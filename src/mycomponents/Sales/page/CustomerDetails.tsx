// src/mycomponents/Sales/CustomerDetails.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCustomers } from '../../Sales/hooks/useCustomers';
import { useSaleOrders } from '../../Sales/hooks/useSaleOrders';
import { useInventories } from '../../inventory/hooks/useInventories';
import { useUsers } from '../../user/hooks/useUsers';

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCustomer } = useCustomers(false);
  const { items: orders, fetch: fetchOrders } = useSaleOrders(undefined, false);
  const { inventories, refetch: refetchInventories } = useInventories();
  const { users, refetch: refetchUsers } = useUsers();

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    void (async () => {
      try {
        const c = await getCustomer(id);
        setCustomer(c);
        await Promise.all([fetchOrders(), refetchInventories(), refetchUsers()]);
      } catch (err) {
        console.error('Failed to load customer or related data', err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const customerOrders = useMemo(() => {
    if (!orders || !id) return [];
    return orders.filter((o) => o.customerId === id);
  }, [orders, id]);

  // pagination calculations
  const totalOrders = customerOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / entriesPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startEntry = totalOrders === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalOrders);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return customerOrders.slice(start, start + entriesPerPage);
  }, [customerOrders, currentPage, entriesPerPage]);

  const getInventoryName = (invId?: string) => {
    if (!invId) return '-';
    return inventories?.find((inv: any) => inv._id === invId)?.name ?? invId;
  };

  const getUserName = (userId?: string) => {
    if (!userId) return '-';
    const user = users?.find((u: any) => u._id === userId);
    return user?.name || user?.fullname || user?.name || userId;
  };

  const getPaginationPages = (current: number, total: number, maxVisible = 5) => {
    const pages: number[] = [];
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, current + half);

    if (end - start + 1 < maxVisible) {
      if (start === 1) {
        end = Math.min(total, start + maxVisible - 1);
      } else if (end === total) {
        start = Math.max(1, end - maxVisible + 1);
      }
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (loading) return <p className="p-6">Loading supplier details...</p>;
  if (!customer) return <p className="p-6 text-gray-500">Customer not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
            <p className="text-sm text-gray-500">Dashboard &gt; Customer &gt; Details</p>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between">
            <div className="flex-1">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Id:</p>
                  <p className="font-semibold text-gray-900">{customer._id}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex">
                  <span className="font-semibold text-gray-700 w-32">Location:</span>
                  <span className="text-gray-600">{customer.address ?? '-'}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-gray-700 w-32">Phone:</span>
                  <span className="text-gray-600">{customer.phone ?? '-'}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-gray-700 w-32">Email:</span>
                  <span className="text-gray-600">{customer.email ?? '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
              <p className="text-sm text-gray-500">
                Showing {startEntry}-{endEntry} of {totalOrders} Orders
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Order number</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Inventory</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Total Price</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created by</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Order Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order: any, idx: number) => (
                    <tr key={order._id ?? idx} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-900">{order.invoiceNumber ?? order._id}</td>
                      <td className="py-4 px-4 text-blue-600 underline cursor-pointer hover:text-blue-800">
                        {getInventoryName(order.products?.[0]?.inventoryId)}
                      </td>
                      <td className="py-4 px-4 text-gray-600">{order.totalAmount ?? '-'}</td>
                      <td className="py-4 px-4 text-gray-600">{getUserName(order.createdBy)}</td>
                      <td className="py-4 px-4 text-gray-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
                      </td>
                      <td className="py-4 px-4 text-gray-600">{order.status ?? '-'}</td>
                      <td className="py-4 px-4">
                      </td>
                    </tr>
                  ))}
                  {paginatedOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-500">
                        No orders found for this customer.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  className="border border-gray-300 rounded-full px-2 py-1 text-sm"
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>

              <div className="flex gap-2">
                <button
                  className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                {getPaginationPages(currentPage, totalPages).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      currentPage === p ? 'bg-gray-800 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
