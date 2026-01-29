// src/mycomponents/stockTransfer/hooks/useStockTransfer.ts
import { useState } from "react";
import {
  createStockTransferService,
  getStockTransferByRefService,
  getTransfersByStatusService,
  markStockTransferAsShippingService,
  markStockTransferAsDeliveredService,
  getAllStockTransfersService,
  updateStockTransferShippingCostService,
  getTransferDocumentService,
} from "../services/stockTransfer";
import type { StockTransferRequest } from "../services/stockTransfer";

export const useStockTransfer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const createStockTransfer = async (payload: StockTransferRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createStockTransferService(payload);
      setData(res);
      return res;
    } catch (err: any) {
      console.error("Stock transfer create error:", err);
      setError(err?.response?.data?.message ?? err.message ?? "Failed to create stock transfer");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateShippingCost = async (id: string, shippingCost: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateStockTransferShippingCostService(id, shippingCost);
      setData(res);
      return res;
    } catch (err: any) {
      console.error("Update shipping cost error:", err);
      setError(err?.response?.data?.message ?? "Failed to update shipping cost");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStockTransferByRef = async (ref: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStockTransferByRefService(ref);
      setData(res);
      return res;
    } catch (err: any) {
      console.error("Get stock transfer error:", err);
      setError(err?.response?.data?.message ?? "Failed to fetch stock transfer");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTransfersByStatus = async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTransfersByStatusService(status);
      setData(res);
      return res;
    } catch (err: any) {
      console.error("Get transfers by status error:", err);
      setError(err?.response?.data?.message ?? "Failed to fetch transfers");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAsShipping = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await markStockTransferAsShippingService(id);
      setData(res);
      return res;
    } catch (err: any) {
      console.error("Mark as shipping error:", err);
      setError(err?.response?.data?.message ?? "Failed to mark as shipping");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAsDelivered = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await markStockTransferAsDeliveredService(id);
      setData(res);
      return res;
    } catch (err: any) {
      console.error("Mark as delivered error:", err);
      setError(err?.response?.data?.message ?? "Failed to mark as delivered");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAllTransfers = async (params?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllStockTransfersService(params);
      setData(res);
      return res;
    } catch (err: any) {
      console.error("Get all transfers error:", err);
      setError(err?.response?.data?.message ?? "Failed to fetch transfers");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTransferDocument = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTransferDocumentService(id);
      setData(res);
      return res;
    } catch (err: any) {
      console.error("Get transfer document error:", err);
      setError(err?.response?.data?.message ?? "Failed to fetch transfer document");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDeliveredTransferById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStockTransferByRefService(id);
      setData(res);
      return res;
    } catch (err: any) {
      console.error("Get delivered transfer error:", err);
      setError(err?.response?.data?.message ?? "Failed to fetch delivered transfer");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createStockTransfer,
    updateShippingCost,
    getStockTransferByRef,
    getTransfersByStatus,
    markAsShipping,
    markAsDelivered,
    getAllTransfers,
    getTransferDocument,
    getDeliveredTransferById,
    data,
    loading,
    error,
  } as const;
};
