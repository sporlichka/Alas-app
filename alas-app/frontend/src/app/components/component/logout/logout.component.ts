import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth-service/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css',
})
export class LogoutComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        Swal.fire({
          title: 'Goodbye',
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
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed', err);
      },
    });
  }
}
