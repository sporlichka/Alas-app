import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Product } from '../../../types/types';
import { ProductService } from '../../../services/product/product.service';
import { CartService } from '../../../services/cart/cart.service';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-random-product',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './random-product.component.html',
  styleUrl: './random-product.component.css',
})
export class RandomProductComponent implements OnInit {
  product: Product = {} as Product;
  quantity: number = 1;
  isLogged = false;
  isAdmin = false;
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.productService.getRandomProductExcluding().subscribe((value) => {
      this.product = value;
    });
    this.authService.isLogged$.subscribe((value) => {
      this.isLogged = value;
    });
    this.authService.isAdmin$.subscribe((value) => {
      this.isAdmin = value;
    });
  }

  addItemCart(product_id?: number, quantity?: number): void {
    if (product_id !== undefined) {
      this.cartService.addItem(product_id, this.quantity).subscribe({
        next: (res) => {
          Swal.fire({
            title: 'Item Added',
            text: res.message,
            color: '#ffffff',
            width: 300,
            heightAuto: true,
            imageUrl: this.product.image,
            imageWidth: 200,
            imageHeight: 100,
            imageAlt: 'Custom image',
            background: '#000',
            showConfirmButton: true,
            confirmButtonColor: '#000',
          });
          console.log(res, product_id, this.quantity);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400 && error.error && error.error.error) {
            Swal.fire({
              title: 'Error adding product',
              text: error.error.error,
              color: '#ffffff',
              width: 300,
              heightAuto: true,
              imageUrl: this.product.image,
              imageWidth: 200,
              imageHeight: 100,
              imageAlt: 'Custom image',
              background: '#000',
              showConfirmButton: true,
              confirmButtonColor: '#000',
            });
          } else {
            console.error('Error Adding product:', error);
            alert(error);
          }
        },
      });
    }
  }
  incrementQuantity() {
    if (this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}
