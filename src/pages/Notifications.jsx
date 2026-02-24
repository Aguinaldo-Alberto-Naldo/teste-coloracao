import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useNotificationsStore } from "../stores/notificationsStore";
import { Bell, Info, AlertTriangle, CheckCircle2, Ticket, Check, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Notifications() {
    const { currentUser } = useAuthStore();
    const { notifications, loading, loadNotifications, markAsRead, markAllAsRead } = useNotificationsStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            loadNotifications(currentUser.id);
        }
    }, [currentUser, loadNotifications]);

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-5 h-5 text-warning" />;
            case 'success': return <CheckCircle2 className="w-5 h-5 text-success" />;
            case 'ticket': return <Ticket className="w-5 h-5 text-primary" />;
            case 'plan': return <AlertTriangle className="w-5 h-5 text-destructive" />;
            default: return <Info className="w-5 h-5 text-primary" />;
        }
    };

    if (!currentUser) return null;

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold glow-text mb-2">Notificações</h1>
                    <p className="text-slate-500 font-medium italic">Fique a par de todas as atualizações e alertas da sua conta.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => markAllAsRead(currentUser.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs rounded-lg border border-border transition-all"
                    >
                        <Check className="w-4 h-4" /> Marcar todas como lidas
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="glass-card rounded-xl p-16 text-center border-dashed border-2 border-border">
                    <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-foreground">Sem notificações</h3>
                    <p className="text-slate-500 text-sm">Não tem nenhuma notificação de momento.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`glass-card rounded-xl p-5 border border-border flex gap-4 transition-all hover:shadow-md cursor-pointer ${!n.is_read ? 'border-l-4 border-l-primary' : ''}`}
                            onClick={() => {
                                markAsRead(n.id);
                                if (n.link) navigate(n.link);
                            }}
                        >
                            <div className="shrink-0 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center">
                                {getIcon(n.type)}
                            </div>
                            <div className="flex-1 space-y-1 overflow-hidden">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className={`font-bold truncate ${!n.is_read ? 'text-foreground' : 'text-slate-500'}`}>
                                        {n.title}
                                    </h4>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight shrink-0">
                                        {new Date(n.created_at).toLocaleDateString('pt-PT')}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                    {n.message}
                                </p>
                                {n.link && (
                                    <div className="pt-2">
                                        <span className="text-xs font-bold text-primary hover:underline">Ir para detalhe →</span>
                                    </div>
                                )}
                            </div>
                            {!n.is_read && (
                                <div className="shrink-0 flex items-center">
                                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
