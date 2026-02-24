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

// Modal Component for Photo Guidelines
function PhotoGuidelinesModal({ onConfirm }) {
    return (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-300 shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden relative">
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-gold" />

                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                    <span className="text-2xl text-primary">✨</span>
                </div>

                <h3 className="text-xl font-black font-heading mb-4 text-slate-900 leading-tight uppercase tracking-tight">Análise Perfeita</h3>

                <div className="space-y-2 mb-6 text-left">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                        <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-primary">1</div>
                        <p className="text-slate-600 font-semibold text-xs leading-snug">Sem maquilhagem para cores reais.</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                        <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-primary">2</div>
                        <p className="text-slate-600 font-semibold text-xs leading-snug">Lugar com boa iluminação natural.</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                        <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-primary">3</div>
                        <p className="text-slate-600 font-semibold text-xs leading-snug">Rosto bem visível e de frente.</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                        <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-primary">4</div>
                        <p className="text-primary font-bold text-xs leading-snug">Envie 2+ fotos para melhor resultado.</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => onConfirm(false)}
                        className="w-full bg-slate-900 hover:bg-black text-white font-black py-3.5 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98] uppercase tracking-[0.1em] text-xs"
                    >
                        Entendi, Vamos Começar
                    </button>
                    <button
                        onClick={() => onConfirm(true)}
                        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-400 font-bold py-2 rounded-lg transition-all text-[11px] hover:text-slate-600 uppercase tracking-tighter"
                    >
                        Não mostrar novamente
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
    const [showGuidelines, setShowGuidelines] = useState(() => {
        return localStorage.getItem('hide_photo_guidelines') !== 'true';
    });

    const handleGuidelinesConfirm = (dontShowAgain) => {
        if (dontShowAgain) {
            localStorage.setItem('hide_photo_guidelines', 'true');
        }
        setShowGuidelines(false);
    };

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

                <div className="bg-gradient-to-br from-white via-white to-primary/5 shadow-2xl border border-white/50 rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden backdrop-blur-sm">
                    {/* Vibrant mesh blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />

                    <h1 className="text-3xl font-heading font-bold mb-2 text-foreground">Nova Análise</h1>
                    <p className="text-muted-foreground text-sm mb-8 max-w-md">
                        Selecione o seu cliente e anexe fotografias com boa luz natural para a AI realizar a análise.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        {/* Client Selection Toggle */}
                        <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-2xl flex gap-1 w-full max-w-md border border-slate-100 shadow-sm">
                            <button
                                type="button"
                                disabled={clients.length === 0}
                                onClick={() => setClientMode('existing')}
                                className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-black transition-all uppercase tracking-tight ${clientMode === 'existing'
                                    ? 'bg-gradient-to-r from-[#db2777] to-[#4f46e5] shadow-lg text-white'
                                    : 'text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed'
                                    }`}
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Cliente Existente
                            </button>
                            <button
                                type="button"
                                onClick={() => setClientMode('new')}
                                className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-black transition-all uppercase tracking-tight ${clientMode === 'new'
                                    ? 'bg-gradient-to-r from-[#db2777] to-[#4f46e5] shadow-lg text-white'
                                    : 'text-slate-400 hover:text-slate-600'
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
                                className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-[#db2777] to-[#4f46e5] hover:scale-[1.02] active:scale-95 text-white font-black h-14 px-10 rounded-2xl shadow-xl shadow-primary/25 transition-all tracking-[0.05em] uppercase text-sm"
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

            {showGuidelines && (
                <PhotoGuidelinesModal onConfirm={handleGuidelinesConfirm} />
            )}
        </>
    );
}
