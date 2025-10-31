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


// productService.ts
export const createProductService = async (product: any) => {
  try {
    console.log("📤 Sending payload:", product);

    // إذا المنتج FormData أرسله كما هو مع header المناسب
    if (product instanceof FormData) {
      const res = await axiosClient.post("/products", product, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data?.product;
    }

    // تأكد من تحويل الأنواع الرقمية
    const normalized = {
      ...product,
      price: product.price !== undefined ? parseFloat(product.price) : product.price,
      tax: product.tax !== undefined ? parseFloat(product.tax) : product.tax,
      unit: product.unit !== undefined ? (typeof product.unit === "string" ? parseInt(product.unit, 10) : product.unit) : product.unit,
      // لا تُرسل placeholders في img — تأكد أنها إما [] أو array of strings (URLs/base64)
      img: Array.isArray(product.img) ? product.img.filter(Boolean) : [],
    };

    const res = await axiosClient.post("/products", normalized);
    return res.data?.data?.product;
  } catch (err: any) {
    // طبع أقصى معلومات من الخطأ
    console.error("❌ createProductService error:", err);
    if (err?.response) {
      console.error("❌ server response data:", err.response.data);
      console.error("❌ server response status:", err.response.status);
    }
    throw err;
  }
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