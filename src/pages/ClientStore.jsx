import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useBillingStore } from "../stores/billingStore";
import { toast } from "sonner";
import { ShoppingCart, CheckCircle2, Package, History, UploadCloud, X } from "lucide-react";

export default function ClientStore() {
    const { currentUser } = useAuthStore();
    const { packages, createOrder, orders, loadOrders } = useBillingStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [view, setView] = useState("store"); // 'store' | 'history'

    // Upload Modal State
    const [selectedPack, setSelectedPack] = useState(null);
    const [proofFile, setProofFile] = useState(null);
    const [proofPreview, setProofPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (currentUser) {
            loadOrders(currentUser.id);
        }
    }, [currentUser, loadOrders]);

    if (!currentUser) return null;

    const myOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const handlePurchaseClick = (pkg) => {
        setSelectedPack(pkg);
        setProofFile(null);
        setProofPreview(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // check size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("O ficheiro é demasiado grande. O limite é 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProofFile(file);
            setProofPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const confirmPurchase = async () => {
        if (!proofPreview) {
            toast.error("Por favor, faça o upload do comprovativo de pagamento.");
            return;
        }

        setIsSubmitting(true);
        // Simulate a tiny delay for feeling real
        await new Promise(r => setTimeout(r, 800));

        const order = await createOrder(currentUser.id, selectedPack.id, proofPreview);

        setIsSubmitting(false);
        if (order) {
            toast.success("Pedido submetido com sucesso! Aguarda aprovação do Administrador.");
            setSelectedPack(null);
            setView("history");
        } else {
            toast.error("Erro ao processar o seu pedido.");
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-12 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold glow-text mb-2">Loja de Créditos</h1>
                    <p className="text-slate-500 font-medium">Adquira pacotes de testes para utilizar no Portal.</p>
                </div>
                <div className="flex bg-secondary p-1 rounded-lg border border-border">
                    <button
                        onClick={() => setView("store")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-colors ${view === "store" ? "bg-card text-foreground shadow-sm" : "text-slate-500 hover:text-foreground"}`}
                    >
                        <ShoppingCart className="w-4 h-4" /> Pacotes
                    </button>
                    <button
                        onClick={() => setView("history")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-colors ${view === "history" ? "bg-card text-foreground shadow-sm" : "text-slate-500 hover:text-foreground"}`}
                    >
                        <History className="w-4 h-4" /> Histórico
                    </button>
                </div>
            </div>

            {view === "store" && (
                <div className="grid md:grid-cols-3 gap-8 mt-8">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className={`glass-card relative flex flex-col p-8 rounded-3xl border ${pkg.isPopular ? 'border-primary ring-1 ring-primary/20 scale-105 shadow-xl z-10' : 'border-border'}`}>
                            {pkg.isPopular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full">
                                    Mais Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-foreground mb-2">{pkg.name}</h3>
                                <p className="text-slate-500 font-medium text-sm">{pkg.description}</p>
                            </div>

                            <div className="mb-8">
                                <span className="text-4xl font-extrabold text-foreground">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(pkg.price)}</span>
                                <span className="text-slate-500 font-bold text-sm"> / pacote</span>
                            </div>

                            <div className="flex-1">
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                        <span className="font-semibold text-foreground">{pkg.credits} Análises UI/AI</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                        <span className="text-sm text-foreground">Acesso a todos os relatórios PDF</span>
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={() => handlePurchaseClick(pkg)}
                                className={`w-full py-4 rounded-xl font-bold transition-all ${pkg.isPopular
                                    ? 'bg-moving-gradient text-white hover:shadow-[0_10px_20px_-5px_rgba(124,58,237,0.4)]'
                                    : 'bg-secondary hover:bg-muted text-foreground border border-border'
                                    }`}
                            >
                                Adquirir
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {view === "history" && (
                <div className="glass-card rounded-xl overflow-hidden border border-border shadow-lg">
                    {myOrders.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="font-bold">Nenhuma encomenda realizada.</p>
                            <p className="text-sm font-medium mt-1">Os seus pedidos de atribuição de créditos aparecerão aqui.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 font-bold uppercase bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 font-bold tracking-wider">Data</th>
                                        <th className="px-6 py-4 font-medium">Pacote</th>
                                        <th className="px-6 py-4 font-medium">Créditos</th>
                                        <th className="px-6 py-4 font-medium">Preço</th>
                                        <th className="px-6 py-4 font-medium">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myOrders.map(order => (
                                        <tr key={order.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-bold text-xs">
                                                {new Date(order.created_at).toLocaleString('pt-AO')}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-foreground">
                                                {order.package_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-primary font-bold">
                                                +{order.credits}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-foreground font-semibold">
                                                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(order.price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${order.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                    order.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                        'bg-red-100 text-red-700 border border-red-200'
                                                    }`}>
                                                    {order.status === 'pending' ? 'Pendente' :
                                                        order.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* UPOLOAD MODAL */}
            {selectedPack && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card rounded-2xl border border-border w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
                            <h3 className="font-heading font-bold text-lg text-foreground">Confirmar Subscrição</h3>
                            <button onClick={() => setSelectedPack(null)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 mb-6 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-primary font-bold uppercase tracking-wider mb-1">Pacote</p>
                                    <p className="font-heading font-bold text-lg text-foreground">{selectedPack.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-primary font-bold uppercase tracking-wider mb-1">Total</p>
                                    <p className="font-heading font-bold text-lg text-foreground">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(selectedPack.price)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-foreground mb-2">Comprovativo de Pagamento</label>
                                <p className="text-[11px] text-slate-500 font-medium mb-4">Para concluir a compra, por favor anexe um ficheiro comprovativo do pagamento (PDF ou Imagem).</p>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileChange}
                                />

                                {!proofPreview ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 hover:border-primary/50 transition-colors group"
                                    >
                                        <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <UploadCloud className="w-6 h-6 text-primary" />
                                        </div>
                                        <p className="text-sm font-bold text-foreground">Clique para enviar comprovativo</p>
                                        <p className="text-xs text-muted-foreground mt-1">Imagens (JPG, PNG) ou Documentos (PDF)</p>
                                    </div>
                                ) : (
                                    <div className="relative border border-border rounded-xl p-4 flex items-center gap-4 bg-muted/20">
                                        {proofFile?.type?.includes('image') ? (
                                            <img src={proofPreview} alt="Comprovativo" className="w-16 h-16 object-cover rounded-lg border border-border shadow-sm" />
                                        ) : (
                                            <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-lg border border-primary/20 text-primary">
                                                <Package className="w-8 h-8" />
                                            </div>
                                        )}
                                        <div className="flex-1 truncate">
                                            <p className="text-sm font-bold text-foreground truncate">{proofFile?.name}</p>
                                            <p className="text-xs text-slate-500 font-bold italic">
                                                {(proofFile?.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => { setProofFile(null); setProofPreview(null); }}
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 pt-0 mt-auto">
                            <button
                                onClick={confirmPurchase}
                                disabled={isSubmitting || !proofFile}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processando...</>
                                ) : (
                                    "Submeter Subscrição"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
