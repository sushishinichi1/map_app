import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const PHOTO_DIRECTORY = new Directory(Paths.document, 'spot-photos');

export type PickPhotoResult =
  | { status: 'success'; uri: string }
  | { status: 'canceled' }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'error' };

function getExtension(fileName: string | null | undefined, mimeType: string | null | undefined) {
  const fileNameExtension = fileName?.split('.').pop()?.toLowerCase();
  if (fileNameExtension && /^[a-z0-9]{2,5}$/.test(fileNameExtension)) {
    return fileNameExtension;
  }
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/heic' || mimeType === 'image/heif') return 'heic';
  return 'jpg';
}

export async function pickAndStoreSpotPhoto(): Promise<PickPhotoResult> {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return { status: 'denied', canAskAgain: permission.canAskAgain };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
      selectionLimit: 1,
    });
    if (result.canceled) return { status: 'canceled' };

    const asset = result.assets[0];
    const extension = getExtension(asset.fileName, asset.mimeType);
    PHOTO_DIRECTORY.create({ idempotent: true, intermediates: true });
    const destination = new File(
      PHOTO_DIRECTORY,
      `spot-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`,
    );
    await new File(asset.uri).copy(destination);
    return { status: 'success', uri: destination.uri };
  } catch {
    return { status: 'error' };
  }
}

export async function deleteStoredSpotPhoto(uri: string | null) {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // The database remains authoritative even if an orphaned file cannot be cleaned up.
  }
}
