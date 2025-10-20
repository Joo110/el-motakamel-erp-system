import { useState, useEffect, useCallback } from "react";
import {
  getProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
  searchProductsService,
  type Product,
} from "../services/productService";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProductsService();
      console.log("✅ Raw response:", response);

      const productsArray = response?.data?.products || [];
      console.log("✅ Products array:", productsArray);
      setProducts(productsArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
      console.error("❌ fetchProducts error:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchProductsService(name);
      setProducts(Array.isArray(results) ? results : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search products");
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Product) => {
    setLoading(true);
    setError(null);
    try {
      const newProduct = await createProductService(product);
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, updatedData: Partial<Product>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateProductService(id, updatedData);
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? updated : p))
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteProductService(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProductById = useCallback(async (id: string) => {
  setLoading(true);
  setError(null);
  try {
    const p = await getProductByIdService(id);
    if (!Array.isArray(p.img)) p.img = [];
    return p;
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to fetch product");
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    searchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  };
};