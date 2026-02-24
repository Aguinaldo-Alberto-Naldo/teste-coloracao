import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, UserPlus, FileText, Settings, CreditCard, LogOut, ShoppingBag, LayoutTemplate, Briefcase, Bell } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useConfigStore } from "../../stores/configStore";

export default function Sidebar({ role, isMobile = false }) {
    const { logout } = useAuthStore();
    const { appName, appLogo } = useConfigStore();

    const clientLinks = [
        { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/store", icon: ShoppingBag, label: "Loja de Créditos" },
        { to: "/subjects/new", icon: UserPlus, label: "Nova Análise" },
        { to: "/my-clients", icon: Users, label: "Os Meus Clientes" },
        { to: "/crm", icon: Users, label: "Os Meus Testes" },
        { to: "/notifications", icon: Bell, label: "Notificações" },
        { to: "/support", icon: Settings, label: "Suporte" },
    ];

    const adminLinks = [
        { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/admin/orders", icon: Briefcase, label: "Pedidos / Loja" },
        { to: "/admin/landing", icon: LayoutTemplate, label: "Landing Page" },
        { to: "/admin/clients", icon: Users, label: "Clientes" },
        { to: "/admin/credits", icon: CreditCard, label: "Créditos" },
        { to: "/admin/packages", icon: Settings, label: "Pacotes" },
        { to: "/admin/tickets", icon: FileText, label: "Tickets de Suporte" },
        { to: "/admin/notifications", icon: Bell, label: "Gestão de Alertas" },
        { to: "/admin/settings", icon: Settings, label: "Configurações" },
    ];

    const links = role === "admin" ? adminLinks : clientLinks;

    return (
        <aside className={`w-64 h-screen bg-card border-r border-border flex flex-col justify-between sticky top-0 shadow-sm ${isMobile ? "flex" : "hidden md:flex"}`}>
            <div>
                <div className="h-16 flex items-center px-6 border-b border-border gap-3">
                    {appLogo ? (
                        <img src={appLogo} alt="Logo" className="h-8 w-auto object-contain" />
                    ) : (
                        <span className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {appName ? appName[0] : "C"}
                        </span>
                    )}
                    <span className="text-xl font-heading font-bold text-primary tracking-wide truncate">
                        {appName}
                    </span>
                </div>
                <nav className="p-4 space-y-1.5">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === "/admin"}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive
                                    ? "bg-primary/10 text-primary font-bold shadow-sm"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`
                            }
                        >
                            <link.icon className="w-5 h-5" />
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t border-border">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Terminar Sessão
                </button>
            </div>
        </aside>
    );
}
