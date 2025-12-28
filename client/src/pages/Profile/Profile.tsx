import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../../store/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Calendar, Mail, CheckCircle2, Clock, Bell, Camera, Loader2, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "../../api/axios";
import ImageCropper from "@/components/ImageCropper";

export default function Profile() {
    const { user, updateProfile, checkAuth, isLoading: isAuthLoading } = useAuthStore();
    const [isUploading, setIsUploading] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        age: 0,
        gender: "",
        bio: "",
        interests: ""
    });

    useEffect(() => {
        if (!user) {
            checkAuth();
        }
    }, [user, checkAuth]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                age: user.age || 0,
                gender: user.gender || "",
                bio: user.bio || "",
                interests: user.interests?.join(", ") || ""
            });
        }
    }, [user]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Please select a valid image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB.");
            return;
        }

        setSelectedImageFile(file);
        setIsCropperOpen(true);
        e.target.value = '';
    };

    const handleCropComplete = async (croppedImageBlob: Blob) => {
        setIsCropperOpen(false);
        setIsUploading(true);

        const formData = new FormData();
        const file = new File([croppedImageBlob], "profile-picture.jpg", { type: "image/jpeg" });
        formData.append("image", file);

        try {
            const uploadResponse = await api.post("/uploads/image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            
            const responseData = uploadResponse.data.data || uploadResponse.data;
            const imageUrl = responseData.url || responseData.imageUrl;
            
            if (!imageUrl) {
                throw new Error("Image URL not returned from server");
            }

            const updatedPhotos = [imageUrl, ...(user?.photos?.filter(p => p !== imageUrl) || [])];
            await updateProfile({ photos: updatedPhotos });
            
            toast.success("Profile picture updated successfully!");
        } catch (err) {
            console.error("Image upload failed:", err);
            const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to upload image. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
            setSelectedImageFile(null);
        }
    };

    const handleOpenEditDialog = () => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                age: user.age || 0,
                gender: user.gender || "",
                bio: user.bio || "",
                interests: user.interests?.join(", ") || ""
            });
        }
        setIsEditDialogOpen(true);
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
            if (!formData.name || !formData.name.trim()) {
                toast.error("Name is required");
                setIsSaving(false);
                return;
            }

            if (!formData.email || !formData.email.trim()) {
                toast.error("Email is required");
                setIsSaving(false);
                return;
            }

            if (!formData.age || formData.age <= 0) {
                toast.error("Valid age is required");
                setIsSaving(false);
                return;
            }

            if (!formData.gender || !["male", "female", "other"].includes(formData.gender)) {
                toast.error("Please select a valid gender");
                setIsSaving(false);
                return;
            }

            const updateData: Record<string, unknown> = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                age: formData.age,
                gender: formData.gender
            };

            if (formData.bio && formData.bio.trim()) {
                updateData.bio = formData.bio.trim();
            }

            if (formData.interests && formData.interests.trim()) {
                updateData.interests = formData.interests
                    .split(",")
                    .map(i => i.trim())
                    .filter(i => i.length > 0);
            }

            await updateProfile(updateData);
            
            toast.success("Profile updated successfully!");
            setIsEditDialogOpen(false);
        } catch (err) {
            console.error("Profile update failed:", err);
            const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to update profile. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    const profileImage = user.photos?.[0];

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar with Upload */}
                        <div className="relative group">
                            <Avatar className="w-32 h-32 border-4 border-gray-100 shadow-md bg-white">
                                <AvatarImage src={profileImage} alt={user.name} className="object-cover" />
                                <AvatarFallback className="text-4xl bg-orange-100 text-orange-600">
                                    {user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <label
                                htmlFor="profile-upload"
                                className="absolute bottom-1 right-1 p-2.5 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-all border border-gray-200 group-hover:scale-110"
                            >
                                {isUploading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                ) : (
                                    <Camera className="w-5 h-5 text-gray-600" />
                                )}
                            </label>
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                                disabled={isUploading}
                            />
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{user.name}</h1>
                                    {user.is_verified && (
                                        <CheckCircle2 className="w-7 h-7 text-blue-500 fill-blue-50" />
                                    )}
                                    <span className="text-2xl md:text-3xl text-gray-500 font-normal">, {user.age}</span>
                                </div>
                                
                                <Button
                                    onClick={handleOpenEditDialog}
                                    variant="outline"
                                    className="border-gray-300 hover:bg-gray-50"
                                >
                                    <Pencil className="w-5 h-5 mr-2" />
                                    Edit Profile
                                </Button>
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
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-xl text-gray-900 mb-4">About Me</h3>
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {user.bio || "No bio yet."}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-xl text-gray-900 mb-4">Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.interests?.map((interest) => (
                                    <Badge
                                        key={interest}
                                        variant="secondary"
                                        className="px-4 py-2 text-sm font-medium bg-gray-50 border border-gray-200 text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                                    >
                                        {interest}
                                    </Badge>
                                ))}
                                {(!user.interests || user.interests.length === 0) && (
                                    <span className="text-gray-500 italic text-sm">No interests added.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Account Details */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-xl text-gray-900 mb-4">Details</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Gender</span>
                                    <span className="text-sm font-medium capitalize text-gray-900">{user.gender}</span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <span className="text-sm font-medium text-green-600">Active</span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Verified</span>
                                    <span className={user.is_verified ? "text-sm font-medium text-blue-600" : "text-sm font-medium text-gray-500"}>
                                        {user.is_verified ? "Yes" : "No"}
                                    </span>
                                </div>

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

            {/* Edit Profile Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Your name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="age">Age</Label>
                                <Input
                                    id="age"
                                    name="age"
                                    type="number"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    min={18}
                                    max={100}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Select...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="interests">Interests</Label>
                            <Input
                                id="interests"
                                name="interests"
                                value={formData.interests}
                                onChange={handleInputChange}
                                placeholder="Reading, Travel, Cooking, Music"
                            />
                            <p className="text-xs text-gray-500">Separate each interest with a comma</p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 bg-gradient-to-r from-primary to-secondary"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                            <Button
                                onClick={() => setIsEditDialogOpen(false)}
                                disabled={isSaving}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Image Cropper Dialog */}
            <ImageCropper
                open={isCropperOpen}
                onClose={() => {
                    setIsCropperOpen(false);
                    setSelectedImageFile(null);
                }}
                onCropComplete={handleCropComplete}
                imageFile={selectedImageFile}
            />
        </div>
    );
}
