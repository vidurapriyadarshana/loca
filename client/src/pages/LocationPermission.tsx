import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/axios';

export default function LocationPermission() {
    const navigate = useNavigate();
    const { updateProfile } = useAuthStore();
    const [isDetecting, setIsDetecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestLocationPermission = async () => {
        setIsDetecting(true);
        setError(null);

        try {
            // Request geolocation permission
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            const { latitude, longitude } = position.coords;
            
            // Update location on backend
            await api.put('/users/location', { latitude, longitude });
            
            // Update local profile
            await updateProfile({
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                }
            });

            // Navigate to discover page
            navigate('/discover');
        } catch (err: any) {
            console.error('Location error:', err);
            
            if (err.code === 1) {
                setError('Location permission denied. Please enable location access in your browser settings.');
            } else if (err.code === 2) {
                setError('Location unavailable. Please check your device settings.');
            } else if (err.code === 3) {
                setError('Location request timed out. Please try again.');
            } else {
                setError('Failed to get location. Please try again or contact support.');
            }
        } finally {
            setIsDetecting(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full p-8 border-0 shadow-xl">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center">
                        <MapPin className="w-10 h-10 text-white" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-3">
                    Location Access Required
                </h1>

                {/* Description */}
                <p className="text-center text-gray-600 mb-6">
                    Loco uses your location to help you discover nearby matches. We need your permission to access your location.
                </p>

                {/* Features */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Why we need location:</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Find people near you</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>See matches within your preferred distance</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Your exact location is never shared with other users</span>
                        </li>
                    </ul>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-red-800 font-medium mb-1">Permission Denied</p>
                            <p className="text-sm text-red-700">{error}</p>
                            
                            {/* Browser-specific instructions */}
                            <details className="mt-3">
                                <summary className="text-sm text-red-700 cursor-pointer hover:underline">
                                    How to enable location access
                                </summary>
                                <div className="mt-2 text-xs text-red-600 space-y-2">
                                    <p><strong>Chrome:</strong> Click the lock icon in the address bar → Site settings → Allow location</p>
                                    <p><strong>Firefox:</strong> Click the shield icon → Permissions → Location → Allow</p>
                                    <p><strong>Safari:</strong> Safari menu → Settings for this website → Location → Allow</p>
                                    <p><strong>Edge:</strong> Click the lock icon → Permissions for this site → Location → Allow</p>
                                </div>
                            </details>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <Button
                    onClick={requestLocationPermission}
                    disabled={isDetecting}
                    className="w-full bg-linear-to-r from-primary to-secondary text-white py-6 text-lg"
                >
                    {isDetecting ? (
                        <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            Detecting Location...
                        </>
                    ) : (
                        <>
                            <MapPin className="w-5 h-5 mr-2" />
                            Enable Location Access
                        </>
                    )}
                </Button>

                {/* Secondary Action */}
                <div className="mt-4 text-center">
                    <button
                        onClick={() => navigate('/profile')}
                        className="text-sm text-gray-600 hover:text-primary transition-colors"
                    >
                        Set location manually instead
                    </button>
                </div>

                {/* Privacy Note */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        🔒 Your location is encrypted and secure. Only approximate distance is shown to matches.
                    </p>
                </div>
            </Card>
        </div>
    );
}
