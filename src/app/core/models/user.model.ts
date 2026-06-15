export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  phone?: string;
  address?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  username: string;
  email: string;
  is_staff: boolean;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}