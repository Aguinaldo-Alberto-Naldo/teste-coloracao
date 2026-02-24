import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useNotificationsStore } from "../stores/notificationsStore";
import { supabase } from "../lib/supabase";
import { Send, Users, User, Bell, Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";

export default function AdminNotifications() {
    const { currentUser, fetchAllProfiles } = useAuthStore();
    const { sendNotification } = useNotificationsStore();

    const [targetType, setTargetType] = useState("all"); // all, single
    const [userId, setUserId] = useState("");
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("info");
    const [link, setLink] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const loadUsers = async () => {
            setLoadingUsers(true);
            try {
                const profiles = await fetchAllProfiles();
                // Filter out admins and format if needed
                const clients = profiles.filter(p => p.role !== 'admin');
                setUsers(clients);
            } catch (err) {
                console.error("DEBUG Error fetching users for alerts:", err);
                toast.error("Erro ao carregar lista de usuários.");
            } finally {
                setLoadingUsers(false);
            }
        };
        loadUsers();
    }, [fetchAllProfiles]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !message) {
            toast.error("Preencha o título e a mensagem.");
            return;
        }

        setSending(true);
        try {
            if (targetType === "all") {
                // Bulk insert
                const notifications = users.map(u => ({
                    user_id: u.id,
                    title,
                    message,
                    type,
                    link: link || null
                }));

                const { error } = await supabase
                    .from('notifications')
                    .insert(notifications);

                if (error) throw error;
                toast.success(`Notificação enviada para ${users.length} usuários.`);
            } else {
                if (!userId) {
                    toast.error("Selecione um usuário.");
                    return;
                }
                await sendNotification({
                    user_id: userId,
                    title,
                    message,
                    type,
                    link: link || null
                });
                toast.success("Notificação enviada com sucesso.");
            }

            setTitle("");
            setMessage("");
            setLink("");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar notificação.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-3xl font-heading font-bold glow-text mb-2">Gestão de Alertas</h1>
                <p className="text-slate-500 font-medium italic">Envie notificações manuais para os seus usuários de forma global ou individual.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 border border-border space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Para quem?</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setTargetType("all")}
                                        className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${targetType === "all" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" : "bg-card text-muted-foreground border-border hover:border-primary/50"}`}
                                    >
                                        <Users className="w-4 h-4" /> Todos
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTargetType("single")}
                                        className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${targetType === "single" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" : "bg-card text-muted-foreground border-border hover:border-primary/50"}`}
                                    >
                                        <User className="w-4 h-4" /> Individual
                                    </button>
                                </div>
                            </div>

                            {targetType === "single" && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Selecionar Usuário</label>
                                    <select
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all font-medium h-[52px]"
                                    >
                                        <option value="">Escolha um usuário...</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Tipo de Alerta</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'info', icon: Info, color: 'text-primary' },
                                    { id: 'warning', icon: AlertTriangle, color: 'text-warning' },
                                    { id: 'success', icon: CheckCircle2, color: 'text-success' },
                                    { id: 'plan', icon: AlertTriangle, color: 'text-destructive' }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setType(t.id)}
                                        className={`px-4 py-2 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all ${type === t.id ? 'bg-secondary border-primary shadow-sm' : 'bg-background border-border hover:border-border/80'}`}
                                    >
                                        <t.icon className={`w-4 h-4 ${t.color}`} />
                                        {t.id.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="space-y-2 text-left w-full">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Título</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Novo recurso disponível!"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2 text-left w-full">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Mensagem</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Descreva o alerta..."
                                    rows={4}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all font-medium resize-none"
                                />
                            </div>

                            <div className="space-y-2 text-left w-full">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Link Relacionado (Opcional)</label>
                                <input
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="Ex: /store"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                        >
                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Enviar Notificação
                        </button>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="glass-card rounded-xl p-6 border border-border bg-primary/5">
                        <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                            <Bell className="w-4 h-4 text-primary" /> Sugestões de Alertas
                        </h3>
                        <div className="space-y-3">
                            <div className="text-xs p-3 bg-background rounded-lg border border-border/50 font-medium">
                                <strong className="text-primary block mb-1">Manutenção:</strong>
                                Amanhã às 04:00 o sistema estará indisponível por 15 min.
                            </div>
                            <div className="text-xs p-3 bg-background rounded-lg border border-border/50 font-medium">
                                <strong className="text-primary block mb-1">Promoção:</strong>
                                Pack Profissional com 20% de desconto hoje!
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
