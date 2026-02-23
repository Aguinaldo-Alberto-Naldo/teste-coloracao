import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useState } from "react";

export default function AppLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
