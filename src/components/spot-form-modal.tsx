import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { CreateSpotInput } from '@/types/spot';

type Coordinate = Pick<CreateSpotInput, 'latitude' | 'longitude'>;
type Props = {
  coordinate: Coordinate | null;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (input: CreateSpotInput) => Promise<boolean>;
};

export function SpotFormModal({ coordinate, isSaving, onCancel, onSave }: Props) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const close = () => {
    setName('');
    setNote('');
    setValidationError(null);
    onCancel();
  };

  const submit = async () => {
    const trimmedName = name.trim();
    if (!coordinate || !trimmedName) {
      setValidationError('スポット名を入力してください。');
      return;
    }
    if (await onSave({ name: trimmedName, note: note.trim(), ...coordinate })) {
      close();
    } else {
      setValidationError('保存に失敗しました。時間をおいてもう一度お試しください。');
    }
  };

  return <Modal visible={coordinate !== null} transparent animationType="slide" onRequestClose={close}>
    <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <View style={styles.sheet}>
        <Text style={styles.title}>新しいスポット</Text>
        <Text style={styles.coordinate}>{coordinate ? `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}` : ''}</Text>
        <TextInput accessibilityLabel="スポット名" autoFocus value={name} onChangeText={setName} placeholder="スポット名" maxLength={80} style={styles.input} />
        <TextInput accessibilityLabel="メモ" value={note} onChangeText={setNote} placeholder="メモ（任意）" maxLength={500} multiline style={[styles.input, styles.noteInput]} />
        {validationError && <Text style={styles.error}>{validationError}</Text>}
        <View style={styles.actions}>
          <Pressable disabled={isSaving} onPress={close} style={styles.secondaryButton}><Text style={styles.secondaryText}>キャンセル</Text></Pressable>
          <Pressable disabled={isSaving} onPress={() => void submit()} style={({ pressed }) => [styles.primaryButton, (pressed || isSaving) && styles.disabled]}><Text style={styles.primaryText}>{isSaving ? '保存中…' : '保存する'}</Text></Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.35)' }, sheet: { padding: 22, paddingBottom: 34, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#FFF' },
  title: { color: '#172033', fontSize: 22, fontWeight: '700' }, coordinate: { color: '#718096', fontSize: 12, marginTop: 5, marginBottom: 18 },
  input: { minHeight: 50, paddingHorizontal: 14, borderWidth: 1, borderColor: '#D6DEEA', borderRadius: 12, color: '#172033', fontSize: 16, backgroundColor: '#F8FAFC', marginBottom: 12 },
  noteInput: { minHeight: 100, paddingTop: 14, textAlignVertical: 'top' }, error: { color: '#C62828', fontSize: 13, marginBottom: 10 }, actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  secondaryButton: { flex: 1, alignItems: 'center', paddingVertical: 14 }, secondaryText: { color: '#52647E', fontSize: 16, fontWeight: '600' },
  primaryButton: { flex: 1.4, alignItems: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: '#1769E0' }, primaryText: { color: '#FFF', fontSize: 16, fontWeight: '700' }, disabled: { opacity: 0.55 },
});
