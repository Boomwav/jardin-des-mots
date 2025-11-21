import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';
import { DbData, Profil, ListeMots } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (!profil && !erreur) {
      <div class="min-h-screen flex items-center justify-center bg-blue-50">
        <div class="text-2xl text-blue-600 font-bold animate-pulse">
          Chargement du profil...
        </div>
      </div>
    }

    @if (erreur) {
      <div class="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4">
        <h2 class="text-2xl text-red-600 font-bold mb-4">Oups ! Problème.</h2>
        <p class="mb-4">{{ erreur }}</p>
        <button routerLink="/" class="bg-red-600 text-white px-6 py-2 rounded shadow">Retour à l'accueil</button>
      </div>
    }

    @if (profil) {
      <div class="min-h-screen bg-blue-50 p-6">
        
        <header class="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-8 gap-4">
          <div class="flex items-center gap-4">
            <span class="text-6xl">{{ profil.avatar }}</span>
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Bonjour {{ profil.nom }} !</h1>
              <p class="text-gray-500">Prêt à faire pousser des légumes ?</p>
            </div>
          </div>
          
          <div class="flex gap-4 text-lg font-bold">
            <div class="bg-orange-100 px-4 py-2 rounded-full text-orange-600 border border-orange-200">
              🥕 {{ profil.inventaire.carotte || 0 }}
            </div>
            <div class="bg-yellow-100 px-4 py-2 rounded-full text-yellow-600 border border-yellow-200">
              🌟 {{ profil.carottes_or || 0 }}
            </div>
          </div>
        </header>

        <h3 class="text-xl font-bold text-gray-700 mb-4 ml-2">Choisis ta liste de mots :</h3>
        
        <div class="grid gap-4 md:grid-cols-2">
          @for (liste of listes; track liste.id) {
            <div (click)="lancerJeu(liste.id)"
                 class="bg-white p-6 rounded-xl shadow border-l-8 border-green-500 cursor-pointer hover:bg-green-50 hover:scale-[1.02] transition-all flex justify-between items-center group">
              <div>
                <h4 class="text-lg font-bold group-hover:text-green-700">{{ liste.nom }}</h4>
                <span class="text-sm text-gray-400">{{ liste.mots.length }} mots</span>
              </div>
              <button class="bg-green-500 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-green-600 transition">
                JOUER ▶
              </button>
            </div>
          }
        </div>
        
        <div class="mt-12 text-center">
          <button routerLink="/" class="text-gray-400 hover:text-gray-600 underline">Changer de profil</button>
        </div>
      </div>
    }
  `
})
export class DashboardComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  api = inject(ApiService);
  cd = inject(ChangeDetectorRef); // Important pour forcer l'affichage
  
  profil: Profil | undefined;
  listes: ListeMots[] = [];
  erreur = '';

  ngOnInit() {
    // 1. Récupérer l'ID depuis l'URL (ex: /dashboard/1)
    const idParam = this.route.snapshot.paramMap.get('id');
    const idRecherche = Number(idParam);

    console.log("Dashboard - ID demandé :", idRecherche);

    // 2. Charger les données
    this.api.getData().subscribe({
      next: (data: DbData) => {
        console.log("Dashboard - Données reçues.");
        
        // On cherche le profil correspondant à l'ID
        this.profil = data.profils.find(p => p.id === idRecherche);
        this.listes = data.listes;

        if (!this.profil) {
          this.erreur = `Impossible de trouver le profil n°${idRecherche}`;
        }

        // On force la mise à jour de l'écran
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.erreur = "Erreur de connexion au serveur.";
        this.cd.detectChanges();
      }
    });
  }

  lancerJeu(listeId: number) {
    if (this.profil) {
      this.router.navigate(['/game', this.profil.id, listeId]);
    }
  }
}