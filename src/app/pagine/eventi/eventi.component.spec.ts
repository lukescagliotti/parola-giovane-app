import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventiComponent } from './eventi.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

describe('EventiComponent', () => {
  let component: EventiComponent;
  let fixture: ComponentFixture<EventiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EventiComponent,
        MatSelectModule,
        MatOptionModule
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EventiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
