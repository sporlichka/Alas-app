import { Component, OnInit } from '@angular/core';
import { Product } from '../../../types/types';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product/product.service';
import { CartService } from '../../../services/cart/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth-service/auth.service';
import { BrandType } from '../../../types/types';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  brands: BrandType[] = [];
  quantity = 1;
  isLogged = false;
  isAdmin = false;
  filters = {
    brand: '',
    min_price: '',
    max_price: '',
    has_stock: true,
  };
  isFiltersVisible = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.loadProducts();
    this.loadBrands();

    this.authService.isLogged$.subscribe({
      next: (value) => (this.isLogged = value),
      error: (error) => console.error(error),
    });
    this.authService.isAdmin$.subscribe({
      next: (value) => (this.isAdmin = value),
      error: (error) => console.error(error),
    });
  }
  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (prods) => (this.products = prods),
      error: (error) => console.error(error),
    });
  }
  loadBrands() {
    this.productService.getBrands().subscribe({
      next: (value) => (this.brands = value),
      error: (error) => console.error(error),
    });
  }
  toggleFilters() {
    this.isFiltersVisible = !this.isFiltersVisible;
  }

  ApplyFilters(): void {
    this.productService.getProducts(this.filters).subscribe({
      next: (prods) => (this.products = prods),
      error: (error) => console.error(error),
    });
  }
  resetFilters(): void {
    this.filters = {
      brand: '',
      min_price: '',
      max_price: '',
      has_stock: true,
    };
    this.productService.getProducts().subscribe({
      next: (prods) => (this.products = prods),
      error: (error) => console.error(error),
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
            imageUrl:
              'https://img.freepik.com/foto-gratis/ilustracion-calzado-deportivo-sobre-fondo-azul-generado-ia_188544-19603.jpg?w=1380&t=st=1720619846~exp=1720620446~hmac=c3c9abe9bd869c4c34ba10f563ad4725250fe2a24c598df070a98b49adff834d',
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
          if (error) {
            Swal.fire({
              title: error.error.error,
              color: '#ffffff',
              width: 300,
              heightAuto: true,
              imageUrl:
                'https://img.freepik.com/foto-gratis/ilustracion-calzado-deportivo-sobre-fondo-azul-generado-ia_188544-19603.jpg?w=1380&t=st=1720619846~exp=1720620446~hmac=c3c9abe9bd869c4c34ba10f563ad4725250fe2a24c598df070a98b49adff834d',
              imageWidth: 200,
              imageHeight: 100,
              imageAlt: 'Custom image',
              background: '#000',
              showConfirmButton: true,
              confirmButtonColor: '#000',
            });
          } else {
            console.error('Error Adding product:', error);
          }
        },
      });
    }
  }
}
