// src/mycomponents/Sales/CustomerDetails.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCustomers } from '../../Sales/hooks/useCustomers';
import { useSaleOrders } from '../../Sales/hooks/useSaleOrders';
import { useInventories } from '../../inventory/hooks/useInventories';
import { useUsers } from '../../user/hooks/useUsers';
import { useTranslation } from 'react-i18next';

const CustomerDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { getCustomer } = useCustomers(false);
  const { items: orders, fetch: fetchOrders } = useSaleOrders(undefined, false);
  const { inventories, refetch: refetchInventories } = useInventories();
  const { users, refetch: refetchUsers } = useUsers();

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

useEffect(() => {
  if (!id) {
    console.error('Customer ID is undefined!');
    return; // ✅ أهم حاجة - اوقف لو مفيش ID
  }
  
  setLoading(true);
  void (async () => {
    try {
      const c = await getCustomer(id); // دلوقتي id موجود مضمون
      setCustomer(c);
      await Promise.all([fetchOrders(), refetchInventories(), refetchUsers()]);
    } catch (err) {
      console.error('Failed to load customer or related data', err);
    } finally {
      setLoading(false);
    }
  })();
}, [id, getCustomer, fetchOrders, refetchInventories, refetchUsers]); // ✅ ضيف الـ dependencies

  const customerOrders = useMemo(() => {
    if (!orders || !id) return [];
    return orders.filter((o) => o.customerId === id);
  }, [orders, id]);

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
    return user?.name || user?.fullname || userId;
  };

  const getPaginationPages = (current: number, total: number, maxVisible = 5) => {
    const pages: number[] = [];
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, current + half);
    if (end - start + 1 < maxVisible) {
      if (start === 1) end = Math.min(total, start + maxVisible - 1);
      else if (end === total) start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (loading) return <p className="p-6">{t('loading_customer_details', 'Loading customer details...')}</p>;
  if (!customer) return <p className="p-6 text-gray-500">{t('customer_not_found', 'Customer not found.')}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('sales_management', 'Sales Management')}</h1>
            <p className="text-sm text-gray-500">{t('dashboard')} &gt; {t('customer')} &gt; {t('details')}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{customer.name}</h2>
                <div className="text-sm sm:text-right">
                  <p className="text-gray-500">{t('id_label', 'Id:')}</p>
                  <p className="font-semibold text-gray-900 break-all">{customer._id}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 sm:w-32">{t('location', 'Location:')}</span>
                  <span className="text-gray-600">{customer.address ?? '-'}</span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 sm:w-32">{t('phone', 'Phone:')}</span>
                  <span className="text-gray-600 break-all">{customer.phone ?? '-'}</span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 sm:w-32">{t('email', 'Email:')}</span>
                  <span className="text-gray-600 break-all">{customer.email ?? '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">{t('orders', 'Orders')}</h2>
              <p className="text-sm text-gray-500">
                {t('showing', 'Showing')} {startEntry}-{endEntry} {t('of', 'of')} {totalOrders} {t('orders', 'Orders')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm sm:text-base">
                <thead>
                  <tr className="border-b">
                    {[
                      t('order_number', 'Order number'),
                      t('inventory', 'Inventory'),
                      t('total_price', 'Total Price'),
                      t('created_by', 'Created by'),
                      t('order_time', 'Order Time'),
                      t('status', 'Status')
                    ].map((h) => (
                      <th key={h} className="text-left py-3 px-4 font-medium text-gray-700 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order: any, idx: number) => (
                    <tr key={order._id ?? idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{order.invoiceNumber ?? order._id}</td>
                      <td className="py-3 px-4 text-blue-600 underline cursor-pointer hover:text-blue-800 whitespace-nowrap">
                        {getInventoryName(order.products?.[0]?.inventoryId)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{order.totalAmount ?? '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{getUserName(order.createdBy)}</td>
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{order.status ?? '-'}</td>
                    </tr>
                  ))}
                  {paginatedOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-500">
                        {t('no_orders_found_for_customer', 'No orders found for this customer.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{t('show', 'Show')}</span>
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
                <span className="text-sm text-gray-600">{t('entries', 'entries')}</span>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                <button
                  className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600 disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  {t('previous', 'Previous')}
                </button>

                {getPaginationPages(currentPage, totalPages).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      currentPage === p
                        ? 'bg-gray-800 text-white'
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600 disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('next', 'Next')}
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