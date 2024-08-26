import { Component, Inject, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Evento } from '../../models/evento.model';

@Component({
  selector: 'app-eventi-dettaglio',
  templateUrl: './eventi-dettaglio.component.html',
  styleUrls: ['./eventi-dettaglio.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class EventiDettaglioComponent implements OnInit, AfterViewInit {
  oreGiornaliere: string[] = [];
  giorno: number = 0;
  mese: string = '';
  anno: number = 0;

  @ViewChild('calendarContainer') calendarContainer!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { eventi: Evento[] },
    private dialogRef: MatDialogRef<EventiDettaglioComponent>
  ) {
    this.oreGiornaliere = Array.from({ length: 25 }, (_, i) => `${i}:00`);
  }

  ngOnInit(): void {
    const firstEvent = this.data.eventi[0];
    const eventDate = new Date(firstEvent.data);
    this.giorno = eventDate.getDate();
    this.mese = eventDate.toLocaleString('it-IT', { month: 'long' }); // Converte il mese in una stringa leggibile in italiano
    this.anno = eventDate.getFullYear();
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
    this.data.eventi.forEach(evento => {
      const dataEvento = this.parseDateTime(evento.data, evento.orarioInizio);
      const dataFineEvento = evento.orarioFine ? this.parseDateTime(evento.data, evento.orarioFine) : null;

      if (isNaN(dataEvento.getTime()) || (dataFineEvento && isNaN(dataFineEvento.getTime()))) {
        console.error('Data non valida:', dataEvento, dataFineEvento);
        return;
      }

      const dataInizio = this.formatDate(dataEvento);
      const dataFine = dataFineEvento ? this.formatDate(dataFineEvento) : '';

      switch (tipo) {
        case 'apple':
          this.downloadICSFile(evento, dataInizio, dataFine);
          break;
        case 'google':
          this.addToGoogleCalendar(evento, dataInizio, dataFine);
          break;
        case 'outlook':
          this.addToOutlookCalendar(evento, dataInizio, dataFine);
          break;
        case 'yahoo':
          this.addToYahooCalendar(evento, dataInizio, dataFine);
          break;
      }
    });
  }

  parseDateTime(data: string, orario?: string): Date {
    return orario ? new Date(`${data}T${orario}:00`) : new Date(`${data}T00:00:00`);
  }

  formatDate(date: Date): string {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
  }

  downloadICSFile(evento: Evento, dataInizio: string, dataFine: string): void {
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Organization//NONSGML v1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${this.generateUID()}
DTSTAMP:${this.formatDateToICS(new Date())}
DTSTART:${dataInizio}
${dataFine ? `DTEND:${dataFine}` : ''}
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

  addToGoogleCalendar(evento: Evento, dataInizio: string, dataFine: string): void {
    const googleCalendarUrl = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(evento.titolo)}&dates=${dataInizio}/${dataFine}&details=${encodeURIComponent(evento.descrizione)}&location=${encodeURIComponent(evento.luogo)}`;
    window.open(googleCalendarUrl, '_blank');
  }

  addToOutlookCalendar(evento: Evento, dataInizio: string, dataFine: string): void {
    const outlookCalendarUrl = `https://outlook.live.com/owa/?path=/calendar/action/compose&startdt=${dataInizio}&enddt=${dataFine}&subject=${encodeURIComponent(evento.titolo)}&body=${encodeURIComponent(evento.descrizione)}&location=${encodeURIComponent(evento.luogo)}`;
    window.open(outlookCalendarUrl, '_blank');
  }

  addToYahooCalendar(evento: Evento, dataInizio: string, dataFine: string): void {
    const yahooCalendarUrl = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(evento.titolo)}&st=${dataInizio}&et=${dataFine}&desc=${encodeURIComponent(evento.descrizione)}&in_loc=${encodeURIComponent(evento.luogo)}`;
    window.open(yahooCalendarUrl, '_blank');
  }

  formatDateToICS(date: Date): string {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '') + 'Z';
  }

  generateUID(): string {
    return `${new Date().getTime()}@yourorganization.com`;
  }
}



  //codice per creare un evento unico con ora inizio del primo evento della giornata e ora fine come ora fine dell'ultimo evento
    /*
    aggiungiAlCalendario(tipo: string): void {
    const eventoInizio = this.data.eventi[0];
    const eventoFine = this.data.eventi[this.data.eventi.length - 1];

    const dataInizio = this.formatDate(new Date(`${this.data.anno}-${this.formatMonth()}-${this.pad(this.data.giorno)}T${eventoInizio.orarioInizio}`));
    const dataFine = eventoFine.orarioFine ? this.formatDate(new Date(`${this.data.anno}-${this.formatMonth()}-${this.pad(this.data.giorno)}T${eventoFine.orarioFine}`)) : '';

    const descrizione = this.data.eventi.map(e => `${e.orarioInizio} - ${e.orarioFine}: ${e.titolo}\n${e.descrizione}`).join('\n\n');

    const eventoUnico = {
      titolo: 'Eventi del Giorno',
      descrizione: descrizione,
      luogo: eventoInizio.luogo
    };

    switch (tipo) {
      case 'apple':
        this.downloadICSFile(eventoUnico, dataInizio, dataFine);
        break;
      case 'google':
        this.addToGoogleCalendar(eventoUnico, dataInizio, dataFine);
        break;
      case 'outlook':
        this.addToOutlookCalendar(eventoUnico, dataInizio, dataFine);
        break;
      case 'yahoo':
        this.addToYahooCalendar(eventoUnico, dataInizio, dataFine);
        break;
    }
  }
  */
