import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "../pages/Auth/Signup";
import Login from "../pages/Auth/Login";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import GoogleCallback from "../pages/Auth/GoogleCallback";
import PrivateRoute from "../middleware/PrivateRoute";
import Dashboard from "../pages/Dashboard/Home";
import Discover from "../pages/Dashboard/Discover";
import Matches from "../pages/Dashboard/Matches";
import Layout from "../layout/Layout";
import Profile from "../pages/Profile/Profile";

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />

                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/discover" element={<Discover />} />
                        <Route path="/matches" element={<Matches />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                </Route>

                {/* Redirect any unknown route */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}
