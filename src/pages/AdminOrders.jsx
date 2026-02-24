import { useState, useEffect } from "react";
import { useBillingStore } from "../stores/billingStore";
import { useAuthStore } from "../stores/authStore";
import { toast } from "sonner";
import { Package, Check, X, Search, Eye, Loader2 } from "lucide-react";

export default function AdminOrders() {
    const { orders, loadOrders, updateOrderStatus } = useBillingStore();
    const { addCredits, fetchAllProfiles } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [viewingProof, setViewingProof] = useState(null);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadOrders(),
                fetchAllProfiles().then(setClients)
            ]);
        } catch (error) {
            console.error("Error loading orders:", error);
            toast.error("Erro ao carregar pedidos.");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const pendingOrders = orders.filter(order => order && order.status === 'pending').filter(order => {
        const client = clients.find(c => c.id === order.user_id);
        const name = client ? (client.full_name || "").toLowerCase() : "";
        const packName = (order.package_name || "").toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return name.includes(searchLower) || packName.includes(searchLower) || (order.user_id || "").includes(searchLower);
    });

    const handleApprove = async (order) => {
        if (!order) return;
        if (window.confirm(`Tem a certeza que deseja aprovar o pacote de ${order.credits} testes? O saldo do utilizador será incrementado de imediato.`)) {
            const toastId = toast.loading("A aprovar pedido...");
            try {
                // IMPORTANT: updateOrderStatus must complete successfully before addCredits
                const updated = await updateOrderStatus(order.id, 'approved');
                if (updated) {
                    await addCredits(order.user_id, order.credits, order.package_name);
                    toast.success("Pedido aprovado e créditos atribuídos!", { id: toastId });
                    setViewingProof(null);
                } else {
                    throw new Error("Falha ao atualizar estado do pedido.");
                }
            } catch (error) {
                console.error("DEBUG:", error);
                const msg = error?.message || error?.error_description || JSON.stringify(error) || "Desconhecido";
                toast.error(`Erro ao aprovar: ${msg}`, { id: toastId });
            }
        }
    };

    const handleReject = async (order) => {
        if (window.confirm("Pretende rejeitar este pedido de compra?")) {
            const toastId = toast.loading("A rejeitar pedido...");
            try {
                await updateOrderStatus(order.id, 'rejected');
                toast.info("Pedido rejeitado.", { id: toastId });
                setViewingProof(null);
            } catch (error) {
                console.error(error);
                toast.error("Erro ao rejeitar pedido.", { id: toastId });
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12 relative">
            <div>
                <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Pedidos de Créditos (Loja)</h1>
                <p className="text-muted-foreground">Analise as transações pendentes dos clientes e atribua os testes finais.</p>
            </div>

            <div className="glass-card rounded-xl p-4 flex items-center gap-4 mb-6 border border-border">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Procurar por ID de utilizador ou pacote..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="glass-card rounded-xl overflow-hidden border border-border mt-8 shadow-sm">
                    {pendingOrders.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-bold text-foreground mb-1">Nenhum pedido pendente</h3>
                            <p className="text-sm">Todos os pedidos foram analisados e despachados.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Data</th>
                                        <th className="px-6 py-4 font-bold">Cliente</th>
                                        <th className="px-6 py-4 font-bold">Pacote Requisitado</th>
                                        <th className="px-6 py-4 font-bold">Valor</th>
                                        <th className="px-6 py-4 font-bold text-right">Acções de Gestor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingOrders.map(order => {
                                        const client = clients.find(c => c.id === order.user_id);
                                        return (
                                            <tr key={order.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs">
                                                    {new Date(order.created_at).toLocaleString('pt-PT')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{client?.full_name || "Utilizador Desconhecido"}</div>
                                                    <div className="text-[10px] text-muted-foreground font-mono">{order.user_id}</div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-primary">
                                                    {order.package_name} (+{order.credits} testes)
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-foreground">
                                                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(order.price)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-2 items-center">
                                                        {order.receipt_proof && (
                                                            <button
                                                                onClick={() => setViewingProof(order)}
                                                                className="inline-flex items-center text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors border border-primary/20 hover:border-primary/50"
                                                                title="Ver Comprovativo"
                                                            >
                                                                <Eye className="w-3 h-3 mr-1" /> Comprovativo
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleReject(order)}
                                                            className="inline-flex items-center text-xs font-semibold text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-md transition-colors border border-transparent hover:border-destructive/20"
                                                        >
                                                            <X className="w-3 h-3 mr-1" /> Rejeitar
                                                        </button>
                                                        <button
                                                            onClick={() => handleApprove(order)}
                                                            className="inline-flex items-center text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md transition-colors shadow-sm"
                                                        >
                                                            <Check className="w-3 h-3 mr-1" /> Aprovar Compra
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* PROOF VIEWER MODAL */}
            {viewingProof && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card rounded-2xl border border-border w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
                            <div>
                                <h3 className="font-heading font-bold text-lg text-foreground">Comprovativo de Pagamento</h3>
                                <p className="text-sm text-muted-foreground">Pacote: {viewingProof.package_name} ({new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(viewingProof.price)})</p>
                            </div>
                            <button onClick={() => setViewingProof(null)} className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-auto bg-muted/5 flex items-center justify-center flex-1 min-h-[300px]">
                            {viewingProof.receipt_proof.startsWith("data:application/pdf") ? (
                                <iframe
                                    src={viewingProof.receipt_proof}
                                    className="w-full h-[60vh] rounded-xl border border-border bg-white"
                                    title="PDF Viewer"
                                />
                            ) : (
                                <img
                                    src={viewingProof.receipt_proof}
                                    alt="Comprovativo"
                                    className="max-w-full max-h-[60vh] object-contain rounded-xl border border-border shadow-md"
                                />
                            )}
                        </div>

                        <div className="p-6 border-t border-border flex justify-between items-center bg-card">
                            <p className="text-sm font-medium text-muted-foreground">Utilizador: {clients.find(c => c.id === viewingProof.user_id)?.full_name || viewingProof.user_id}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleReject(viewingProof)}
                                    className="bg-destructive/10 text-destructive hover:bg-destructive/20 font-bold py-2 px-6 rounded-lg transition-colors"
                                >
                                    Rejeitar Pedido
                                </button>
                                <button
                                    onClick={() => handleApprove(viewingProof)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-colors"
                                >
                                    Aprovar Comprovativo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
