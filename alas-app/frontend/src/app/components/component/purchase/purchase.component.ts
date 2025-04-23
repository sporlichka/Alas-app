import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { PurchaseConfirmationResponse } from '../../../types/types';
import { CommonModule } from '@angular/common';
import { ShoeDividerComponent } from '../shoe-divider/shoe-divider.component';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [CommonModule, ShoeDividerComponent],
  templateUrl: './purchase.component.html',
  styleUrl: './purchase.component.css',
})
export class PurchaseComponent {
  @Input() purchase: PurchaseConfirmationResponse =
    {} as PurchaseConfirmationResponse;
  @Input() confirmedTotal!: number;
}
