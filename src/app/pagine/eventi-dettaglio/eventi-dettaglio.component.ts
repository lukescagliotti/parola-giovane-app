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
    const scrollTop = this.calcolaPosizioneOrario('08:00');
    this.calendarContainer.nativeElement.scrollTop = scrollTop;
  }

  chiudi(): void {
    this.dialogRef.close();
  }

  apriLink(): void {
    const evento = this.data.eventi[0];
    window.open(evento.luogo, '_blank');
  }

  calcolaPosizioneOrario(orario?: string): number {
    if (!orario) {
      return 0;
    }
    const [ore, minuti] = orario.split(':').map(Number);
    const pixelsPerHour = 30;
    const offsetMinutes = 90;
    return ((ore * 60 + minuti + offsetMinutes) * pixelsPerHour) / 60;
  }

  calcolaDurataEvento(orarioInizio?: string, orarioFine?: string): number {
    if (!orarioInizio || !orarioFine) {
      return 0;
    }
    const inizio = this.calcolaPosizioneOrario(orarioInizio);
    const fine = this.calcolaPosizioneOrario(orarioFine);
    return fine - inizio;
  }

  aggiungiAlCalendario(tipo: string): void {
    const evento = this.data.eventi[0];
    const dataEventoInizio = new Date(`${this.data.anno}-${this.data.mese}-${this.data.giorno}T${evento.orarioInizio}`);
    const dataEventoFine = new Date(`${this.data.anno}-${this.data.mese}-${this.data.giorno}T${evento.orarioFine}`);

    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Organization//NONSGML v1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${this.generateUID()}
DTSTAMP:${this.FormatDateToICS(new Date())}
DTSTART:${this.FormatDateToICS(dataEventoInizio)}
DTEND:${this.FormatDateToICS(dataEventoFine)}
SUMMARY:${evento.titolo}
DESCRIPTION:${evento.descrizione}
LOCATION:${evento.luogo}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR
    `.trim();

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${evento.titolo}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  FormatDateToICS(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  generateUID(): string {
    return `${new Date().getTime()}@yourorganization.com`;
  }
}
