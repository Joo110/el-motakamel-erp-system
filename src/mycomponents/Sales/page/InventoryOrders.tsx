// src/mycomponents/Inventory/InventoryOrders.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useSaleOrdersList } from '../../Sales/hooks/useSaleOrders';
import { useCustomers } from '../../Sales/hooks/useCustomers';
import { useInventories } from '../../inventory/hooks/useInventories';
import axiosClient from '@/lib/axiosClient';

type TabType = 'draft' | 'approved' | 'delivered';

const InventoryOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('draft');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // sale orders hook (autoFetch = false so we control fetch by tab)
  const { items, loading, error, fetch } = useSaleOrdersList(undefined, false);

  // customers & inventories hooks
  const { customers, fetchCustomers } = useCustomers(true) as any;
  const { inventories } = useInventories() as any;

  // local cache for createdBy => name
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  // fetch orders on tab change
  useEffect(() => {
    void (async () => {
      try {
        await fetch(activeTab);
      } catch (err) {
        // fetch handles error state inside hook
        console.error('Failed to fetch sale orders for', activeTab, err);
      }
    })();
  }, [activeTab, fetch]);

  // ensure customers loaded (if hook didn't auto fetch)
  useEffect(() => {
    // fetchCustomers may be undefined depending on your hook signature, guard it
    if (typeof fetchCustomers === 'function') void fetchCustomers();
  }, [fetchCustomers]);

  // helper: fetch user name (createdBy) and cache it
  const fetchUserName = async (userId?: string) => {
    if (!userId) return;
    if (userNames[userId]) return; // cached
    try {
      const res = await axiosClient.get<any>(`/users/${userId}`);
      const payload = res?.data ?? res;
      // best-effort unwrap common shapes:
      const name =
        payload?.data?.user?.fullname ||
        payload?.data?.user?.name ||
        payload?.data?.user?.username ||
        payload?.data?.name ||
        payload?.name ||
        (typeof payload === 'string' ? payload : undefined);

      setUserNames((prev) => ({ ...prev, [userId]: name ?? userId }));
    } catch (err) {
      // fallback: store id so we at least don't re-request repeatedly
      setUserNames((prev) => ({ ...prev, [userId]: userId }));
      console.debug('Failed to fetch user name for', userId, err);
    }
  };

  // whenever items change, prefetch createdBy names
  useEffect(() => {
    if (!items || items.length === 0) return;
    items.forEach((it) => {
      if (it.createdBy && !userNames[it.createdBy]) void fetchUserName(it.createdBy);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // pagination + derived data
  const data = items ?? [];
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const paginatedData = useMemo(
    () => data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [data, currentPage, itemsPerPage]
  );

  // map order -> row values (keep UI same)
  const rowFor = (order: any) => {
    const orderNumber = order.invoiceNumber || order._id || '-';
    const customer =
      customers?.find((c: any) => c._id === order.customerId)?.name ||
      order.customerId ||
      '-';

    // choose first product's inventory name if exists
    let inventory = '-';
    if (Array.isArray(order.products) && order.products.length > 0) {
      const invId = order.products[0].inventoryId;
      const invObj = inventories?.find((i: any) => i._id === invId || i.id === invId);
      inventory = invObj?.name || invId || '-';
    }

    const totalPrice = (order.totalAmount ?? order.total ?? 0).toString();
    const createdByName = userNames[order.createdBy] ?? order.createdBy ?? '-';
    const orderTime = order.createdAt
      ? new Date(order.createdAt).toLocaleString()
      : order.orderTime ?? '-';

    const action =
      activeTab === 'draft' ? 'Approve' : activeTab === 'approved' ? 'Delivered' : 'Invoice';

    return { orderNumber, customer, inventory, totalPrice, createdByName, orderTime, action };
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Inventory Management</h1>
        <div className="text-sm text-gray-500">Dashboard {'>'} Inventory {'>'} Precious</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setActiveTab('draft');
            setCurrentPage(1);
          }}
          className={`px-6 py-2 rounded-full transition-colors ${
            activeTab === 'draft' ? 'bg-slate-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Draft
        </button>
        <button
          onClick={() => {
            setActiveTab('approved');
            setCurrentPage(1);
          }}
          className={`px-6 py-2 rounded-full transition-colors ${
            activeTab === 'approved' ? 'bg-slate-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => {
            setActiveTab('delivered');
            setCurrentPage(1);
          }}
          className={`px-6 py-2 rounded-full transition-colors ${
            activeTab === 'delivered' ? 'bg-slate-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Delivered
        </button>
      </div>

      {/* Info Text */}
      <div className="text-right text-sm text-gray-500 mb-4">
        Showing {data.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
        {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} products
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3 font-medium">Order number</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Inventory</th>
                <th className="pb-3 font-medium">Total Price</th>
                <th className="pb-3 font-medium">Created by</th>
                <th className="pb-3 font-medium">Order Time</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => {
                const row = rowFor(item);
                return (
                  <tr key={item._id ?? index} className="border-b last:border-0">
                    <td className="py-4 text-sm">{row.orderNumber}</td>
                    <td className="py-4 text-sm">{row.customer}</td>
                    <td className="py-4 text-sm text-blue-600">{row.inventory}</td>
                    <td className="py-4 text-sm">{row.totalPrice}</td>
                    <td className="py-4 text-sm">{row.createdByName}</td>
                    <td className="py-4 text-sm">{row.orderTime}</td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <button className="px-4 py-1.5 text-sm text-white bg-slate-700 rounded-full hover:bg-slate-800 transition-colors">
                          {row.action}
                        </button>
                        <button className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                          view
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    {loading ? 'Loading...' : error ? `Failed to load: ${error.message}` : 'No orders found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(Math.max(1, Math.min(5, totalPages)))].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(Math.min(totalPages, i + 1))}
                className={`w-8 h-8 rounded-full ${
                  currentPage === i + 1 ? 'bg-slate-700 text-white' : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryOrders;