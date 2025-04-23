import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product/product.service';
import { Product } from '../../../types/types';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stock-admin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './stock-admin.component.html',
  styleUrl: './stock-admin.component.css',
})
export class StockAdminComponent implements OnInit {
  products: Product[] = [];
  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      },
    });
  }

  updateStock(product: Product): void {
    if (product.stock === 0) {
      alert('Stock cannot be zero. Please enter a valid value.');
      Swal.fire({
        title: 'Stock cannot be zero. Please enter a valid value.',
        color: '#ffffff',
        width: 300,
        heightAuto: true,
        background: '#000',
        showConfirmButton: true,
        confirmButtonColor: '#000',
      });
      return;
    }

    this.productService.patchProductStock(product.id, product.stock).subscribe({
      next: (updatedProduct) => {
        console.log('Product stock updated successfully:', updatedProduct);
        Swal.fire({
          title: 'Product stock updated successfully',
          text: 'New Stock: ' + updatedProduct.stock,
          color: '#ffffff',
          icon: 'success',
          width: 300,
          background: '#000',
          showConfirmButton: true,
          confirmButtonColor: '#000',
        });
      },
      error: (err) => {
        console.error('Error updating product stock:', err);
      },
    });
  }
}
