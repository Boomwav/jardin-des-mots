import 'zone.js';
import 'zone.js/testing';

// Mock SpeechSynthesis for the test environment
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: () => {},
    getVoices: () => [],
  },
  writable: true,
});

// Mock SpeechSynthesisUtterance
Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  value: class SpeechSynthesisUtterance {
    text: string;
    lang: string;
    voice: any;
    constructor(text: string) {
      this.text = text;
      this.lang = '';
      this.voice = null;
    }
  },
  writable: true,
});
