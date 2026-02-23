import { useState, useEffect } from "react";
import { CreditCard, Plus, ArrowUpRight, ArrowDownRight, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../stores/authStore";

export default function AdminCredits() {
    const [transactions, setTransactions] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState("");
    const [amount, setAmount] = useState(1);
    const [search, setSearch] = useState("");

    const { addCredits, fetchAllProfiles, fetchTransactions } = useAuthStore();

    const loadData = async () => {
        setLoading(true);
        try {
            const [profiles, txs] = await Promise.all([
                fetchAllProfiles(),
                fetchTransactions()
            ]);
            setClients(profiles.filter(u => u.role === "client"));
            setTransactions(txs);
        } catch (error) {
            console.error("Error loading credit data:", error);
            toast.error("Erro ao carregar dados.");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [fetchAllProfiles, fetchTransactions]);

    const handleAddCredits = async (e) => {
        e.preventDefault();
        if (!selectedClient || amount <= 0) return;

        const toastId = toast.loading("A atribuir créditos...");
        try {
            await addCredits(selectedClient, parseInt(amount, 10), "Atribuição Manual");
            await loadData(); // Reload all to stay in sync
            setIsModalOpen(false);
            setSelectedClient("");
            setAmount(1);
            toast.success("Créditos atribuídos com sucesso!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atribuir créditos.", { id: toastId });
        }
    };

    const filteredTx = transactions.filter(tx => {
        const client = clients.find(c => c.id === tx.user_id);
        const name = client ? (client.full_name || "").toLowerCase() : "";
        const desc = (tx.description || "").toLowerCase();
        const searchLower = search.toLowerCase();
        return name.includes(searchLower) || desc.includes(searchLower);
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold glow-text mb-2">Transações & Créditos</h1>
                    <p className="text-slate-500 font-medium">Histórico de consumos e atribuição manual.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4" /> Atribuir Créditos
                </button>
            </div>

            <div className="glass-card rounded-xl p-4 flex items-center border border-white/5">
                <Search className="w-4 h-4 text-slate-400 mx-3" />
                <input
                    type="text"
                    placeholder="Pesquisar transação por cliente ou descrição..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-none text-sm placeholder:text-slate-400 focus:outline-none w-full text-foreground"
                />
            </div>

            {/* Transactions Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="glass-card rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 font-bold uppercase bg-white/5 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Data</th>
                                    <th className="px-6 py-4 font-medium">Cliente</th>
                                    <th className="px-6 py-4 font-medium">Descrição</th>
                                    <th className="px-6 py-4 font-medium">Tipo</th>
                                    <th className="px-6 py-4 font-medium text-right">Montante</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTx.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-muted">Ainda não existem transações.</td>
                                    </tr>
                                ) : (
                                    filteredTx.map(tx => {
                                        const client = clients.find(c => c.id === tx.user_id);
                                        const isConsumption = tx.type === 'consumption';
                                        return (
                                            <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium text-xs">
                                                    {new Date(tx.created_at).toLocaleString('pt-PT')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">
                                                    {client?.full_name || "Cliente Removido"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                                                    {tx.description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isConsumption ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>
                                                        {isConsumption ? 'Consumo' : 'Carregamento'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-bold flex items-center justify-end gap-1">
                                                    {isConsumption ? (
                                                        <ArrowDownRight className="w-4 h-4 text-orange-400" />
                                                    ) : (
                                                        <ArrowUpRight className="w-4 h-4 text-green-400" />
                                                    )}
                                                    <span className={isConsumption ? "text-orange-400" : "text-green-400"}>
                                                        {isConsumption ? '-' : '+'}{tx.amount}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Add Credits */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="glass-card border border-white/10 rounded-xl w-full max-w-md p-6 relative">
                        <h2 className="text-xl font-heading font-bold mb-4">Adicionar Créditos</h2>
                        <form onSubmit={handleAddCredits} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Cliente</label>
                                <select
                                    required
                                    value={selectedClient}
                                    onChange={(e) => setSelectedClient(e.target.value)}
                                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                                >
                                    <option value="" disabled>Selecione um cliente...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Quantidade</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm text-foreground bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm text-white bg-primary hover:bg-primary-light rounded-lg transition-colors"
                                >
                                    Confirmar Atribuição
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
