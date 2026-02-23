import { useState, useEffect } from "react";
import { Search, Mail, Loader2 } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

export default function AdminClients() {
    const [search, setSearch] = useState("");
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchAllProfiles } = useAuthStore();

    useEffect(() => {
        const loadClients = async () => {
            setLoading(true);
            try {
                const profiles = await fetchAllProfiles();
                setClients(profiles.filter(u => u.role === "client"));
            } catch (error) {
                console.error("Error loading clients:", error);
            }
            setLoading(false);
        };
        loadClients();
    }, [fetchAllProfiles]);

    const filteredClients = clients.filter(c =>
        (c.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-heading font-bold glow-text mb-2">Clientes</h1>
                <p className="text-slate-500 font-medium">Lista e gestão global dos perfis de clientes.</p>
            </div>

            {/* Filter Bar */}
            <div className="glass-card rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between border border-white/5">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar cliente (nome, email)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-input text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    />
                </div>
            </div>

            {/* Table */}
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
                                    <th className="px-6 py-4 font-medium">Nome</th>
                                    <th className="px-6 py-4 font-medium hidden lg:table-cell">Email</th>
                                    <th className="px-6 py-4 font-medium">Plano Atual</th>
                                    <th className="px-6 py-4 font-medium text-center">Consumidos</th>
                                    <th className="px-6 py-4 font-medium text-center">Restantes</th>
                                    <th className="px-6 py-4 font-medium text-center">Expira Em</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-muted">
                                            Nenhum cliente encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClients.map((client) => {
                                        const available = (client.credits_total || 0) - (client.credits_used || 0);

                                        let daysLeft = null;
                                        if (client.credits_expiration) {
                                            const diffTime = new Date(client.credits_expiration).getTime() - new Date().getTime();
                                            daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                            if (daysLeft < 0) daysLeft = 0;
                                        }

                                        return (
                                            <tr key={client.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-semibold text-foreground">
                                                    {client.full_name || "Sem Nome"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 hidden lg:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3 h-3" />
                                                        {client.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-primary font-bold">
                                                    {client.current_plan || "Nenhum"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-slate-500 font-medium">
                                                    {client.credits_used || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`px-2 py-1 rounded inline-flex font-bold text-xs ${available > 0 ? 'bg-primary/20 text-primary-light' : 'bg-destructive/20 text-destructive'}`}>
                                                        {available}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-slate-500 font-semibold">
                                                    {daysLeft !== null ? (
                                                        <span className={daysLeft <= 5 ? "text-orange-400" : ""}>{daysLeft} dias</span>
                                                    ) : "-"}
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
        </div>
    );
}
