import { Component, OnInit } from '@angular/core';
import { PurchaseService } from '../../../services/purchase/purchase.service';
import { Purchase } from '../../../types/types';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [],
  templateUrl: './purchase-history.component.html',
  styleUrl: './purchase-history.component.css',
})
export class PurchaseHistoryComponent implements OnInit {
  purchases: Purchase[] = [];

  constructor(private purchaseService: PurchaseService) {}

  public ngOnInit(): void {
    this.purchaseService.getPurchases().subscribe({
      next: (response) => (this.purchases = response),
      error: (error) => console.error(error),
    });
  }
}
