import { Component, OnInit } from '@angular/core';
import { EmailService } from '../../../services/email/email.service';
import { EmailData } from '../../../types/types';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth-service/auth.service';
import { COMPANYEMAIL } from '../../../utils/utils';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.css',
})
export class ContactPageComponent implements OnInit {
  subject: string = '';
  message: string = '';
  toEmail: string = COMPANYEMAIL;
  user: string = '';
  isLogged: boolean = false;

  constructor(
    private emailService: EmailService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.userEmail$.subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
        }
      },
      error: (error) => {
        console.error('Error occurred while fetching user:', error);
      },
    });
    this.authService.isLogged$.subscribe({
      next: (isLogged) => {
        this.isLogged = isLogged;
      },
      error: (error) => {
        console.error('Error occurred while checking login status:', error);
      },
    });
  }

  sendEmail(): void {
    const emailData: EmailData = {
      subject: this.subject,
      message: this.message,
      to_email: this.toEmail,
    };

    this.emailService.sendEmail(emailData).subscribe({
      next: (response) => {
        console.log(response);
        Swal.fire({
          title: 'Email sent successfully',
          icon: 'success',
          color: '#ffffff',
          width: 300,
          heightAuto: true,
          background: '#000',
          showConfirmButton: true,
          confirmButtonColor: '#000',
        });
        this.subject = '';
        this.message = '';
        this.toEmail = '';
      },
      error: (error) => {
        console.error('Error sending email:', error);
        alert('Error sending email');
      },
    });
  }
}
