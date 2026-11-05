import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Spot } from '@/types/spot';

type Props = {
  visible: boolean;
  spots: Spot[];
  onClose: () => void;
  onSelect: (spot: Spot) => void;
};

function SpotListItem({ spot, onPress }: { spot: Spot; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${spot.name}を地図で表示`}
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
      {spot.photoUri ? (
        <Image source={{ uri: spot.photoUri }} resizeMode="cover" style={styles.thumbnail} />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Text style={styles.thumbnailPlaceholderText}>SPOT</Text>
        </View>
      )}
      <View style={styles.itemContent}>
        <Text numberOfLines={1} style={styles.itemName}>{spot.name}</Text>
        <Text numberOfLines={2} style={styles.itemNote}>{spot.note || 'メモはありません'}</Text>
        <Text style={styles.itemDate}>
          {new Date(spot.createdAt).toLocaleString('ja-JP')}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function SpotListModal({ visible, spots, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const filteredSpots = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ja-JP');
    const newestFirst = [...spots].sort(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
    );
    if (!normalizedQuery) return newestFirst;
    return newestFirst.filter((spot) =>
      `${spot.name}\n${spot.note}`.toLocaleLowerCase('ja-JP').includes(normalizedQuery),
    );
  }, [query, spots]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>SAVED SPOTS</Text>
            <Text style={styles.title}>スポット一覧</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={close} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>閉じる</Text>
          </Pressable>
        </View>
        <TextInput
          accessibilityLabel="スポットを検索"
          value={query}
          onChangeText={setQuery}
          placeholder="名前・メモを検索"
          placeholderTextColor="#8A96A8"
          returnKeyType="search"
          clearButtonMode="while-editing"
          style={styles.searchInput}
        />
        <Text style={styles.resultCount}>{filteredSpots.length}件</Text>
        <FlatList
          data={filteredSpots}
          keyExtractor={(spot) => String(spot.id)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.listContent,
            filteredSpots.length === 0 && styles.emptyListContent,
          ]}
          renderItem={({ item }) => (
            <SpotListItem spot={item} onPress={() => onSelect(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {spots.length === 0 ? '保存済みスポットはありません' : '該当するスポットがありません'}
              </Text>
              <Text style={styles.emptyMessage}>
                {spots.length === 0
                  ? '地図を長押しして最初のスポットを登録できます。'
                  : '検索キーワードを変えてお試しください。'}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  eyebrow: { color: '#1769E0', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#172033', fontSize: 26, fontWeight: '700', marginTop: 3 },
  closeButton: { paddingHorizontal: 12, paddingVertical: 9 },
  closeButtonText: { color: '#1769E0', fontSize: 15, fontWeight: '700' },
  searchInput: {
    height: 48,
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#D7DFEA',
    borderRadius: 14,
    color: '#172033',
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  resultCount: { color: '#718096', fontSize: 12, marginHorizontal: 22, marginTop: 10 },
  listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 },
  emptyListContent: { flexGrow: 1 },
  item: {
    minHeight: 106,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFF',
  },
  pressed: { opacity: 0.65 },
  thumbnail: { width: 76, height: 76, borderRadius: 12, backgroundColor: '#E8EDF3' },
  thumbnailPlaceholder: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#E7F0FF',
  },
  thumbnailPlaceholderText: { color: '#1769E0', fontSize: 10, fontWeight: '800' },
  itemContent: { flex: 1, alignSelf: 'stretch', justifyContent: 'center', marginLeft: 13 },
  itemName: { color: '#172033', fontSize: 17, fontWeight: '700' },
  itemNote: { color: '#586982', fontSize: 13, lineHeight: 18, marginTop: 4 },
  itemDate: { color: '#8A96A8', fontSize: 11, marginTop: 6 },
  chevron: { color: '#9AA6B7', fontSize: 28, marginLeft: 8 },
  separator: { height: 10 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  emptyTitle: { color: '#27364D', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptyMessage: { color: '#718096', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 9 },
});
