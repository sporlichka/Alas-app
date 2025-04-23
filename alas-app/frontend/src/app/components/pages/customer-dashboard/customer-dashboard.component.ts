import { Component } from '@angular/core';
import { PurchaseHistoryComponent } from '../../component/purchase-history/purchase-history.component';
import { RouterLink } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { UserUpdateComponent } from '../../component/user-update/user-update.component';
import { ShoeDividerComponent } from '../../component/shoe-divider/shoe-divider.component';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    PurchaseHistoryComponent,
    RouterLink,
    RouterOutlet,
    UserUpdateComponent,
    ShoeDividerComponent,
    AdminDashboardComponent,
  ],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.css',
})
export class CustomerDashboardComponent {}
