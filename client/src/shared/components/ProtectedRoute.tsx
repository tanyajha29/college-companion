import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, Role } from "../context/AuthContext";

interface ProtectedRouteProps {
    allowedRoles?: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />; // Fallback route instead of Unauthorized page
    }

    return <Outlet />;
}
