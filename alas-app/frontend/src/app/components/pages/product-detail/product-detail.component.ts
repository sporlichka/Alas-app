import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ProductService } from '../../../services/product/product.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../types/types';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart/cart.service';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth-service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  product: Product = {} as Product;
  other: Product = {} as Product;
  quantity: number = 1;
  isLogged = false;
  isAdmin = false;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getProductId();
    this.authService.isLogged$.subscribe((value) => {
      this.isLogged = value;
    });
    this.authService.isAdmin$.subscribe((value) => {
      this.isAdmin = value;
    });
  }

  getProductId() {
    const productId = this.route.snapshot.paramMap.get('id');

    console.log('Product ID:', productId);
    if (productId) {
      this.productService.getProductById(Number(productId)).subscribe({
        next: (prod) => (this.product = prod),
        error: (error) => {
          console.error('Error retrieving the product:', error);
        },
      });
      this.productService
        .getRandomProductExcluding(Number(productId))
        .subscribe({
          next: (prod) => (this.other = prod),
          error: (error) => {
            console.error('Error retrieving the product:', error);
          },
        });
    } else {
      console.error('The ID in the URL is undefined or invalid');
    }
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
