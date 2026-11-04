import { apiClient } from '../services/apiClient';

/**
 * Determines whether an image URI is a local/preview source that requires
 * being uploaded to Cloudinary CDN, rather than an already-hosted HTTP(S) URL.
 */
export function isLocalMediaUri(uri?: string | null): boolean {
  if (!uri || typeof uri !== 'string') return false;
  const trimmed = uri.trim();
  if (trimmed.length === 0) return false;
  return !trimmed.startsWith('http://') && !trimmed.startsWith('https://');
}

/**
 * Resolves an array of media URIs, uploading any local/preview URIs to Cloudinary
 * in parallel via Promise.all. Pre-hosted HTTP(S) URLs are preserved as-is.
 */
export async function resolveLocalMediaUrls(
  uris: string[],
  folder: string = 'pawty/media'
): Promise<string[]> {
  if (!Array.isArray(uris) || uris.length === 0) return [];

  return Promise.all(
    uris.map(async (uri) => {
      if (!uri) return '';
      if (!isLocalMediaUri(uri)) {
        return uri;
      }
      try {
        const uploadedUrl = await apiClient.uploadImage(uri, folder);
        return uploadedUrl || uri;
      } catch (err) {
        console.warn(`[mediaUtils] Failed to upload local media to ${folder}:`, err);
        throw err;
      }
    })
  );
}

/**
 * Resolves a single media URI, uploading it if it's local.
 */
export async function resolveSingleMediaUrl(
  uri?: string | null,
  folder: string = 'pawty/media'
): Promise<string | undefined> {
  if (!uri) return undefined;
  if (!isLocalMediaUri(uri)) return uri;
  const uploadedUrl = await apiClient.uploadImage(uri, folder);
  return uploadedUrl || uri;
}

