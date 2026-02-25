import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";

/**
 * AdminGuard component protects admin routes.
 * Handles loading, redirects unauthenticated users to login,
 * and redirects non‑admin users to the standard dashboard.
 */
export default function AdminGuard() {
    const { currentUser, loading, initialize } = useAuthStore();

    // Initialize auth store on mount if needed.
    useEffect(() => {
        if (initialize) {
            initialize();
        }
    }, [initialize]);

    if (loading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Redirect non‑admin users.
    if (currentUser.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
