import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export type LocationErrorKind = 'permission' | 'services' | 'unavailable';
type Coordinates = { latitude: number; longitude: number };
type LocationState =
  | { status: 'loading'; coordinates: null; errorKind: null }
  | { status: 'ready'; coordinates: Coordinates; errorKind: null }
  | { status: 'error'; coordinates: null; errorKind: LocationErrorKind };
const initialState: LocationState = { status: 'loading', coordinates: null, errorKind: null };

export function useCurrentLocation() {
  const [state, setState] = useState<LocationState>(initialState);
  const requestLocation = useCallback(async () => {
    setState(initialState);
    try {
      if (!(await Location.hasServicesEnabledAsync())) {
        setState({ status: 'error', coordinates: null, errorKind: 'services' });
        return;
      }
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setState({ status: 'error', coordinates: null, errorKind: 'permission' });
        return;
      }
      const result = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setState({ status: 'ready', coordinates: { latitude: result.coords.latitude, longitude: result.coords.longitude }, errorKind: null });
    } catch {
      setState({ status: 'error', coordinates: null, errorKind: 'unavailable' });
    }
  }, []);
  useEffect(() => {
    void Promise.resolve().then(requestLocation);
  }, [requestLocation]);
  return { ...state, requestLocation };
}
