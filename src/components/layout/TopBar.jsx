import { Menu, Bell, User, Settings, LogOut, Check, Info, AlertTriangle, CheckCircle2, Ticket } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useNotificationsStore } from "../../stores/notificationsStore";
import { useEffect } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";

export default function TopBar({ onMenuClick }) {
    const { currentUser, logout } = useAuthStore();
    const { notifications, unreadCount, loadNotifications, markAsRead, markAllAsRead } = useNotificationsStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            loadNotifications(currentUser.id);
        }
    }, [currentUser, loadNotifications]);

    if (!currentUser) return null;

    const creditsTotal = currentUser.creditsTotal ?? 0;
    const creditsUsed = currentUser.creditsUsed ?? 0;
    const creditsAvailable = creditsTotal - creditsUsed;
    const initial = (currentUser.fullName || currentUser.email || "?").charAt(0).toUpperCase();

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
            case 'success': return <CheckCircle2 className="w-4 h-4 text-success" />;
            case 'ticket': return <Ticket className="w-4 h-4 text-primary" />;
            case 'plan': return <AlertTriangle className="w-4 h-4 text-destructive" />;
            default: return <Info className="w-4 h-4 text-primary" />;
        }
    };

    const isAdmin = currentUser.role === "admin";

    return (
        <header className={`h-16 border-b backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 transition-all duration-500 ${isAdmin
            ? "bg-slate-950 border-gold/40 shadow-[0_4px_30px_rgba(212,175,55,0.2)]"
            : "bg-primary border-white/10 shadow-lg shadow-primary/10"
            }`}>
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className={`md:hidden p-2 rounded-lg transition-colors border border-transparent ${isAdmin
                        ? "text-slate-300 hover:bg-white/10 hover:border-gold/20"
                        : "text-white/90 hover:bg-white/10 hover:border-white/10"
                        }`}
                    aria-label="Abrir Menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="hidden md:flex items-center gap-3">
                    <div className={`text-sm font-medium ${isAdmin ? "text-slate-400" : "text-white/70"}`}>
                        Olá, <span className={`font-bold ${isAdmin ? "text-white" : "text-white"}`}>{currentUser.fullName}</span>
                    </div>
                    {isAdmin && (
                        <span className="px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-[10px] font-black text-gold uppercase tracking-widest animate-pulse">
                            Modo Gestão
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {currentUser.role !== "admin" && (
                    <div className="flex flex-col items-end mr-2 hidden sm:flex">
                        <span className="text-[11px] text-white/60 font-bold uppercase tracking-tight">Créditos Disponíveis</span>
                        <span className="text-sm font-bold text-white drop-shadow-sm">
                            {creditsAvailable} {creditsAvailable === 1 ? 'teste' : 'testes'}
                        </span>
                    </div>
                )}

                {/* Notifications Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={`relative p-2 rounded-full transition-colors outline-none ${isAdmin
                            ? "text-slate-400 hover:text-white hover:bg-white/10"
                            : "text-white/80 hover:text-white hover:bg-white/10"
                            }`}>
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className={`absolute top-1.5 right-1.5 w-4 h-4 text-[10px] font-bold text-white rounded-full border flex items-center justify-center ${isAdmin
                                    ? "bg-gold border-slate-900"
                                    : "bg-accent border-primary"
                                    }`}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={`w-80 mt-2 p-0 overflow-hidden border ${isAdmin ? "bg-slate-900 border-gold/20" : "border-border"}`}>
                        <div className={`p-4 border-b flex justify-between items-center ${isAdmin ? "bg-slate-800/50 border-gold/10" : "bg-muted/50 border-border"}`}>
                            <DropdownMenuLabel className={`p-0 font-bold ${isAdmin ? "text-white" : ""}`}>Notificações</DropdownMenuLabel>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllAsRead(currentUser.id)}
                                    className={`text-[11px] font-bold hover:underline ${isAdmin ? "text-gold" : "text-primary"}`}
                                >
                                    Marcar todas como lidas
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className={`p-8 text-center italic text-sm ${isAdmin ? "text-slate-500" : "text-slate-500"}`}>
                                    Não tem notificações no momento.
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <DropdownMenuItem
                                        key={n.id}
                                        onClick={() => {
                                            markAsRead(n.id);
                                            if (n.link) navigate(n.link);
                                        }}
                                        className={`p-4 border-b last:border-0 cursor-pointer flex items-start gap-4 transition-colors ${isAdmin
                                            ? "border-gold/5 hover:bg-white/5 focus:bg-white/5"
                                            : "border-border focus:bg-muted"
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${isAdmin ? "bg-slate-800" : "bg-white"}`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <h4 className={`text-sm font-bold truncate ${isAdmin ? "text-slate-200" : "text-foreground"}`}>{n.title}</h4>
                                                {!n.is_read && <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${isAdmin ? "bg-gold" : "bg-primary"}`} />}
                                            </div>
                                            <p className={`text-xs leading-relaxed line-clamp-2 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>{n.message}</p>
                                            <span className="text-[10px] text-slate-400 font-medium mt-1">
                                                {new Date(n.created_at).toLocaleDateString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </div>
                        <DropdownMenuSeparator className={isAdmin ? "bg-gold/10 m-0" : "m-0"} />
                        <Link to="/notifications" className={`block w-full text-center py-3 text-xs font-bold transition-colors ${isAdmin
                            ? "text-slate-400 hover:text-gold hover:bg-white/5"
                            : "text-slate-500 hover:text-primary hover:bg-muted/50"
                            }`}>
                            Ver todas as notificações
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={`flex items-center gap-2 p-1.5 border rounded-full transition-all outline-none ${isAdmin
                            ? "bg-white/5 border-gold/30 hover:bg-white/10 hover:border-gold/50"
                            : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30"
                            }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${isAdmin
                                ? "bg-gold text-slate-900"
                                : "bg-white text-primary"
                                }`}>
                                {initial}
                            </div>
                            <div className="hidden sm:block text-left mr-1">
                                <p className={`text-[11px] font-black uppercase tracking-tighter leading-none mb-0.5 ${isAdmin ? "text-gold" : "text-white"}`}>
                                    {isAdmin ? "Admin" : "Cliente"}
                                </p>
                                <p className={`text-[10px] font-medium leading-none ${isAdmin ? "text-slate-400" : "text-white/70 text-truncate max-w-[80px]"}`}>
                                    {currentUser.fullName.split(' ')[0]}
                                </p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={`w-64 mt-2 p-0 overflow-hidden shadow-2xl ${isAdmin ? "bg-slate-900 border-gold/20" : "border-border"}`}>
                        <div className={`p-6 ${isAdmin ? "bg-gradient-to-br from-slate-800 to-slate-900" : "bg-gradient-to-br from-primary via-primary/90 to-wine"}`}>
                            <DropdownMenuLabel className="font-normal p-0 flex items-center gap-3">
                                <div className={`w-14 h-14 shrink-0 rounded-full border flex items-center justify-center font-bold text-xl overflow-hidden shadow-inner ${isAdmin
                                    ? "bg-white/5 border-gold/30 text-gold"
                                    : "bg-white/20 border-white/30 text-white backdrop-blur-md"
                                    }`}>
                                    {currentUser.avatarUrl ? (
                                        <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        initial
                                    )}
                                </div>
                                <div className="flex flex-col space-y-0.5 overflow-hidden text-left">
                                    <span className={`text-base font-bold truncate ${isAdmin ? "text-white" : "text-white drop-shadow-sm"}`}>{currentUser.fullName}</span>
                                    <span className={`text-xs truncate ${isAdmin ? "text-slate-400" : "text-white/80 font-medium"}`}>{currentUser.email}</span>
                                    {isAdmin && (
                                        <span className="text-[10px] uppercase font-black text-gold tracking-[0.15em] mt-1 bg-gold/10 w-max px-2.5 py-0.5 rounded-full border border-gold/20">
                                            Admin
                                        </span>
                                    )}
                                </div>
                            </DropdownMenuLabel>
                        </div>
                        <div className={`p-2 space-y-1 ${isAdmin ? "bg-slate-900" : "bg-card"}`}>
                            <DropdownMenuItem asChild className={`cursor-pointer py-3 px-3 rounded-lg transition-colors group ${isAdmin ? "focus:bg-white/5" : "focus:bg-primary/5"}`}>
                                <Link to={isAdmin ? '/admin/account' : '/settings'} className="flex items-center w-full">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform ${isAdmin ? "bg-blue-400/10" : "bg-blue-500/10"}`}>
                                        <User className={`w-4 h-4 ${isAdmin ? "text-blue-400" : "text-blue-500"}`} />
                                    </div>
                                    <span className={`font-bold text-sm ${isAdmin ? "text-slate-200" : "text-foreground"}`}>A Minha Conta</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className={`cursor-pointer py-3 px-3 rounded-lg transition-colors group ${isAdmin ? "focus:bg-white/5" : "focus:bg-primary/5"}`}>
                                <Link to={isAdmin ? '/admin/settings' : '/settings'} className="flex items-center w-full">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform ${isAdmin ? "bg-amber-400/10" : "bg-amber-500/10"}`}>
                                        <Settings className={`w-4 h-4 ${isAdmin ? "text-amber-400" : "text-amber-500"}`} />
                                    </div>
                                    <span className={`font-bold text-sm ${isAdmin ? "text-slate-200" : "text-foreground"}`}>Definições</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className={isAdmin ? "bg-gold/10 mx-2" : "mx-2"} />
                            <DropdownMenuItem
                                onClick={logout}
                                className={`cursor-pointer py-3 px-3 rounded-lg transition-colors group ${isAdmin ? "focus:bg-destructive/10" : "focus:bg-destructive/5"}`}
                            >
                                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                    <LogOut className="w-4 h-4 text-destructive" />
                                </div>
                                <span className="font-bold text-sm text-destructive">Terminar Sessão</span>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
