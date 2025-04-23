import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth-service/auth.service';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { CookieConsentComponent } from './components/component/cookie-consent/cookie-consent.component';
import { LoaderComponent } from './components/component/loader/loader.component';
import { WhatsappButtonComponent } from './components/component/whatsapp-button/whatsapp-button.component';
import { CartService } from './services/cart/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CookieConsentComponent,
    LoaderComponent,
    WhatsappButtonComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(
    //private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.isLogged$.subscribe((isLogged) => {
      if (isLogged) {
        // this.cartService.loadInitialCart();
      }
    });
    window.addEventListener('storage', (event) => {
      if (event.key === 'token') {
        this.authService.isLogged.next(this.authService.checkIsLogged());
        this.authService.isAdmin.next(this.authService.checkIsAdmin());
      }
    });
  }
}
