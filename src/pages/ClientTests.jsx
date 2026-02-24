import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useSubjectsStore } from "../stores/subjectsStore";
import { useReportsStore } from "../stores/reportsStore";
import { useTestableClientsStore } from "../stores/testableClientsStore";
import StatusBadge from "../components/ui/StatusBadge";
import { ArrowLeft, ArrowUpRight, Loader2, Calendar } from "lucide-react";

export default function ClientTests() {
    const { id } = useParams(); // testable_client_id
    const navigate = useNavigate();
    const { currentUser } = useAuthStore();
    const { loadSubjects, subjects } = useSubjectsStore();
    const { loadReports, reports } = useReportsStore();
    const { clients, loadClients } = useTestableClientsStore();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (currentUser) {
                setLoading(true);
                try {
                    await Promise.all([
                        loadSubjects(currentUser.id),
                        loadReports(currentUser.id),
                        loadClients(currentUser.id)
                    ]);
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    }, [currentUser, loadSubjects, loadReports, loadClients]);

    if (!currentUser) return null;

    const client = clients.find(c => c.id === id);

    // Filter subjects for this specific testable_client_id
    const clientSubjects = subjects.filter(s => s.testable_client_id === id);

    // Combine subjects with their generated reports
    const tableData = clientSubjects.map((subject) => {
        const report = reports.find((r) => r.subject_id === subject.id);
        return {
            ...subject,
            seasonDisplay: report?.season || "-",
            subSeasonDisplay: report?.sub_season || "-",
            reportId: report?.id || null
        };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
            <div>
                <button
                    onClick={() => navigate('/my-clients')}
                    className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar aos Meus Clientes
                </button>
                <h1 className="text-3xl font-heading font-bold mb-2">Histórico de Testes</h1>
                <p className="text-muted-foreground">
                    Testes realizados para o cliente <strong className="text-foreground">{client?.name || "Desconhecido"}</strong>
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="bg-card shadow-sm rounded-xl overflow-hidden border border-border">
                    <div className="p-6 border-b border-border bg-muted/10 flex justify-between items-center">
                        <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Testes Realizados ({tableData.length})
                        </h2>
                        <Link
                            to="/subjects/new"
                            className="text-sm bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Novo Teste
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-sm text-muted-foreground bg-muted/20 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Data</th>
                                    <th className="px-6 py-4 font-semibold">Estação</th>
                                    <th className="px-6 py-4 font-semibold">Estado</th>
                                    <th className="px-6 py-4 font-semibold text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground">
                                            Nenhum teste registado para este cliente.
                                        </td>
                                    </tr>
                                ) : (
                                    tableData.map((item) => (
                                        <tr key={item.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {new Date(item.created_at).toLocaleDateString('pt-PT', {
                                                    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-bold text-primary">{item.subSeasonDisplay}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {item.reportId ? (
                                                    <button
                                                        onClick={() => navigate(`/reports/${item.id}`)}
                                                        className="inline-flex items-center text-xs font-bold text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-md transition-all"
                                                    >
                                                        Ver Relatório <ArrowUpRight className="w-3 h-3 ml-1" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate(`/subjects/${item.id}`)}
                                                        className="inline-flex items-center text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 px-3 py-1.5 rounded-md transition-all"
                                                    >
                                                        Resolver Problema <ArrowUpRight className="w-3 h-3 ml-1" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
