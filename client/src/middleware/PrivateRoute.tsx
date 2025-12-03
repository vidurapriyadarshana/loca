import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

export default function PrivateRoute() {
    const { isAuthenticated, token, checkAuth, isLoading } = useAuthStore();

    useEffect(() => {
        // If we have a token but no auth check has been done, verify it
        if (token && !isAuthenticated && !isLoading) {
            checkAuth();
        }
    }, [token, isAuthenticated, isLoading, checkAuth]);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
