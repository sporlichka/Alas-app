import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product/product.service';
import {
  NewProduct,
  ShoeModelType,
  BrandType,
  SizeType,
  ColorType,
} from '../../../types/types';
import { FormsModule } from '@angular/forms';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-product',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './new-product.component.html',
  styleUrl: './new-product.component.css',
})
export class NewProductComponent implements OnInit {
  form!: FormGroup;
  shoeModels: ShoeModelType[] = [];
  brands: BrandType[] = [];
  sizes: SizeType[] = [];
  colors: ColorType[] = [];

  constructor(
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.form = this.formBuilder.group({
      stock: ['', [Validators.required]],
      image: ['', [Validators.required]],
      detail: ['', [Validators.required]],
      price: ['', [Validators.required]],
      model: ['', [Validators.required]],
      brand: ['', [Validators.required]],
      size: ['', [Validators.required]],
      color: ['', [Validators.required]],
    });
  }
  ngOnInit(): void {
    this.loadOptions();
  }

  loadOptions(): void {
    this.productService
      .getShoeModels()
      .subscribe((models) => (this.shoeModels = models));
    this.productService
      .getBrands()
      .subscribe((brands) => (this.brands = brands));
    this.productService.getSizes().subscribe((sizes) => (this.sizes = sizes));
    this.productService
      .getColors()
      .subscribe((colors) => (this.colors = colors));
  }
  get stock() {
    return this.form.get('stock');
  }

  get image() {
    return this.form.get('image');
  }

  get detail() {
    return this.form.get('detail');
  }

  get price() {
    return this.form.get('price');
  }

  addProduct(event: Event): void {
    event.preventDefault();
    if (this.form.valid) {
      const newProduct: NewProduct = {
        stock: this.form.value.stock,
        image: this.form.value.image,
        detail: this.form.value.detail,
        price: this.form.value.price,
        model: this.form.value.model,
        brand: this.form.value.brand,
        size: this.form.value.size,
        color: this.form.value.color,
      };

      this.productService.addProduct(newProduct).subscribe({
        next: (addedProduct) => {
          if (addedProduct.id)
            Swal.fire({
              title: 'Product added successfully:',
              text: 'New Stock: ' + addedProduct.model,
              color: '#ffffff',
              icon: 'success',
              width: 300,
              background: '#000',
              showConfirmButton: true,
              confirmButtonColor: '#000',
            });
          this.resetForm();
        },
        error: (err) => {
          console.error('Error adding product:', err);
          Swal.fire({
            title: 'Error adding product:',
            text: 'Error adding product. Please try again later.',
            color: '#ffffff',
            icon: 'error',
            width: 300,
            background: '#000',
            showConfirmButton: true,
            confirmButtonColor: '#000',
          });
        },
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.form.reset({
      stock: '',
      image: '',
      detail: '',
      price: '',
      model: '',
      brand: '',
      size: '',
      color: '',
    });
  }
}
