import { Menu, Bell, User, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Link } from "react-router-dom";

export default function TopBar({ onMenuClick }) {
    const { currentUser, logout } = useAuthStore();

    if (!currentUser) return null;

    const creditsTotal = currentUser.creditsTotal ?? 0;
    const creditsUsed = currentUser.creditsUsed ?? 0;
    const creditsAvailable = creditsTotal - creditsUsed;
    const initial = (currentUser.fullName || currentUser.email || "?").charAt(0).toUpperCase();

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

                {/* Notifications */}
                <button className="relative p-2 text-slate-500 hover:text-foreground hover:bg-secondary rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border border-card"></span>
                </button>

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
                    <DropdownMenuContent align="end" className="w-64 mt-2 p-2">
                        <DropdownMenuLabel className="font-normal flex items-center gap-3 pb-4">
                            <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
                                {currentUser.avatarUrl ? (
                                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    initial
                                )}
                            </div>
                            <div className="flex flex-col space-y-0.5 overflow-hidden">
                                <span className="text-sm font-bold text-foreground truncate">{currentUser.fullName}</span>
                                <span className="text-xs text-slate-500 font-medium truncate">{currentUser.email}</span>
                                {currentUser.role === 'admin' && (
                                    <span className="text-[10px] uppercase font-bold text-accent-foreground tracking-widest mt-1 bg-accent/20 w-max px-2 py-0.5 rounded-full">
                                        Administrador
                                    </span>
                                )}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="-mx-2" />
                        <div className="py-1">
                            <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                                <Link to={currentUser.role === 'admin' ? '/admin/account' : '/settings'} className="flex items-center w-full">
                                    <User className="w-4 h-4 mr-3 text-slate-500" />
                                    <span className="font-medium text-foreground">A Minha Conta</span>
                                </Link>
                            </DropdownMenuItem>
                            {currentUser.role === 'admin' ? (
                                <DropdownMenuItem className="cursor-pointer py-2.5">
                                    <Settings className="w-4 h-4 mr-3 text-muted-foreground" />
                                    <span className="font-medium text-foreground">Definições do Sistema</span>
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem className="cursor-pointer py-2.5">
                                    <Settings className="w-4 h-4 mr-3 text-slate-500" />
                                    <span className="font-medium text-foreground">Preferências</span>
                                </DropdownMenuItem>
                            )}
                        </div>
                        <DropdownMenuSeparator className="-mx-2" />
                        <DropdownMenuItem onClick={logout} className="cursor-pointer py-2.5 mt-1 text-destructive focus:text-destructive focus:bg-destructive/10 rounded-md">
                            <LogOut className="w-4 h-4 mr-3" />
                            <span className="font-semibold">Terminar Sessão</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
