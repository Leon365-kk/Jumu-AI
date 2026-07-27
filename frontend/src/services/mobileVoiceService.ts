/**
 * Mobile-compatible voice service for Capacitor apps
 * Uses Web Speech API with fallbacks for mobile devices
 */

export interface VoiceRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export class MobileVoiceService {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback: ((result: VoiceRecognitionResult) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    // Check if running in Capacitor (mobile)
    const isCapacitor = !!(window as any).Capacitor;
    
    // Web Speech API - works on most modern mobile browsers
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      
      this.recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const resultTranscript = event.results[current][0].transcript;
        const isFinal = event.results[current].isFinal;
        
        if (this.onResultCallback) {
          this.onResultCallback({ transcript: resultTranscript, isFinal });
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
        
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  startListening(
    language: string = 'en-US',
    onResult: (result: VoiceRecognitionResult) => void,
    onError: (error: string) => void
  ) {
    if (!this.recognition) {
      onError('Speech recognition not supported on this device');
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
    
    this.recognition.lang = langMap[language] || 'en-US';
    
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      onError('Failed to start speech recognition');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

export const mobileVoiceService = new MobileVoiceService();
