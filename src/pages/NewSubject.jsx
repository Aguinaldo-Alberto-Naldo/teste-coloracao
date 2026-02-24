import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useSubjectsStore } from "../stores/subjectsStore";
import { useReportsStore } from "../stores/reportsStore";
import { useConfigStore } from "../stores/configStore";
import { useTestableClientsStore } from "../stores/testableClientsStore";
import { supabase } from "../lib/supabase";
import { analyzeImagesWithVision } from "../lib/visionService";
import PhotoUpload from "../components/ui/PhotoUpload";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Plus, Users, UserPlus } from "lucide-react";

// Modal Component for Warnings
function WarningModal({ title, message, onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl border border-slate-100">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-2xl font-bold font-heading mb-3 text-slate-900">{title}</h3>
                <p className="text-slate-600 font-medium mb-8 leading-relaxed">
                    {message}
                </p>
                <div className="space-y-3">
                    <Link
                        to="/store"
                        className="block w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-md shadow-primary/20 transition-all active:scale-[0.98]"
                        onClick={onClose}
                    >
                        Carregar Créditos
                    </Link>
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-3 rounded-xl transition-colors"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        </div>
    );
}

// Processing Overlay Component
function ProcessingOverlay() {
    return (
        <div className="fixed inset-0 z-[100] bg-background/95 flex flex-col items-center justify-center p-4">
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-light animate-spin" style={{ animationDuration: '1.5s' }} />
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-accent animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-white animate-spin" style={{ animationDuration: '1s' }} />
                <Loader2 className="w-8 h-8 text-primary font-bold animate-pulse" />
            </div>
            <h2 className="text-2xl font-heading font-bold glow-text mb-4 text-center">A analisar as fotografias...</h2>
            <p className="text-muted max-w-md text-center">
                A nossa IA está a extrair os valores cromáticos para determinar a temperatura, intensidade e profundidade perfeitas.
            </p>
        </div>
    );
}

export default function NewSubject() {
    const navigate = useNavigate();
    const { currentUser, updateCredits } = useAuthStore();
    const { addSubject, updateSubjectStatus } = useSubjectsStore();
    const { addReport } = useReportsStore();
    const { aiPrompt } = useConfigStore();
    const { clients, loadClients, addClient } = useTestableClientsStore();

    const [photos, setPhotos] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCreditWarning, setShowCreditWarning] = useState(false);

    // Client selection mode: 'existing' or 'new'
    const [clientMode, setClientMode] = useState('existing');
    const [selectedClientId, setSelectedClientId] = useState('');

    // Form state for new client
    const [newClientName, setNewClientName] = useState('');
    const [newClientEmail, setNewClientEmail] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');

    const availableCredits = (currentUser?.creditsTotal || 0) - (currentUser?.creditsUsed || 0);

    useEffect(() => {
        if (currentUser?.id) {
            loadClients(currentUser.id);
        }
    }, [currentUser, loadClients]);

    // Set default selected client if there are clients and mode is existing
    useEffect(() => {
        if (clients.length > 0 && !selectedClientId && clientMode === 'existing') {
            setSelectedClientId(clients[0].id);
        } else if (clients.length === 0 && clientMode === 'existing') {
            setClientMode('new');
        }
    }, [clients, clientMode, selectedClientId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        if (clientMode === 'existing' && !selectedClientId) {
            toast.error("Por favor, selecione um cliente.");
            return;
        }

        if (clientMode === 'new' && newClientName.trim().length < 3) {
            toast.error("O nome deve ter no mínimo 3 caracteres.");
            return;
        }

        if (photos.length === 0) {
            toast.error("Por favor, adicione pelo menos uma fotografia.");
            return;
        }

        if (availableCredits <= 0 && currentUser?.role !== "admin") {
            setShowCreditWarning(true);
            return;
        }

        setIsProcessing(true);
        let createdSubjectId = null;

        try {
            // Determine target client
            let targetClientId = selectedClientId;
            let targetClientData = null;

            if (clientMode === 'new') {
                const newClient = await addClient({
                    userId: currentUser.id,
                    name: newClientName,
                    email: newClientEmail,
                    phone: newClientPhone
                });
                targetClientId = newClient.id;
                targetClientData = newClient;
            } else {
                targetClientData = clients.find(c => c.id === targetClientId);
            }

            if (!targetClientData) throw new Error("Cliente não encontrado.");

            // Upload images
            const photoUrls = [];
            for (const photoObj of photos) {
                const file = photoObj.file;
                const originalName = file.name || 'photo.jpg';
                const fileExt = originalName.split('.').pop() || 'jpg';
                const fileName = `${currentUser.id}/${crypto.randomUUID()}.${fileExt}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('photos')
                    .upload(fileName, file, { cacheControl: '3600', upsert: false });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('photos')
                    .getPublicUrl(fileName);

                photoUrls.push(publicUrl);
            }

            // Insert TestSubject
            const subject = await addSubject({
                fullName: targetClientData.name,
                email: targetClientData.email,
                phone: targetClientData.phone,
                clientId: currentUser.id,
                testableClientId: targetClientId,
                photoUrls: photoUrls
            });

            createdSubjectId = subject.id;

            // Run GPT-4 Vision analysis
            const aiResult = await analyzeImagesWithVision(photoUrls, aiPrompt);

            // Save Report
            const reportData = {
                ...aiResult,
                subjectId: subject.id,
                clientId: currentUser.id
            };

            await addReport(reportData);

            // Deduct credits
            if (currentUser?.role !== "admin") {
                await updateCredits(currentUser.id, 1);
            }

            // Update subject
            await updateSubjectStatus(subject.id, "completed");

            navigate(`/reports/${subject.id}`);

        } catch (e) {
            console.error("DEBUG Erro na Análise:", e);
            const errorMsg = e.message || "Ocorreu um erro ao processar as fotografias.";
            toast.error(errorMsg);

            if (createdSubjectId) {
                await updateSubjectStatus(createdSubjectId, "error");
            }
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="max-w-3xl mx-auto py-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </button>

                <div className="bg-card shadow-sm border border-border rounded-2xl p-6 md:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                    <h1 className="text-3xl font-heading font-bold mb-2 text-foreground">Nova Análise</h1>
                    <p className="text-muted-foreground text-sm mb-8 max-w-md">
                        Selecione o seu cliente e anexe fotografias com boa luz natural para a AI realizar a análise.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        {/* Client Selection Toggle */}
                        <div className="bg-muted/30 p-2 rounded-xl flex gap-2 w-full max-w-md">
                            <button
                                type="button"
                                disabled={clients.length === 0}
                                onClick={() => setClientMode('existing')}
                                className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${clientMode === 'existing'
                                        ? 'bg-background shadow text-foreground'
                                        : 'text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed'
                                    }`}
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Cliente Existente
                            </button>
                            <button
                                type="button"
                                onClick={() => setClientMode('new')}
                                className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${clientMode === 'new'
                                        ? 'bg-background shadow text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Novo Cliente
                            </button>
                        </div>

                        <div className="p-5 border border-border rounded-xl bg-background/50">
                            {clientMode === 'existing' ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Selecionar Cliente</label>
                                    <select
                                        value={selectedClientId}
                                        onChange={(e) => setSelectedClientId(e.target.value)}
                                        className="w-full h-11 rounded-md border border-input bg-background px-3 transition-colors focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="" disabled>Selecione um cliente...</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>
                                                {client.name} {client.email ? `(${client.email})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-sm font-medium text-foreground">Nome Completo *</label>
                                        <input
                                            type="text"
                                            value={newClientName}
                                            onChange={(e) => setNewClientName(e.target.value)}
                                            className="w-full h-11 rounded-md border border-input bg-background/50 px-3 transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                                            placeholder="Nome do cliente"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-foreground">Email</label>
                                        <input
                                            type="email"
                                            value={newClientEmail}
                                            onChange={(e) => setNewClientEmail(e.target.value)}
                                            className="w-full h-11 rounded-md border border-input bg-background/50 px-3 transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                                            placeholder="cliente@email.com"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-foreground">Telefone</label>
                                        <input
                                            type="tel"
                                            value={newClientPhone}
                                            onChange={(e) => setNewClientPhone(e.target.value)}
                                            className="w-full h-11 rounded-md border border-input bg-background/50 px-3 transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                                            placeholder="+351 900 000 000"
                                        />
                                    </div>
                                    <div className="md:col-span-2 text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Plus className="w-3.5 h-3.5" />
                                        Este cliente será guardado no seu CRM.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Photo Upload Section */}
                        <div className="pt-2">
                            <h3 className="font-semibold text-foreground text-lg flex items-center mb-4">
                                Fotografias <span className="text-xs ml-2 text-primary font-bold">(Mini. 1, Max. 3)</span>
                            </h3>
                            <PhotoUpload onChange={setPhotos} />
                        </div>

                        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg border border-border">
                                Custo: <span className="text-foreground font-bold">1 Crédito</span>
                            </div>
                            <button
                                type="submit"
                                className="w-full sm:w-auto inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 px-8 rounded-xl shadow-md shadow-primary/20 transition-all tracking-wide"
                            >
                                Analisar Agora
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showCreditWarning && (
                <WarningModal
                    title="Sem Créditos"
                    message="Não possui créditos suficientes para realizar esta análise. Por favor, carregue a sua conta para continuar a utilizar os nossos serviços de IA."
                    onClose={() => setShowCreditWarning(false)}
                />
            )}

            {isProcessing && <ProcessingOverlay />}
        </>
    );
}
