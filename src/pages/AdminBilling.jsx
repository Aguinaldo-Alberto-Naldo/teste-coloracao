import { useState, useEffect, useMemo } from "react";
import { useBillingStore } from "../stores/billingStore";
import {
    TrendingUp,
    Calendar,
    Filter,
    Download,
    ShoppingBag,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function AdminBilling() {
    const { orders, fetchAllOrders, loading, packages, loadPackages } = useBillingStore();
    const [monthFilter, setMonthFilter] = useState("all");
    const [packageFilter, setPackageFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchAllOrders();
                await loadPackages();
            } catch (err) {
                console.error('Error loading billing data:', err);
                // Optionally set an error state if needed
            }
        };
        loadData();
    }, [fetchAllOrders, loadPackages]);

    // Format months for filter
    const months = useMemo(() => {
        const uniqueMonths = new Set();
        orders.forEach(order => {
            const date = new Date(order.created_at);
            uniqueMonths.add(format(date, "MMMM yyyy", { locale: pt }));
        });
        return Array.from(uniqueMonths);
    }, [orders]);

    // Apply filters
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const date = new Date(order.created_at);
            const orderMonth = format(date, "MMMM yyyy", { locale: pt });

            const matchesMonth = monthFilter === "all" || orderMonth === monthFilter;
            const matchesPackage = packageFilter === "all" || order.package_name === packageFilter;
            const matchesSearch = searchTerm === "" ||
                (order.package_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.profiles?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.profiles?.email || "").toLowerCase().includes(searchTerm.toLowerCase());

            return matchesMonth && matchesPackage && matchesSearch;
        });
    }, [orders, monthFilter, packageFilter, searchTerm]);

    const metrics = useMemo(() => {
        const totalRevenue = filteredOrders
            .filter(o => o.status === 'approved')
            .reduce((acc, o) => acc + (o.price || 0), 0);
        const approvedCount = filteredOrders.filter(o => o.status === 'approved').length;
        const pendingRevenue = filteredOrders
            .filter(o => o.status === 'pending')
            .reduce((acc, o) => acc + (o.price || 0), 0);
        const pendingCount = filteredOrders.filter(o => o.status === 'pending').length;
        const totalCount = filteredOrders.length;
        return { totalRevenue, approvedCount, pendingRevenue, pendingCount, totalCount };
    }, [filteredOrders]);


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="ml-4 text-primary font-medium">Carregando dados de faturamento...</span>
            </div>
        );
    }


    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground mb-1 flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-primary" />
                        Faturamento & Transações
                    </h1>
                    <p className="text-muted-foreground font-medium">Controlo financeiro e métricas de vendas da plataforma.</p>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/10 transition-colors" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Receita Aprovada</p>
                            <h3 className="text-3xl font-black text-foreground">
                                {metrics.totalRevenue.toLocaleString('pt-PT')} <span className="text-sm font-bold">Kz</span>
                            </h3>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-green-600 bg-green-50 w-max px-2 py-0.5 rounded-full border border-green-100">
                        <CheckCircle2 className="w-3 h-3" /> {metrics.approvedCount} pedidos pagos
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Receita Pendente</p>
                            <h3 className="text-3xl font-black text-foreground">
                                {metrics.pendingRevenue.toLocaleString('pt-PT')} <span className="text-sm font-bold">Kz</span>
                            </h3>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-amber-600 bg-amber-50 w-max px-2 py-0.5 rounded-full border border-amber-100">
                        <AlertCircle className="w-3 h-3" /> {metrics.pendingCount} a aguardar validação
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total de Pedidos</p>
                            <h3 className="text-3xl font-black text-foreground">{metrics.totalCount}</h3>
                        </div>
                    </div>
                    <p className="mt-4 text-[11px] font-bold text-slate-500 italic">No período e filtros selecionados</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Procurar transação..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
                    <div className="relative min-w-[160px]">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 bg-muted/30 border border-border rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold cursor-pointer"
                        >
                            <option value="all">Todos os Meses</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative min-w-[160px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                            value={packageFilter}
                            onChange={(e) => setPackageFilter(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 bg-muted/30 border border-border rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold cursor-pointer"
                        >
                            <option value="all">Todos os Planos</option>
                            {packages.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-foreground">Histórico de Transações</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">ID / Data</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Cliente</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Plano / Créditos</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Estado</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground italic">Nenhuma transação encontrada para os filtros selecionados.</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground mb-0.5">#{order.id.slice(0, 8)}</div>
                                            <div className="text-[11px] font-medium text-slate-400">
                                                {format(new Date(order.created_at), "dd MMM yyyy, HH:mm", { locale: pt })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground">{order.profiles?.full_name || "Desconhecido"}</div>
                                            <div className="text-[11px] font-medium text-slate-400">{order.profiles?.email || "-"}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            <div className="text-primary font-bold">{order.package_name}</div>
                                            <div className="text-[11px] text-slate-500">{order.credits} créditos</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200' :
                                                order.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                                    'bg-amber-50 text-amber-600 border-amber-200'
                                                }`}>
                                                {order.status === 'approved' ? 'Aprovado' : order.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-base font-black text-foreground">
                                                {order.price.toLocaleString('pt-PT')} <span className="text-xs">Kz</span>
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
