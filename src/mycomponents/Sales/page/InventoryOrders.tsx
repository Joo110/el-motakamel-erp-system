// src/mycomponents/inventory/page/InventoryOrders.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// hooks
import { useSaleOrders } from '../../Sales/hooks/useSaleOrders';
import { useCustomers } from '../../Sales/hooks/useCustomers';
import { useInventories } from '../../inventory/hooks/useInventories';
import { useUsers } from '../../user/hooks/useUsers';

type TabType = 'draft' | 'approved' | 'delivered';

const InventoryOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('draft');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const navigate = useNavigate();

  const { items, loading, error, fetch, approve, markDelivered } = useSaleOrders(undefined, false);
  const { customers, fetchCustomers } = useCustomers(true) as any;
  const { inventories } = useInventories() as any;
  const { users, loading: usersLoading } = useUsers();

  const usersMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of users) {
      const name = u.name ?? u.fullname ?? u.email ?? u._id;
      m.set(u._id, name);
    }
    return m;
  }, [users]);

  useEffect(() => {
    void (async () => {
      try {
        console.log('📦 Fetching sale orders for tab:', activeTab);
        await fetch(activeTab);
      } catch (err) {
        console.error('❌ Failed to fetch orders for', activeTab, err);
      }
    })();
  }, [activeTab, fetch]);

  useEffect(() => {
    if (typeof fetchCustomers === 'function') void fetchCustomers();
  }, [fetchCustomers]);

  const data = items ?? [];
  const paginatedData = useMemo(
    () => data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [data, currentPage, itemsPerPage]
  );

  // ✅ enhanced: better logging for approve/deliver/invoice
  const handleActionClick = async (orderId: string) => {
    console.log('🟡 handleActionClick triggered', { orderId, activeTab });
    try {
      if (activeTab === 'draft') {
        console.log('🟢 Approving order:', orderId);
        if (!approve) throw new Error('Approve function not available');
        const result = await approve(orderId);
        console.log('✅ Approve API response:', result);
        toast.success('✅ Order approved successfully!');
        await fetch(activeTab);
      } else if (activeTab === 'approved') {
        console.log('🟣 Marking as delivered:', orderId);
        if (!markDelivered) throw new Error('markDelivered function not available');
        const result = await markDelivered(orderId);
        console.log('✅ Deliver API response:', result);
        toast.success('🚚 Order marked as delivered!');
        await fetch(activeTab);
      } else {
        console.log('🧾 Navigating to invoice screen for:', orderId);
        navigate(`/dashboard/stock-out-draft/${orderId}`, { state: { status: 'invoice' } });
      }
    } catch (err: any) {
      console.error('❌ Action failed:', err);
      toast.error('❌ Failed: ' + (err?.message || String(err)));
    }
  };

  const rowFor = (order: any) => {
    const orderNumber = order.invoiceNumber || order._id || '-';
    const customer =
      customers?.find((c: any) => c._id === order.customerId)?.name ||
      order.customerId ||
      '-';

    let inventory = '-';
    if (Array.isArray(order.products) && order.products.length > 0) {
      const invId = order.products[0].inventoryId;
      const invObj = inventories?.find((i: any) => i._id === invId || i.id === invId);
      inventory = invObj?.name || invId || '-';
    }

    const totalPrice = (order.totalAmount ?? order.total ?? 0).toString();
    const createdByName =
      usersMap.get(order.createdBy) ||
      (usersLoading ? 'Loading user...' : order.createdBy || '-');
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
        <div className="text-sm text-gray-500">Dashboard {'>'} Inventory {'>'} Sales Order</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {(['draft', 'approved', 'delivered'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              console.log('🔁 Switched tab to:', tab);
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`px-6 py-2 rounded-full transition-colors ${
              activeTab === tab
                ? 'bg-slate-700 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="text-right text-sm text-gray-500 mb-4">
        Showing {data.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
        {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} orders
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
    <button
      className="px-4 py-1.5 text-sm text-white bg-slate-700 rounded-full hover:bg-slate-800 transition-colors"
      onClick={() => handleActionClick(item._id)}
    >
      {row.action}
    </button>
    <button
      className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
      onClick={() => {
        console.log('👁️ Viewing Order ID:', item._id);
        navigate(`/dashboard/stock-out-draft/${item._id}`, {
          state: { status: activeTab },
        });
      }}
    >
      View
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
      </div>
    </div>
  );
};

export default InventoryOrders;
