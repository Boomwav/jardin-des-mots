import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; // <--- Ajout de ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';
import { Profil } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      
      <div class="w-full max-w-2xl bg-gray-800 text-green-400 p-4 rounded mb-8 text-xs font-mono overflow-auto h-40 border-4 border-red-500">
        <strong>DIAGNOSTIC ANGULAR :</strong><br>
        1. Variable 'rawDebug': {{ rawDebug | json }} <br>
        --------------------------------------<br>
        2. Variable 'profils' (taille): {{ profils.length }}
      </div>
      <h1 class="text-4xl font-bold text-green-800 mb-8">🥕 Jardin des Mots</h1>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
        @for (profil of profils; track profil.id) {
          <div (click)="selectProfil(profil.id)"
               class="cursor-pointer bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center">
            <div class="text-6xl mb-4">{{ profil.avatar }}</div>
            <div class="text-xl font-bold text-gray-700">{{ profil.nom }}</div>
          </div>
        } @empty {
          <p class="text-red-500 font-bold">La liste est vide (Angular ne voit pas les éléments).</p>
        }
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  api = inject(ApiService);
  router = inject(Router);
  cd = inject(ChangeDetectorRef); // Outil pour forcer la mise à jour

  profils: Profil[] = [];
  rawDebug: any = "En attente des données...";

  ngOnInit() {
    this.api.getData().subscribe({
      next: (data: any) => {
        // 1. On stocke tout ce qu'on reçoit pour l'afficher
        this.rawDebug = data;
        
        console.log('Données reçues :', data);

        // 2. Tentative d'assignation sécurisée
        if (data && data.profils) {
          this.profils = data.profils;
        } else if (Array.isArray(data)) {
          // Parfois l'API renvoie le tableau directement sans l'objet parent
          this.profils = data; 
        }

        // 3. FORCE la mise à jour de l'écran (Le coup de pied pour réveiller Angular)
        this.cd.detectChanges(); 
      },
      error: (err) => {
        this.rawDebug = "ERREUR : " + JSON.stringify(err);
        console.error(err);
      }
    });
  }

  selectProfil(id: number) {
    this.router.navigate(['/dashboard', id]);
  }
}