import { useState } from 'react';

interface GeolocationPosition {
    latitude: number;
    longitude: number;
    accuracy: number;
}

interface GeolocationState {
    position: GeolocationPosition | null;
    error: string | null;
    loading: boolean;
}

export const useGeolocation = () => {
    const [state, setState] = useState<GeolocationState>({
        position: null,
        error: null,
        loading: false,
    });

    const getCurrentPosition = () => {
        if (!navigator.geolocation) {
            setState({
                position: null,
                error: 'Geolocation is not supported by your browser',
                loading: false,
            });
            return;
        }

        setState({ position: null, error: null, loading: true });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setState({
                    position: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    },
                    error: null,
                    loading: false,
                });
            },
            (error) => {
                let errorMessage = 'Unable to get location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                }
                setState({
                    position: null,
                    error: errorMessage,
                    loading: false,
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return {
        ...state,
        getCurrentPosition,
    };
};
