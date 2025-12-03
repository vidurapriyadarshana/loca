import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { Heart, X, MapPin, Info, Loader2, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { userAPI, swipeAPI } from '@/api/services';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types';

interface FilterState {
    radius: number;
    gender: 'all' | 'male' | 'female' | 'other';
}

export default function Discover() {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [swipeQueue, setSwipeQueue] = useState<{ swiped_on: string; direction: 'LEFT' | 'RIGHT' }[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [matchNotification, setMatchNotification] = useState<User | null>(null);
    const [filters, setFilters] = useState<FilterState>({
        radius: 1000,
        gender: 'all'
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        loadNearbyUsers();
    }, [filters]);

    const loadNearbyUsers = async () => {
        try {
            setIsLoading(true);
            const params: any = { 
                limit: 20,
                radius: filters.radius
            };
            
            // Only add gender filter if not 'all'
            if (filters.gender !== 'all') {
                params.gender = filters.gender;
            }
            
            const data = await userAPI.getNearbyUsers(params);
            const fetchedUsers = data.users || [];
            
            // Filter out current user
            const filtered = fetchedUsers.filter((u: User) => u._id !== currentUser?._id);
            setUsers(filtered);
            setCurrentIndex(0); // Reset to first card when filters change
            setHasMore(filtered.length > 0);
        } catch (error) {
            console.error('Failed to load nearby users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        setIsFilterOpen(false);
        loadNearbyUsers();
    };

    const handleSwipe = async (direction: 'LEFT' | 'RIGHT') => {
        if (currentIndex >= users.length) return;

        const currentUserCard = users[currentIndex];
        const newSwipe = { swiped_on: currentUserCard._id!, direction };

        // Add to queue
        const updatedQueue = [...swipeQueue, newSwipe];
        setSwipeQueue(updatedQueue);

        // Move to next card
        setCurrentIndex(currentIndex + 1);

        // Send swipes in batch when queue reaches 5 or it's the last card
        if (updatedQueue.length >= 5 || currentIndex + 1 >= users.length) {
            try {
                const response = await swipeAPI.createSwipes(updatedQueue);
                
                // Check for new matches
                if (response.matches && response.matches.length > 0) {
                    // Show match notification for the first match
                    const match = response.matches[0];
                    const matchedUser = match.user1._id === currentUser?._id ? match.user2 : match.user1;
                    setMatchNotification(matchedUser);
                    setTimeout(() => setMatchNotification(null), 5000);
                }
                
                // Clear queue after successful submission
                setSwipeQueue([]);
            } catch (error) {
                console.error('Failed to submit swipes:', error);
            }
        }

        // Load more users if running low
        if (currentIndex + 1 >= users.length - 3 && hasMore) {
            loadNearbyUsers();
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
                        Check back later for more potential matches, or try adjusting your search preferences.
                    </p>
                    <Button onClick={loadNearbyUsers} className="bg-linear-to-r from-primary to-secondary">
                        Refresh
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-linear-to-br from-orange-50 via-red-50 to-pink-50">
            <div className="w-full max-w-md relative flex flex-col items-center gap-6">
                {/* Filter Button - Moved above cards */}
                <div className="self-end z-50">
                    <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                variant="outline" 
                                size="lg"
                                className="bg-white shadow-lg hover:shadow-xl transition-shadow border-2"
                            >
                                <SlidersHorizontal className="w-5 h-5 mr-2" />
                                Filters
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Discovery Filters</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                {/* Radius Filter */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <Label>Distance Radius</Label>
                                        <span className="text-sm font-medium text-gray-700">
                                            {filters.radius >= 1000 
                                                ? `${(filters.radius / 1000).toFixed(0)} km` 
                                                : `${filters.radius} m`}
                                        </span>
                                    </div>
                                    <Slider
                                        value={[filters.radius]}
                                        onValueChange={(value: number[]) => setFilters(prev => ({ ...prev, radius: value[0] }))}
                                        min={100}
                                        max={10000}
                                        step={100}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>100m</span>
                                        <span>10km</span>
                                    </div>
                                </div>

                                {/* Gender Filter */}
                                <div className="space-y-3">
                                    <Label>Show Me</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            type="button"
                                            variant={filters.gender === 'all' ? 'default' : 'outline'}
                                            onClick={() => setFilters(prev => ({ ...prev, gender: 'all' }))}
                                            className={filters.gender === 'all' ? 'bg-linear-to-r from-primary to-secondary' : ''}
                                        >
                                            Everyone
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={filters.gender === 'female' ? 'default' : 'outline'}
                                            onClick={() => setFilters(prev => ({ ...prev, gender: 'female' }))}
                                            className={filters.gender === 'female' ? 'bg-linear-to-r from-primary to-secondary' : ''}
                                        >
                                            Women
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={filters.gender === 'male' ? 'default' : 'outline'}
                                            onClick={() => setFilters(prev => ({ ...prev, gender: 'male' }))}
                                            className={filters.gender === 'male' ? 'bg-linear-to-r from-primary to-secondary' : ''}
                                        >
                                            Men
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={filters.gender === 'other' ? 'default' : 'outline'}
                                            onClick={() => setFilters(prev => ({ ...prev, gender: 'other' }))}
                                            className={filters.gender === 'other' ? 'bg-linear-to-r from-primary to-secondary' : ''}
                                        >
                                            Other
                                        </Button>
                                    </div>
                                </div>

                                {/* Apply Button */}
                                <Button 
                                    onClick={applyFilters}
                                    className="w-full bg-linear-to-r from-primary to-secondary"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Match Notification */}
                {matchNotification && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute top-12 left-1/2 -translate-x-1/2 mb-4 z-50"
                    >
                        <Card className="p-4 bg-white shadow-2xl border-2 border-primary">
                            <div className="flex items-center gap-3">
                                <Heart className="w-6 h-6 text-primary fill-primary" />
                                <div>
                                    <p className="font-bold text-gray-900">It's a Match!</p>
                                    <p className="text-sm text-gray-600">You and {matchNotification.name} liked each other</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Card Stack */}
                <div className="relative h-[600px] w-full">
                    {/* Next cards preview (stack effect) */}
                    {users.slice(currentIndex + 1, currentIndex + 3).map((user, idx) => (
                        <Card
                            key={user._id}
                            className="absolute inset-0 border-2 border-gray-200 shadow-xl"
                            style={{
                                transform: `scale(${1 - (idx + 1) * 0.05}) translateY(${(idx + 1) * 10}px)`,
                                zIndex: 10 - idx,
                                opacity: 1 - (idx + 1) * 0.3,
                            }}
                        />
                    ))}

                    {/* Current Card */}
                    <SwipeCard
                        user={currentUserCard}
                        onSwipe={handleSwipe}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center items-center gap-6 mt-2">
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleSwipe('LEFT')}
                        className="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 hover:scale-110 transition-all shadow-lg"
                    >
                        <X className="w-8 h-8 text-gray-600" />
                    </Button>

                    <Button
                        size="lg"
                        onClick={() => handleSwipe('RIGHT')}
                        className="w-20 h-20 rounded-full bg-linear-to-br from-primary to-secondary hover:scale-110 transition-all shadow-xl"
                    >
                        <Heart className="w-10 h-10 text-white fill-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Swipeable Card Component
interface SwipeCardProps {
    user: User;
    onSwipe: (direction: 'LEFT' | 'RIGHT') => void;
}

function SwipeCard({ user, onSwipe }: SwipeCardProps) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (Math.abs(info.offset.x) > 100) {
            onSwipe(info.offset.x > 0 ? 'RIGHT' : 'LEFT');
        }
    };

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ x, rotate, opacity }}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            whileTap={{ cursor: 'grabbing' }}
        >
            <Card className="h-full w-full border-2 border-gray-200 shadow-2xl overflow-hidden bg-white">
                {/* Image */}
                <div className="relative h-[400px] bg-linear-to-br from-orange-100 to-pink-100">
                    {user.photos && user.photos[0] ? (
                        <img
                            src={user.photos[0]}
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-8xl font-bold text-gray-300">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}

                    {/* Swipe indicators */}
                    <motion.div
                        style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
                        className="absolute top-8 right-8 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-2xl rotate-12 border-4 border-white shadow-xl"
                    >
                        LIKE
                    </motion.div>
                    <motion.div
                        style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
                        className="absolute top-8 left-8 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-2xl -rotate-12 border-4 border-white shadow-xl"
                    >
                        NOPE
                    </motion.div>
                </div>

                {/* User Info */}
                <div className="p-6 space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {user.name}, {user.age}
                        </h2>
                        {user.location && (
                            <div className="flex items-center gap-1 text-gray-600 mt-1">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">Nearby</span>
                            </div>
                        )}
                    </div>

                    {user.bio && (
                        <p className="text-gray-700 text-sm line-clamp-2">{user.bio}</p>
                    )}

                    {user.interests && user.interests.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {user.interests.slice(0, 5).map((interest) => (
                                <Badge
                                    key={interest}
                                    variant="secondary"
                                    className="px-3 py-1 bg-gray-100 text-gray-700"
                                >
                                    {interest}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Info className="w-4 h-4" />
                        <span>Swipe right to like, left to pass</span>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
