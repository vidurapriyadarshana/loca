import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Heart, X, MapPin, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { userAPI, swipeAPI } from '@/api/services';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types';

export default function Discover() {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isActioning, setIsActioning] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    useEffect(() => {
        loadNearbyUsers();
    }, []);

    const loadNearbyUsers = async () => {
        try {
            setIsLoading(true);
            const data = await userAPI.getNearbyUsers({ limit: 20 });
            const fetchedUsers = data.users || [];

            // Filter out current user
            const filtered = fetchedUsers.filter((u: User) => u._id !== currentUser?._id);
            setUsers(filtered);
            setCurrentIndex(0);
            setCurrentPhotoIndex(0);
        } catch (error) {
            console.error('Failed to load nearby users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwipe = async (direction: 'LEFT' | 'RIGHT') => {
        if (currentIndex >= users.length || isActioning) return;

        setIsActioning(true);
        const currentUserCard = users[currentIndex];

        try {
            const response = await swipeAPI.createSwipes([
                { swiped_on: currentUserCard._id!, direction }
            ]);

            // Check for match
            if (response.matches && response.matches.length > 0) {
                toast.success(`It's a Match! You and ${currentUserCard.name} liked each other!`);
            }

            // Move to next card
            setCurrentIndex(prev => prev + 1);
            setCurrentPhotoIndex(0);
        } catch (error) {
            console.error('Failed to submit swipe:', error);
        } finally {
            setIsActioning(false);
        }
    };

    const handleLike = () => handleSwipe('RIGHT');
    const handleDislike = () => handleSwipe('LEFT');

    const nextPhoto = () => {
        const currentUserCard = users[currentIndex];
        if (currentUserCard?.photos && currentPhotoIndex < currentUserCard.photos.length - 1) {
            setCurrentPhotoIndex(prev => prev + 1);
        }
    };

    const prevPhoto = () => {
        if (currentPhotoIndex > 0) {
            setCurrentPhotoIndex(prev => prev - 1);
        }
    };

    const currentUserCard = users[currentIndex];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!currentUserCard) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] px-4">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-12 h-12 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No more users nearby</h2>
                    <p className="text-gray-600 mb-6">
                        Check back later for more potential matches.
                    </p>
                    <Button onClick={loadNearbyUsers} className="bg-gradient-to-r from-primary to-secondary">
                        Refresh
                    </Button>
                </div>
            </div>
        );
    }

    const photos = currentUserCard.photos || [];
    const currentPhoto = photos[currentPhotoIndex];

    return (
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
            <div className="w-full max-w-md flex flex-col items-center gap-6">
                {/* Card */}
                <Card className="w-full h-[550px] overflow-hidden shadow-2xl border-2 border-gray-200 bg-white">
                    {/* Image Section */}
                    <div className="relative h-[380px] bg-gradient-to-br from-orange-100 to-pink-100">
                        {currentPhoto ? (
                            <img
                                src={currentPhoto}
                                alt={currentUserCard.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-8xl font-bold text-gray-300">
                                    {currentUserCard.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}

                        {/* Photo Navigation */}
                        {photos.length > 1 && (
                            <>
                                {/* Photo Indicators */}
                                <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 px-4">
                                    {photos.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-1 flex-1 max-w-[60px] rounded-full transition-all ${
                                                idx === currentPhotoIndex
                                                    ? 'bg-white'
                                                    : 'bg-white/50'
                                            }`}
                                        />
                                    ))}
                                </div>

                                {/* Navigation Buttons */}
                                {currentPhotoIndex > 0 && (
                                    <button
                                        onClick={prevPhoto}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                )}
                                {currentPhotoIndex < photos.length - 1 && (
                                    <button
                                        onClick={nextPhoto}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {/* User Info Section */}
                    <div className="p-5 space-y-3">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {currentUserCard.name}, {currentUserCard.age}
                            </h2>
                            {currentUserCard.location && (
                                <div className="flex items-center gap-1 text-gray-600 mt-1">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">Nearby</span>
                                </div>
                            )}
                        </div>

                        {currentUserCard.bio && (
                            <p className="text-gray-700 text-sm line-clamp-2">{currentUserCard.bio}</p>
                        )}

                        {currentUserCard.interests && currentUserCard.interests.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {currentUserCard.interests.slice(0, 4).map((interest) => (
                                    <Badge
                                        key={interest}
                                        variant="secondary"
                                        className="px-3 py-1 bg-gray-100 text-gray-700"
                                    >
                                        {interest}
                                    </Badge>
                                ))}
                                {currentUserCard.interests.length > 4 && (
                                    <Badge
                                        variant="secondary"
                                        className="px-3 py-1 bg-gray-100 text-gray-700"
                                    >
                                        +{currentUserCard.interests.length - 4}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-center items-center gap-8">
                    {/* Dislike Button (LEFT) */}
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={handleDislike}
                        disabled={isActioning}
                        className="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 hover:scale-110 transition-all shadow-lg disabled:opacity-50"
                    >
                        <X className="w-8 h-8 text-red-500" />
                    </Button>

                    {/* Like Button (RIGHT) */}
                    <Button
                        size="lg"
                        onClick={handleLike}
                        disabled={isActioning}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary hover:scale-110 transition-all shadow-xl disabled:opacity-50"
                    >
                        <Heart className="w-10 h-10 text-white fill-white" />
                    </Button>
                </div>

                {/* Counter */}
                <p className="text-sm text-gray-500">
                    {currentIndex + 1} of {users.length} profiles
                </p>
            </div>
        </div>
    );
}
