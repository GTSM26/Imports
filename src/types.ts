export interface TransportOp {
  dateChargement: string;
  annee: string;
  sem: string;
  mois: string;
  pays: string;
  type: string;
  mpl: string;
  lieuChargement: string;
  vehicule: string;
  transporteur: string;
  prixAchat: number;
  dateDepart: string;
  refDossier: string;
  bcd: string;
  agenceMA: string;
  numRemorque: string;
  numTracteur: string;
  status: string;
  observations: string;
  tauxChange?: string;
  incident?: string;
  devise: 'EUR' | 'MAD';
}

export type TransportStatus = 'En Transit' | 'Chargé' | 'Embarqué' | 'Arrivée' | string;

export interface DashboardStats {
  totalEnvois: number;
  enTransitCount: number;
  chiffreAchatTotal: number;
  paysActifsCount: number;
}
