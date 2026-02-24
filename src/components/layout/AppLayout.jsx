import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useNotificationsStore } from "../../stores/notificationsStore";

export default function AppLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { currentUser } = useAuthStore();
    const { sendNotification, notifications } = useNotificationsStore();

    useEffect(() => {
        if (currentUser && currentUser.creditsExpiration) {
            const expiryDate = new Date(currentUser.creditsExpiration);
            const now = new Date();
            const diffTime = expiryDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // If expiration is within 7 days
            if (diffDays > 0 && diffDays <= 7) {
                // Check if we already sent a plan expiration notification in the last 3 days
                const lastExpNotif = notifications.find(n =>
                    n.type === 'plan' &&
                    (new Date() - new Date(n.created_at)) < (3 * 24 * 60 * 60 * 1000)
                );

                if (!lastExpNotif) {
                    sendNotification({
                        user_id: currentUser.id,
                        title: "Seu plano está a terminar",
                        message: `O seu plano expira em ${diffDays} dias (${expiryDate.toLocaleDateString('pt-PT')}). Renove agora para continuar a usar.`,
                        type: 'plan',
                        link: '/store'
                    });
                }
            }
        }
    }, [currentUser, notifications, sendNotification]);

    return (
        <div className="flex min-h-screen w-full bg-background text-foreground">
            <Sidebar role="client" />
            <div className="flex flex-col flex-1 min-w-0">
                <TopBar onMenuClick={() => setMobileMenuOpen(true)} />
                <main className="flex-1 p-4 md:p-8 md:pt-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Menu Overlay - simple implementation for MVP */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <div className="w-64 h-full relative" onClick={e => e.stopPropagation()}>
                        <Sidebar role="client" isMobile={true} />
                    </div>
                </div>
            )}
        </div>
    );
}
