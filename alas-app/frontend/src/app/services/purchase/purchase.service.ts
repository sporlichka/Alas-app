import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  PurchaseConfirmationResponse,
  Purchase,
  PaymentTypes,
  EmailData,
} from '../../types/types';
import { tap, finalize } from 'rxjs';
import { CartService } from '../cart/cart.service';
import { catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoaderService } from '../loader/loader.service';
import { EmailService } from '../email/email.service';
import { AuthService } from '../auth-service/auth.service';
import { EMAIL_RESPONSES } from '../../utils/email_responses';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  private userEmail: string | null = null;

  constructor(
    private cartService: CartService,
    private http: HttpClient,
    private loaderService: LoaderService,
    private emailService: EmailService,
    private authService: AuthService
  ) {
    this.authService.userEmail$.subscribe({
      next: (userEmail) => {
        if (userEmail) {
          this.userEmail = userEmail;
        }
      },
      error: (error) => console.error('Error getting user email:', error),
    });
  }

  public confirmPurchase(
    Payment_method_id: number
  ): Observable<PurchaseConfirmationResponse> {
    this.loaderService.show();
    return this.http
      .post<PurchaseConfirmationResponse>(
        'purchase/confirm_purchase/',
        { Payment_method_id }
      )
      .pipe(
        tap((response) => {
          this.cartService.getCart().subscribe();

          if (this.userEmail) {
            const emailData: EmailData = {
              subject: EMAIL_RESPONSES.CONFIRMATION_PURCHASE_SUBJECT,
              message: `
                        ${EMAIL_RESPONSES.CONFIRMATION_PURCHASE_MESSAGE}
                        Delivery Tracking Number: ${response.delivery.tracking_number}
                    `,
              to_email: this.userEmail,
            };
            this.emailService.sendEmail(emailData).subscribe({
              next: () => console.log('Order confirmation email sent'),
              error: (error) => console.error('Error sending email:', error),
            });
          } else {
            console.warn(
              'User email is not available for sending the confirmation email.'
            );
          }
        }),
        catchError((error) => {
          console.error(`Error occurred while confirming purchase:`, error);
          console.log(error);
          throw error;
        }),
        finalize(() => this.loaderService.hide())
      );
  }

  public getPaymentMethodTypes(): Observable<PaymentTypes[]> {
    return this.http.get<PaymentTypes[]>('payment-mode/').pipe(
      catchError((error) => {
        console.error('Error occurred while fetching purchases:', error);
        throw error;
      })
    );
  }

  public getPurchases(): Observable<Purchase[]> {
    this.loaderService.show();
    return this.http
      .get<Purchase[]>('purchase/user_purchases/')
      .pipe(
        tap(() => {
          this.cartService.getCart().subscribe();
        }),
        catchError((error) => {
          console.error('Error occurred while fetching purchases:', error);
          throw error;
        }),
        finalize(() => this.loaderService.hide())
      );
  }
}
