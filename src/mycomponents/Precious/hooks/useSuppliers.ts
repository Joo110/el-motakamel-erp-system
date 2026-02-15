import { useCallback, useEffect, useState } from "react";
import type { Supplier } from "../services/suppliersService";
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getOrganizationSuppliers,
  addOrganizationToSupplier,
} from "../services/suppliersService";


function normalizeSuppliers(raw: any): Supplier[] {
  let arr: any[] = [];

  if (!raw) return [];

  if (raw.data && Array.isArray(raw.data)) {
    arr = raw.data;
  }
  else if (raw.data?.data && Array.isArray(raw.data.data)) {
    arr = raw.data.data;
  }
  // fallback
  else if (Array.isArray(raw)) {
    arr = raw;
  }
  else if (raw.data?.docs && Array.isArray(raw.data.docs)) {
    arr = raw.data.docs;
  }
  else {
    return [];
  }

  return arr.map((s) => ({
    ...s,
    _id: s._id ?? s.id,
  }));
}


export function useSuppliers(initialFetch = true) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Fetch All Suppliers ---------------- */
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSuppliers();
      const normalized = normalizeSuppliers(res);
      setSuppliers(normalized);
      return normalized;
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to load suppliers");
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
      // normalize single supplier if it's wrapped
      const normalizedArr = normalizeSuppliers(supplier ?? []);
      // return single object if available
      return (Array.isArray(normalizedArr) && normalizedArr[0]) || (supplier as any) || null;
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to fetch supplier");
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
      const newSupplierRes = await createSupplier(supplierData);
      // normalize created supplier (service might return { data: {...} } or the object)
      const normalized = normalizeSuppliers(newSupplierRes);
      const newSupplier = normalized[0] ?? (newSupplierRes as Supplier);
      setSuppliers((prev) => [...prev, newSupplier as Supplier]);
      return newSupplier;
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to create supplier");
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
      const updatedRes = await updateSupplier(id, supplierData);
      const normalized = normalizeSuppliers(updatedRes);
      const updatedSupplier = normalized[0] ?? (updatedRes as Supplier);
      setSuppliers((prev) =>
        prev.map((supplier) =>
          (supplier as any)._id === id || (supplier as any).id === id ? (updatedSupplier as Supplier) : supplier
        )
      );
      return updatedSupplier;
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to update supplier");
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
      const result = await deleteSupplier(id);
      // remove from local state by matching either _id or id
      setSuppliers((prev) => prev.filter((supplier) => (supplier as any)._id !== id && (supplier as any).id !== id));
      return result;
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to delete supplier");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- Organization Operations ---------------- */
  const fetchOrganizationSuppliersHandler = useCallback(async (organizationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrganizationSuppliers(organizationId);
      // normalize if needed
      return normalizeSuppliers(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to fetch organization suppliers");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addOrgToSupplierHandler = useCallback(async (supplierId: string, organizationId: string) => {
    setLoading(true);
    setError(null);
    try {
      await addOrganizationToSupplier(supplierId, organizationId);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to add organization to supplier");
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
    fetchOrganizationSuppliers: fetchOrganizationSuppliersHandler,
    addOrganizationToSupplier: addOrgToSupplierHandler,
    setSuppliers,
  } as const;
}
