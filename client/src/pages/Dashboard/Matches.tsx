import { useState, useEffect } from 'react';
import { Heart, MapPin, Calendar, MessageCircle, Loader2, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { matchAPI } from '@/api/services';
import { useAuthStore } from '@/store/authStore';
import type { Match, User } from '@/types';

export default function Matches() {
    const { user: currentUser } = useAuthStore();
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        try {
            setIsLoading(true);
            const data = await matchAPI.getMatches();
            setMatches(data.matches || []);
        } catch (error) {
            console.error('Failed to load matches:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getMatchedUser = (match: Match): User => {
        return match.user1._id === currentUser?._id ? match.user2 : match.user1;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <Loader2 className="w-10 h-10 animate-spin text-[#fd267a]" />
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] px-4">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-12 h-12 text-[#fd267a]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No matches yet</h2>
                    <p className="text-gray-600 mb-6">
                        Start swiping to find people you like. When they like you back, you'll see them here!
                    </p>
                    <Button
                        onClick={() => window.location.href = '/dashboard'}
                        className="bg-gradient-to-r from-[#fd267a] to-[#ff6036]"
                    >
                        Start Swiping
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#fd267a] to-[#ff6036] rounded-full flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white fill-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Your Matches</h1>
                            <p className="text-gray-600">
                                {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Matches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map((match) => {
                        const matchedUser = getMatchedUser(match);
                        return (
                            <Card
                                key={match._id}
                                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                                onClick={() => setSelectedMatch(match)}
                            >
                                {/* User Image */}
                                <div className="relative h-72 bg-gradient-to-br from-orange-100 to-pink-100">
                                    {matchedUser.photos && matchedUser.photos[0] ? (
                                        <img
                                            src={matchedUser.photos[0]}
                                            alt={matchedUser.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-6xl font-bold text-gray-300">
                                                {matchedUser.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}

                                    {/* Match Badge */}
                                    <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                                        <Heart className="w-5 h-5 text-[#fd267a] fill-[#fd267a]" />
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="p-5 space-y-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {matchedUser.name}, {matchedUser.age}
                                        </h3>
                                        {matchedUser.location && (
                                            <div className="flex items-center gap-1 text-gray-600 mt-1">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-sm">Nearby</span>
                                            </div>
                                        )}
                                    </div>

                                    {matchedUser.bio && (
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                            {matchedUser.bio}
                                        </p>
                                    )}

                                    {matchedUser.interests && matchedUser.interests.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {matchedUser.interests.slice(0, 3).map((interest) => (
                                                <Badge
                                                    key={interest}
                                                    variant="secondary"
                                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700"
                                                >
                                                    {interest}
                                                </Badge>
                                            ))}
                                            {matchedUser.interests.length > 3 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700"
                                                >
                                                    +{matchedUser.interests.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            Matched {new Date(match.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <Button
                                        className="w-full bg-gradient-to-r from-[#fd267a] to-[#ff6036] hover:shadow-lg transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Future: Open chat
                                            alert(`Chat feature coming soon! Start a conversation with ${matchedUser.name}`);
                                        }}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Send Message
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Match Detail Modal (Optional - for future enhancement) */}
            {selectedMatch && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedMatch(null)}
                >
                    <Card
                        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {(() => {
                            const matchedUser = getMatchedUser(selectedMatch);
                            return (
                                <div>
                                    {/* Header Image */}
                                    <div className="relative h-96 bg-gradient-to-br from-orange-100 to-pink-100">
                                        {matchedUser.photos && matchedUser.photos[0] ? (
                                            <img
                                                src={matchedUser.photos[0]}
                                                alt={matchedUser.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-9xl font-bold text-gray-300">
                                                    {matchedUser.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-3xl font-bold text-gray-900">
                                                    {matchedUser.name}, {matchedUser.age}
                                                </h2>
                                                {matchedUser.location && (
                                                    <div className="flex items-center gap-1 text-gray-600 mt-2">
                                                        <MapPin className="w-5 h-5" />
                                                        <span>Nearby</span>
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setSelectedMatch(null)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                Close
                                            </Button>
                                        </div>

                                        {matchedUser.bio && (
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-900 mb-2">About</h3>
                                                <p className="text-gray-700">{matchedUser.bio}</p>
                                            </div>
                                        )}

                                        {matchedUser.interests && matchedUser.interests.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-900 mb-3">Interests</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {matchedUser.interests.map((interest) => (
                                                        <Badge
                                                            key={interest}
                                                            variant="secondary"
                                                            className="px-3 py-2 bg-gray-100 text-gray-700"
                                                        >
                                                            {interest}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 text-sm text-gray-500 pt-4 border-t border-gray-200">
                                            <Heart className="w-4 h-4 text-[#fd267a] fill-[#fd267a]" />
                                            <span>
                                                Matched on {new Date(selectedMatch.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        <Button
                                            className="w-full bg-gradient-to-r from-[#fd267a] to-[#ff6036] py-6 text-lg"
                                            onClick={() => {
                                                alert(`Chat feature coming soon! Start a conversation with ${matchedUser.name}`);
                                            }}
                                        >
                                            <MessageCircle className="w-5 h-5 mr-2" />
                                            Start Conversation
                                        </Button>
                                    </div>
                                </div>
                            );
                        })()}
                    </Card>
                </div>
            )}
        </div>
    );
}
