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

    return (
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden text-foreground hover:bg-secondary p-2 rounded-lg transition-colors border border-transparent hover:border-border"
                    aria-label="Abrir Menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="hidden md:block text-sm font-medium text-slate-500">
                    Olá, <span className="text-foreground font-bold">{currentUser.fullName}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {currentUser.role !== "admin" && (
                    <div className="flex flex-col items-end mr-2 hidden sm:flex">
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">Créditos Disponíveis</span>
                        <span className="text-sm font-bold text-primary">
                            {creditsAvailable} {creditsAvailable === 1 ? 'teste' : 'testes'}
                        </span>
                    </div>
                )}

                {/* Notifications Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative p-2 text-slate-500 hover:text-foreground hover:bg-secondary rounded-full transition-colors outline-none">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive text-[10px] font-bold text-white rounded-full border border-card flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 mt-2 p-0 overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/50 flex justify-between items-center">
                            <DropdownMenuLabel className="p-0 font-bold">Notificações</DropdownMenuLabel>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllAsRead(currentUser.id)}
                                    className="text-[11px] font-bold text-primary hover:underline"
                                >
                                    Marcar todas como lidas
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 italic text-sm">
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
                                        className={`p-4 border-b border-border/50 flex flex-col items-start gap-1 cursor-pointer transition-colors ${!n.is_read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'}`}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            {getIcon(n.type)}
                                            <span className={`text-sm font-bold flex-1 truncate ${!n.is_read ? 'text-foreground' : 'text-slate-500'}`}>
                                                {n.title}
                                            </span>
                                            {!n.is_read && <div className="w-2 h-2 bg-primary rounded-full" />}
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2 ml-6 text-left w-full">
                                            {n.message}
                                        </p>
                                        <span className="text-[10px] text-slate-400 font-medium ml-6 mt-1">
                                            {new Date(n.created_at).toLocaleDateString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </div>
                        <DropdownMenuSeparator className="m-0" />
                        <Link to="/notifications" className="block w-full text-center py-3 text-xs font-bold text-slate-500 hover:text-primary transition-colors hover:bg-muted/50">
                            Ver todas as notificações
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm hover:ring-2 hover:ring-primary/40 transition-all outline-none overflow-hidden">
                            {currentUser.avatarUrl ? (
                                <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                initial
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 mt-2 p-0 overflow-hidden border-border shadow-2xl">
                        <div className="bg-gradient-to-br from-primary via-primary/90 to-wine p-6">
                            <DropdownMenuLabel className="font-normal p-0 flex items-center gap-3">
                                <div className="w-14 h-14 shrink-0 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-inner">
                                    {currentUser.avatarUrl ? (
                                        <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        initial
                                    )}
                                </div>
                                <div className="flex flex-col space-y-0.5 overflow-hidden">
                                    <span className="text-base font-bold text-white truncate drop-shadow-sm">{currentUser.fullName}</span>
                                    <span className="text-xs text-white/80 font-medium truncate">{currentUser.email}</span>
                                    {currentUser.role === 'admin' && (
                                        <span className="text-[10px] uppercase font-black text-white tracking-[0.15em] mt-1 bg-white/20 w-max px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                                            Admin
                                        </span>
                                    )}
                                </div>
                            </DropdownMenuLabel>
                        </div>
                        <div className="p-2 space-y-1 bg-card">
                            <DropdownMenuItem asChild className="cursor-pointer py-3 px-3 rounded-lg focus:bg-primary/5 transition-colors group">
                                <Link to={currentUser.role === 'admin' ? '/admin/account' : '/settings'} className="flex items-center w-full">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                        <User className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <span className="font-bold text-sm text-foreground">A Minha Conta</span>
                                </Link>
                            </DropdownMenuItem>
                            {currentUser.role === 'admin' ? (
                                <DropdownMenuItem className="cursor-pointer py-3 px-3 rounded-lg focus:bg-primary/5 transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                        <Settings className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <span className="font-bold text-sm text-foreground">Definições do Sistema</span>
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem className="cursor-pointer py-3 px-3 rounded-lg focus:bg-primary/5 transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                        <Settings className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <span className="font-bold text-sm text-foreground">Preferências</span>
                                </DropdownMenuItem>
                            )}
                        </div>
                        <div className="p-2 pt-0">
                            <DropdownMenuSeparator className="mb-2" />
                            <DropdownMenuItem onClick={logout} className="cursor-pointer py-3 px-3 text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg group">
                                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center mr-3 group-hover:rotate-12 transition-transform">
                                    <LogOut className="w-4 h-4" />
                                </div>
                                <span className="font-black text-sm uppercase tracking-wider">Sair</span>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
