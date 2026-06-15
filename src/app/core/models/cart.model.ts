import { Product } from './product.model';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
  total_items: number;
}