import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Giorno } from './giorno.model';

interface GiornoEsteso extends Giorno {
  nonCorrente: boolean;
  evento?: string;
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
    { img: 'logo.png', label: 'Bottone 2', linkEsterno: 'https://www.example2.com' },
    { img: 'logo.png', label: 'Bottone 3', linkEsterno: 'https://www.example3.com' },
    { img: 'logo.png', label: 'Bottone 4', linkEsterno: 'https://www.example4.com' },
    { img: 'logo.png', label: 'Bottone 5', linkEsterno: 'https://www.example5.com' },
    { img: 'logo.png', label: 'Bottone 1', linkEsterno: 'https://www.example1.com' },
    { img: 'logo.png', label: 'Bottone 6', linkEsterno: 'https://www.example6.com' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Evento[]>('assets/eventi.json').subscribe(data => {
      this.eventi = data;
      this.TrovaMesiDaVisualizzare();
      const dataOdierna = new Date();
      this.meseCorrente = dataOdierna.getMonth();
      this.annoCorrente = dataOdierna.getFullYear();
      this.giornoDefault = this.listaMesi[this.meseCorrente];
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
    this.meseCorrente = this.listaMesi.indexOf(this.giornoDefault);
    this.GeneraGiorniDelMese(this.meseCorrente, this.annoCorrente);
  }

  MesePrecedente() {
    if (this.meseCorrente === 0) {
      this.meseCorrente = 11;
      this.annoCorrente--;
    } else {
      this.meseCorrente--;
    }
    this.giornoDefault = this.listaMesi[this.meseCorrente];
    this.GeneraGiorniDelMese(this.meseCorrente, this.annoCorrente);
  }

  MeseSuccessivo() {
    if (this.meseCorrente === 11) {
      this.meseCorrente = 0;
      this.annoCorrente++;
    } else {
      this.meseCorrente++;
    }
    this.giornoDefault = this.listaMesi[this.meseCorrente];
    this.GeneraGiorniDelMese(this.meseCorrente, this.annoCorrente);
  }

  GeneraGiorniDelMese(mese: number, anno: number) {
    const primoGiornoMese = new Date(anno, mese, 1);
    const ultimoGiornoMese = new Date(anno, mese + 1, 0);
    const giorniNelMese = ultimoGiornoMese.getDate();
    const primoGiornoSettimana = primoGiornoMese.getDay() === 0 ? 7 : primoGiornoMese.getDay();
    
    this.giorniMese = [];

    const giorniNelMesePrecedente = new Date(anno, mese, 0).getDate();
    for (let i = primoGiornoSettimana - 2; i >= 0; i--) {
      this.giorniMese.push({
        numero: giorniNelMesePrecedente - i,
        contenuto: '',
        nonCorrente: true
      });
    }

    for (let i = 1; i <= giorniNelMese; i++) {
      const dataCorrente = new Date(anno, mese, i);
      const evento = this.eventi.find(e => {
        const eventoData = new Date(e.data);
        return eventoData.getFullYear() === dataCorrente.getFullYear() &&
               eventoData.getMonth() === dataCorrente.getMonth() &&
               eventoData.getDate() === dataCorrente.getDate();
      });
      this.giorniMese.push({
        numero: i,
        contenuto: evento ? evento.evento : '',
        nonCorrente: false
      });
    }

    const giorniAggiuntivi = (7 - (this.giorniMese.length % 7)) % 7;
    for (let i = 1; i <= giorniAggiuntivi; i++) {
      this.giorniMese.push({
        numero: i,
        contenuto: '',
        nonCorrente: true
      });
    }
  }
}
