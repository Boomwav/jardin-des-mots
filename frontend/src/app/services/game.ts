import { Injectable, signal, computed, inject } from '@angular/core';
import { StateService } from './state';

export interface MotJeu {
  texte: string;
  erreurs: number; // How many times the child has made a mistake on this word
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private state = inject(StateService);
  private profilId: number | null = null;

  // --- GAME STATES (SIGNALS) ---
  
  // The current word to write
  currentWord = signal<MotJeu | null>(null);
  
  // The queue of remaining words
  queue = signal<MotJeu[]>([]);
  
  // Vegetable state (0 = seed, 1 = sprout, 2 = grown, 3 = harvested)
  vegetableStage = signal<number>(0);
  
  // Consecutive success counter (for the golden carrot)
  streak = signal<number>(0);
  
  // Visual feedback ('waiting', 'success', 'error')
  feedbackState = signal<'waiting' | 'success' | 'error'>('waiting');

  // 1. Initialize a session
  startSession(profilId: number, wordList: string[]) {
    this.profilId = profilId;

    // Transform strings into game objects
    const file = wordList.map(m => ({ texte: m, erreurs: 0 }));
    // Shuffle the list (optional)
    this.queue.set(file.sort(() => Math.random() - 0.5));
    this.streak.set(0);
    this.vegetableStage.set(0);
    this.nextWord();
  }

  // 2. Move to the next word
  private nextWord() {
    const q = this.queue();
    if (q.length === 0) {
      this.currentWord.set(null);
      // TODO: Trigger end of game (Victory!)
      return;
    }
    
    const next = q[0]; // Take the first one
    this.currentWord.set(next);
    this.feedbackState.set('waiting');
    
    // Update the queue (remove the word we just took)
    this.queue.set(q.slice(1));

    // Read the word after a short delay
    setTimeout(() => this.speak(next.texte), 500);
  }

  // 3. Check the child's answer
  checkAnswer(inputUser: string) {
    const target = this.currentWord();
    if (!target) return;

    // Clean the input (lowercase, no spaces)
    const cleanInput = inputUser.trim().toLowerCase();
    const cleanTarget = target.texte.trim().toLowerCase();

    if (cleanInput === cleanTarget) {
      this.handleSuccess();
    } else {
      this.handleError(target);
    }
  }

  private handleSuccess() {
    this.feedbackState.set('success');
    
    // 1. The vegetable grows
    this.vegetableStage.update(v => Math.min(v + 1, 3));

    // 2. Streak management (Golden Carrot)
    this.streak.update(s => s + 1);

    // 3. If the vegetable is ripe (stage 3)
    if (this.vegetableStage() >= 3) {
      if(this.profilId) {
        if(this.streak() >= 3)
          this.state.addCarotteOr(this.profilId);
        else
          this.state.addCarotte(this.profilId);
      }
      setTimeout(() => this.vegetableStage.set(0), 1000);
    }

    // Next word after 1.5 seconds (time to see the green)
    setTimeout(() => this.nextWord(), 1500);
  }

  private handleError(mot: MotJeu) {
    this.feedbackState.set('error');
    this.streak.set(0); // Break the chain
    
    // The word is put back at the end of the queue
    const newMot = { ...mot, erreurs: mot.erreurs + 1 };
    this.queue.update(q => [...q, newMot]);
    
    // No next word right away, let the child see the correction
    // They may need to press "Continue" or we wait 3 seconds
    setTimeout(() => {
        // We launch the next word (which is a new word, as the current one has gone to the end)
        this.nextWord();
    }, 3000);
  }

  // --- TTS Tool ---
  speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    // Small hack to force a correct voice if available
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => v.lang.includes('fr') && !v.name.includes('Google')); 
    if(frVoice) utterance.voice = frVoice;
    
    window.speechSynthesis.speak(utterance);
  }
}
