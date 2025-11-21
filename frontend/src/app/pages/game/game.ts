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
  templateUrl: './game.html'
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