import { useState } from "react";
import {
  createStockTransferService,
  getStockTransferByRefService,
  getDraftStockTransfersService,
  markStockTransferAsShippingService,
  getShippedStockTransfersService,
  markStockTransferAsDeliveredService,
  getDeliveredStockTransfersService,
  getDeliveredStockTransferByIdService,
  type StockTransferRequest,
} from "../services/stockTransfer";

export const useStockTransfer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // 🔹 إنشاء تحويل جديد
  const createStockTransfer = async (payload: StockTransferRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createStockTransferService(payload);
      setData(res);
      return res;
    } catch (err: any) {
      console.error("Stock transfer error:", err);
      setError(err?.response?.data?.message || "Failed to create stock transfer");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 جلب تحويل بالمرجع
  const getStockTransferByRef = async (ref: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStockTransferByRefService(ref);
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch stock transfer");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 جلب التحويلات بالحالة "Draft"
  const getDraftTransfers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDraftStockTransfersService();
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch draft transfers");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 تحديث حالة التحويل إلى "Shipping"
  const markAsShipping = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await markStockTransferAsShippingService(id);
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to mark as shipping");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 جلب التحويلات بالحالة "Shipped"
  const getShippedTransfers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getShippedStockTransfersService();
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch shipped transfers");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 تحديث حالة التحويل إلى "Delivered"
  const markAsDelivered = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await markStockTransferAsDeliveredService(id);
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to mark as delivered");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 جلب التحويلات بالحالة "Delivered"
  const getDeliveredTransfers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDeliveredStockTransfersService();
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch delivered transfers");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 جلب تحويل "Delivered" محدد بالـ ID
  const getDeliveredTransferById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDeliveredStockTransferByIdService(id);
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch delivered transfer by ID");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createStockTransfer,
    getStockTransferByRef,
    getDraftTransfers,
    markAsShipping,
    getShippedTransfers,
    markAsDelivered,
    getDeliveredTransfers,
    getDeliveredTransferById,
    data,
    loading,
    error,
  };
};