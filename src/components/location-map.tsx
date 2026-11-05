import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type LongPressEvent, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCurrentLocation } from '@/hooks/use-current-location';
import { useSpots } from '@/hooks/use-spots';
import type { CreateSpotInput, Spot } from '@/types/spot';
import { LocationStateView } from './location-state-view';
import { SpotDetailModal } from './spot-detail-modal';
import { SpotEditModal } from './spot-edit-modal';
import { SpotFormModal } from './spot-form-modal';

type Coordinate = { latitude: number; longitude: number };

export function LocationMap() {
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const location = useCurrentLocation();
  const spotState = useSpots();
  const [draftCoordinate, setDraftCoordinate] = useState<Coordinate | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null);

  if (location.status === 'loading') return <LocationStateView />;
  if (location.status === 'error') {
    return <LocationStateView errorKind={location.errorKind} onRetry={location.requestLocation} />;
  }

  const region: Region = {
    ...location.coordinates,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  };

  const handleLongPress = (event: LongPressEvent) => {
    setDraftCoordinate(event.nativeEvent.coordinate);
    spotState.clearError();
  };

  const saveSpot = async (input: CreateSpotInput) => (await spotState.createSpot(input)) !== null;

  const editSpot = (spot: Spot) => {
    setSelectedSpot(null);
    setEditingSpot(spot);
    spotState.clearError();
  };

  const cancelEdit = () => {
    setSelectedSpot(editingSpot);
    setEditingSpot(null);
  };

  const saveEditedSpot = async (input: Pick<Spot, 'name' | 'note'>) => {
    if (!editingSpot) return false;
    const updated = await spotState.updateSpot(editingSpot.id, {
      ...input,
      latitude: editingSpot.latitude,
      longitude: editingSpot.longitude,
    });
    if (!updated) return false;

    setEditingSpot(null);
    setSelectedSpot(updated);
    return true;
  };

  const confirmDelete = (spot: Spot) => {
    Alert.alert('スポットを削除', `「${spot.name}」を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => {
          void spotState.deleteSpot(spot.id).then((deleted) => {
            if (deleted) {
              setSelectedSpot(null);
            } else {
              Alert.alert('削除できませんでした', '時間をおいてもう一度お試しください。');
            }
          });
        },
      },
    ]);
  };

  return <View style={styles.container}>
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={region}
      mapType="standard"
      showsCompass
      showsUserLocation={false}
      onLongPress={handleLongPress}>
      <Marker coordinate={location.coordinates} title="現在地" anchor={{ x: 0.5, y: 0.5 }}>
        <View style={styles.currentLocationOuter}><View style={styles.currentLocationInner} /></View>
      </Marker>
      {spotState.spots.map((spot) => (
        <Marker
          key={spot.id}
          coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
          title={spot.name}
          description={spot.note || undefined}
          pinColor="#E05A2A"
          onPress={() => setSelectedSpot(spot)}
        />
      ))}
    </MapView>

    <View pointerEvents="none" style={[styles.header, { top: insets.top + 12 }]}>
      <Text style={styles.eyebrow}>LOCATION</Text>
      <Text style={styles.heading}>現在地マップ</Text>
      <Text style={styles.hint}>長押しでスポットを登録</Text>
    </View>

    {spotState.isLoading && <View style={[styles.loadingBadge, { top: insets.top + 14 }]}><ActivityIndicator color="#1769E0" size="small" /><Text style={styles.loadingText}>読込中</Text></View>}

    {spotState.error && <Pressable accessibilityRole="button" accessibilityLabel="エラーを閉じる" onPress={spotState.clearError} style={[styles.errorBanner, { top: insets.top + 112 }]}><Text style={styles.errorText}>{spotState.error}</Text><Text style={styles.errorClose}>×</Text></Pressable>}

    <Pressable
      accessibilityLabel="現在地に戻る"
      accessibilityRole="button"
      onPress={() => mapRef.current?.animateToRegion(region, 450)}
      style={({ pressed }) => [styles.locationButton, { bottom: insets.bottom + 24 }, pressed && styles.locationButtonPressed]}>
      <Text style={styles.locationButtonIcon}>◎</Text>
    </Pressable>

    <SpotFormModal coordinate={draftCoordinate} isSaving={spotState.isMutating} onCancel={() => setDraftCoordinate(null)} onSave={saveSpot} />
    <SpotDetailModal spot={selectedSpot} isMutating={spotState.isMutating} onClose={() => setSelectedSpot(null)} onEdit={editSpot} onDelete={confirmDelete} />
    {editingSpot && <SpotEditModal spot={editingSpot} isSaving={spotState.isMutating} onCancel={cancelEdit} onSave={saveEditedSpot} />}
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EDF3' },
  header: { position: 'absolute', left: 16, paddingHorizontal: 18, paddingVertical: 13, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.94)', shadowColor: '#0A1930', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  eyebrow: { color: '#1769E0', fontSize: 10, fontWeight: '800', letterSpacing: 1.6 }, heading: { color: '#172033', fontSize: 18, fontWeight: '700', marginTop: 2 }, hint: { color: '#718096', fontSize: 11, marginTop: 3 },
  currentLocationOuter: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: 'rgba(23,105,224,0.25)' }, currentLocationInner: { width: 12, height: 12, borderWidth: 2, borderColor: '#FFF', borderRadius: 6, backgroundColor: '#1769E0' },
  loadingBadge: { position: 'absolute', right: 16, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.94)' }, loadingText: { color: '#52647E', fontSize: 12, fontWeight: '600' },
  errorBanner: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFF0F0', shadowColor: '#0A1930', shadowOpacity: 0.12, shadowRadius: 8 }, errorText: { flex: 1, color: '#A42626', fontSize: 13, fontWeight: '600' }, errorClose: { color: '#A42626', fontSize: 20, marginLeft: 8 },
  locationButton: { position: 'absolute', right: 18, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', shadowColor: '#0A1930', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10 },
  locationButtonPressed: { opacity: 0.72, transform: [{ scale: 0.96 }] }, locationButtonIcon: { color: '#1769E0', fontSize: 30, fontWeight: '700', lineHeight: 34 },
});
