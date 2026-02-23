import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReportsStore } from "../stores/reportsStore";
import ColorSwatch from "../components/ui/ColorSwatch";
import AvoidColorSwatch from "../components/ui/AvoidColorSwatch";
import { Download, MessageCircle, ArrowLeft, Shirt, Brush, Diamond, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export default function Report() {
    const { id } = useParams(); // This is the subject ID
    const navigate = useNavigate();
    const { getBySubject } = useReportsStore();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const reportRef = useRef(null);

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                const data = await getBySubject(id);
                setReport(data);
            } catch (error) {
                console.error("Error fetching report:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id, getBySubject]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                <p className="mt-4 text-muted">A carregar relatório...</p>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <h2 className="text-2xl font-bold mb-4">Relatório não encontrado</h2>
                <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">
                    Voltar ao Dashboard
                </button>
            </div>
        );
    }

    const handleExportPDF = async () => {
        if (!reportRef.current) return;
        const toastId = toast.loading("A gerar PDF...");

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 1.5,
                backgroundColor: "#0F0A1E",
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    const blurs = clonedDoc.querySelectorAll('.backdrop-blur-sm, .backdrop-blur-md');
                    blurs.forEach(el => el.style.backdropFilter = 'none');
                }
            });

            const imgData = canvas.toDataURL("image/jpeg", 0.95);
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Colorimetria_${report.subject_name || 'Relatorio'}.pdf`);

            toast.success("PDF exportado com sucesso!", { id: toastId });
        } catch (error) {
            console.error("PDF generation failed:", error);
            toast.error(`Erro ao gerar PDF: ${error?.message || "Desconhecido"}`, { id: toastId });
        }
    };

    const handleShareWa = () => {
        const text = `Olá ${report.subject_name || ''}! A tua análise de coloração pessoal está concluída. És uma deslumbrante ${report.sub_season || ''}! Podes consultar o teu relatório detalhado aqui: [LINK]`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    };

    const seasonColors = {
        Primavera: "from-orange-400 to-yellow-400",
        Verão: "from-blue-300 to-purple-300",
        Outono: "from-orange-600 to-amber-700",
        Inverno: "from-blue-600 to-fuchsia-600",
    };

    const bgGradient = seasonColors[report.season] || "from-primary to-accent";

    return (
        <div className="max-w-5xl mx-auto pb-12">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sticky top-16 z-20 bg-background/80 backdrop-blur-md py-4 border-b border-white/5">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-sm font-bold text-slate-600 hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao Dashboard
                </button>

                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleShareWa}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Exportar PDF
                    </button>
                </div>
            </div>

            {/* Report Content to be Exported */}
            <div ref={reportRef} className="bg-card rounded-3xl overflow-hidden border border-border shadow-lg relative">
                <div data-html2canvas-ignore="true" className="absolute top-0 right-0 w-full h-96 bg-gradient-to-br from-primary/5 to-transparent mix-blend-multiply pointer-events-none" />

                {/* Header Block */}
                <div className={`p-10 md:p-16 text-center bg-gradient-to-br ${bgGradient} relative overflow-hidden bg-opacity-20`}>
                    <div data-html2canvas-ignore="true" className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
                    <div className="relative z-10">
                        <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-background/60 backdrop-blur-md text-foreground text-sm font-bold tracking-widest uppercase mb-6 shadow-sm">
                            Análise Cromática
                        </div>
                        <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-4 leading-tight">
                            {report.sub_season}
                        </h1>
                        <p className="text-xl text-foreground/80 font-bold mb-8 font-heading italic">
                            "{report.subject_name}"
                        </p>
                    </div>
                </div>

                <div className="p-8 md:p-16 space-y-16">
                    {/* Main Analysis Text */}
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h3 className="text-2xl font-heading font-bold text-primary mb-4 flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-primary hidden md:block"></span>
                            A Sua Análise
                        </h3>
                        <p className="text-lg text-foreground leading-relaxed font-serif">
                            {report.full_analysis}
                        </p>
                    </section>

                    {/* Color Palette */}
                    <section>
                        <div className="text-center mb-10">
                            <h3 className="text-3xl font-heading font-bold text-foreground">A Tua Paleta Estrela</h3>
                            <p className="text-muted-foreground mt-2 font-bold">Cores que harmonizam perfeitamente com a sua tez.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                            {(report.palette || []).map((color, idx) => (
                                <ColorSwatch key={idx} color={color} />
                            ))}
                        </div>
                    </section>

                    {/* Avoid Colors */}
                    <section className="bg-secondary/30 rounded-2xl p-8 md:p-12 border border-border">
                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-heading font-bold text-destructive">Cores a Evitar</h3>
                            <p className="text-muted-foreground mt-2 text-sm font-bold">Tons que podem apagar a sua luminosidade natural.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                            {(report.colors_to_avoid || []).map((color, idx) => (
                                <AvoidColorSwatch key={idx} color={color} />
                            ))}
                        </div>
                    </section>

                    {/* Styling & Makeup */}
                    <section className="grid lg:grid-cols-3 gap-6 pt-8 border-t border-border">
                        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                <Shirt className="w-7 h-7" />
                            </div>
                            <h3 className="font-heading font-bold text-xl mb-4 text-foreground">Vestuário</h3>
                            <div className="text-sm text-left space-y-3 w-full">
                                <p><strong className="text-foreground">Sugestões:</strong> <span className="text-muted-foreground font-medium">{report.clothing?.suggestions}</span></p>
                                <p><strong className="text-foreground">Tecidos:</strong> <span className="text-muted-foreground font-medium">{report.clothing?.fabrics}</span></p>
                                <p><strong className="text-foreground">Padrões:</strong> <span className="text-muted-foreground font-medium">{report.clothing?.patterns}</span></p>
                            </div>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mb-4 text-accent-foreground">
                                <Brush className="w-7 h-7" />
                            </div>
                            <h3 className="font-heading font-bold text-xl mb-4 text-foreground">Maquilhagem</h3>
                            <div className="text-sm text-left space-y-3 w-full">
                                <p><strong className="text-foreground">Base:</strong> <span className="text-muted-foreground font-medium">{report.makeup?.foundation}</span></p>
                                <p><strong className="text-foreground">Blush:</strong> <span className="text-muted-foreground font-medium">{report.makeup?.blush}</span></p>
                                <p><strong className="text-foreground">Lábios:</strong> <span className="text-muted-foreground font-medium">{report.makeup?.lips}</span></p>
                                <p><strong className="text-foreground">Olhos:</strong> <span className="text-muted-foreground font-medium">{report.makeup?.eyes}</span></p>
                            </div>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4 text-foreground">
                                <Diamond className="w-7 h-7" />
                            </div>
                            <h3 className="font-heading font-bold text-xl mb-4 text-foreground">Acessórios</h3>
                            <div className="text-sm text-left space-y-3 w-full">
                                <p><strong className="text-foreground">Metais:</strong> <span className="text-muted-foreground font-medium">{report.accessories?.metals}</span></p>
                                <p><strong className="text-foreground">Pedras:</strong> <span className="text-muted-foreground font-medium">{report.accessories?.stones}</span></p>
                                <p><strong className="text-foreground">Geral:</strong> <span className="text-muted-foreground font-medium">{report.accessories?.general}</span></p>
                            </div>
                        </div>
                    </section>

                    {/* Footer Logo of Report */}
                    <div className="pt-12 pb-4 text-center border-t border-border">
                        <span className="text-xl font-heading font-bold tracking-widest uppercase text-foreground">ChromaTest AI</span>
                        <p className="text-xs text-muted-foreground mt-2 font-bold tracking-tight">© {new Date().getFullYear()} — Todos os direitos reservados</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
