import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {

  meseCorrente: number = 0;
  annoCorrente: number = new Date().getFullYear();
  isMenuOpen = false;

  @ViewChild('indicator') indicator!: ElementRef;

  constructor(private el: ElementRef, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const mese = params['mese'];
      if (mese) {
        this.meseCorrente = parseInt(mese, 10) - 1;
      }
    });
  }

  ngAfterViewInit() {
    this.updateIndicatorPosition();
  }

  moveIndicator(event: MouseEvent) {
    const target = event.target as HTMLElement;
    this.setIndicatorPosition(target);
  }

  updateIndicatorPosition() {
    const activeLink = this.el.nativeElement.querySelector('.active');
    if (activeLink) {
      this.setIndicatorPosition(activeLink);
    }
  }

  setIndicatorPosition(element: HTMLElement) {
    const indicator = this.indicator.nativeElement;
    const rect = element.getBoundingClientRect();
    const parentRect = this.el.nativeElement.querySelector('.menu-items').getBoundingClientRect();

    indicator.style.width = `${rect.width}px`;
    indicator.style.left = `${rect.left - parentRect.left}px`;
    indicator.style.top = `${rect.top - parentRect.top}px`;
    indicator.style.height = `${rect.height}px`;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
