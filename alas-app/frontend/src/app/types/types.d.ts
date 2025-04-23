export interface ShoeModelType {
  id: number;
  model: string;
}

export interface BrandType {
  id: number;
  description: string;
}

export interface ColorType {
  id: number;
  description: string;
}

export interface SizeType {
  id: number;
  size: string;
}

export interface NewProduct {
  price: number;
  stock: number;
  image?: string | null;
  detail?: string | null;
  model: number | null;
  brand: number | null;
  size: number | null;
  color: number | null;
}

export interface Product {
  id: number;
  price: number;
  stock: number;
  image: string | null;
  detail: string | null;
  model: ShoeModelType | null;
  brand: BrandType | null;
  size: SizeType | null;
  color: ColorType | null;
}

export interface Cart {
  id: number;
  user_email: string;
  items: Item[];
  date: string;
  user: number;
}

export interface Item {
  id: number;
  quantity: number;
  product: Product;
  cart: Cart;
}
export interface NewItem {
  product_id: number;
  quantity?: number;
}

export interface AddProductResponse {
  message: string;
  cart: Cart;
}

export interface RemoveItemRequest {
  product_id: number;
}

export interface RemoveItemResponse {
  message: string;
}

export interface NewUser {
  username: string;
  email: string;
  password: string;
  identification_number?: number;
  phone?: number;
  adress?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  identification_number?: number;
  password?: string;
  is_staff: boolean;
  adress?: string;
}
export interface UserLogin {
  username: string;
  email: string;
  password: string;
}

export interface UserRegistrationResponse {
  user: User;
  message: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  is_staff: boolean;
  expires_in: number;
}

export interface LogoutResponse {
  success: string;
}

export interface Purchase {
  id: number;
  invoice_number: string;
  date: string;
  user: User;
  total: number;
  details: PurchaseDetail[];
  payment_type: number;
  delivery: Delivery;
}

export interface PurchaseDetail {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  purchase: number;
}

export interface PurchaseConfirmationResponse {
  message: string;
  details: PurchaseDetail[];
  delivery: Delivery;
  payment_intent: string;
  payment_method: string;
}

export type DeliveryStatus = 'P' | 'T' | 'C';

export interface Delivery {
  id: number;
  purchase: number;
  tracking_number: string;
  delivery_address: string;
  estimated_date: string | null;
  delivery_date: string | null;
  delivery_status: DeliveryStatus;
}

export interface DeliveryHistory {
  id: number;
  description: DeliveryStatus;
  change_date: string;
}

export interface DeliveryStatusResponse {
  message: string;
  delivery: Delivery;
  delivery_history: DeliveryHistory[];
}

export interface UpdateDeliveryStatusRequest {
  purchase_id: number;
  status_description: DeliveryStatus;
}

export interface PaymentTypes {
  id: number;
  description: string;
}
export interface EmailData {
  subject: string;
  message: string;
  to_email: string;
}
export interface EmailResponse {
  status: 'success' | 'error';
  message?: string;
}
export interface PasswordResetRequestResponse {
  success: boolean;
  message: string;
}

export interface PasswordResetConfirmResponse {
  success: boolean;
  message: string;
  uid: string;
  token: string;
}
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  new_password: string;
  confirm_password: string;
}

export interface Conversation {
  id: number;
  name: string;
  user: User;
  open: boolean;
  created_at: string;
  closed_at?: string;
}

export interface NewConversation {
  name: string;
}

export interface Message {
  id: number;
  sender: User;
  content: string;
  created_at: string;
  conversation: number;
}
export interface NewMessage {
  content: string;
  conversation: number;
}
export interface CacheEntry<T> {
  data: T;
  expiry: number;
}
