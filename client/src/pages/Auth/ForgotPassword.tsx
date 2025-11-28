import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import AuthLayout from "../../layout/AuthLayout";
import { useAuthStore } from "../../store/authStore";

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
        <AuthLayout title="Forgot Password?" subtitle="No worries, we'll send you reset instructions.">
            {!success ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Send Reset Link
                    </Button>

                    <div className="text-center">
                        <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </form>
            ) : (
                <div className="text-center space-y-6">
                    <div className="p-4 bg-green-50 text-green-700 rounded-xl">
                        Check your email! We've sent reset instructions to <strong>{email}</strong>.
                    </div>
                    <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
                        Try another email
                    </Button>
                    <div className="text-center">
                        <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}
