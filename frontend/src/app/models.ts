// src/app/models.ts

export interface Inventaire {
  carotte: number;
  tomate: number;
  [key: string]: number; // Permet d'autres légumes futurs
}

export interface Profil {
  id: number;
  nom: string;
  avatar: string;
  inventaire: Inventaire;
  carottes_or: number;
}

export interface ListeMots {
  id: number;
  nom: string;
  mots: string[];
}

export interface DbData {
  profils: Profil[];
  listes: ListeMots[];
}