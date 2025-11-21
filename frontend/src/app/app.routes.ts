// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { GameComponent } from './pages/game/game';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Accueil (Choix profil)
  { path: 'dashboard/:id', component: DashboardComponent }, // Choix liste
  { path: 'game/:profilId/:listeId', component: GameComponent }, // Le jeu
  { path: '**', redirectTo: '' }
];