import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../stores/authStore";
import { useSubjectsStore } from "../stores/subjectsStore";
import { useReportsStore } from "../stores/reportsStore";
import { useTicketsStore } from "../stores/ticketsStore";
import { Users2, CheckSquare, Coins, CalendarDays, Activity, AlertCircle, ShoppingBag, Clock } from "lucide-react";
export default function AdminDashboard() {
    const { loadSubjects, subjects } = useSubjectsStore();
    const { loadReports } = useReportsStore();
    const { tickets, loadTickets } = useTicketsStore();
    const { fetchAllProfiles } = useAuthStore();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([
                loadSubjects(),
                loadReports(),
                loadTickets()
            ]);
            const allProfiles = await fetchAllProfiles();
            setClients(allProfiles.filter(u => u.role === "client"));
            setLoading(false);
        };
        loadAll();
    }, [loadSubjects, loadReports, loadTickets, fetchAllProfiles]);

    const totalClients = clients.length;

    const totalTests = subjects.length;

    const totalActiveCredits = clients.reduce((acc, client) => {
        return acc + (client.credits_total - client.credits_used);
    }, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const testsThisMonth = subjects.filter(s => {
        const d = new Date(s.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    // --- NEW METRICS ---

    const planStats = useMemo(() => {
        const stats = {};
        clients.forEach(c => {
            const plan = c.current_plan || "Sem Plano";
            stats[plan] = (stats[plan] || 0) + 1;
        });
        return stats;
    }, [clients]);

    const expiriesIn7Days = useMemo(() => {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return clients.filter(c => {
            if (!c.credits_expiration) return false;
            const exp = new Date(c.credits_expiration);
            return exp > now && exp <= nextWeek;
        }).length;
    }, [clients]);

    const activeTickets = tickets.filter(t => t.status !== "closed" && t.status !== "resolved").length;

    const topClients = useMemo(() => {
        return [...clients]
            .sort((a, b) => b.credits_used - a.credits_used)
            .slice(0, 5);
    }, [clients]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (

        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Painel de Controlo</h1>
                <p className="text-muted-foreground">Métricas avançadas e visão geral do sistema ChromaTest AI.</p>
            </div>

            {/* Primary Metrics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

                <div className="bg-card shadow-sm border border-border rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/4 group-hover:bg-primary/20 transition-colors" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Users2 className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Clientes Registados</p>
                            <h3 className="text-3xl font-bold text-foreground">{totalClients}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-card shadow-sm border border-border rounded-xl p-6 relative overflow-hidden group hover:border-accent/80 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/4 group-hover:bg-accent/30 transition-colors" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent-foreground">
                            <CheckSquare className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Testes Realizados</p>
                            <h3 className="text-3xl font-bold text-foreground">{totalTests}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-card shadow-sm border border-border rounded-xl p-6 relative overflow-hidden group hover:border-blue-300 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/4 group-hover:bg-blue-500/20 transition-colors" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                            <Coins className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Total Créditos Ativos</p>
                            <h3 className="text-3xl font-bold text-foreground">{totalActiveCredits}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-card shadow-sm border border-border rounded-xl p-6 relative overflow-hidden group hover:border-green-300 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/4 group-hover:bg-green-500/20 transition-colors" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-green-100 border border-green-200 flex items-center justify-center text-green-600">
                            <CalendarDays className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Testes Este Mês</p>
                            <h3 className="text-3xl font-bold text-foreground">{testsThisMonth}</h3>
                        </div>
                    </div>
                </div>

            </div>

            {/* Secondary Metrics Grid */}
            <div className="grid md:grid-cols-3 gap-6">

                {/* Plan Distribution */}
                <div className="bg-card shadow-sm border border-border rounded-xl p-6 relative flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-heading font-bold text-foreground">Distribuição de Planos</h2>
                    </div>
                    {Object.keys(planStats).length === 0 ? (
                        <p className="text-muted-foreground text-sm italic">Nenhum dado disponível.</p>
                    ) : (
                        <div className="space-y-4 flex-1">
                            {Object.entries(planStats).map(([plan, count]) => (
                                <div key={plan} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-foreground">{plan}</span>
                                        <span className="text-muted-foreground bg-accent/10 px-2 py-0.5 rounded-full text-xs font-bold text-accent-foreground">{count}</span>
                                    </div>
                                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-primary h-full rounded-full"
                                            style={{ width: `${(count / totalClients) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Approaching Expiration */}
                <div className="bg-card shadow-sm border border-border rounded-xl p-6 relative flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-heading font-bold text-foreground">Avisos de Expiração</h2>
                    </div>

                    <div className="flex flex-col items-center justify-center flex-1 py-4">
                        <div className="text-5xl font-bold text-foreground mb-2 flex items-center gap-2">
                            {expiriesIn7Days}
                            <span className="text-sm font-medium text-muted-foreground inline-flex mt-2">clientes</span>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            Avisos importantes de pacotes que expiram <br />nos próximos 7 dias.
                        </p>
                    </div>
                </div>

                {/* Support Tickets Overview */}
                <div className="bg-card shadow-sm border border-border rounded-xl p-6 relative flex flex-col h-full hover:border-indigo-300 transition-colors group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/4 group-hover:bg-indigo-500/20 transition-colors pointer-events-none" />

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-heading font-bold text-foreground">Suporte (Tickets)</h2>
                    </div>

                    <div className="flex flex-col flex-1 pb-4 relative z-10">
                        <div className="bg-indigo-50 rounded-lg border border-indigo-100 p-4 mb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-indigo-900 mb-0.5">Tickets Abertos/Em Curso</p>
                                    <p className="text-xs text-indigo-600">A precisar de atenção admin</p>
                                </div>
                                <span className="text-3xl font-black text-indigo-700">{activeTickets}</span>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Utilize o menu "Tickets de Suporte" na lateral para gerir reclamações e comunicar com os clientes.
                        </div>
                    </div>
                </div>

            </div>

            {/* Top Consumers Table */}
            <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden mt-8">
                <div className="p-6 border-b border-border bg-muted/30">
                    <h2 className="text-lg font-heading font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-600" /> Top 5 Clientes (Uso de Créditos)
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold uppercase text-xs">Nome do Cliente</th>
                                <th className="px-6 py-4 font-semibold uppercase text-xs">Plano Atual</th>
                                <th className="px-6 py-4 font-semibold uppercase text-xs">Créditos Usados</th>
                                <th className="px-6 py-4 font-semibold uppercase text-xs">Créditos Restantes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {topClients.map((client) => {
                                const remaining = client.credits_total - client.credits_used;
                                return (


                                    <tr key={client.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-foreground">{client.full_name}</div>
                                            <div className="text-xs text-muted-foreground">{client.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/20 text-accent-foreground border border-accent/40">
                                                {client.current_plan || "Sem Plano"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-foreground">{client.credits_used}</td>
                                        <td className="px-6 py-4 font-mono">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${remaining <= 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {remaining}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                            {topClients.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">Nenhum cliente registado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
