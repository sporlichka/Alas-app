import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError , tap} from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ApiFallbackInterceptor implements HttpInterceptor {
  private readonly localBaseUrl = 'http://127.0.0.1:8000/api';
  private readonly remoteBaseUrl = 'https://full-online-shop-angular-django-production.up.railway.app/api';

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
   
    const localReq = this.cloneRequestWithBaseUrl(req, this.localBaseUrl);

    return next.handle(localReq).pipe(
      catchError((error: HttpErrorResponse) => {
       
        if (error.status === 0 || error.status === 503) {
          
          console.info(`Error connecting to local URL: ${this.localBaseUrl}. Retrying with remote URL...`);
          
          
          const remoteReq = this.cloneRequestWithBaseUrl(req, this.remoteBaseUrl);
          return next.handle(remoteReq).pipe(
            tap(() => console.info(`Successfully connected to remote URL: ${this.remoteBaseUrl}`)),
            catchError((remoteError: HttpErrorResponse) => {
              
              console.error('Error connecting to remote URL:');
           
              return throwError(() => error);
            })
          );
        }
        
        return throwError(() => error);
      })
    );
  }

  private cloneRequestWithBaseUrl(req: HttpRequest<any>, baseUrl: string): HttpRequest<any> {
    return req.clone({ url: `${baseUrl}/${req.url}` });
  }
}
