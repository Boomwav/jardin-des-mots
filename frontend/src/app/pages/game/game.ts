import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { StateService } from '../../services/state';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.html'
})
export class GameComponent implements OnInit {
  game = inject(GameService);
  state = inject(StateService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  userInput = '';
  profilId = 0;

  constructor() {
    // Vide le champ de saisie après une réponse, en fonction du feedback
    effect(() => {
      if (this.game.feedbackState() === 'success') {
        this.userInput = '';
      } else if (this.game.feedbackState() === 'error') {
        setTimeout(() => (this.userInput = ''), 2000);
      }
    });
  }

  ngOnInit() {
    this.profilId = Number(this.route.snapshot.paramMap.get('profilId'));
    const listeId = Number(this.route.snapshot.paramMap.get('listeId'));

    // Si les données ne sont pas chargées, on les charge d'abord
    // Dans une app plus grande, un resolver de route serait idéal
    if (this.state.profils().length === 0) {
      this.state.loadInitialData().subscribe(() => {
        this.startGame(listeId);
      });
    } else {
      this.startGame(listeId);
    }
  }

  private startGame(listeId: number) {
    const profil = this.state.profils().find(p => p.id === this.profilId);
    if (profil && profil.listes) {
      const liste = profil.listes.find(l => l.id === listeId);
      if (liste) {
        this.game.startSession(this.profilId, liste.mots);
      }
    }
  }

  valider() {
    if (!this.userInput) return;
    this.game.checkAnswer(this.userInput);
  }

  quitter() {
    this.router.navigate(['/dashboard', this.profilId]);
  }
}
