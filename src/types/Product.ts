export interface Product {
  _id?: string;
  name: string;
  code: string;
  price: number;
  tax: number;
  description: string;
  category: string;
  unit: number;
  img: (string | File)[]; // ✅ هنا أصبح يقبل string أو File
}
