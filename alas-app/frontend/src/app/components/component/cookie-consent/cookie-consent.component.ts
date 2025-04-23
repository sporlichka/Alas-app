import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [],
  templateUrl: './cookie-consent.component.html',
  styleUrl: './cookie-consent.component.css',
})
export class CookieConsentComponent implements OnInit {
  showCookieConsent = true;
  ngOnInit() {
    if (localStorage.getItem('cookie-consent') === 'accepted') {
      this.showCookieConsent = false;
    }
  }

  acceptAllCookies() {
    localStorage.setItem('cookie-consent', 'accepted');
    this.closeCookieConsent();
  }

  closeCookieConsent() {
    this.showCookieConsent = false;
  }
}
