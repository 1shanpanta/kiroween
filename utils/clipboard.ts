import * as Clipboard from 'expo-clipboard';

export async function copyToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
  console.log('[Clipboard] Copied:', text.substring(0, 20));
}
