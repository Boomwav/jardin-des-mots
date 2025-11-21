import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // IMPORTANT pour [(ngModel)]
import { GameService } from '../../services/game'; // Ton service précédent
import { ApiService } from '../../services/api';
import { DbData } from '../../models';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-sky-200 to-green-100 flex flex-col items-center relative overflow-hidden">
      
      <button (click)="quitter()" class="absolute top-4 left-4 bg-white/50 px-3 py-1 rounded-full text-sm">
        ✖ Quitter
      </button>

      <div class="flex-grow flex items-end justify-center pb-10 w-full relative">
        <div class="absolute bottom-0 w-full h-20 bg-green-600"></div>
        
        <div class="relative transition-all duration-500 ease-out transform origin-bottom mb-16"
             [ngClass]="{
               'scale-0': game.vegetableStage() === 0,
               'scale-50': game.vegetableStage() === 1,
               'scale-75': game.vegetableStage() === 2,
               'scale-100': game.vegetableStage() === 3
             }">
             <span class="text-9xl filter drop-shadow-lg">🥕</span>
        </div>

        <div *ngIf="game.streak() >= 3" class="absolute top-20 animate-bounce">
           <span class="text-yellow-500 font-bold text-2xl bg-white px-4 py-2 rounded-full shadow-lg">
             🌟 Carotte d'Or !
           </span>
        </div>
      </div>

      <div class="w-full max-w-md p-6 bg-white rounded-t-3xl shadow-2xl z-10 text-center">
        
        <div *ngIf="!game.currentWord()">
          <h2 class="text-2xl font-bold text-green-600 mb-4">Bravo ! 🎉</h2>
          <p class="mb-6">Tu as terminé la liste !</p>
          <button (click)="quitter()" class="w-full bg-green-500 text-white py-4 rounded-xl text-xl font-bold shadow-lg hover:bg-green-600">
            Retour au jardin
          </button>
        </div>

        <div *ngIf="game.currentWord()">
          
          <button (click)="game.speak(game.currentWord()!.texte)" 
                  class="mb-4 bg-blue-100 text-blue-600 p-4 rounded-full hover:bg-blue-200 transition">
            🔊 Écouter le mot
          </button>

          <input 
            #wordInput
            type="text" 
            [(ngModel)]="userInput"
            (keyup.enter)="valider()"
            placeholder="Tape le mot ici..."
            class="w-full text-center text-2xl font-bold border-b-4 border-gray-300 focus:border-blue-500 outline-none py-2 mb-4 bg-transparent uppercase"
            [ngClass]="{
              'text-red-500': game.feedbackState() === 'error',
              'text-green-500': game.feedbackState() === 'success'
            }"
          />

          <div *ngIf="game.feedbackState() === 'error'" class="text-red-500 font-bold mb-4 animate-pulse">
            Mince ! C'était : <span class="text-xl uppercase">{{ game.currentWord()?.texte }}</span>
          </div>

          <button (click)="valider()" 
                  class="w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-lg shadow-md active:scale-95 transition">
            Valider
          </button>
        </div>

      </div>
    </div>
  `
})
export class GameComponent implements OnInit {
  game = inject(GameService);
  api = inject(ApiService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  userInput = '';
  profilId = 0;

  ngOnInit() {
    this.profilId = Number(this.route.snapshot.paramMap.get('profilId'));
    const listeId = Number(this.route.snapshot.paramMap.get('listeId'));

    // Chargement des données pour récupérer les mots
    this.api.getData().subscribe(data => {
      const liste = data.listes.find(l => l.id === listeId);
      if (liste) {
        this.game.startSession(liste.mots);
      }
    });
  }

  valider() {
    if (!this.userInput) return;
    
    this.game.checkAnswer(this.userInput);
    
    // On vide le champ si c'est un succès, sinon on attend un peu
    if (this.game.feedbackState() === 'success') {
      this.userInput = '';
    } else {
       // En cas d'erreur, on laisse le mot affiché 2s pour comparer, puis on efface
       setTimeout(() => this.userInput = '', 2000);
    }
    
    // Sauvegarder le progrès (très simplifié pour l'instant)
    // Dans une V2, on ferait ça dans le service proprement
    if (this.game.vegetableStage() === 3) {
        this.sauvegarderGain('carotte');
    }
  }

  sauvegarderGain(type: string) {
    this.api.getData().subscribe(data => {
        const profil = data.profils.find(p => p.id === this.profilId);
        if (profil) {
            profil.inventaire[type]++;
            this.api.saveData(data).subscribe();
        }
    });
  }

  quitter() {
    this.router.navigate(['/dashboard', this.profilId]);
  }
}