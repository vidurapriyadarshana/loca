import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin } from "lucide-react";
import AuthLayout from "../../layout/AuthLayout";
import { cn } from "@/lib/utils";

const INTERESTS_LIST = [
    "Music", "Travel", "Food", "Movies", "Tech",
    "Fitness", "Art", "Gaming", "Reading", "Nature",
    "Photography", "Fashion", "Cooking", "Dancing", "Pets"
];

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
        interests: [] as string[],
    });

    const toggleInterest = (interest: string) => {
        setFormData(prev => {
            const currentInterests = prev.interests;
            if (currentInterests.includes(interest)) {
                return { ...prev, interests: currentInterests.filter(i => i !== interest) };
            } else {
                if (currentInterests.length >= 5) return prev; // Limit to 5
                return { ...prev, interests: [...currentInterests, interest] };
            }
        });
    };

    const [locationStatus, setLocationStatus] = useState<"idle" | "detecting" | "success" | "error">("idle");
    const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);

    useEffect(() => {
        if ("geolocation" in navigator) {
            setLocationStatus("detecting");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoordinates([position.coords.longitude, position.coords.latitude]);
                    setLocationStatus("success");
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationStatus("error");
                }
            );
        } else {
            setLocationStatus("error");
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const payload = {
            ...formData,
            age: parseInt(formData.age),
            // interests is already an array
            photos: ["https://example.com/photo1.jpg"],
            location: {
                type: "Point",
                coordinates: coordinates
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
        <AuthLayout title="Create Account" subtitle="Join the community today">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="age">Age</Label>
                            <Input
                                id="age"
                                type="number"
                                placeholder="25"
                                value={formData.age}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, age: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <select
                                id="gender"
                                className="w-full px-4 py-2 bg-white border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input h-12 rounded-xl border-2 border-slate-100 bg-slate-50"
                                value={formData.gender}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Interests (Select up to 5)</Label>
                    <div className="flex flex-wrap gap-2">
                        {INTERESTS_LIST.map((interest) => (
                            <button
                                key={interest}
                                type="button"
                                onClick={() => toggleInterest(interest)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2",
                                    formData.interests.includes(interest)
                                        ? "bg-gradient-to-r from-[#fd267a] to-[#ff6036] text-white border-transparent shadow-md transform scale-105"
                                        : "bg-white text-gray-600 border-slate-200 hover:border-[#fd267a]/50 hover:bg-slate-50"
                                )}
                            >
                                {interest}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                        id="bio"
                        className="flex min-h-[80px] w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fd267a]/20 focus-visible:border-[#fd267a] disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-300 transition-all duration-200"
                        placeholder="Tell us about yourself..."
                        value={formData.bio}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bio: e.target.value })}
                    />
                </div>

                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <MapPin className={cn("w-4 h-4", locationStatus === "success" ? "text-green-500" : locationStatus === "error" ? "text-red-500" : "text-gray-400")} />
                    <span>
                        {locationStatus === "detecting" && "Detecting location..."}
                        {locationStatus === "success" && "Location detected"}
                        {locationStatus === "error" && "Location access denied (using default)"}
                        {locationStatus === "idle" && "Waiting for location..."}
                    </span>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Account
                </Button>
            </form>

            <div className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-[#fd267a] hover:underline">
                    Log in
                </Link>
            </div>
        </AuthLayout>
    );
}
