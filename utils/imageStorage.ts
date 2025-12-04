import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';

export async function uploadImage(uri: string, userId: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  const fileName = `${userId}/${Date.now()}.jpg`;
  const { data, error } = await supabase.storage
    .from('artifact-images')
    .upload(fileName, decode(base64), {
      contentType: 'image/jpeg',
    });

  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('artifact-images')
    .getPublicUrl(fileName);
  
  return publicUrl;
}

function decode(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
