import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs';
import { User } from '../../types/types';
import { LoaderService } from '../loader/loader.service';
import { tap, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient, private loaderService: LoaderService) {}

  getUser(): Observable<User> {
    this.loaderService.show();
    return this.http.get<User>( 'user/').pipe(
      catchError((error) => {
        console.error('Error occurred while fetching user:', error);
        throw error;
      }),
      finalize(() => this.loaderService.hide())
    );
  }

  updateUser(data: Partial<User>): Observable<User> {
    this.loaderService.show();
    return this.http.patch<User>( 'user/update/', data).pipe(
      catchError((error) => {
        console.error('Error occurred while updating user:', error);
        throw error;
      }),
      finalize(() => this.loaderService.hide())
    );
  }
}
