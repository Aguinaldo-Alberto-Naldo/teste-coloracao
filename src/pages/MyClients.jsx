import { useEffect, useState } from "react";
import { useTestableClientsStore } from "../stores/testableClientsStore";
import { useAuthStore } from "../stores/authStore";
import { Loader2, Plus, Users, Search, Edit2, Trash2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function MyClients() {
    const { currentUser } = useAuthStore();
    const { clients, loading, loadClients, addClient, updateClient, deleteClient } = useTestableClientsStore();
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (currentUser?.id) {
            loadClients(currentUser.id);
        }
    }, [currentUser, loadClients]);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOpenModal = (client = null) => {
        if (client) {
            setEditingClient(client);
            setFormData({ name: client.name, email: client.email || "", phone: client.phone || "" });
        } else {
            setEditingClient(null);
            setFormData({ name: "", email: "", phone: "" });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
        setFormData({ name: "", email: "", phone: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("O nome é obrigatório");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingClient) {
                await updateClient(editingClient.id, {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                });
            } else {
                await addClient({
                    userId: currentUser.id,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                });
            }
            handleCloseModal();
        } catch {
            // Error is handled in store
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Tem certeza que deseja eliminar o cliente ${name}?`)) {
            await deleteClient(id);
        }
    };

    if (loading && clients.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
                        <Users className="w-8 h-8 text-primary" />
                        A Minha Base de Clientes
                    </h1>
                    <p className="text-muted-foreground mt-1">Gerencie os clientes para os quais realiza testes.</p>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-r from-[#db2777] to-[#4f46e5] hover:scale-[1.02] active:scale-95 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Cliente
                </button>
            </div>

            <div className="bg-card shadow-sm border border-border rounded-xl p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Pesquisar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="p-4 font-semibold text-muted-foreground">Nome</th>
                                <th className="p-4 font-semibold text-muted-foreground">Contactos</th>
                                <th className="p-4 font-semibold text-muted-foreground">Data de Registo</th>
                                <th className="p-4 font-semibold text-muted-foreground text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-foreground">{client.name}</div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="flex flex-col gap-1">
                                                {client.email ? (
                                                    <span className="flex items-center text-muted-foreground">
                                                        <Mail className="w-3.5 h-3.5 mr-1.5" /> {client.email}
                                                    </span>
                                                ) : <span className="text-muted-foreground/50 italic text-xs">Sem email</span>}
                                                {client.phone && (
                                                    <span className="flex items-center text-muted-foreground">
                                                        <Phone className="w-3.5 h-3.5 mr-1.5" /> {client.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">
                                            {new Date(client.created_at).toLocaleDateString('pt-PT')}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => window.location.href = `/my-clients/${client.id}`}
                                                    className="p-2 text-primary hover:text-primary-foreground bg-primary/10 hover:bg-primary rounded-lg transition-colors"
                                                    title="Ver Testes"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(client)}
                                                    className="p-2 text-muted-foreground hover:text-primary bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(client.id, client.name)}
                                                    className="p-2 text-muted-foreground hover:text-destructive bg-secondary/50 hover:bg-destructive/10 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-muted-foreground">
                                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Nenhum cliente encontrado.</p>
                                        {searchTerm && <p className="text-sm mt-1">Tente pesquisar com outros termos.</p>}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Add/Edit Client */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-border bg-muted/10">
                            <h2 className="text-xl font-bold font-heading">
                                {editingClient ? "Editar Cliente" : "Novo Cliente"}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Nome Completo *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Ex: Maria Silva"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Email (Opcional)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Ex: maria.silva@email.com"
                                />
                                <p className="text-xs text-muted-foreground">O emal precisa de ser único para cada cliente do consultor.</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Telefone (Opcional)</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Ex: 912345678"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-4 mt-2 border-t border-border/50">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-input rounded-lg font-medium hover:bg-muted/50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {editingClient ? "Guardar" : "Adicionar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
