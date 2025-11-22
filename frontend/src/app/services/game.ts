import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface MotJeu {
  texte: string;
  erreurs: number; // Combien de fois l'enfant s'est trompé sur ce mot
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api';

  // --- ÉTATS DU JEU (SIGNALS) ---
  
  // Le mot actuel à écrire
  currentWord = signal<MotJeu | null>(null);
  
  // La file d'attente des mots restants
  queue = signal<MotJeu[]>([]);
  
  // État du légume (0 = graine, 1 = pousse, 2 = grand, 3 = récolté)
  vegetableStage = signal<number>(0);
  
  // Compteur de succès d'affilée (pour la carotte d'or)
  streak = signal<number>(0);
  
  // Feedback visuel ('waiting', 'success', 'error')
  feedbackState = signal<'waiting' | 'success' | 'error'>('waiting');

  constructor(private http: HttpClient) {}

  // 1. Initialiser une session
  startSession(listeMots: string[]) {
    // On transforme les string en objets de jeu
    const file = listeMots.map(m => ({ texte: m, erreurs: 0 }));
    // Mélanger la liste (optionnel)
    this.queue.set(file.sort(() => Math.random() - 0.5));
    this.streak.set(0);
    this.vegetableStage.set(0);
    this.nextWord();
  }

  // 2. Passer au mot suivant
  private nextWord() {
    const q = this.queue();
    if (q.length === 0) {
      this.currentWord.set(null);
      // TODO: Déclencher la fin de partie (Victoire!)
      return;
    }
    
    const next = q[0]; // On prend le premier
    this.currentWord.set(next);
    this.feedbackState.set('waiting');
    
    // On met à jour la file (on retire le mot qu'on vient de prendre)
    this.queue.set(q.slice(1));

    // On lit le mot après un court délai
    setTimeout(() => this.speak(next.texte), 500);
  }

  // 3. Vérifier la réponse de l'enfant
  checkAnswer(inputUser: string) {
    const target = this.currentWord();
    if (!target) return;

    // On nettoie l'input (minuscule, sans espace)
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
    
    // 1. Le légume pousse
    this.vegetableStage.update(v => Math.min(v + 1, 3));

    // 2. Gestion du Streak (Carotte d'or)
    this.streak.update(s => s + 1);
 
    // 3. Si le légume est mûr (stade 3)
    if (this.vegetableStage() >= 3) {
        // TODO: Ajouter légume à l'inventaire local
        // Reset du légume pour le prochain
        setTimeout(() => this.vegetableStage.set(0), 1000);
    }

    // Mot suivant après 1.5 secondes (temps de voir le vert)
    setTimeout(() => this.nextWord(), 1500);
  }

  private handleError(mot: MotJeu) {
    this.feedbackState.set('error');
    this.streak.set(0); // Brise la chaîne
    
    // Le mot est remis à la fin de la file
    const newMot = { ...mot, erreurs: mot.erreurs + 1 };
    this.queue.update(q => [...q, newMot]);
    
    // Pas de mot suivant tout de suite, on laisse l'enfant voir la correction
    // Il devra peut-être appuyer sur "Continuer" ou on attend 3 secondes
    setTimeout(() => {
        // On relance le mot suivant (qui est un nouveau mot, car l'actuel est parti à la fin)
        this.nextWord();
    }, 3000);
  }

  // --- Outil TTS ---
  speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    // Petit hack pour forcer une voix correcte si dispo
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => v.lang.includes('fr') && !v.name.includes('Google')); 
    if(frVoice) utterance.voice = frVoice;
    
    window.speechSynthesis.speak(utterance);
  }
}