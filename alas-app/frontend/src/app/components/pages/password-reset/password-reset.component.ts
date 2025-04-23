import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth-service/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.css',
})
export class PasswordResetComponent {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  get email() {
    return this.form.get('email');
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.form.valid) {
      const email = this.form.value.email;
      this.authService.requestPasswordReset(email).subscribe({
        next: (res) => {
          Swal.fire({
            title: 'Your reset link has been sent.',
            text: res.message,
            icon: 'success',
            color: '#ffffff',
            width: 300,
            heightAuto: true,
            background: '#000',
            showConfirmButton: true,
            confirmButtonColor: '#000',
          });
          this.router.navigate(['/home']);
        },
        error: (err) => {
          Swal.fire({
            title: "'There was an error sending the reset link.'",
            color: '#ffffff',
            icon: 'error',
            width: 300,
            background: '#000',
            showConfirmButton: true,
            confirmButtonColor: '#000',
          });
          console.error(err);
        },
      });
    }
  }
}
