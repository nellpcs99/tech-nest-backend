import { Product } from './product.model';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  total: number;
  shipping_address: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  shipping_address: string;
}