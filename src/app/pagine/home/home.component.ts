import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import localeIt from '@angular/common/locales/it';
import { LOCALE_ID } from '@angular/core';
import { Evento } from '../../models/evento.model';

registerLocaleData(localeIt);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [{ provide: LOCALE_ID, useValue: 'it' }]
})
export class HomeComponent implements OnInit {
  eventi: Evento[] = [];
  prossimiEventi: Evento[] = [];
  currentIndex: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Evento[]>('assets/eventi.json').subscribe(data => {
      this.eventi = data;
      this.prossimiEventi = this.getProssimiEventi(this.eventi);
      this.startSlider();
    });
  }

  startSlider() {
    setInterval(() => {
      this.nextSlide();
    }, 3000); // Cambia slide ogni 3 secondi
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.prossimiEventi.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.prossimiEventi.length) % this.prossimiEventi.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  getProssimiEventi(eventi: Evento[]): Evento[] {
    const oggi = new Date();
    return eventi
      .filter(evento => new Date(evento.data) >= oggi)
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, 3);
  }
}
