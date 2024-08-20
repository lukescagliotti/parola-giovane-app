import { Component, Inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

interface Evento {
  titolo: string;
  descrizione: string;
  orarioInizio?: string;
  orarioFine?: string;
  giornataIntera?: boolean;
  luogo: string;
}

@Component({
  selector: 'app-eventi-dettaglio',
  templateUrl: './eventi-dettaglio.component.html',
  styleUrls: ['./eventi-dettaglio.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class EventiDettaglioComponent implements AfterViewInit {
  oreGiornaliere: string[] = [];

  @ViewChild('calendarContainer') calendarContainer!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { giorno: number; mese: string; anno: number; eventi: Evento[] },
    private dialogRef: MatDialogRef<EventiDettaglioComponent>
  ) {
    this.oreGiornaliere = Array.from({ length: 25 }, (_, i) => `${i}:00`);
  }

  ngAfterViewInit(): void {
    // Scorri la vista alle 8:00
    const scrollTop = this.calcolaPosizioneOrario('08:00');
    this.calendarContainer.nativeElement.scrollTop = scrollTop;
  }

  chiudi(): void {
    this.dialogRef.close();
  }

  calcolaPosizioneOrario(orario?: string): number {
    if (!orario) {
      return 0;
    }
    const [ore, minuti] = orario.split(':').map(Number);
    return (ore * 60 + minuti) * (30 / 60); // Altezza ora di 30px
  }

  calcolaDurataEvento(orarioInizio?: string, orarioFine?: string): number {
    if (!orarioInizio || !orarioFine) {
      return 0;
    }
    const inizio = this.calcolaPosizioneOrario(orarioInizio);
    const fine = this.calcolaPosizioneOrario(orarioFine);
    return fine - inizio;
  }
}
