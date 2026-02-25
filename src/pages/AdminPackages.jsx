import { useState, useEffect } from "react";
import { useBillingStore } from "../stores/billingStore";
import { Copy, Plus, Edit2, Trash2, CheckCircle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminPackages() {
    const { packages, loadPackages, addPackage, updatePackage, deletePackage } = useBillingStore();
    const [isEditing, setIsEditing] = useState(false);
    const [currentPkg, setCurrentPkg] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                await loadPackages();
            } catch (err) {
                console.error("Error loading packages:", err);
            }
            setLoading(false);
        };
        load();
    }, [loadPackages]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const pkgData = {
            name: formData.get("name"),
            credits: parseInt(formData.get("credits"), 10),
            price: parseInt(formData.get("price"), 10),
            description: formData.get("description"),
            is_popular: formData.get("isPopular") === "on",
        };

        const toastId = toast.loading("A guardar pacote...");
        try {
            if (currentPkg?.id) {
                await updatePackage(currentPkg.id, pkgData);
                toast.success("Pacote atualizado com sucesso!", { id: toastId });
            } else {
                await addPackage(pkgData);
                toast.success("Novo pacote criado com sucesso!", { id: toastId });
            }
            setIsEditing(false);
            setCurrentPkg(null);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao salvar pacote.", { id: toastId });
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Tem a certeza que pretende eliminar este pacote?")) {
            try {
                await deletePackage(id);
                toast.success("Pacote eliminado.");
            } catch {
                toast.error("Erro ao eliminar pacote.");
            }
        }
    };

    const openEditMode = (pkg = null) => {
        setCurrentPkg(pkg);
        setIsEditing(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold glow-text mb-2">Pacotes de Créditos</h1>
                    <p className="text-slate-500 font-medium">Faça a gestão dos planos mensais. Tudo o que alterar aqui refletirá na Landing Page e na loja dos clientes.</p>
                </div>
                <button
                    onClick={() => openEditMode()}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4" /> Novo Pacote
                </button>
            </div>

            {isEditing && (
                <div className="glass-card rounded-xl border border-white/10 p-6 mb-8 animate-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                        <h2 className="text-xl font-heading font-bold">{currentPkg ? "Editar Pacote" : "Criar Novo Pacote"}</h2>
                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nome do Plano</label>
                            <input name="name" defaultValue={currentPkg?.name} required className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary font-medium" placeholder="ex: Iniciante" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Preço (AOA)</label>
                            <input type="number" name="price" defaultValue={currentPkg?.price} required className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary font-medium" placeholder="ex: 25000" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Créditos / Testes</label>
                            <input type="number" name="credits" defaultValue={currentPkg?.credits} required className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary font-medium" placeholder="ex: 50" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descrição</label>
                            <input name="description" defaultValue={currentPkg?.description} required className="w-full bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-primary font-medium" placeholder="Pequena frase chamativa." />
                        </div>
                        <div className="space-y-1 md:col-span-2 flex items-center gap-3">
                            <input type="checkbox" name="isPopular" id="isPopular" defaultChecked={currentPkg?.is_popular} className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-primary" />
                            <label htmlFor="isPopular" className="text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer">Destacar como "Popular" na Landing Page</label>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-foreground bg-white/5 hover:bg-white/10 rounded-lg transition-colors">Cancelar</button>
                            <button type="submit" className="px-5 py-2 text-sm text-white bg-primary hover:bg-primary-light rounded-lg transition-colors font-medium">Salvar Pacote</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {[...packages].sort((a, b) => a.price - b.price).map(pkg => (
                        <div key={pkg.id} className="glass-card rounded-xl p-8 border border-white/5 relative overflow-hidden group flex flex-col">
                            {pkg.is_popular && (
                                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-bl-lg">
                                    Popular
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-heading font-bold text-primary-light">{pkg.name}</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditMode(pkg)} className="p-1.5 text-slate-400 hover:text-primary transition-colors bg-white/5 rounded-md" title="Editar"><Edit2 className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleDelete(pkg.id)} className="p-1.5 text-slate-400 hover:text-destructive transition-colors bg-white/5 rounded-md" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 font-medium mb-6">{pkg.description}</p>

                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-foreground">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(pkg.price)}</span>
                                <span className="text-sm text-slate-500 font-medium">/ mês</span>
                            </div>

                            <div className="space-y-3 border-t border-white/5 pt-6 flex-1">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-accent" />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{pkg.credits} Análises de IA</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-accent" />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Validade de 1 Mês</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-accent" />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Relatórios em PDF</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && packages.length === 0 && (
                <div className="text-center py-12 text-muted glass-card border flex flex-col items-center justify-center rounded-xl">
                    <p>Ainda não existem pacotes criados.</p>
                </div>
            )}
        </div>
    );
}
