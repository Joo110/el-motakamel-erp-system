import { useState, useEffect, useCallback } from "react";
import type { Product } from "../services/productService";
import {
  getProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
} from "../services/productService";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     Fetch all products
  ========================= */
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductsService();
      setProducts(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Get product by ID
  ========================= */
  const getProductById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getProductByIdService(id);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     Create product
  ========================= */
const addProduct = async (formData: FormData) => {
  setLoading(true);
  setError(null);

  try {
    const created = await createProductService(formData);

    setProducts(prev => [...prev, created]);

    return created;
  } catch (error: any) {
    setError(error);
    throw error;
  } finally {
    setLoading(false);
  }
};

  /* =========================
     Update product
  ========================= */
const updateProduct = async (id: string, payload: any | FormData) => {
  setLoading(true);
  setError(null);
  try {
    const updated = await updateProductService(id, payload);
    if (updated) {
      setProducts(prev => prev.map(p => (p._id === id ? updated : p)));
      return updated;
    } else {
      throw new Error("Update failed: No product returned");
    }
  } finally {
    setLoading(false);
  }
};

  /* =========================
     Delete product
  ========================= */
  const deleteProduct = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteProductService(id);
      setProducts(prev =>
        prev.filter(p => p._id !== id)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
  };
};
