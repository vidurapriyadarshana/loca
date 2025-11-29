import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, Mail, CheckCircle2, Clock, Bell, Camera, Loader2, Pencil, X, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "../../api/axios";

export default function Profile() {
    const { user, updateProfile, checkAuth, isLoading: isAuthLoading } = useAuthStore();
    const [isUploading, setIsUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state for editable fields
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        age: 0,
        gender: "",
        bio: "",
        interests: "",
        latitude: "",
        longitude: "",
        password: "" // Optional - only if user wants to change password
    });

    // Fetch profile data on mount
    useEffect(() => {
        if (!user) {
            checkAuth();
        }
    }, [user, checkAuth]);

    // Initialize form data when user data is loaded
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                age: user.age || 0,
                gender: user.gender || "",
                bio: user.bio || "",
                interests: user.interests?.join(", ") || "",
                latitude: user.location?.coordinates?.[1]?.toString() || "",
                longitude: user.location?.coordinates?.[0]?.toString() || "",
                password: ""
            });
        }
    }, [user]);

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

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing - reset form data
            if (user) {
                setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    age: user.age || 0,
                    gender: user.gender || "",
                    bio: user.bio || "",
                    interests: user.interests?.join(", ") || "",
                    latitude: user.location?.coordinates?.[1]?.toString() || "",
                    longitude: user.location?.coordinates?.[0]?.toString() || "",
                    password: ""
                });
            }
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "age" ? parseInt(value) || 0 : value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Validate required fields
            if (!formData.name || !formData.name.trim()) {
                alert("Name is required");
                setIsSaving(false);
                return;
            }

            if (!formData.email || !formData.email.trim()) {
                alert("Email is required");
                setIsSaving(false);
                return;
            }

            if (!formData.age || formData.age <= 0) {
                alert("Valid age is required");
                setIsSaving(false);
                return;
            }

            if (!formData.gender || !["male", "female", "other"].includes(formData.gender)) {
                alert("Please select a valid gender");
                setIsSaving(false);
                return;
            }

            // Prepare data for API - only include valid fields
            const updateData: any = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                age: formData.age,
                gender: formData.gender
            };

            // Add bio if provided
            if (formData.bio && formData.bio.trim()) {
                updateData.bio = formData.bio.trim();
            }

            // Add interests if provided
            if (formData.interests && formData.interests.trim()) {
                updateData.interests = formData.interests
                    .split(",")
                    .map(i => i.trim())
                    .filter(i => i.length > 0);
            }

            // Add password if provided (for password change)
            if (formData.password && formData.password.trim().length > 0) {
                updateData.password = formData.password;
            }

            // Add location if coordinates are provided
            if (formData.latitude && formData.longitude) {
                const lat = parseFloat(formData.latitude);
                const lng = parseFloat(formData.longitude);
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    updateData.location = {
                        type: "Point",
                        coordinates: [lng, lat] // [longitude, latitude]
                    };
                }
            }

            console.log('Sending update data:', updateData);

            await updateProfile(updateData);
            
            alert("Profile updated successfully!");
            setIsEditing(false);
            
            // Clear password field after successful update
            setFormData(prev => ({ ...prev, password: "" }));
        } catch (err) {
            console.error("Profile update failed:", err);
            const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to update profile. Please try again.";
            alert(errorMessage);
        } finally {
            setIsSaving(false);
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
        <div className="min-h-screen w-full bg-gray-50">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

                        {/* Avatar with Upload */}
                        <div className="relative group">
                            <Avatar className="w-32 h-32 border-4 border-gray-100 shadow-md bg-white">
                                <AvatarImage src={user.photos?.[0]} alt={user.name} className="object-cover" />
                                <AvatarFallback className="text-4xl bg-orange-100 text-orange-600">
                                    {user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <label
                                htmlFor="profile-upload"
                                className="absolute bottom-1 right-1 p-2.5 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-all border border-gray-200 group-hover:scale-110"
                            >
                                {isUploading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-[#fd267a]" />
                                ) : (
                                    <Camera className="w-5 h-5 text-gray-600" />
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

                        <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {isEditing ? (
                                        <Input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="text-3xl md:text-4xl font-bold h-auto py-2 px-3 border-2"
                                        />
                                    ) : (
                                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{user.name}</h1>
                                    )}
                                    {user.is_verified && (
                                        <CheckCircle2 className="w-7 h-7 text-blue-500 fill-blue-50" />
                                    )}
                                    {isEditing ? (
                                        <>
                                            <span className="text-2xl md:text-3xl text-gray-500 font-normal">,</span>
                                            <Input
                                                name="age"
                                                type="number"
                                                value={formData.age}
                                                onChange={handleInputChange}
                                                className="text-2xl md:text-3xl w-20 h-auto py-2 px-3 border-2"
                                            />
                                        </>
                                    ) : (
                                        <span className="text-2xl md:text-3xl text-gray-500 font-normal">, {user.age}</span>
                                    )}
                                </div>
                                
                                {/* Edit/Save/Cancel Buttons */}
                                <div className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <Button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Check className="w-5 h-5 mr-2" />
                                                        Save
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                onClick={handleEditToggle}
                                                disabled={isSaving}
                                                variant="outline"
                                                className="border-gray-300"
                                            >
                                                <X className="w-5 h-5 mr-2" />
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={handleEditToggle}
                                            variant="outline"
                                            className="border-gray-300 hover:bg-gray-50"
                                        >
                                            <Pencil className="w-5 h-5 mr-2" />
                                            Edit Profile
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                                {user.location && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        <span>
                                            {user.location.coordinates ? "Location enabled" : "Location not set"}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <Mail className="w-4 h-4" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                                </div>
                                {user.last_active && (
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        <span>Active {new Date(user.last_active).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column: Bio & Interests */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-xl text-gray-900 mb-4">
                                About Me
                            </h3>
                            {isEditing ? (
                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="text-sm">Bio</Label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-[#fd267a] resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            ) : (
                                <p className="text-gray-700 leading-relaxed text-sm">
                                    {user.bio || "No bio yet."}
                                </p>
                            )}
                        </div>

                        {/* Interests Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-xl text-gray-900 mb-4">Interests</h3>
                            {isEditing ? (
                                <div className="space-y-2">
                                    <Label htmlFor="interests" className="text-sm">
                                        Interests (comma-separated)
                                    </Label>
                                    <Input
                                        id="interests"
                                        name="interests"
                                        value={formData.interests}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Reading, Travel, Cooking, Music"
                                        className="text-sm border-2"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Separate each interest with a comma
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {user.interests?.map((interest) => (
                                        <Badge
                                            key={interest}
                                            variant="secondary"
                                            className="px-4 py-2 text-sm font-medium bg-gray-50 border border-gray-200 text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                                        >
                                                {interest}
                                        {interest}
                                    </Badge>
                                ))}
                                {(!user.interests || user.interests.length === 0) && (
                                    <span className="text-gray-500 italic text-sm">No interests added.</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Account Settings Section (Edit Mode Only) */}
                    {isEditing && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-xl text-gray-900 mb-4">Account Settings</h3>
                            
                            <div className="space-y-4">
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="your.email@example.com"
                                        className="text-sm border-2"
                                    />
                                </div>

                                {/* Password (Optional) */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm">
                                        Change Password (Optional)
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                placeholder="Leave blank to keep current password"
                        className="text-sm border-2"
                    />
                    <p className="text-xs text-gray-500">
                        Only fill this if you want to change your password
                    </p>
                </div>

                {/* Location Coordinates */}
                <div className="space-y-2">
                    <Label className="text-sm">Location Coordinates</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Input
                                id="latitude"
                                name="latitude"
                                type="text"
                                value={formData.latitude}
                                onChange={handleInputChange}
                                placeholder="Latitude (e.g., 19.0760)"
                                className="text-sm border-2"
                            />
                        </div>
                        <div>
                            <Input
                                id="longitude"
                                name="longitude"
                                type="text"
                                value={formData.longitude}
                                onChange={handleInputChange}
                                placeholder="Longitude (e.g., 72.877)"
                                className="text-sm border-2"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Enter your location coordinates (latitude, longitude)
                    </p>
                </div>
            </div>
        </div>
    )}
</div>

                    {/* Right Column: Account Details */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-xl text-gray-900 mb-4">Details</h3>
                            <div className="space-y-4">
                                {/* Gender */}
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Gender</span>
                                    {isEditing ? (
                                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="text-sm font-medium capitalize border-2 border-gray-200 rounded-md px-3 py-1 focus:outline-none focus:border-[#fd267a]"
                        >
                            <option value="">Select...</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    ) : (
                        <span className="text-sm font-medium capitalize text-gray-900">{user.gender}</span>
                    )}
                </div>

                {/* Status */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="text-sm font-medium text-green-600">Active</span>
                </div>

                {/* Verified */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Verified</span>
                    <span className={user.is_verified ? "text-sm font-medium text-blue-600" : "text-sm font-medium text-gray-500"}>
                        {user.is_verified ? "Yes" : "No"}
                    </span>
                </div>

                {/* Notifications */}
                <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Notifications</span>
                    <div className="flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                            {user.preferences?.notifications ? "On" : "Off"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
            </div>
        </div>
    );
}
