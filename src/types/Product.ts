export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  units: number;
  price: number;
  tax: number;
  total: number;
 img?: (string | File)[];
}


// src/mytypes/product.ts
export type CreateProductDTO = {
  name: string;
  code?: string;
  price: number | string;
  tax: number | string;
  description?: string;
  category: string;
  unit?: number | string;
  img?: (string | File)[]; // قد تكون ملفات أو URLs/base64
};
