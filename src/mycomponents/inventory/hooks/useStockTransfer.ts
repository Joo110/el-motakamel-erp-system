import { useState } from "react";
import {
  createStockTransferService,
  type StockTransferRequest,
  type StockTransferResponse,
} from "../services/stockTransfer";


export const useStockTransfer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StockTransferResponse | null>(null);

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

  return { createStockTransfer, data, loading, error };
};