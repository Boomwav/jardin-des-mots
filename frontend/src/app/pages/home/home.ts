import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; // <--- Ajout de ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';
import { Profil } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html'
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