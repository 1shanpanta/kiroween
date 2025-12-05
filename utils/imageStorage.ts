import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export async function uploadImageToSupabase(
  localUri: string,
  userId: string
): Promise<string | null> {
  if (!localUri) {
    console.error('[ImageStorage] No local URI provided');
    return null;
  }

  // Check if it's already a Supabase URL
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    console.log('[ImageStorage] Already a URL, skipping upload:', localUri.substring(0, 50));
    return localUri;
  }

  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
  const bucketName = 'artifact-images';

  console.log('[ImageStorage] Uploading image:', fileName);
  console.log('[ImageStorage] Local URI:', localUri.substring(0, 50));
  console.log('[ImageStorage] Platform:', Platform.OS);

  // Read file and prepare for upload
  let uploadData: Blob | File | ArrayBuffer | Uint8Array;
  
  try {
    if (Platform.OS === 'web') {
      // For web, read as base64 and convert to Blob
      const base64Data = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      uploadData = new Blob([bytes], { type: 'image/jpeg' });
    } else {
      // For React Native, read file as base64 then convert to Uint8Array
      const base64Data = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('[ImageStorage] Base64 data length:', base64Data.length);
      
      // Convert base64 to Uint8Array (Supabase accepts this)
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      const cleanBase64 = base64Data.replace(/[^A-Za-z0-9\+\/\=]/g, '');
      const byteLength = Math.floor(cleanBase64.length * 0.75);
      const bytes = new Uint8Array(byteLength);
      let p = 0;
      
      for (let i = 0; i < cleanBase64.length; i += 4) {
        const enc1 = chars.indexOf(cleanBase64.charAt(i));
        const enc2 = chars.indexOf(cleanBase64.charAt(i + 1) || '=');
        const enc3 = chars.indexOf(cleanBase64.charAt(i + 2) || '=');
        const enc4 = chars.indexOf(cleanBase64.charAt(i + 3) || '=');
        
        if (enc1 !== -1 && enc2 !== -1 && p < byteLength) {
          bytes[p++] = (enc1 << 2) | (enc2 >> 4);
        }
        if (enc3 !== -1 && enc3 !== 64 && p < byteLength) {
          bytes[p++] = ((enc2 & 15) << 4) | (enc3 >> 2);
        }
        if (enc4 !== -1 && enc4 !== 64 && p < byteLength) {
          bytes[p++] = ((enc3 & 3) << 6) | enc4;
        }
      }
      
      uploadData = bytes;
      console.log('[ImageStorage] Converted to Uint8Array, length:', bytes.length);
    }
  } catch (fileError) {
    console.error('[ImageStorage] Failed to read file:', fileError);
    return null;
  }

  // Upload to Supabase Storage
  console.log('[ImageStorage] Upload data type:', typeof uploadData, uploadData instanceof Uint8Array ? 'Uint8Array' : uploadData instanceof Blob ? 'Blob' : 'other');
  console.log('[ImageStorage] Upload data size:', uploadData instanceof Uint8Array ? uploadData.length : uploadData instanceof Blob ? uploadData.size : 'unknown');
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, uploadData, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) {
    console.error('[ImageStorage] Failed to upload image:', error);
    console.error('[ImageStorage] Error details:', JSON.stringify(error, null, 2));
    console.error('[ImageStorage] Bucket:', bucketName);
    console.error('[ImageStorage] File name:', fileName);
    return null;
  }
  
  console.log('[ImageStorage] Upload successful, data:', data);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  if (!urlData?.publicUrl) {
    console.error('[ImageStorage] Failed to get public URL');
    return null;
  }

  console.log('[ImageStorage] Image uploaded successfully:', urlData.publicUrl.substring(0, 50));
  return urlData.publicUrl;
}

export async function deleteImageFromSupabase(imageUrl: string): Promise<void> {
  if (!imageUrl || (!imageUrl.includes('storage.supabase.co') && !imageUrl.includes('/storage/v1/object/public/'))) {
    console.log('[ImageStorage] Not a Supabase URL, skipping delete:', imageUrl?.substring(0, 50));
    return;
  }

  // Extract file path from URL
  const urlParts = imageUrl.split('/storage/v1/object/public/');
  if (urlParts.length < 2) {
    console.error('[ImageStorage] Invalid Supabase URL format');
    return;
  }

  const pathParts = urlParts[1].split('/');
  const bucketName = pathParts[0];
  const fileName = pathParts.slice(1).join('/');

  console.log('[ImageStorage] Deleting image:', fileName);

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([fileName]);

  if (error) {
    console.error('[ImageStorage] Failed to delete image:', error);
  } else {
    console.log('[ImageStorage] Image deleted successfully');
  }
}

