import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function Signup() {
    const navigate = useNavigate();
    const { register } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        age: "",
        gender: "male",
        bio: "",
        interests: "", // Comma separated for input
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const payload = {
            ...formData,
            age: parseInt(formData.age),
            interests: formData.interests.split(",").map(i => i.trim()).filter(i => i),
            // Default location and photos for now as per curl example if needed, or let backend handle defaults
            photos: ["https://example.com/photo1.jpg"],
            location: {
                type: "Point",
                coordinates: [72.8777, 19.0760]
            }
        };

        try {
            await register(payload);
            navigate("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4 py-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden"
            >
                <div className="p-8 space-y-8">
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Age"
                                    type="number"
                                    placeholder="25"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    required
                                />
                                <div className="w-full space-y-2">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Gender</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-primary focus:ring-0 transition-all duration-200 outline-none"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <Input
                            label="Interests (comma separated)"
                            placeholder="Music, Travel, Coding"
                            value={formData.interests}
                            onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                        />

                        <div className="w-full space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Bio</label>
                            <textarea
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-primary focus:ring-0 transition-all duration-200 outline-none placeholder:text-gray-400 min-h-[100px] resize-none"
                                placeholder="Tell us about yourself..."
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Create Account
                        </Button>
                    </form>

                    <div className="text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link to="/login" className="font-bold text-primary hover:underline">
                            Log in
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
