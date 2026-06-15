import { Category } from './category.model';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  old_price: number | null;
  stock: number;
  category: Category;
  brand: string;
  image: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_on_sale: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  ordering?: string;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
}