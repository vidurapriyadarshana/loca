import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound } from "lucide-react";

export default function ForgotPassword() {
    const { forgotPassword } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            await forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to send reset email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden"
            >
                <div className="p-8 space-y-6">
                    <Link to="/login" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Link>

                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                            <KeyRound className="w-8 h-8 text-orange-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                        <p className="text-gray-500">No worries, we'll send you reset instructions.</p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg text-center">
                                    {error}
                                </div>
                            )}

                            <Input
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                Send Reset Link
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="p-4 bg-green-50 text-green-700 rounded-xl">
                                Check your email! We've sent reset instructions to <strong>{email}</strong>.
                            </div>
                            <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
                                Try another email
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
