import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { Spot } from '@/types/spot';

type SpotTextInput = Pick<Spot, 'name' | 'note'>;

type Props = {
  spot: Spot;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (input: SpotTextInput) => Promise<boolean>;
};

export function SpotEditModal({ spot, isSaving, onCancel, onSave }: Props) {
  const [name, setName] = useState(spot.name);
  const [note, setNote] = useState(spot.note);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const submit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('スポット名を入力してください。');
      return;
    }
    if (submittingRef.current) return;

    submittingRef.current = true;
    setError(null);
    const saved = await onSave({ name: trimmedName, note: note.trim() });
    submittingRef.current = false;

    if (!saved) {
      setError('保存に失敗しました。時間をおいてもう一度お試しください。');
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.sheet}>
          <Text style={styles.label}>EDIT SPOT</Text>
          <Text style={styles.title}>スポットを編集</Text>
          <TextInput
            accessibilityLabel="スポット名"
            autoFocus
            value={name}
            onChangeText={setName}
            placeholder="スポット名"
            maxLength={80}
            style={styles.input}
          />
          <TextInput
            accessibilityLabel="メモ"
            value={note}
            onChangeText={setNote}
            placeholder="メモ（任意）"
            maxLength={500}
            multiline
            style={[styles.input, styles.noteInput]}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.actions}>
            <Pressable disabled={isSaving} onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </Pressable>
            <Pressable
              disabled={isSaving}
              onPress={() => void submit()}
              style={({ pressed }) => [
                styles.saveButton,
                (pressed || isSaving) && styles.disabled,
              ]}>
              <Text style={styles.saveText}>{isSaving ? '保存中…' : '変更を保存'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.35)',
  },
  sheet: {
    padding: 22,
    paddingBottom: 34,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFF',
  },
  label: { color: '#1769E0', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#172033', fontSize: 22, fontWeight: '700', marginTop: 4, marginBottom: 18 },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D6DEEA',
    borderRadius: 12,
    color: '#172033',
    fontSize: 16,
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  noteInput: { minHeight: 100, paddingTop: 14, textAlignVertical: 'top' },
  error: { color: '#C62828', fontSize: 13, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelButton: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  cancelText: { color: '#52647E', fontSize: 16, fontWeight: '600' },
  saveButton: {
    flex: 1.4,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1769E0',
  },
  saveText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.55 },
});
