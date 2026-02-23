import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReportsStore } from "../stores/reportsStore";
import { useSubjectsStore } from "../stores/subjectsStore";
import { Search, Eye, Calendar, Loader2 } from "lucide-react";

export default function AdminReports() {
    const navigate = useNavigate();
    const { reports, loadReports, loading: reportsLoading } = useReportsStore();
    const { subjects, loadSubjects, loading: subjectsLoading } = useSubjectsStore();
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadReports();
        loadSubjects();
    }, [loadReports, loadSubjects]);

    const getClientName = (subjectId) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return "Cargando...";
        // For now, names are stored in the subject or we'd need a users table in Supabase.
        // Assuming we want the client who created it, but the subject name is usually enough.
        return subject.full_name || "Anónimo";
    };

    const filteredReports = reports.filter(r =>
        (r.subject_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.season || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.sub_season || "").toLowerCase().includes(search.toLowerCase())
    );

    const isLoading = reportsLoading || subjectsLoading;

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-3xl font-heading font-bold glow-text mb-2">Todos os Relatórios</h1>
                <p className="text-muted">Acesso global a todos os relatórios gerados pelos clientes na plataforma.</p>
            </div>

            <div className="glass-card rounded-xl p-4 flex items-center border border-white/5">
                <Search className="w-4 h-4 text-muted mx-3" />
                <input
                    type="text"
                    placeholder="Pesquisar por nome do sujeito ou estação..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-none text-sm placeholder:text-muted focus:outline-none w-full"
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map(report => (
                        <div key={report.id} className="glass-card p-6 rounded-xl border border-white/5 flex flex-col items-start group">
                            <div className="w-full flex justify-between items-start mb-4">
                                <span className="px-2.5 py-1 bg-primary/20 text-primary-light text-xs font-bold rounded-md">
                                    {report.season}
                                </span>
                                <span className="flex items-center text-xs text-muted">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(report.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-lg font-heading font-bold text-foreground mb-1 line-clamp-1">{report.subject_name || "Sem Nome"}</h3>
                            <p className="text-sm font-medium text-accent mb-4">{report.sub_season}</p>

                            <div className="text-xs text-muted mt-auto w-full pt-4 border-t border-white/5 flex justify-between items-center">
                                <span>Sujeito: <strong className="text-foreground">{report.subject_name}</strong></span>

                                <button
                                    onClick={() => navigate(`/reports/${report.id}`)}
                                    className="flex items-center gap-1 text-primary-light hover:text-white transition-colors"
                                    title="Ver Relatório"
                                >
                                    Detalhes <Eye className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredReports.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted glass-card rounded-xl border-dashed border-2 border-white/5">
                            Nenhum relatório encontrado na plataforma.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
