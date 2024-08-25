import { TestBed } from '@angular/core/testing';

import { EventoSelezionatoService } from '../Services/evento-selezionato.service';

describe('EventoSelezionatoService', () => {
  let service: EventoSelezionatoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventoSelezionatoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
