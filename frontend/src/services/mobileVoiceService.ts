/**
 * Mobile-compatible voice service for Capacitor apps
 * Uses native speech recognition plugin for Android/iOS
 */

import { SpeechRecognition } from '@capacitor-community/speech-recognition';

export interface VoiceRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export class MobileVoiceService {
  private isListening = false;
  private onResultCallback: ((result: VoiceRecognitionResult) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  async isSupported(): Promise<boolean> {
    try {
      const { available } = await SpeechRecognition.available();
      return available;
    } catch {
      return false;
    }
  }

  async startListening(
    language: string = 'en-US',
    onResult: (result: VoiceRecognitionResult) => void,
    onError: (error: string) => void
  ) {
    try {
      const { available } = await SpeechRecognition.available();
      
      if (!available) {
        onError('Speech recognition not available on this device');
        return;
      }

      this.onResultCallback = onResult;
      this.onErrorCallback = onError;
      
      // Map language codes
      const langMap: Record<string, string> = {
        en: 'en-US',
        sw: 'sw-KE',
        es: 'es-ES'
      };
      
      const lang = langMap[language] || 'en-US';

      await SpeechRecognition.start({
        language: lang,
        maxResults: 10,
        prompt: 'Speak now',
        partialResults: true,
        popup: false
      });

      this.isListening = true;

      // Listen for results
      SpeechRecognition.addListener('partialResults', (data: any) => {
        if (data.matches && data.matches.length > 0) {
          const transcript = data.matches[0];
          if (this.onResultCallback) {
            this.onResultCallback({ transcript, isFinal: false });
          }
        }
      });

      SpeechRecognition.addListener('results', (data: any) => {
        if (data.matches && data.matches.length > 0) {
          const transcript = data.matches[0];
          if (this.onResultCallback) {
            this.onResultCallback({ transcript, isFinal: true });
          }
        }
        this.isListening = false;
      });

      SpeechRecognition.addListener('error', (data: any) => {
        console.error('Speech recognition error:', data);
        this.isListening = false;
        if (this.onErrorCallback) {
          onError(data.error || 'Speech recognition error');
        }
      });

    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      this.isListening = false;
      onError('Failed to start speech recognition');
    }
  }

  async stopListening() {
    try {
      await SpeechRecognition.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

export const mobileVoiceService = new MobileVoiceService();
