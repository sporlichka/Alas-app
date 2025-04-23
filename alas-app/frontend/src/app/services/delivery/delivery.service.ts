import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Delivery,
  DeliveryStatusResponse,
  UpdateDeliveryStatusRequest,
} from '../../types/types';
import { catchError } from 'rxjs';
import { LoaderService } from '../loader/loader.service';
import { tap, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  constructor(private http: HttpClient, private loaderService: LoaderService) {}

  getDeliveries(): Observable<Delivery[]> {
    this.loaderService.show();
    return this.http.get<Delivery[]>(`deliveries/`).pipe(
      catchError((error) => {
        console.error('Error occurred while updating product stock:', error);
        throw error;
      }),
      finalize(() => this.loaderService.hide())
    );
  }

  updateDeliveryStatus(
    request: UpdateDeliveryStatusRequest
  ): Observable<DeliveryStatusResponse> {
    this.loaderService.show();
    return this.http
      .patch<DeliveryStatusResponse>(`deliveries/`, request)
      .pipe(
        catchError((error) => {
          console.error('Error occurred while updating product stock:', error);
          throw error;
        }),
        finalize(() => this.loaderService.hide())
      );
  }
}
