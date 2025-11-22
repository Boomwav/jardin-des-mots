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
  listes: ListeMots[];
}

export interface ListeMots {
  id: number;
  titre: string;
  description: string;
  mots: string[];
}

export interface DbData {
  profils: Profil[];
}
