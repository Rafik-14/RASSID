import * as ImageManipulator from 'expo-image-manipulator';

const MAX_WIDTH = 800;
const COMPRESS = 0.8;

/**
 * Compress captured proof images: resize, grayscale, WebP target ~35KB.
 */
export async function compressProofImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_WIDTH } }],
    { compress: COMPRESS, format: ImageManipulator.SaveFormat.WEBP, base64: false }
  );
  return result.uri;
}
