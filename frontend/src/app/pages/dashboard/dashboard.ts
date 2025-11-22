import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';
import { DbData, Profil, ListeMots } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
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

        // On récupère les listes directement depuis le profil
        if (this.profil) {
          this.listes = this.profil.listes || [];
        } else {
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