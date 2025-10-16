export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  code: string;
  units: number;
  price: number;
  tax: number;
  total: number;
  image?: string;
}
