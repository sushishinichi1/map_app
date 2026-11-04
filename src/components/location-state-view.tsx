import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { LocationErrorKind } from '@/hooks/use-current-location';

const errorContent: Record<LocationErrorKind, { title: string; message: string }> = {
  permission: { title: '位置情報の許可が必要です', message: '現在地を地図に表示するため、設定から位置情報の利用を許可してください。' },
  services: { title: '位置情報サービスがオフです', message: 'iPhoneの「設定」で位置情報サービスをオンにしてから、もう一度お試しください。' },
  unavailable: { title: '現在地を取得できませんでした', message: '空が見える場所や通信環境の良い場所へ移動して、もう一度お試しください。' },
};
type Props = { errorKind?: LocationErrorKind; onRetry?: () => void };

export function LocationStateView({ errorKind, onRetry }: Props) {
  const content = errorKind ? errorContent[errorKind] : null;
  return <SafeAreaView style={styles.container}>
    <View style={styles.iconCircle}><Text style={styles.icon}>{content ? '!' : '⌖'}</Text></View>
    <Text style={styles.title}>{content?.title ?? '現在地を取得しています'}</Text>
    <Text style={styles.message}>{content?.message ?? '位置情報の確認には少し時間がかかることがあります。'}</Text>
    {content && onRetry ? <View style={styles.actions}>
      <Pressable accessibilityRole="button" onPress={onRetry} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>もう一度試す</Text></Pressable>
      {(errorKind === 'permission' || errorKind === 'services') && <Pressable accessibilityRole="button" onPress={() => void Linking.openSettings()} style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}><Text style={styles.settingsButtonText}>設定を開く</Text></Pressable>}
    </View> : <View style={styles.loadingTrack}><View style={styles.loadingBar} /></View>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, backgroundColor: '#F6F8FB' },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 24, backgroundColor: '#E7F0FF' },
  icon: { color: '#1769E0', fontSize: 34, fontWeight: '700' }, title: { color: '#172033', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  message: { color: '#61708A', fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 12, maxWidth: 340 }, actions: { alignSelf: 'stretch', gap: 10, marginTop: 28 },
  primaryButton: { alignItems: 'center', paddingVertical: 15, borderRadius: 14, backgroundColor: '#1769E0' }, primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  settingsButton: { alignItems: 'center', paddingVertical: 13 }, settingsButtonText: { color: '#1769E0', fontSize: 16, fontWeight: '600' }, pressed: { opacity: 0.7 },
  loadingTrack: { width: 160, height: 4, overflow: 'hidden', borderRadius: 2, marginTop: 28, backgroundColor: '#DCE3ED' }, loadingBar: { width: '55%', height: '100%', borderRadius: 2, backgroundColor: '#1769E0' },
});
