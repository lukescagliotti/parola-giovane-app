import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventoSelezionatoService {
  private eventoSelezionato: { giorno: number, mese: number, anno: number } | null = null;

  setEventoSelezionato(giorno: number, mese: number, anno: number) {
    this.eventoSelezionato = { giorno, mese, anno };
  }

  getEventoSelezionato() {
    return this.eventoSelezionato;
  }

  clearEventoSelezionato() {
    this.eventoSelezionato = null;
  }
}
