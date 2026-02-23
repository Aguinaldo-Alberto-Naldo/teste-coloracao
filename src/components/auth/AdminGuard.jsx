import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export default function AdminGuard() {
    const { currentUser, loading } = useAuthStore();

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

    if (currentUser.role !== "admin") {
        // If client, send to their dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
