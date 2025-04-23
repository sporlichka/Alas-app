import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoaderService } from '../loader/loader.service';
import { catchError } from 'rxjs';
import { finalize } from 'rxjs';
import { EmailData, EmailResponse } from '../../types/types';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  constructor(private http: HttpClient, private loaderService: LoaderService) {}

  sendEmail(emailData: EmailData): Observable<EmailResponse> {
    this.loaderService.show();
    return this.http
      .post<EmailResponse>(`send_mail/`, emailData)
      .pipe(
        catchError((error) => {
          console.error('Error occurred while sending Email :', error);
          throw error;
        }),
        finalize(() => this.loaderService.hide())
      );
  }
}
