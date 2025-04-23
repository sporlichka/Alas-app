import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service/auth.service';
import { UserLogin } from '../../../types/types';
import Swal from 'sweetalert2';
import { CartService } from '../../../services/cart/cart.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  form!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cartService: CartService
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(20),
        ],
      ],
    });
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  Userlogin(event: Event): void {
    event.preventDefault();
    if (this.form.valid) {
      const logUser: UserLogin = {
        email: this.form.value.email,
        username: this.form.value.email,
        password: this.form.value.password,
      };

      this.authService.login(logUser).subscribe({
        next: (res) => {
          if (res.token) {
            this.cartService.loadInitialCart();
            Swal.fire({
              title: 'Welcome',
              text: res.user.email,
              color: '#ffffff',
              width: 300,
              heightAuto: true,
              imageUrl:
                'https://img.freepik.com/foto-gratis/ilustracion-calzado-deportivo-sobre-fondo-azul-generado-ia_188544-19603.jpg?w=1380&t=st=1720619846~exp=1720620446~hmac=c3c9abe9bd869c4c34ba10f563ad4725250fe2a24c598df070a98b49adff834d',
              imageWidth: 200,
              imageHeight: 100,
              imageAlt: 'Custom image',
              background: '#000',
              showConfirmButton: true,
              confirmButtonColor: '#000',
            });
            console.log(res.user);
            console.log(res.expires_in);
            this.router.navigate(['/home']);
          }
        },
        error: (error) => {
          Swal.fire({
            title: 'Login Error',
            text: 'Please try again',
            color: '#ffffff',
            width: 300,
            heightAuto: true,
            imageUrl:
              'https://img.freepik.com/foto-gratis/ilustracion-calzado-deportivo-sobre-fondo-azul-generado-ia_188544-19603.jpg?w=1380&t=st=1720619846~exp=1720620446~hmac=c3c9abe9bd869c4c34ba10f563ad4725250fe2a24c598df070a98b49adff834d',
            imageWidth: 200,
            imageHeight: 100,
            imageAlt: 'Custom image',
            background: '#000',
            showConfirmButton: true,
            confirmButtonColor: '#000',
          });
          console.error(error);
        },
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
