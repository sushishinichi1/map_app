import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { LocationStateView } from './location-state-view';

export function LocationMap() {
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const location = useCurrentLocation();
  if (location.status === 'loading') return <LocationStateView />;
  if (location.status === 'error') return <LocationStateView errorKind={location.errorKind} onRetry={location.requestLocation} />;
  const region: Region = { ...location.coordinates, latitudeDelta: 0.012, longitudeDelta: 0.012 };
  return <View style={styles.container}>
    <MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={region} mapType="standard" showsCompass showsUserLocation={false}>
      <Marker coordinate={location.coordinates} title="現在地" pinColor="#1769E0" />
    </MapView>
    <View pointerEvents="none" style={[styles.header, { top: insets.top + 12 }]}><Text style={styles.eyebrow}>LOCATION</Text><Text style={styles.heading}>現在地マップ</Text></View>
    <Pressable accessibilityLabel="現在地に戻る" accessibilityRole="button" onPress={() => mapRef.current?.animateToRegion(region, 450)} style={({ pressed }) => [styles.locationButton, { bottom: insets.bottom + 24 }, pressed && styles.locationButtonPressed]}><Text style={styles.locationButtonIcon}>◎</Text></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EDF3' },
  header: { position: 'absolute', left: 16, paddingHorizontal: 18, paddingVertical: 13, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.94)', shadowColor: '#0A1930', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  eyebrow: { color: '#1769E0', fontSize: 10, fontWeight: '800', letterSpacing: 1.6 }, heading: { color: '#172033', fontSize: 18, fontWeight: '700', marginTop: 2 },
  locationButton: { position: 'absolute', right: 18, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', shadowColor: '#0A1930', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10 },
  locationButtonPressed: { opacity: 0.72, transform: [{ scale: 0.96 }] }, locationButtonIcon: { color: '#1769E0', fontSize: 30, fontWeight: '700', lineHeight: 34 },
});
