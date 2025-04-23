import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth-service/auth.service';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLogged$.pipe(
    switchMap(isLogged => {
      if (isLogged) {
        return authService.isAdmin$.pipe(
          map(isAdmin => {
            if (isAdmin) {
              return true;
            } else {
              router.navigate(['/home']);
              return false;
            }
          }),
          catchError(() => {
            router.navigate(['/home']);
            return of(false);
          })
        );
      } else {
        router.navigate(['/home']);
        return of(false);
      }
    }),
    catchError(() => {
      router.navigate(['/home']);
      return of(false);
    })
  );
};
