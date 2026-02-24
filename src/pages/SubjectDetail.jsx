import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReportsStore } from "../stores/reportsStore";
import { useSubjectsStore } from "../stores/subjectsStore";
import { useAuthStore } from "../stores/authStore";
import { useConfigStore } from "../stores/configStore";
import { analyzeImagesWithVision } from "../lib/visionService";
import { ArrowLeft, RefreshCw, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SubjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { reports, loadReports, addReport } = useReportsStore();
    const { subjects, loadSubjects, deleteSubject, updateSubjectStatus } = useSubjectsStore();
    const { currentUser, updateCredits } = useAuthStore();
    const { aiPrompt } = useConfigStore();

    const [subject, setSubject] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadReports();
        if (currentUser) {
            loadSubjects(currentUser.id);
        }
    }, [loadReports, loadSubjects, currentUser]);

    useEffect(() => {
        // 1. Check if a report already exists for this subject ID
        if (reports.length > 0) {
            const existingReport = reports.find(r => r.subject_id === id) || reports.find(r => r.id === id);
            if (existingReport) {
                navigate(`/reports/${existingReport.subject_id}`, { replace: true });
                return;
            }
        }

        // 2. If no report exists, find the subject to display the incomplete UI
        if (subjects.length > 0) {
            const foundSubject = subjects.find(s => s.id === id);
            if (foundSubject) {
                setSubject(foundSubject);
            }
        }
    }, [id, reports, subjects, navigate]);

    const handleRetry = async () => {
        // Validation Checks
        if (currentUser?.role !== "admin") {
            const total = currentUser?.creditsTotal || 0;
            const used = currentUser?.creditsUsed || 0;
            if (total - used <= 0) {
                toast.error("Créditos insuficientes para gerar a análise.", { duration: 4000 });
                return;
            }
        }

        if (!subject?.photoUrls || subject.photoUrls.length === 0) {
            toast.error("Fotografias não encontradas para este teste.");
            return;
        }

        setIsRetrying(true);
        const toastId = toast.loading("A reprocessar análise com IA...");

        try {
            // 1. Run Analysis
            const aiResult = await analyzeImagesWithVision(subject.photoUrls, aiPrompt);

            // 2. Save Report
            const reportData = {
                ...aiResult,
                subjectId: subject.id,
                clientId: currentUser.id
            };
            await addReport(reportData);

            // 3. Deduct Credits
            if (currentUser?.role !== "admin") {
                await updateCredits(currentUser.id, 1);
            }

            // 4. Update Status
            await updateSubjectStatus(subject.id, "completed");

            toast.success("Análise concluída!", { id: toastId });
            navigate(`/reports/${subject.id}`, { replace: true });
        } catch (error) {
            console.error("Retry failed:", error);
            const errorMsg = error.message || "A inteligência artificial falhou novamente.";
            toast.error(errorMsg, { id: toastId });
            await updateSubjectStatus(subject.id, "error");
        } finally {
            setIsRetrying(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Tem a certeza que deseja eliminar este teste? Esta ação é irreversível.")) return;

        setIsDeleting(true);
        const success = await deleteSubject(subject.id);
        if (success) {
            navigate('/crm');
        } else {
            setIsDeleting(false);
        }
    };

    if (!subject) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                <span className="ml-3 text-muted">A carregar teste...</span>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in duration-500">
            <button
                onClick={() => navigate('/crm')}
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao CRM
            </button>

            <div className="glass-card rounded-2xl p-8 border-2 border-destructive/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-foreground">Teste Incompleto</h1>
                        <p className="text-muted-foreground text-sm">A análise para {subject.full_name || "este cliente"} não foi terminada.</p>
                    </div>
                </div>

                <div className="bg-destructive/5 rounded-xl p-4 mb-8 border border-destructive/10">
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                        Parece que ocorreu uma interrupção ou um erro de rede enquanto o nosso motor de Inteligência Artificial tentava processar as fotografias.
                        <br /><br />
                        <strong className="text-foreground">Não se preocupe:</strong> Os seus créditos <span className="text-destructive font-bold">NÃO</span> foram descontados.
                    </p>
                </div>

                {subject.photoUrls && subject.photoUrls.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Fotografias Salvas</h3>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {subject.photoUrls.map((url, idx) => (
                                <img key={idx} src={url} alt={`Foto ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border border-border shadow-sm shrink-0" />
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleRetry}
                        disabled={isRetrying || isDeleting}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRetrying ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> A Processar IA...</>
                        ) : (
                            <><RefreshCw className="w-5 h-5 mr-2" /> Tentar Novamente</>
                        )}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isRetrying || isDeleting}
                        className="sm:flex-none bg-background hover:bg-destructive/10 text-destructive border border-destructive/20 font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trash2 className="w-5 h-5 mr-2" /> Eliminar</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
