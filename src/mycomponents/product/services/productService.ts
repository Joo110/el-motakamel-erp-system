import axiosClient from "@/lib/axiosClient";

/* =========================
   Product Interface
========================= */
export interface Product {
  _id?: string;
  id?: string;

  name: string;
  code: string;

  retailPrice?: number;
  wholesalePrice?: number;

  tax: number;
  description?: string;

  category: string | {
    _id: string;
    category: string;
  };

  unit: number;
  img?: string[];

  createdAt?: string;
  updatedAt?: string;
}

/* =========================
   Get all products
========================= */
export const getProductsService = async (): Promise<Product[]> => {
  const res = await axiosClient.get("/products");

  const data = res.data?.data;

  if (Array.isArray(data)) {
    return data.map((p: any) => ({
      ...p,
      _id: p._id || p.id,
    }));
  }

  if (Array.isArray(data?.products)) {
    return data.products.map((p: any) => ({
      ...p,
      _id: p._id || p.id,
    }));
  }

  return [];
};

/* =========================
   Get product by ID
========================= */
export const getProductByIdService = async (id: string): Promise<Product> => {
  const res = await axiosClient.get(`/products/${id}`);

  const product =
    res.data?.data?.product ??
    res.data?.data;

  return {
    ...product,
    _id: product._id || product.id,
  };
};

/* =========================
   Create product (FormData)
========================= */
export const createProductService = async (
  formData: FormData
): Promise<Product> => {
  const res = await axiosClient.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const created = res.data.data;

  return {
    ...created,
    _id: created._id || created.id,
  };
};

/* =========================
   Update product (FormData)
========================= */

export const updateProductService = async (
  id: string,
  payload: any | FormData
): Promise<Product> => {
  let config = {};
  const body: any = payload;

  if (payload instanceof FormData) {
    config = { headers: { "Content-Type": "multipart/form-data" } };
  }

  const res = await axiosClient.patch(`/products/${id}`, body, config);

  // 🔹 تحقق من وجود product
  const updated = res.data?.data?.product;
  if (!updated) {
    throw new Error("Update failed: product not returned from server");
  }

  return { ...updated, _id: updated._id || updated.id };
};


/* =========================
   Delete product
========================= */
export const deleteProductService = async (
  id: string
): Promise<void> => {
  await axiosClient.delete(`/products/${id}`);
};
