import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user/user.service';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { User } from '../../../types/types';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-update',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './user-update.component.html',
  styleUrl: './user-update.component.css',
})
export class UserUpdateComponent implements OnInit {
  user!: User;
  updateForm!: FormGroup;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder
  ) {
    this.updateForm = this.formBuilder.group({
      identification_number: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{6,10}$')],
      ],

      phone: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]],
      adress: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      marketing_accept: [true, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    this.userService.getUser().subscribe({
      next: (user: User) => {
        this.user = user;
        this.updateForm.patchValue({
          identification_number: user.identification_number,
          phone: user.phone,
          adress: user.adress,
        });
      },
      error: (error) => {
        console.error('Error fetching user:', error);
      },
    });
  }

  onSubmit(): void {
    if (this.updateForm.valid && this.user) {
      const formData = this.updateForm.value;

      this.userService.updateUser(formData).subscribe({
        next: (updatedUser: User) => {
          console.log('User updated successfully:', updatedUser);
          Swal.fire({
            text: 'User updated successfully',
            color: '#ffffff',
            icon: 'success',
            width: 300,
            heightAuto: true,
            background: '#000',
            showConfirmButton: true,
            confirmButtonColor: '#000',
          });
        },
        error: (error) => {
          console.error('Error updating user:', error);
          Swal.fire({
            text: 'Error updating user. Check the console for details.',
            color: '#ffffff',
            icon: 'error',
            width: 300,
            heightAuto: true,
            background: '#000',
            showConfirmButton: true,
            confirmButtonColor: '#000',
          });
        },
      });
    }
  }

  get identification_number() {
    return this.updateForm.get('identification_number');
  }
  get phone() {
    return this.updateForm.get('phone');
  }
  get adress() {
    return this.updateForm.get('adress');
  }
  get marketing_accept() {
    return this.updateForm.get('marketing_accept');
  }
}
