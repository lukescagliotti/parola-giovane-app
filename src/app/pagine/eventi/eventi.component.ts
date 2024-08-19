import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Giorno } from './giorno.model';

interface GiornoEsteso extends Giorno {
  nonCorrente: boolean;
  evento?: string[];
  isToday?: boolean;
}

interface Evento {
  data: string;
  evento: string;
}

interface Bottone {
  img: string;
  label: string;
  linkEsterno: string;
}

@Component({
  selector: 'app-eventi',
  templateUrl: './eventi.component.html',
  styleUrls: ['./eventi.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule
  ]
})
export class EventiComponent implements OnInit {
  listaMesi: string[] = [];
  giorniMese: GiornoEsteso[] = [];
  giornoDefault: string = '';
  meseCorrente: number = 0;
  annoCorrente: number = 0;
  eventi: Evento[] = [];

  bottoni: Bottone[] = [
    { img: 'logo.png', label: 'Bottone 1', linkEsterno: 'https://www.example1.com' },
    { img: 'logo.png', label: 'Bottone 2', linkEsterno: 'https://www.example2.com' },
    { img: 'logo.png', label: 'Bottone 3', linkEsterno: 'https://www.example3.com' },
    { img: 'logo.png', label: 'Bottone 4', linkEsterno: 'https://www.example4.com' },
    { img: 'logo.png', label: 'Bottone 5', linkEsterno: 'https://www.example5.com' },
    { img: 'logo.png', label: 'Bottone 6', linkEsterno: 'https://www.example6.com' }
  ];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<Evento[]>('assets/eventi.json').subscribe(data => {
      this.eventi = data;
      this.TrovaMesiDaVisualizzare();
      const dataOdierna = new Date();
      this.meseCorrente = dataOdierna.getMonth();
      this.annoCorrente = dataOdierna.getFullYear();
      this.giornoDefault = `${this.listaMesi[this.meseCorrente]} ${this.annoCorrente}`;
      this.GeneraGiorniDelMese(this.meseCorrente, this.annoCorrente);
    });
  }

  TrovaMesiDaVisualizzare() {
    this.listaMesi = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
  }

  CambiaMese(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.giornoDefault = selectElement.value;
    this.meseCorrente = this.listaMesi.indexOf(this.giornoDefault.split(' ')[0]);
    this.annoCorrente = parseInt(selectElement.value.split(' ')[1], 10);
    this.GeneraGiorniDelMese(this.meseCorrente, this.annoCorrente);
  }

  MesePrecedente() {
    if (this.meseCorrente === 0) {
      this.meseCorrente = 11;
      this.annoCorrente--;
    } else {
      this.meseCorrente--;
    }
    this.giornoDefault = `${this.listaMesi[this.meseCorrente]} ${this.annoCorrente}`;
    this.GeneraGiorniDelMese(this.meseCorrente, this.annoCorrente);
  }

  MeseSuccessivo() {
    if (this.meseCorrente === 11) {
      this.meseCorrente = 0;
      this.annoCorrente++;
    } else {
      this.meseCorrente++;
    }
    this.giornoDefault = `${this.listaMesi[this.meseCorrente]} ${this.annoCorrente}`;
    this.GeneraGiorniDelMese(this.meseCorrente, this.annoCorrente);
  }

  GeneraGiorniDelMese(mese: number, anno: number) {
    const oggi = new Date();
    const primoGiornoMese = new Date(anno, mese, 1);
    const ultimoGiornoMese = new Date(anno, mese + 1, 0);
    const giorniNelMese = ultimoGiornoMese.getDate();
    const primoGiornoSettimana = primoGiornoMese.getDay() === 0 ? 7 : primoGiornoMese.getDay();

    this.giorniMese = [];

    const giorniNelMesePrecedente = new Date(anno, mese, 0).getDate();
    for (let i = primoGiornoSettimana - 2; i >= 0; i--) {
      this.giorniMese.push({
        numero: giorniNelMesePrecedente - i,
        evento: [],
        nonCorrente: true,
        contenuto: ''
      });
    }

    for (let i = 1; i <= giorniNelMese; i++) {
      const dataCorrente = new Date(anno, mese, i);
      const eventiGiorno = this.eventi
        .filter(e => {
          const eventoData = new Date(e.data);
          return eventoData.getFullYear() === dataCorrente.getFullYear() &&
            eventoData.getMonth() === dataCorrente.getMonth() &&
            eventoData.getDate() === dataCorrente.getDate();
        })
        .map(e => e.evento);

      this.giorniMese.push({
        numero: i,
        evento: eventiGiorno,
        nonCorrente: false,
        isToday: oggi.getDate() === i && oggi.getMonth() === mese && oggi.getFullYear() === anno,
        contenuto: ''
      });
    }

    const giorniAggiuntivi = (7 - (this.giorniMese.length % 7)) % 7;
    for (let i = 1; i <= giorniAggiuntivi; i++) {
      this.giorniMese.push({
        numero: i,
        evento: [],
        nonCorrente: true,
        contenuto: ''
      });
    }
  }

  AggiungiEventoAlCalendario(evento: string, giorno: GiornoEsteso) {
    const titoloEvento = evento;
    const dataEventoInizio = new Date(this.annoCorrente, this.meseCorrente, giorno.numero, 10, 0, 0); // Inizio alle 10:00
    const dataEventoFine = new Date(dataEventoInizio.getTime() + 60 * 60 * 1000); // Evento di un'ora

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
SUMMARY:${titoloEvento}
DESCRIPTION:${titoloEvento}
LOCATION:Luogo dell'evento
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR
    `.trim();

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${titoloEvento}.ics`;
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
