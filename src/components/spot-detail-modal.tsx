import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Spot } from '@/types/spot';

type Props = {
  spot: Spot | null;
  isMutating: boolean;
  onClose: () => void;
  onEdit: (spot: Spot) => void;
  onDelete: (spot: Spot) => void;
};

export function SpotDetailModal({ spot, isMutating, onClose, onEdit, onDelete }: Props) {
  return <Modal visible={spot !== null} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      {spot && <View style={styles.card}>
        <Text style={styles.label}>SAVED SPOT</Text><Text style={styles.title}>{spot.name}</Text>
        <Text style={styles.note}>{spot.note || 'メモはありません'}</Text>
        <Text style={styles.meta}>{new Date(spot.createdAt).toLocaleString('ja-JP')}</Text>
        <Text style={styles.meta}>{spot.latitude.toFixed(5)}, {spot.longitude.toFixed(5)}</Text>
        <View style={styles.actions}>
          <Pressable onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>閉じる</Text></Pressable>
          <Pressable disabled={isMutating} onPress={() => onEdit(spot)} style={({ pressed }) => [styles.editButton, (pressed || isMutating) && styles.disabled]}><Text style={styles.editText}>編集</Text></Pressable>
          <Pressable disabled={isMutating} onPress={() => onDelete(spot)} style={({ pressed }) => [styles.deleteButton, (pressed || isMutating) && styles.disabled]}><Text style={styles.deleteText}>{isMutating ? '処理中…' : '削除'}</Text></Pressable>
        </View>
      </View>}
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(15,23,42,0.4)' }, card: { width: '100%', maxWidth: 400, padding: 22, borderRadius: 22, backgroundColor: '#FFF' },
  label: { color: '#E05A2A', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 }, title: { color: '#172033', fontSize: 24, fontWeight: '700', marginTop: 5 }, note: { color: '#45556F', fontSize: 15, lineHeight: 22, marginTop: 14, marginBottom: 18 },
  meta: { color: '#7B879A', fontSize: 12, marginTop: 3 }, actions: { flexDirection: 'row', gap: 10, marginTop: 22 }, closeButton: { flex: 1, alignItems: 'center', paddingVertical: 13 }, closeText: { color: '#52647E', fontSize: 15, fontWeight: '600' },
  editButton: { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 12, backgroundColor: '#1769E0' }, editText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  deleteButton: { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 12, backgroundColor: '#C93434' }, deleteText: { color: '#FFF', fontSize: 15, fontWeight: '700' }, disabled: { opacity: 0.55 },
});
