import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import localeIt from '@angular/common/locales/it';
import { LOCALE_ID } from '@angular/core';
import { Evento } from '../../models/evento.model';

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
  currentIndex = 0;

  constructor(private http: HttpClient, private router: Router) {}

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
    }, 5000);
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.prossimiEventi.length;
  }

  prevSlide() {
    this.currentIndex =
      (this.currentIndex - 1 + this.prossimiEventi.length) % this.prossimiEventi.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  navigateToEvent(evento: Evento) {
    const mese = new Date(evento.data).getMonth() + 1;
    const anno = new Date(evento.data).getFullYear();

    // Naviga alla pagina degli eventi con il mese e l'anno come parametri
    this.router.navigate(['/eventi'], { queryParams: { mese, anno } });
  }

  getProssimiEventi(eventi: Evento[]): Evento[] {
    const oggi = new Date();
    return eventi
      .filter(evento => new Date(evento.data) >= oggi)
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, 3);
  }
}
