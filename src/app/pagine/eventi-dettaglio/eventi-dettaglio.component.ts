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
    this.mese = eventDate.toLocaleString('it-IT', { month: 'long' });
    this.anno = eventDate.getFullYear();

    // Creazione manuale delle ore per eventi di giornata intera
    this.data.eventi.forEach(evento => {
      if (evento.giornataIntera) {
        evento.orarioInizio = '00:00';
        evento.orarioFine = '23:59';
      }
    });
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
    const eventiDelGiorno = this.data.eventi.filter(evento => {
      const eventDate = new Date(evento.data).toDateString();
      const selectedDate = new Date(this.data.eventi[0].data).toDateString();
      return eventDate === selectedDate;
    });

    console.log("Eventi del giorno selezionato:", eventiDelGiorno);

    if (eventiDelGiorno.length === 0) {
      console.warn('Nessun evento trovato per il giorno selezionato.');
      return;
    }

    const allDayEvent = eventiDelGiorno.some(evento => evento.giornataIntera);

    let dataInizio: string, dataFine: string;

    if (allDayEvent) {
      const dataEvento = new Date(eventiDelGiorno[0].data);
      dataInizio = this.formatDate(dataEvento, true);
      dataFine = this.formatDate(dataEvento, true);
    } else {
      const orarioInizioMin = eventiDelGiorno.reduce((min, evento) => {
        const orarioInizio = new Date(`${evento.data}T${evento.orarioInizio || '00:00:00'}`).getTime();
        return orarioInizio < min ? orarioInizio : min;
      }, Infinity);

      const orarioFineMax = eventiDelGiorno.reduce((max, evento) => {
        const orarioFine = evento.orarioFine ? new Date(`${evento.data}T${evento.orarioFine}`).getTime() : new Date(`${evento.data}T23:59:59`).getTime();
        return orarioFine > max ? orarioFine : max;
      }, -Infinity);

      dataInizio = this.formatDate(new Date(orarioInizioMin));
      dataFine = this.formatDate(new Date(orarioFineMax));
    }

    console.log("Data inizio:", dataInizio);
    console.log("Data fine:", dataFine);
    console.log("Giornata intera:", allDayEvent);

    // Crea la descrizione aggregata
    const descrizione = eventiDelGiorno
      .map(evento => {
        if (evento.giornataIntera) {
          return `${evento.titolo} (Tutta la giornata)\n${evento.descrizione}\n${evento.luogo}`;
        } else {
          const orarioInizio = evento.orarioInizio ? evento.orarioInizio : 'TBD';
          const orarioFine = evento.orarioFine ? evento.orarioFine : 'TBD';
          return `${evento.titolo} (${orarioInizio} - ${orarioFine})\n${evento.descrizione}\n${evento.luogo}`;
        }
      })
      .join('\n\n');

    console.log("Descrizione aggregata:", descrizione);

    const eventoUnico: Evento = {
      titolo: 'Eventi di Parola Giovane',
      descrizione: descrizione.trim(),
      luogo: eventiDelGiorno[0].luogo,
      data: eventiDelGiorno[0].data,
      giornataIntera: allDayEvent
    };

    console.log("Evento unificato:", eventoUnico);

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
      default:
        console.error('Tipo di calendario non riconosciuto:', tipo);
    }
  }

  formatDate(date: Date, allDay: boolean = false): string {
    if (allDay) {
      return date.toISOString().split('T')[0].replace(/-/g, '');
    } else {
      return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    }
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
  ${evento.giornataIntera ? `DTSTART;VALUE=DATE:${dataInizio.split('T')[0]}` : `DTSTART:${dataInizio}`}
  ${evento.giornataIntera ? '' : `DTEND:${dataFine}`}
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
    const googleCalendarUrl = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(evento.titolo)}&dates=${evento.giornataIntera ? `${dataInizio.split('T')[0]}/${dataInizio.split('T')[0]}` : `${dataInizio}/${dataFine}`}&details=${encodeURIComponent(evento.descrizione)}&location=${encodeURIComponent(evento.luogo)}`;
    window.open(googleCalendarUrl, '_blank');
  }

  addToOutlookCalendar(evento: Evento, dataInizio: string, dataFine: string): void {
    const outlookCalendarUrl = `https://outlook.live.com/owa/?path=/calendar/action/compose&startdt=${evento.giornataIntera ? `${dataInizio.split('T')[0]}` : `${dataInizio}`}&enddt=${evento.giornataIntera ? '' : `${dataFine}`}&subject=${encodeURIComponent(evento.titolo)}&body=${encodeURIComponent(evento.descrizione)}&location=${encodeURIComponent(evento.luogo)}`;
    window.open(outlookCalendarUrl, '_blank');
  }

  addToYahooCalendar(evento: Evento, dataInizio: string, dataFine: string): void {
    const yahooCalendarUrl = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(evento.titolo)}&st=${evento.giornataIntera ? `${dataInizio.split('T')[0]}` : `${dataInizio}`}&et=${evento.giornataIntera ? '' : `${dataFine}`}&desc=${encodeURIComponent(evento.descrizione)}&in_loc=${encodeURIComponent(evento.luogo)}`;
    window.open(yahooCalendarUrl, '_blank');
  }

  parseDateTime(data: string, orario?: string): Date {
    return orario ? new Date(`${data}T${orario}:00`) : new Date(`${data}T00:00:00`);
  }

  formatDateToICS(date: Date): string {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '') + 'Z';
  }

  generateUID(): string {
    return `${new Date().getTime()}@yourorganization.com`;
  }
}
