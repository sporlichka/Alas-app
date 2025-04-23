import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product/product.service';
import { Product, BrandType } from '../../../types/types';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service/auth.service';
import { CartService } from '../../../services/cart/cart.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-brand-product-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './brand-product-list.component.html',
  styleUrl: './brand-product-list.component.css',
})
export class BrandProductListComponent implements OnInit {
  products: Product[] = [];
  brandName: string | null = null;
  brands: BrandType[] = [];
  quantity = 1;
  isLogged = false;
  isAdmin = false;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.brandName = params.get('brandName');
      if (this.brandName) {
        this.loadBrands();
      }
    });

    this.authService.isLogged$.subscribe({
      next: (value) => (this.isLogged = value),
      error: (error) => console.error(error),
    });

    this.authService.isAdmin$.subscribe({
      next: (value) => (this.isAdmin = value),
      error: (error) => console.error(error),
    });
  }

  private loadBrands(): void {
    this.productService.getBrands().subscribe({
      next: (brands) => {
        console.log('Brands fetched:', brands); // Agregar esto
        this.brands = brands;
        this.loadProductsForBrand();
      },
      error: (err) => {
        console.error('Error loading brands:', err);
      },
    });
  }

  private loadProductsForBrand(): void {
    if (this.brandName) {
      const brand = this.brands.find((b) => b.description === this.brandName);

      if (brand) {
        this.productService.getProducts({ brand: brand.id }).subscribe({
          next: (products) => {
            this.products = products;
          },
          error: (err) => {
            console.error(
              `Error loading products for brand ${this.brandName}`,
              err
            );
          },
        });
      } else {
        console.error('Brand not found.');
      }
    }
  }
  addItemCart(product_id?: number, quantity?: number): void {
    if (product_id !== undefined) {
      this.cartService.addItem(product_id, this.quantity).subscribe({
        next: (res) => {
          Swal.fire({
            title: 'Product Added',
            text: res.message,
            color: '#ffffff',
            width: 300,
            heightAuto: true,
            imageUrl:
              'https://img.freepik.com/foto-gratis/ilustracion-calzado-deportivo-sobre-fondo-azul-generado-ia_188544-19603.jpg?w=1380&t=st=1720619846~exp=1720620446~hmac=c3c9abe9bd869c4c34ba10f563ad4725250fe2a24c598df070a98b49adff834d',
            imageWidth: 250,
            imageHeight: 150,
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
              title: 'Error adding product',
              text: error.error.error,
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
