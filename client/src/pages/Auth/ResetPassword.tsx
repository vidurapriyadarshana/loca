import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setError("");
        setIsLoading(true);
        try {
            await resetPassword(token!, password);
            navigate("/login");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-red-500">Invalid Link</h1>
                    <p className="text-gray-500">Missing reset token.</p>
                    <Link to="/login" className="text-primary hover:underline mt-4 block">Return to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden"
            >
                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                            <Lock className="w-8 h-8 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
                        <p className="text-gray-500">Your new password must be different from previously used passwords.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <Input
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Reset Password
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
