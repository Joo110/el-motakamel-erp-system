// src/mycomponents/Precious/page/PreciousManagement.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  approvePurchaseOrder,
  deliverPurchaseOrder,
} from "../../Precious/services/purchaseOrders";
import { usePurchaseOrdersList } from "../../Precious/hooks/useCreatePurchaseOrder";
import { useSuppliers } from "../../Precious/hooks/useSuppliers";
import { useUsers } from "../../user/hooks/useUsers";
import { toast } from 'react-hot-toast';

type TabType = "draft" | "approved" | "delivered";

const PreciousManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>("draft");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  const { items, loading, error, fetch } = usePurchaseOrdersList(activeTab);
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { users, loading: usersLoading } = useUsers();

  const suppliersMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of suppliers) {
      m.set(s._id, s.name ?? s._id);
    }
    return m;
  }, [suppliers]);

  const usersMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of users) {
      const name = u.name ?? (u.fullname || u.email) ?? u._id;
      m.set(u._id, name);
    }
    return m;
  }, [users]);

  useEffect(() => {
    setCurrentPage(1);
    void fetch(activeTab);
  }, [activeTab, fetch]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedData = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSupplierName = (supplierId?: string | null) => {
    if (!supplierId) return "-";
    const name = suppliersMap.get(supplierId);
    if (name) return name;
    if (suppliersLoading) return "Loading supplier...";
    return supplierId;
  };

  const getCreatedByName = (userId?: string | null) => {
    if (!userId) return "-";
    const name = usersMap.get(userId);
    if (name) return name;
    if (usersLoading) return "Loading user...";
    return userId;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Purchase Orders Management
        </h1>
        <div className="text-sm text-gray-500">
          Dashboard {'>'} Purchase Orders
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {(["draft", "approved", "delivered"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full transition-colors ${
              activeTab === tab
                ? "bg-slate-700 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="text-right text-sm text-gray-500 mb-4">
        Showing {items.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
        {Math.min(currentPage * itemsPerPage, items.length)} of {items.length}{" "}
        orders
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {loading && <div className="text-center py-6">Loading...</div>}
        {error && (
          <div className="text-center text-red-600 py-6">
            Failed to load orders: {error.message}
          </div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Invoice Number</th>
                  <th className="pb-3 font-medium">Supplier</th>
                  <th className="pb-3 font-medium">Currency</th>
                  <th className="pb-3 font-medium">Total Amount</th>
                  <th className="pb-3 font-medium">Created By</th>
                  <th className="pb-3 font-medium">Created At</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((order) => (
                  <tr key={order._id} className="border-b last:border-0">
                    <td className="py-4 text-sm">
                      {order.invoiceNumber || "-"}
                    </td>
                    <td className="py-4 text-sm">
                      {getSupplierName(order.supplierId)}
                    </td>
                    <td className="py-4 text-sm">{order.currency || "EGP"}</td>
                    <td className="py-4 text-sm">
                      {order.totalAmount?.toLocaleString() || "0"}
                    </td>
                    <td className="py-4 text-sm">
                      {getCreatedByName(order.createdBy)}
                    </td>
                    <td className="py-4 text-sm">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-GB")
                        : "-"}
                    </td>

                    <td className="py-4">
                      <div className="flex gap-2">
                        {/* Approve / Deliver / Invoice */}
                        <button
                          className="px-4 py-1.5 text-sm text-white bg-slate-700 rounded-full hover:bg-slate-800 transition-colors"
                          onClick={async () => {
                            try {
                              if (activeTab === "draft") {
                                await approvePurchaseOrder(order._id);
                                toast("✅ Order approved successfully!");
                                void fetch(activeTab);
                              } else if (activeTab === "approved") {
                                await deliverPurchaseOrder(order._id);
                                toast("🚚 Order delivered successfully!");
                                void fetch(activeTab);
                              } else {
                                navigate(`/dashboard/stock-in-draft/${order._id}`, {
                                  state: { status: "invoice" },
                                });
                              }
                            } catch (err: any) {
                              console.error(err);
                              alert(`❌ Failed: ${err.message}`);
                            }
                          }}
                        >
                          {activeTab === "draft"
                            ? "Approve"
                            : activeTab === "approved"
                            ? "Deliver"
                            : "Invoice"}
                        </button>

                      
    {/* View */}
    <button
      className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
      onClick={() => {
        console.log("👁️ Viewing Order ID:", order._id);
        console.log("📦 Status:", activeTab);
        navigate(`/dashboard/stock-in-draft/${order._id}`, {
          state: { status: activeTab },
        });
      }}
    >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-6 text-gray-500"
                    >
                      No orders found for this status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 0 && (
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
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page + 1)}
                  className={`w-8 h-8 rounded-full ${
                    currentPage === page + 1
                      ? "bg-slate-700 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreciousManagement;
