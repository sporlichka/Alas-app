import { Component, OnInit } from '@angular/core';
import {
  Delivery,
  DeliveryStatus,
  DeliveryStatusResponse,
} from '../../../types/types';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { DeliveryService } from '../../../services/delivery/delivery.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-deliveries',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './deliveries.component.html',
  styleUrl: './deliveries.component.css',
})
export class DeliveriesComponent implements OnInit {
  deliveries: Delivery[] = [];
  statusForm: FormGroup;

  constructor(
    private deliveryService: DeliveryService,
    private formBuilder: FormBuilder
  ) {
    this.statusForm = this.formBuilder.group({
      purchase_id: ['', Validators.required],
      status_description: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.deliveryService.getDeliveries().subscribe({
      next: (data) => {
        this.deliveries = data;
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      },
    });
  }

  updateDeliveryStatus(
    purchaseId: number,
    statusDescription: DeliveryStatus
  ): void {
    const requestData = {
      purchase_id: purchaseId,
      status_description: statusDescription,
    };

    this.deliveryService.updateDeliveryStatus(requestData).subscribe({
      next: (response: DeliveryStatusResponse) => {
        console.log('Delivery status updated successfully:', response);
        Swal.fire({
          title: 'Delivery status updated successfully:',
          color: '#ffffff',
          icon: 'success',
          width: 300,
          background: '#000',
          showConfirmButton: true,
          confirmButtonColor: '#000',
        });
        this.loadDeliveries();
      },
      error: (err) => {
        console.error('Error updating delivery status:', err);
        Swal.fire({
          title: 'Error updating delivery status:',
          color: '#ffffff',
          icon: 'error',
          width: 300,
          background: '#000',
          showConfirmButton: true,
          confirmButtonColor: '#000',
        });
      },
    });
  }
}
