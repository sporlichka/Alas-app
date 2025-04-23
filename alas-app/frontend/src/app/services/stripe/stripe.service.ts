import { Injectable } from '@angular/core';
import {
  loadStripe,
  Stripe,
  StripeElements,
  StripeCardElement,
  PaymentMethod,
} from '@stripe/stripe-js';
import { from, Observable, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;

  initializeStripe(): Observable<void> {
    return from(loadStripe(environment.stripePublicKey)).pipe(
      switchMap((stripe: Stripe | null) => {
        if (stripe) {
          this.stripe = stripe;
          this.elements = stripe.elements();
          this.cardElement = this.elements.create('card');
          return new Observable<void>((observer) => {
            this.cardElement?.mount('#card-element');
            observer.next();
            observer.complete();
          });
        } else {
          return new Observable<void>((observer) => {
            observer.error('Failed to load Stripe.');
          });
        }
      }),
      tap(() => {
        console.log('Stripe elements initialized');
      }),
      catchError((error) => {
        console.error('Error setting up Stripe elements:', error);
        return of();
      })
    );
  }

  createPaymentMethod(): Observable<PaymentMethod | null> {
    if (!this.stripe || !this.cardElement) {
      return of(null);
    }

    return from(
      this.stripe.createPaymentMethod({
        type: 'card',
        card: this.cardElement,
      })
    ).pipe(
      switchMap(({ paymentMethod, error }) => {
        if (error) {
          console.error('Payment Method Error:', error);
          return of(null);
        }
        return of(paymentMethod);
      }),
      catchError((error) => {
        console.error('Error creating payment method:', error);
        return of(null);
      })
    );
  }
}
