import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';
import { LandingPageComponent } from './components/pages/landing-page/landing-page.component';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { RegisterPageComponent } from './components/pages/register-page/register-page.component';
import { NotFoundComponent } from './components/component/not-found/not-found.component';
import { ProductListComponent } from './components/pages/product-list/product-list.component';
import { ProductDetailComponent } from './components/pages/product-detail/product-detail.component';
import { CartDetailComponent } from './components/pages/cart-detail/cart-detail.component';
import { CustomerDashboardComponent } from './components/pages/customer-dashboard/customer-dashboard.component';
import { PurchaseHistoryComponent } from './components/component/purchase-history/purchase-history.component';
import { UserUpdateComponent } from './components/component/user-update/user-update.component';
import { AdminDashboardComponent } from './components/pages/admin-dashboard/admin-dashboard.component';
import { DeliveriesComponent } from './components/component/deliveries/deliveries.component';
import { StockAdminComponent } from './components/component/stock-admin/stock-admin.component';
import { NewProductComponent } from './components/component/new-product/new-product.component';
import { ContactPageComponent } from './components/pages/contact-page/contact-page.component';
import { PasswordResetComponent } from './components/pages/password-reset/password-reset.component';
import { PasswordResetConfirmComponent } from './components/pages/password-reset-confirm/password-reset-confirm.component';
import { MesaggingAdminComponent } from './components/component/mesagging-admin/mesagging-admin.component';
import { MesaggingUserComponent } from './components/component/mesagging-user/mesagging-user.component';
import { BrandProductListComponent } from './components/pages/brand-product-list/brand-product-list.component';
import { RandomProductComponent } from './components/pages/random-product/random-product.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: LandingPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'reset-password', component: PasswordResetComponent },
  {
    path: 'reset-password/:uid/:token',
    component: PasswordResetConfirmComponent,
  },
  {
    path: 'user',
    component: CustomerDashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'purchase-history', component: PurchaseHistoryComponent },
      { path: 'user-update', component: UserUpdateComponent },
      { path: 'mesagge-user', component: MesaggingUserComponent },
    ], 
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [adminGuard],
    children: [
      { path: 'deliveries', component: DeliveriesComponent },
      { path: 'stock-admin', component: StockAdminComponent },
      { path: 'new-product', component: NewProductComponent },
      { path: 'mesagge-admin', component: MesaggingAdminComponent },
    ], 
  },
  { path: 'products', component: ProductListComponent },
  { path: 'random-product', component: RandomProductComponent },
  { path: 'products/brand/:brandName', component: BrandProductListComponent },
  { path: 'cart', component: CartDetailComponent , canActivate: [authGuard]},
  { path: 'contact-page', component: ContactPageComponent  },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: '**', component: NotFoundComponent },
];
