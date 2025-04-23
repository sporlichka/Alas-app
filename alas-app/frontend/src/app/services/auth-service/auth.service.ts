import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, finalize } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import {
  NewUser,
  UserRegistrationResponse,
  LoginResponse,
  LogoutResponse,
  UserLogin,
  PasswordResetRequest,
  PasswordResetConfirm,
  PasswordResetRequestResponse,
  PasswordResetConfirmResponse,
} from '../../types/types';
import Cookies from 'universal-cookie';
import { LoaderService } from '../loader/loader.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public cookies = new Cookies();
  public isLogged = new BehaviorSubject<boolean>(this.checkIsLogged());
  isLogged$ = this.isLogged.asObservable();
  public isAdmin = new BehaviorSubject<boolean>(this.checkIsAdmin());
  isAdmin$ = this.isAdmin.asObservable();
  public userEmail = new BehaviorSubject<string>(
    this.cookies.get('userEmail') || ''
  );
  userEmail$ = this.userEmail.asObservable();

  constructor(private http: HttpClient, private loaderService: LoaderService) {
    this.checkIsLogged();
  }

  public checkIsLogged(): boolean {
    const token = this.cookies.get('token');
    const expiresIn = this.cookies.get('expiresIn');
    if (token && expiresIn) {
      const now = new Date().getTime();
      const expirationTime = new Date(expiresIn).getTime();
      if (now < expirationTime) {
        console.log("logued")
        return true;
      } else {
        console.log("no logued")
        return false;
      }
    }
    return false;
  }

  public checkIsAdmin(): boolean {
    return !!this.cookies.get('isAdmin');
  }

  public getTokenExpirationDate(expiresIn: number): Date {
    const now = new Date();
    return new Date(now.getTime() + expiresIn * 1000);
  }

  public login(user: UserLogin): Observable<LoginResponse> {
    this.loaderService.show();
    return this.http.post<LoginResponse>(`login/`, user).pipe(
      tap((response) => {
        const userEmail = response.user.email!;
        const expiresIn = response.expires_in;
        const token = response.token;
        const is_staff = response.is_staff;
        this.createSession(userEmail, expiresIn, token, is_staff);
        
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      }),
      finalize(() => this.loaderService.hide())
    );
  }

  public register(user: NewUser): Observable<UserRegistrationResponse> {
    this.loaderService.show();
    return this.http
      .post<UserRegistrationResponse>(`register/`, user)
      .pipe(
        catchError((error) => {
          this.loaderService.hide();
          console.error('Registration error:', error);
          throw error;
        }),
        finalize(() => this.loaderService.hide())
      );
  }

  public logout(): Observable<LogoutResponse> {
    this.loaderService.show();

    return this.http.post<LogoutResponse>( 'logout/', {}).pipe(
      tap(() => {
        this.isLogged.next(false);
        this.isAdmin.next(false);
        this.cookies.remove('userEmail');
        this.cookies.remove('token');
        this.cookies.remove('isAdmin');
        this.cookies.remove('expiresIn');
      }),
      catchError((error) => {
        console.error('Logout error:', error);
        throw error;
      }),
      finalize(() => this.loaderService.hide())
    );
  }
  private createSession(
    userEmail: string,
    expiresIn: number,
    token: string,
    is_staff: boolean
  ): void {
    const expirationDate = this.getTokenExpirationDate(expiresIn).toISOString();
    this.userEmail.next(userEmail);
    this.isLogged.next(true);
    this.cookies.set('userEmail', userEmail);
    this.cookies.set('token', token);
    this.cookies.set('expiresIn', expirationDate);
    console.log(is_staff);
    if (is_staff) {
      this.isAdmin.next(is_staff);
      this.cookies.set('isAdmin', is_staff);
    }
  }
  requestPasswordReset(
    email: string
  ): Observable<PasswordResetRequestResponse> {
    const body: PasswordResetRequest = { email };
    return this.http
      .post<PasswordResetRequestResponse>(
        `reset-password-request/`,
        body
      )
      .pipe(
        catchError((error) => {
          console.error('Password reset request error:', error);
          throw error;
        })
      );
  }

  confirmPasswordReset(
    uid: string,
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<PasswordResetConfirmResponse> {
    const body: PasswordResetConfirm = {
      new_password: newPassword,
      confirm_password: confirmPassword,
    };
    return this.http
      .post<PasswordResetConfirmResponse>(
        `reset-password/${uid}/${token}/`,
        body
      )
      .pipe(
        catchError((error) => {
          console.error('Password reset confirmation error:', error);
          throw error;
        })
      );
  }
}
