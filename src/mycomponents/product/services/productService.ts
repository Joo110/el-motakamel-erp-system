import axiosClient from "@/lib/axiosClient";

// ✅ Type Definitions
export interface Product {
  _id?: string;
  name: string;
  code: string;
  price: number;
  tax: number;
  description: string;
  category: string;
  unit: number;
  img: (string | File)[];
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Response Types
export interface GetProductsResponse {
  status: string;
  results: number;
  data: {
    products: Product[];
  };
}

export interface SingleProductResponse {
  status: string;
  data: {
    product: Product;
  };
}

export interface ProductResponse<T = unknown> {
  status?: string;
  message?: string;
  data?: T;
}

// ✅ Services

// 1️⃣ Get all products - FIXED
export const getProductsService = async (): Promise<GetProductsResponse> => {
  const response = await axiosClient.get<GetProductsResponse>("/products");
  console.log("✅ getProductsService response:", response.data);
  return response.data;
};

// 2️⃣ Get specific product - FIXED
export const getProductByIdService = async (id: string): Promise<Product> => {
  const response = await axiosClient.get<SingleProductResponse>(`/products/${id}`);
  console.log("🔴 getProductByIdService called with ID:", id);
  console.trace("🔍 Call stack:"); // ✅
  return response.data.data.product;
};

export const createProductService = async (product: Product): Promise<Product> => {
  const payload = {
    name: product.name,
    code: product.code,
    price: product.price,
    tax: product.tax,
    description: product.description,
    category: product.category,
    unit: product.unit,
    img: product.img.map(i => (typeof i === "string" ? i : "daf")), // أي File يتحول لاسم افتراضي
  };

  console.log("📤 Sending payload:", payload);

  const response = await axiosClient.post<SingleProductResponse>("/products", payload);

  console.log("✅ createProductService response:", response.data);
  return response.data.data.product;
};



// 4️⃣ Update product
export const updateProductService = async (
  id: string,
  updatedData: Partial<Product>
): Promise<Product> => {
  const response = await axiosClient.patch<SingleProductResponse>(
    `/products/${id}`,
    updatedData
  );
  console.log("✅ updateProductService response:", response.data);
  return response.data.data.product;
};

// 5️⃣ Delete product
export const deleteProductService = async (id: string): Promise<string> => {
  const response = await axiosClient.delete<ProductResponse>(`/products/${id}`);
  console.log("✅ deleteProductService response:", response.data);
  return response.data.message || "Product deleted successfully";
};

// 6️⃣ Search products by name
export const searchProductsService = async (name: string): Promise<Product[]> => {
  const response = await axiosClient.get<GetProductsResponse>(
    `/products/search`,
    { params: { name } }
  );
  console.log("✅ searchProductsService response:", response.data);
  return response.data.data.products || [];
};