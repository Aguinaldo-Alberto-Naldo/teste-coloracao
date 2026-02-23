import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useSubjectsStore } from "../stores/subjectsStore";
import { useReportsStore } from "../stores/reportsStore";
import { useConfigStore } from "../stores/configStore";
import { supabase } from "../lib/supabase";
import { analyzeImagesWithVision } from "../lib/visionService";
import PhotoUpload from "../components/ui/PhotoUpload";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

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
                {/* Animated rings */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-light animate-spin" style={{ animationDuration: '1.5s' }} />
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-accent animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-white animate-spin" style={{ animationDuration: '1s' }} />
                <Loader2 className="w-8 h-8 text-primary font-bold animate-pulse" />
            </div>
            <h2 className="text-2xl font-heading font-bold glow-text mb-4 text-center">A analisar as suas fotografias...</h2>
            <p className="text-muted max-w-md text-center">
                A nossa IA está a extrair os valores cromáticos para determinar a temperatura, intensidade e profundidade perfeitas.
            </p>
        </div>
    );
}

const schema = z.object({
    fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
});

export default function NewSubject() {
    const navigate = useNavigate();
    const { currentUser, updateCredits } = useAuthStore();
    const { addSubject, updateSubjectStatus } = useSubjectsStore();
    const { addReport } = useReportsStore();
    const { aiPrompt } = useConfigStore();

    const [photos, setPhotos] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCreditWarning, setShowCreditWarning] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const availableCredits = (currentUser?.creditsTotal || 0) - (currentUser?.creditsUsed || 0);

    const onSubmit = async (data) => {
        // 1. Verify credits beforehand
        if (availableCredits <= 0 && currentUser?.role !== "admin") {
            setShowCreditWarning(true);
            return;
        }

        if (photos.length === 0) {
            toast.error("Por favor, adicione pelo menos uma fotografia.");
            return;
        }

        // Prepare processing layout
        setIsProcessing(true);

        try {
            // 2. Upload images to Supabase Storage
            const photoUrls = [];
            for (const photoObj of photos) {
                const file = photoObj.file; // This is the actual File object
                const originalName = file.name || 'photo.jpg';
                const fileExt = originalName.split('.').pop() || 'jpg';
                const fileName = `${currentUser.id}/${crypto.randomUUID()}.${fileExt}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('photos')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('photos')
                    .getPublicUrl(fileName);

                photoUrls.push(publicUrl);
            }

            // 3. Insert TestSubject into Supabase
            const subject = await addSubject({
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                clientId: currentUser.id,
                photoUrls: photoUrls
            });

            // 4. Deduce credits
            if (currentUser?.role !== "admin") {
                await updateCredits(currentUser.id, 1);
            }

            // 5. Run GPT-4 Vision analysis
            const aiResult = await analyzeImagesWithVision(photoUrls, aiPrompt);

            // 6. Save Report to Supabase
            const reportData = {
                ...aiResult,
                subjectId: subject.id,
                clientId: currentUser.id
            };

            const report = await addReport(reportData);

            // Update subject status
            await updateSubjectStatus(subject.id, "completed");

            // Navigate to report
            navigate(`/reports/${subject.id}`);

        } catch (e) {
            console.error("DEBUG Erro na Análise:", e);
            const errorMsg = e.message || "Ocorreu um erro ao processar as fotografias.";
            toast.error(errorMsg);
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

                    <h1 className="text-3xl font-heading font-bold mb-2 text-foreground">Adicionar Pessoa</h1>
                    <p className="text-muted-foreground text-sm mb-8 max-w-md">
                        Forneça os dados e as melhores fotografias com luz natural para o nosso motor de IA analisar com precisão.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                        {/* Form Info Section */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Nome Completo *</label>
                                <input
                                    type="text"
                                    {...register("fullName")}
                                    className="w-full h-11 rounded-md border border-input bg-background/50 px-3 transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                                    placeholder="Nome do cliente"
                                />
                                {errors.fullName && <span className="text-xs text-destructive">{errors.fullName.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Email *</label>
                                <input
                                    type="email"
                                    {...register("email")}
                                    className="w-full h-11 rounded-md border border-input bg-background/50 px-3 transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                                    placeholder="cliente@email.com"
                                />
                                {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-foreground">Telefone</label>
                                <input
                                    type="tel"
                                    {...register("phone")}
                                    className="w-full h-11 rounded-md border border-input bg-background/50 px-3 transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                                    placeholder="+351 900 000 000"
                                />
                            </div>
                        </div>

                        {/* Photo Upload Section */}
                        <div>
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
