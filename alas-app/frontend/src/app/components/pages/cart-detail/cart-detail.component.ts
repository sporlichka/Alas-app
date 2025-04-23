import { Component, OnInit } from '@angular/core';

import { RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart/cart.service';
import { PurchaseService } from '../../../services/purchase/purchase.service';
import {
  Cart,
  PurchaseConfirmationResponse,
  PaymentTypes,
} from '../../../types/types';
import { HttpErrorResponse } from '@angular/common/http';
import { PurchaseComponent } from '../../component/purchase/purchase.component';
import { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { tap, of } from 'rxjs';
import { catchError } from 'rxjs';
import { StripeService } from '../../../services/stripe/stripe.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart-detail',
  standalone: true,
  imports: [RouterLink, PurchaseComponent, FormsModule, CommonModule],
  templateUrl: './cart-detail.component.html',
  styleUrls: ['./cart-detail.component.css'],
})
export class CartDetailComponent implements OnInit {
  cart: Cart = {} as Cart;
  total: number = 0;
  purchase: PurchaseConfirmationResponse = {} as PurchaseConfirmationResponse;
  purchaseConfirmed: boolean = false;
  confirmedTotal: number = 0;
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;
  PaymentMethodTypes: PaymentTypes[] = [];
  Payment_method_id!: number;
  PaymentMode!: string;
  PaymentSelected: PaymentTypes | null = null;

  constructor(
    private cartService: CartService,
    private purchaseService: PurchaseService,
    private stripeService: StripeService
  ) {}

  ngOnInit(): void {
    this.purchaseService.getPaymentMethodTypes().subscribe({
      next: (payments) => {
        this.PaymentMethodTypes = payments;
      },
      error: (error) => console.error(error),
    });

    this.stripeService.initializeStripe().subscribe({
      next: () => {
        console.log('Stripe initialized successfully');
      },
      error: (error) => console.error('Error initializing Stripe:', error),
    });

    this.cartService.cartSubject$.subscribe({
      next: (cart) => {
        this.cart = cart;
      },
      error: (error) => console.error(error),
    });

    this.cartService.total$.subscribe({
      next: (total) => {
        this.total = total;
      },
      error: (error) => console.error(error),
    });
  }

  updatePaymentMethod() {
    if (this.PaymentSelected) {
      this.Payment_method_id = this.PaymentSelected.id;
      this.PaymentMode = this.PaymentSelected.description;
    } else {
      this.Payment_method_id = 0;
      this.PaymentMode = 'no anda';
    }
    console.log('Selected Payment Method:', this.PaymentSelected);
    console.log('Payment Mode:', this.PaymentMode);
    console.log('Payment Method ID:', this.Payment_method_id);
  }
  deleteItem(item_id: number): void {
    if (item_id) {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        color: '#ffffff',
        width: 300,
        heightAuto: true,
        background: '#000',
        showCancelButton: true,
        confirmButtonColor: '#000',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.cartService.deleteItem(item_id).subscribe({
            next: (res) => {
              Swal.fire({
                title: 'Item Deleted',
                text: res.message,
                icon: 'success',
                color: '#ffffff',
                width: 300,
                heightAuto: true,
                background: '#000',
                showConfirmButton: true,
                confirmButtonColor: '#000',
              });
            },
            error: (error) => {
              console.error('Error deleting product: ', error);
              Swal.fire({
                title: 'Product Added',
                text: 'Error deleting product ',
                color: '#ffffff',
                width: 300,
                heightAuto: true,
                icon: 'error',
                background: '#000',
                showConfirmButton: true,
                confirmButtonColor: '#000',
              });
            },
          });
        } else {
          console.error('The item ID is undefined');
        }
      });
    }
  }

  confirmPurchase(event: Event) {
    event.preventDefault();

    if (this.PaymentMode === 'Stripe') {
      this.stripeService.createPaymentMethod().subscribe({
        next: (paymentMethod) => {
          if (!paymentMethod || !paymentMethod.id) {
            Swal.fire({
              title: 'Error creating payment method. Please try again.',
              color: '#ffffff',
              icon: 'error',
              width: 300,
              background: '#000',
              showConfirmButton: true,
              confirmButtonColor: '#000',
            });

            return;
          }

          this.processPurchase(this.Payment_method_id);
        },
        error: (error) => {
          console.error('Error creating payment method:', error);
          Swal.fire({
            title: 'Error creating payment method. Please try again.',
            color: '#ffffff',
            icon: 'error',
            width: 300,
            background: '#000',
            showConfirmButton: true,
            confirmButtonColor: '#000',
          });
        },
      });
    } else if (this.PaymentMode === 'Cash') {
      this.processPurchase(this.Payment_method_id);
    } else {
      Swal.fire({
        title: 'Payment method not supported.',
        color: '#ffffff',
        icon: 'error',
        width: 300,
        background: '#000',
        showConfirmButton: true,
        confirmButtonColor: '#000',
      });
    }
  }

  private processPurchase(paymentMethodId: number): void {
    this.purchaseService
      .confirmPurchase(paymentMethodId)
      .pipe(
        tap((response) => {
          console.log('Purchase completed:', response);
          Swal.fire({
            title: 'Purchase completed successfully.',
            color: '#ffffff',
            icon: 'success',
            width: 300,
            background: '#000',
            showConfirmButton: true,
            confirmButtonColor: '#000',
          });
          this.purchase = response;
          this.purchaseConfirmed = true;
          this.confirmedTotal = this.total;
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 400 && error.error && error.error.error) {
            Swal.fire({
              title: error.error.error,
              color: '#ffffff',
              icon: 'error',
              width: 300,
              background: '#000',
              showConfirmButton: true,
              confirmButtonColor: '#000',
            });
          } else {
            console.error('Error processing the purchase:', error);
            Swal.fire({
              title:
                'An error occurred while processing the purchase, please try again.',
              color: '#ffffff',
              icon: 'error',
              width: 300,
              background: '#000',
              showConfirmButton: true,
              confirmButtonColor: '#000',
            });
          }
          return of(null);
        })
      )
      .subscribe();
  }
}
