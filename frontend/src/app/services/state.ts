import { Injectable, signal } from '@angular/core';
import { ApiService } from './api';
import { DbData, Profil } from '../models';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private data = signal<DbData | null>(null);

  constructor(private api: ApiService) {}

  // --- State Accessors ---

  profils = () => this.data()?.profils ?? [];

  // --- State Initialization ---

  loadInitialData(): Observable<DbData> {
    return this.api.getData().pipe(
      tap(data => this.data.set(data))
    );
  }

  // --- State Mutations ---

  addCarotte(profilId: number) {
    this.data.update(d => {
      if (!d) return null;
      const profil = d.profils.find(p => p.id === profilId);
      if (profil) {
        profil.inventaire.carotte++;
      }
      return { ...d };
    });
    this.saveData();
  }

  addCarotteOr(profilId: number) {
    this.data.update(d => {
      if (!d) return null;
      const profil = d.profils.find(p => p.id === profilId);
      if (profil) {
        profil.carottes_or++;
      }
      return { ...d };
    });
    this.saveData();
  }

  private saveData() {
    const currentData = this.data();
    if (currentData) {
      this.api.saveData(currentData).subscribe();
    }
  }
}
