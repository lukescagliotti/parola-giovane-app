export interface Evento {
  data: string;
  titolo: string;
  descrizione: string;
  orarioInizio?: string;
  orarioFine?: string;
  giornataIntera?: boolean;
  luogo: string;
  top?: number;
  height?: number;
  imagePath?: string;
}
