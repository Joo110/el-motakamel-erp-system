import { useCallback, useEffect, useState } from "react";
import type { Supplier } from "../services/suppliersService";
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/suppliersService";

export function Suppliers(initialFetch = true) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Fetch All Suppliers ---------------- */
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSuppliers();
      setSuppliers(data);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to load suppliers";
      setError(msg);
      console.error("Fetch suppliers error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- Get Supplier by ID ---------------- */
  const fetchSupplierById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const supplier = await getSupplierById(id);
      return supplier;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to fetch supplier";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- Create Supplier ---------------- */
  const addSupplier = useCallback(async (supplierData: Supplier) => {
    setLoading(true);
    setError(null);
    try {
      const newSupplier = await createSupplier(supplierData);
      setSuppliers((prev) => [...prev, newSupplier]);
      return newSupplier;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create supplier";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- Update Supplier ---------------- */
  const editSupplier = useCallback(async (id: string, supplierData: Partial<Supplier>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedSupplier = await updateSupplier(id, supplierData);
      setSuppliers((prev) =>
        prev.map((supplier) => (supplier._id === id ? updatedSupplier : supplier))
      );
      return updatedSupplier;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update supplier";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- Delete Supplier ---------------- */
  const removeSupplier = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteSupplier(id);
      setSuppliers((prev) => prev.filter((supplier) => supplier._id !== id));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete supplier";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- Auto Fetch on Mount ---------------- */
  useEffect(() => {
    if (initialFetch) void fetchSuppliers();
  }, [fetchSuppliers, initialFetch]);

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    fetchSupplierById,
    addSupplier,
    editSupplier,
    removeSupplier,
    setSuppliers,
  } as const;
}