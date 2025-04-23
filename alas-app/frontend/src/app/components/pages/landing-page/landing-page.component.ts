import { Component } from '@angular/core';
import { CarouselComponent } from '../../component/carousel/carousel.component';
import { CollectionsComponent } from '../../component/collections/collections.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CarouselComponent, CollectionsComponent, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent {
  isModalOpen = true;
  isAsideOpen = true;

  closeAside() {
    this.isAsideOpen = false;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
