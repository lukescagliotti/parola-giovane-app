import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventiDettaglioComponent } from './eventi-dettaglio.component';

describe('EventiDettaglioComponent', () => {
  let component: EventiDettaglioComponent;
  let fixture: ComponentFixture<EventiDettaglioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventiDettaglioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EventiDettaglioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
