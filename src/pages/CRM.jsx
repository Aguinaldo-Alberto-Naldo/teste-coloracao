import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useSubjectsStore } from "../stores/subjectsStore";
import { useReportsStore } from "../stores/reportsStore";
import StatusBadge from "../components/ui/StatusBadge";
import { Search, Filter, ArrowUpRight, Users2, CreditCard, Loader2 } from "lucide-react";

export default function CRM() {
    const { currentUser } = useAuthStore();
    const { loadSubjects, subjects } = useSubjectsStore();
    const { loadReports, reports } = useReportsStore();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [seasonFilter, setSeasonFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (currentUser) {
                setLoading(true);
                try {
                    await Promise.all([
                        loadSubjects(currentUser.id),
                        loadReports(currentUser.id)
                    ]);
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    }, [currentUser, loadSubjects, loadReports]);

    if (!currentUser) return null;

    // Combine subjects with their generated reports for display mapping
    const tableData = subjects.map((subject) => {
        const report = reports.find((r) => r.subject_id === subject.id);
        return {
            ...subject,
            seasonDisplay: report?.season || "-",
            subSeasonDisplay: report?.sub_season || "-",
            reportId: report?.id || null
        };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Search and Filter Logic
    const filteredData = tableData.filter((item) => {
        const matchesSearch =
            (item.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
            (item.email || "").toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        const matchesSeason = seasonFilter === "all" || item.seasonDisplay === seasonFilter;

        return matchesSearch && matchesStatus && matchesSeason;
    });

    const availableCredits = (currentUser.creditsTotal || 0) - (currentUser.creditsUsed || 0);

    const seasonOptions = ["all", "Primavera", "Verão", "Outono", "Inverno"];
    const statusOptions = ["all", "pending", "processing", "completed", "error"];

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-3xl font-heading font-bold glow-text mb-2">O Meu CRM</h1>
                <p className="text-slate-500 font-medium">Faça a gestão dos clientes e aceda a todos os relatórios gerados.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card rounded-xl p-6 flex items-center gap-4 border-l-4 border-l-primary">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users2 className="w-6 h-6 text-primary-light" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total de Testes</p>
                        <p className="text-2xl font-bold">{subjects.length}</p>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-6 flex items-center gap-4 border-l-4 border-l-muted">
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 font-bold uppercase tracking-tight">Créditos Usados</p>
                        <p className="text-2xl font-bold">{currentUser.creditsUsed || 0}</p>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-6 flex items-center gap-4 border-r-4 border-r-accent">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Créditos Disponíveis</p>
                        <p className="text-2xl font-bold text-accent">{availableCredits}</p>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between border border-border">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-input text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    />
                </div>

                <div className="flex w-full md:w-auto gap-4">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-background border border-input text-sm rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all appearance-none w-full md:w-auto"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt} value={opt}>{opt === "all" ? "Todos os Estados" : opt}</option>
                            ))}
                        </select>
                    </div>

                    <select
                        value={seasonFilter}
                        onChange={(e) => setSeasonFilter(e.target.value)}
                        className="bg-background border border-input text-sm rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all appearance-none w-full md:w-auto"
                    >
                        {seasonOptions.map(opt => (
                            <option key={opt} value={opt}>{opt === "all" ? "Todas as Estações" : opt}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="glass-card rounded-xl overflow-hidden border border-border shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 font-bold uppercase bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-bold tracking-wider">Cliente</th>
                                    <th className="px-6 py-4 font-medium hidden sm:table-cell">Contactos</th>
                                    <th className="px-6 py-4 font-medium">Estação</th>
                                    <th className="px-6 py-4 font-medium">Data</th>
                                    <th className="px-6 py-4 font-medium">Estado</th>
                                    <th className="px-6 py-4 font-medium text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-muted">
                                            Nenhum registo encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item) => (
                                        <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                        {(item.full_name || "C").charAt(0)}
                                                    </div>
                                                    <div className="font-semibold text-foreground">{item.full_name || "Sem Nome"}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden sm:table-cell">
                                                <div className="text-xs text-slate-600 font-bold group-hover:text-foreground/90 transition-colors">{item.email}</div>
                                                <div className="text-[11px] text-slate-500 font-medium">{item.phone || "-"}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-bold text-primary">{item.subSeasonDisplay}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-bold text-xs">
                                                {new Date(item.created_at).toLocaleDateString('pt-PT')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {item.reportId ? (
                                                    <button
                                                        onClick={() => navigate(`/reports/${item.id}`)}
                                                        className="inline-flex items-center text-xs font-semibold text-white bg-primary hover:bg-primary/80 shadow-md px-3 py-1.5 rounded-md transition-all active:scale-95"
                                                    >
                                                        Ver Relatório <ArrowUpRight className="w-3 h-3 ml-1" />
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground font-medium italic">Indisponível</span>
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
