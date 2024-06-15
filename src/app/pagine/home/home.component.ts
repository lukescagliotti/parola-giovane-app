import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

interface Evento {
  data: string;
  evento: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, HttpClientModule]
})
export class HomeComponent implements OnInit {
  eventi: Evento[] = [];
  prossimiEventi: Evento[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Evento[]>('assets/eventi.json').subscribe(data => {
      this.eventi = data;
      this.prossimiEventi = this.getProssimiEventi(this.eventi);
    });
  }

  getProssimiEventi(eventi: Evento[]): Evento[] {
    const oggi = new Date();
    return eventi
      .filter(evento => new Date(evento.data) >= oggi)
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, 3);
  }
}
