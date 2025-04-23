import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Cart } from '../../../types/types';
import { CartService } from '../../../services/cart/cart.service';
@Component({
  selector: 'app-cart-popup',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-popup.component.html',
  styleUrl: './cart-popup.component.css',
})
export class CartPopupComponent implements OnInit {
  cart: Cart = {} as Cart;
  total: number = 0;

  constructor(private cartService: CartService) {}
  ngOnInit(): void {
    this.cartService.cartSubject$.subscribe({
      next: (cartobj) => {
        this.cart = cartobj;
      },
      error: (error) => console.error(error),
      complete: () => {
        console.log('Cart:', this.cart);
      },
    });
    this.cartService.total$.subscribe({
      next: (total) => {
        this.total = total;
      },
      error: (error) => console.error(error),
      complete: () => {
        console.log('Total ', this.total);
      },
    });
  }
}
