import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useStockTransfer } from '../hooks/useStockTransfer';
import axiosClient from "@/lib/axiosClient";
import { useTranslation } from "react-i18next";

type StatusType = "draft" | "shipping" | "delivered";

const TransferManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StatusType>('draft');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const {
    getTransfersByStatus,
    markAsShipping,
    markAsDelivered,
    loading,
    error
  } = useStockTransfer();

  const [transfersData, setTransfersData] = useState<any[]>([]);
  const [inventoryNames, setInventoryNames] = useState<Record<string, string>>({});

  const fetchInventoryName = async (inventoryId: string) => {
    if (!inventoryId || inventoryNames[inventoryId]) return;

    try {
      const { data } = await axiosClient.get(`/inventories/${inventoryId}`);

      const name =
        data?.data?.inventory?.name ||
        data?.name || 
        inventoryId;

      setInventoryNames((prev) => ({
        ...prev,
        [inventoryId]: name,
      }));
    } catch (err) {
      console.error("❌ Error fetching inventory name:", err);
      // fallback
      setInventoryNames((prev) => ({
        ...prev,
        [inventoryId]: inventoryId,
      }));
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const findTransfersArray = (result: any): any[] => {
    if (!result) return [];

    if (Array.isArray(result)) return result;

    const root = { ...(result?.data ? result.data : result), ...(result || {}) };

    const candidates = [
      result?.data,
      result?.data?.allTransfers,
      result?.data?.allDelivered,
      result?.data?.allShipped,
      result?.data?.allShipping,
      result?.data?.stockTransfers,
      result?.data?.stockTransfer,
      result?.stockTransfers,
      result?.stockTransfer,
      result?.data?.result,
      result?.result,
      root,
    ];

    for (const cand of candidates) {
      if (!cand) continue;
      if (Array.isArray(cand)) return cand;
      if (typeof cand === 'object') {
        const preferKeys = ['allShipped','allShipping','allDelivered','allTransfers','stockTransfers','stockTransfer','result','data'];
        for (const k of preferKeys) {
          if (Array.isArray((cand as any)[k])) return (cand as any)[k];
        }
        for (const key of Object.keys(cand)) {
          const val = (cand as any)[key];
          if (Array.isArray(val) && val.length > 0) {
            const first = val[0];
            if (first && (first._id || first.reference || first.status || first.from)) {
              return val;
            }
          }
        }
      }
    }

    return [];
  };

  const fetchData = async () => {
    try {
     const result = await getTransfersByStatus(activeTab);


      console.log('📦 API Response:', result);

      const transfers: any[] = findTransfersArray(result);

      console.log('🔍 raw extracted transfers:', transfers);

      const normalized = transfers.map((t: any) => ({
        ...t,
        status: (t?.status ?? '').toString().toLowerCase()
      }));

      const filtered = normalized.filter((t: any) => {
        if (t.status) return t.status === activeTab;
        return activeTab === 'draft';
      });

      console.log("✅ Extracted transfers (normalized):", normalized);
      console.log("🔎 Transfers after filtering by activeTab:", filtered);

      setTransfersData(filtered);

      filtered.forEach((transfer: any) => {
        const fromId = extractInventoryId(transfer.from);
        const toId = extractInventoryId(transfer.to);
        
        if (fromId) fetchInventoryName(fromId);
        if (toId) fetchInventoryName(toId);
      });

    } catch (err) {
      console.error('❌ Error fetching transfers:', err);
      toast.error(t("failed_load_transfer"));
      setTransfersData([]);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await markAsShipping(id);
      toast.success(t("order_approved_successfully"));
      fetchData();
    } catch {
      // nothing
    }
  };

  const handleDeliver = async (id: string) => {
    try {
      await markAsDelivered(id);
      toast.success(t("order_delivered_successfully"));
      fetchData();
    } catch (err) {
      console.error("❌ Failed to mark delivered:", err);
      toast.error(t("failed"));
    }
  };

  const handleView = (id: string, status: string) => {
    navigate(`/dashboard/transfer-draft/${id}`, {
      state: { status }
    });
  };

  const getTotalUnits = (products: any[]) => {
    if (!products || products.length === 0) return '0';
    return products.reduce((sum, p) => sum + (p.unit ?? p.quantity ?? 0), 0).toString();
  };

  // Helper function to extract inventory ID from various formats
  const extractInventoryId = (inventory: any): string | null => {
    if (!inventory) return null;
    
    // If it's already a string (ID)
    if (typeof inventory === 'string') return inventory;
    
    // If it's an object with _id
    if (typeof inventory === 'object' && inventory._id) return inventory._id;
    
    // If it's an object with id
    if (typeof inventory === 'object' && inventory.id) return inventory.id;
    
    return null;
  };

  // Helper function to get inventory name safely
  const getInventoryName = (inventory: any): string => {
    if (!inventory) return '-';
    
    // If inventory is an object with name property
    if (typeof inventory === 'object') {
      if (inventory.name) return inventory.name;
      if (inventory._id) {
        // Check if we have cached name for this ID
        return inventoryNames[inventory._id] || inventory._id;
      }
      if (inventory.id) {
        return inventoryNames[inventory.id] || inventory.id;
      }
    }
    
    // If inventory is a string (ID)
    if (typeof inventory === 'string') {
      return inventoryNames[inventory] || inventory;
    }
    
    return '-';
  };

  const safeTransfersData = Array.isArray(transfersData) ? transfersData : [];
  const totalPages = Math.ceil(safeTransfersData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = safeTransfersData.slice(startIndex, endIndex);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">{t("inventory_management")}</h1>
        <div className="text-xs sm:text-sm text-gray-500">
          {t("dashboard")} {'>'} {t("inventory_management")} {'>'} {t("transfer_management")}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
        <button
          onClick={() => {
            setActiveTab('draft');
            setCurrentPage(1);
          }}
          className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-full transition-colors ${
            activeTab === 'draft'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t("status_draft")}
        </button>
        <button
          onClick={() => {
            setActiveTab('shipping');
            setCurrentPage(1);
          }}
          className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-full transition-colors ${
            activeTab === 'shipping'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t("status_shipping")}
        </button>
        <button
          onClick={() => {
            setActiveTab('delivered');
            setCurrentPage(1);
          }}
          className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-full transition-colors ${
            activeTab === 'delivered'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t("status_delivered")}
        </button>
      </div>

      {/* Table - Desktop */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        {loading ? (
          <div className="text-center py-10 text-gray-500">{t("loading_transfer_data")}</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">❌ {error}</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="pb-3 font-medium">{t("reference_label")}</th>
                    <th className="pb-3 font-medium">{t("time_date")}</th>
                    <th className="pb-3 font-medium">{t("units_label")}</th>
                    <th className="pb-3 font-medium">{t("from_label")}</th>
                    <th className="pb-3 font-medium">{t("to_label")}</th>
                    <th className="pb-3 font-medium">{t("actions_col")}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">
                        {t("no_products_transferred")}
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item: any) => (
                      <tr key={item._id || item.id} className="border-b last:border-0">
                        <td className="py-4 text-sm">{item.reference || '-'}</td>
                        <td className="py-4 text-sm">
                          {item.createdAt 
                            ? new Date(item.createdAt).toLocaleDateString('en-GB')
                            : '-'
                          }
                        </td>
                        <td className="py-4 text-sm">{getTotalUnits(item.products)}</td>
                        <td className="py-4 text-sm">{getInventoryName(item.from)}</td>
                        <td className="py-4 text-sm">{getInventoryName(item.to)}</td>

                        <td className="py-4">
                          <div className="flex gap-2">
                            {activeTab === 'draft' && (
                              <button 
                                onClick={() => handleApprove(item._id || item.id)}
                                className="px-4 py-1.5 text-sm text-white bg-slate-700 rounded-full hover:bg-slate-800 transition-colors"
                              >
                                {t("approve")}
                              </button>
                            )}
                            
                            {activeTab === 'shipping' && (
                              <button 
                                onClick={() => handleDeliver(item._id || item.id)}
                                className="px-4 py-1.5 text-sm text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
                              >
                                {t("deliver")}
                              </button>
                            )}
                            
                            {activeTab === 'delivered' && (
                              <button 
                                onClick={() => handleView(item._id || item.id, activeTab)}
                                className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                              >
                                {t("invoice_btn")}
                              </button>
                            )}

                            {activeTab === 'delivered' && (
                              <button 
                                onClick={() => handleView(item._id || item.id, activeTab)}
                                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                {t("view_all")}
                              </button>
                            )}

                            {activeTab === 'shipping' && (
                              <button
                                onClick={() => {
                                  const id = item._id || item.id;
                                  console.log('🚚 Go to Shipping page for ID:', id);
                                  navigate(`/dashboard/Shipping/${id}`, {
                                    state: { orderId: id },
                                  });
                                }}
                                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                {t("shipping_cost")}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {currentData.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  {t("no_products_transferred")}
                </div>
              ) : (
                currentData.map((item: any) => (
                  <div key={item._id || item.id} className="bg-white border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-gray-500">{t("reference_label")}</div>
                        <div className="font-medium">{item.reference || '-'}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.createdAt 
                          ? new Date(item.createdAt).toLocaleDateString('en-GB')
                          : '-'
                        }
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">{t("units_label")}</div>
                        <div>{getTotalUnits(item.products)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">{t("from_label")}</div>
                        <div className="truncate">{getInventoryName(item.from)}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500">{t("to_label")}</div>
                        <div className="truncate">{getInventoryName(item.to)}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {activeTab === 'draft' && (
                        <button 
                          onClick={() => handleApprove(item._id || item.id)}
                          className="flex-1 px-4 py-2 text-sm text-white bg-slate-700 rounded-full hover:bg-slate-800 transition-colors"
                        >
                          {t("approve")}
                        </button>
                      )}
                      
                      {activeTab === 'shipping' && (
                        <>
                          <button 
                            onClick={() => handleDeliver(item._id || item.id)}
                            className="flex-1 px-4 py-2 text-sm text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
                          >
                            {t("deliver")}
                          </button>
                          <button
                            onClick={() => {
                              const id = item._id || item.id;
                              navigate(`/dashboard/Shipping/${id}`, {
                                state: { orderId: id },
                              });
                            }}
                            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                          >
                            {t("shipping_cost")}
                          </button>
                        </>
                      )}
                      
                      {activeTab === 'delivered' && (
                        <>
                          <button 
                            onClick={() => handleView(item._id || item.id, activeTab)}
                            className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                          >
                            {t("invoice_btn")}
                          </button>
                          <button 
                            onClick={() => handleView(item._id || item.id, activeTab)}
                            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                          >
                            {t("view_all")}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {safeTransfersData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 gap-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span>{t("show")}</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 sm:px-4 py-1.5 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-slate-700"
                  >
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                  </select>
                  <span>{t("entries")}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("previous")}
                  </button>
                  
                  {[...Array(Math.min(totalPages, 3))].map((_, idx) => {
                    const page = idx + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 text-xs sm:text-sm rounded-full ${
                          currentPage === page
                            ? 'bg-slate-700 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("next")}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransferManagement;