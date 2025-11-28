import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { googleLogin } = useAuthStore();
    const [status, setStatus] = useState("Initializing...");
    const [error, setError] = useState("");

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            setStatus("Token found. Authenticating...");
            googleLogin(token)
                .then(() => {
                    setStatus("Login successful. Redirecting...");
                    setTimeout(() => navigate("/dashboard"), 500);
                })
                .catch((err) => {
                    console.error("Google login failed", err);
                    setError(err.response?.data?.message || "Google login failed. Please try again.");
                    setStatus("Error");
                });
        } else {
            setError("No access token found in URL.");
            setStatus("Error");
        }
    }, [searchParams, googleLogin, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="text-center space-y-4 max-w-md w-full">
                {status !== "Error" ? (
                    <>
                        <Loader2 className="w-10 h-10 animate-spin text-[#fd267a] mx-auto" />
                        <p className="text-gray-500">{status}</p>
                    </>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center justify-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            <p>{error}</p>
                        </div>
                        <Button onClick={() => navigate("/login")} className="w-full">
                            Back to Login
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
