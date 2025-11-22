// src/app/models.ts

export interface Inventaire {
  carotte: number;
  carotte_or: number;
  [key: string]: number; // Permet d'autres légumes futurs
}

export interface Profil {
  id: number;
  nom: string;
  avatar: string;
  inventaire: Inventaire;
  listes: ListeMots[];
}

export interface ListeMots {
  id: number;
  nom: string;
  mots: string[];
}

export interface DbData {
  profils: Profil[];
}
