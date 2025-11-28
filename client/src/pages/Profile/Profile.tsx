import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, MapPin, Calendar, Mail, CheckCircle2, Clock, Bell, Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "../../api/axios";

export default function Profile() {
    const { user, logout, updateProfile, checkAuth, isLoading: isAuthLoading } = useAuthStore();
    const [isUploading, setIsUploading] = useState(false);

    // Fetch profile data on mount
    useEffect(() => {
        if (!user) {
            checkAuth();
        }
    }, [user, checkAuth]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert("Please select a valid image file.");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            // 1. Upload Image
            const uploadResponse = await api.post("/uploads/image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            
            console.log('Upload response:', uploadResponse.data);
            
            // Backend returns: {statusCode: 201, data: {url: "..."}, message, success}
            const responseData = uploadResponse.data.data || uploadResponse.data;
            const imageUrl = responseData.url || responseData.imageUrl;
            
            if (!imageUrl) {
                console.error('No URL in response:', uploadResponse.data);
                throw new Error("Image URL not returned from server");
            }

            console.log('Image URL:', imageUrl);

            // 2. Update Profile with new image URL
            const updatedPhotos = [imageUrl, ...(user?.photos?.filter(p => p !== imageUrl) || [])];

            await updateProfile({ photos: updatedPhotos });
            
            console.log("Profile picture updated successfully!");
            alert("Profile picture updated successfully!");
        } catch (err) {
            console.error("Image upload failed:", err);
            const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to upload image. Please try again.";
            alert(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-[#fd267a]" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen w-full">
            {/* Profile Header Card */}
            <Card className="overflow-hidden border-none shadow-none rounded-none bg-white h-full">
                <div className="h-64 bg-gradient-to-r from-[#fd267a] to-[#ff6036]" />
                <CardContent className="relative pt-0 pb-16 px-8 md:px-16 lg:px-24">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-20 mb-8 gap-6">

                        {/* Avatar with Upload */}
                        <div className="relative group">
                            <Avatar className="w-40 h-40 border-4 border-white shadow-xl bg-white">
                                <AvatarImage src={user.photos?.[0]} alt={user.name} className="object-cover" />
                                <AvatarFallback className="text-5xl bg-orange-100 text-orange-600">
                                    {user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <label
                                htmlFor="profile-upload"
                                className="absolute bottom-2 right-2 p-3 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-all border border-gray-200 group-hover:scale-110"
                            >
                                {isUploading ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-[#fd267a]" />
                                ) : (
                                    <Camera className="w-6 h-6 text-gray-600" />
                                )}
                            </label>
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={isUploading}
                            />
                        </div>

                        <div className="flex-1 space-y-3 pt-4 md:pt-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{user.name}</h1>
                                {user.is_verified && (
                                    <CheckCircle2 className="w-8 h-8 text-blue-500 fill-blue-50" />
                                )}
                                <span className="text-3xl md:text-4xl text-gray-500 font-normal">, {user.age}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-gray-500 text-base">
                                {user.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        <span>
                                            {user.location.coordinates ? "Location enabled" : "Location not set"}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Mail className="w-5 h-5" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                                </div>
                                {user.last_active && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        <span>Active {new Date(user.last_active).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 mt-4 md:mt-0 px-6 py-6 text-base"
                            onClick={logout}
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Logout
                        </Button>
                    </div>

                    <div className="grid gap-12 lg:grid-cols-3 max-w-7xl">
                        {/* Left Column: Bio & Interests */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Bio Section */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-2xl text-gray-900 flex items-center gap-2">
                                    About Me
                                </h3>
                                <p className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100 text-base">
                                    {user.bio || "No bio yet."}
                                </p>
                            </div>

                            {/* Interests Section */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-2xl text-gray-900">Interests</h3>
                                <div className="flex flex-wrap gap-3">
                                    {user.interests?.map((interest) => (
                                        <Badge
                                            key={interest}
                                            variant="secondary"
                                            className="px-6 py-3 text-base font-medium bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                                        >
                                            {interest}
                                        </Badge>
                                    ))}
                                    {(!user.interests || user.interests.length === 0) && (
                                        <span className="text-gray-500 italic text-base">No interests added.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Account Details */}
                        <div className="space-y-6">
                            <Card className="border border-gray-200 shadow-sm">
                                <CardHeader className="pb-4">
                                    <h3 className="font-semibold text-2xl">Details</h3>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-base text-gray-500">Gender</span>
                                        <span className="text-base font-medium capitalize">{user.gender}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-base text-gray-500">Status</span>
                                        <span className="text-base font-medium text-green-600">Active</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-base text-gray-500">Verified</span>
                                        <span className={user.is_verified ? "text-base font-medium text-blue-600" : "text-base font-medium text-gray-500"}>
                                            {user.is_verified ? "Yes" : "No"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-base text-gray-500">Notifications</span>
                                        <div className="flex items-center gap-2">
                                            <Bell className="w-4 h-4 text-gray-400" />
                                            <span className="text-base font-medium">
                                                {user.preferences?.notifications ? "On" : "Off"}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
