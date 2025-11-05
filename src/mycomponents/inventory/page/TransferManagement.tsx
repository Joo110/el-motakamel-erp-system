import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useStockTransfer } from '../hooks/useStockTransfer';
import axiosClient from "@/lib/axiosClient";

type StatusType = "draft" | "shipping" | "delivered";

const TransferManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StatusType>('draft');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const {
    getDraftTransfers,
    getShippedTransfers,
    getDeliveredTransfers,
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

      if (data?.status === "success" && data?.data?.inventory?.name) {
        setInventoryNames((prev) => ({
          ...prev,
          [inventoryId]: data.data.inventory.name,
        }));
      }
    } catch (err) {
      console.error("❌ Error fetching inventory name:", err);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // NEW: helper to locate transfers array inside the response
  const findTransfersArray = (result: any): any[] => {
    if (!result) return [];

    // 1) if the result itself is an array
    if (Array.isArray(result)) return result;

    // 2) sometimes API uses "statsu" typo - let's normalize root
    const root = { ...(result?.data ? result.data : result), ...(result || {}) };

    // 3) prefer common names if present
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

    // scan each candidate: if it's an array return it; if it's an object look for array valued props
    for (const cand of candidates) {
      if (!cand) continue;
      if (Array.isArray(cand)) return cand;
      if (typeof cand === 'object') {
        // prefer known property names
        const preferKeys = ['allShipped','allShipping','allDelivered','allTransfers','stockTransfers','stockTransfer','result','data'];
        for (const k of preferKeys) {
          if (Array.isArray((cand as any)[k])) return (cand as any)[k];
        }
        // otherwise take first array property that looks like transfers (has _id or reference or status)
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
      let result;
      
      if (activeTab === 'draft') {
        result = await getDraftTransfers();
      } else if (activeTab === 'shipping') {
        result = await getShippedTransfers();
      } else if (activeTab === 'delivered') {
        result = await getDeliveredTransfers();
      }

      console.log('📦 API Response:', result);

      const transfers: any[] = findTransfersArray(result);

      console.log('🔍 raw extracted transfers:', transfers);

      // normalize status and lowercase it
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

      // only fetch inventory names for visible transfers (to avoid extra requests)
      filtered.forEach((transfer: any) => {
        if (transfer.from) fetchInventoryName(transfer.from);
        if (transfer.to) fetchInventoryName(transfer.to);
      });

    } catch (err) {
      console.error('❌ Error fetching transfers:', err);
      toast.error('Failed to load transfers');
      setTransfersData([]);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await markAsShipping(id);
      toast.success('✅ Transfer marked as shipping');
      fetchData();
    } catch {
      // nothing
    }
  };

  const handleDeliver = async (id: string) => {
    try {
      await markAsDelivered(id);
      toast.success('✅ Transfer marked as delivered');
      fetchData();
    } catch (err) {
      console.error("❌ Failed to mark delivered:", err);
      toast.error('Failed to mark as delivered');
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

  const getInventoryName = (inventoryId: string) => {
    return inventoryNames[inventoryId] || inventoryId || '-';
  };

  const safeTransfersData = Array.isArray(transfersData) ? transfersData : [];
  const totalPages = Math.ceil(safeTransfersData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = safeTransfersData.slice(startIndex, endIndex);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Inventory Management</h1>
        <div className="text-sm text-gray-500">Dashboard {'>'} Inventory {'>'} Transfer Management</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setActiveTab('draft');
            setCurrentPage(1);
          }}
          className={`px-6 py-2 rounded-full transition-colors ${
            activeTab === 'draft'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Draft
        </button>
        <button
          onClick={() => {
            setActiveTab('shipping');
            setCurrentPage(1);
          }}
          className={`px-6 py-2 rounded-full transition-colors ${
            activeTab === 'shipping'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Shipping
        </button>
        <button
          onClick={() => {
            setActiveTab('delivered');
            setCurrentPage(1);
          }}
          className={`px-6 py-2 rounded-full transition-colors ${
            activeTab === 'delivered'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Delivered
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {loading ? (
          <div className="text-center py-10 text-gray-500">⏳ Loading transfers...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">❌ {error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="pb-3 font-medium">Transfer number</th>
                    <th className="pb-3 font-medium">Time</th>
                    <th className="pb-3 font-medium">Units</th>
                    <th className="pb-3 font-medium">From</th>
                    <th className="pb-3 font-medium">To</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">
                        No transfers found
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
                                Approve
                              </button>
                            )}
                            
                            {activeTab === 'shipping' && (
                              <button 
                                onClick={() => handleDeliver(item._id || item.id)}
                                className="px-4 py-1.5 text-sm text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
                              >
                                Mark Delivered
                              </button>
                            )}
                            
                            {activeTab === 'delivered' && (
                              <button 
                                 onClick={() => handleView(item._id || item.id, activeTab)}
                                className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                              >
                                Print
                              </button>
                            )}

                            {activeTab === 'delivered' && (
                              <button 
                                onClick={() => handleView(item._id || item.id, activeTab)}
                                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                View
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
                                Add shipping cost
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

            {/* Pagination */}
            {safeTransfersData.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2 text-sm">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-4 py-1.5 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-slate-700"
                  >
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                  </select>
                  <span>entries</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(totalPages, 3))].map((_, idx) => {
                    const page = idx + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-full ${
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
                    className="px-3 py-1.5 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
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
