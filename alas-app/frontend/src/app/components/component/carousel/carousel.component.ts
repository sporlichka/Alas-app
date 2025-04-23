import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OnInit } from '@angular/core';
import { ProductService } from '../../../services/product/product.service';
import { Product } from '../../../types/types';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
})
export class CarouselComponent implements OnInit {
  @ViewChild('container') container!: ElementRef;
  products: Product[] = [];

  constructor(private productService: ProductService) {}
  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (prods) => (this.products = prods),
      error: (error) => console.error(error),
    });
  }
  slideLeft() {
    this.container.nativeElement.scrollLeft -= 250;
  }

  slideRight() {
    this.container.nativeElement.scrollLeft += 250;
  }
}
