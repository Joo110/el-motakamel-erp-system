// src/mycomponents/inventory/page/InventoryOrders.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// hooks
import { useSaleOrders } from '../../Sales/hooks/useSaleOrders';
import { useCustomers } from '../../Sales/hooks/useCustomers';
import { useInventories } from '../../inventory/hooks/useInventories';
import { useUsers } from '../../user/hooks/useUsers';

// i18next
import { useTranslation } from 'react-i18next';

type TabType = 'draft' | 'approved' | 'shipped' | 'delivered';

/** Helper: safely convert various shapes to a display string */
function toDisplayString(v: any, fallback = '-') {
  if (v === null || v === undefined) return fallback;
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object') {
    if (typeof v.name === 'string') return v.name;
    if (typeof v.fullname === 'string') return v.fullname;
    if (typeof v.fullName === 'string') return v.fullName;
    if (typeof v.company === 'string') return v.company;
    if (typeof v.email === 'string') return v.email;
    if (typeof v.id === 'string') return v.id;
    if (typeof v._id === 'string') return v._id;
    try {
      const json = JSON.stringify(v);
      return json.length > 40 ? json.slice(0, 37) + '...' : json;
    } catch {
      return fallback;
    }
  }
  return String(v);
}

const InventoryOrders: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('draft');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const navigate = useNavigate();

  // useSaleOrders should provide approve, ship, deliver
  const { items, loading, error, fetch, approve, ship, deliver } = useSaleOrders(undefined, false);
  const { customers, fetchCustomers } = useCustomers(true) as any;
  const { inventories } = useInventories() as any;
  const { users, loading: usersLoading } = useUsers();

  // build users map to display creator name (ensure value is string)
  const usersMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of (users ?? [])) {
      const name = toDisplayString(u?.name ?? u?.fullname ?? u?.email ?? u?._id, u?._id ?? '-');
      const id = u?._id ?? null;
      if (id) m.set(id, name);
    }
    return m;
  }, [users]);

  useEffect(() => {
    void (async () => {
      try {
        await fetch(activeTab);
      } catch (err) {
        console.error(`${t('failed_to_load')}: ${activeTab}`, err);
      }
    })();
  }, [activeTab, fetch, t]);

  useEffect(() => {
    if (typeof fetchCustomers === 'function') void fetchCustomers();
  }, [fetchCustomers]);

  const data = items ?? [];
  const paginatedData = useMemo(
    () => data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [data, currentPage, itemsPerPage]
  );

  const handleActionClick = async (orderId?: string) => {
    try {
      if (!orderId) {
        console.error('handleActionClick called without orderId', { activeTab });
        toast.error(t('invalid_order_id'));
        return;
      }

      if (activeTab === 'draft') {
        if (!approve) throw new Error('Approve function not available');
        await approve(orderId);
        toast.success(t('order_approved'));
        await fetch('draft');
      } else if (activeTab === 'approved') {
        if (!ship) throw new Error('Ship function not available');
        await ship(orderId);
        toast.success(t('order_shipped'));
        await fetch('approved');
      } else if (activeTab === 'shipped') {
        if (!deliver) throw new Error('Deliver function not available');
        await deliver(orderId);
        toast.success(t('order_delivered'));
        await fetch('shipped');
      } else {
        navigate(`/dashboard/stock-out-draft/${orderId}`, { state: { status: 'invoice' } });
      }
    } catch (err: any) {
      // show backend message if available
      const msg = err?.response?.data?.message || err?.message || String(err);
      toast.error(`${t('action_failed')}: ${msg}`);
    }
  };

  const rowFor = (order: any) => {
    const orderNumber = order.invoiceNumber ?? order._id ?? order.id ?? '-';

    // ensure we always have the correct ObjectId for customer
    let customerDisplay = '-';
    let customerIdForRequest: string | null = null;
    try {
      const found = customers?.find((c: any) => (c?._id === order.customerId) || (c?.id === order.customerId));
      if (found) {
        customerDisplay = toDisplayString(found?.name ?? found);
        customerIdForRequest = found._id ?? found.id ?? null;
      } else {
        customerDisplay = toDisplayString(order.customer ?? order.customerId ?? '-');
        customerIdForRequest = order.customerId ?? null;
      }
    } catch {
      customerDisplay = toDisplayString(order.customerId ?? '-');
      customerIdForRequest = order.customerId ?? null;
    }

    let inventory = '-';
    if (Array.isArray(order.products) && order.products.length > 0) {
      const invId = order.products[0]?.inventoryId ?? order.products[0]?.inventory;
      const invObj = inventories?.find((i: any) => i?._id === invId || i?.id === invId);
      inventory = invObj ? toDisplayString(invObj?.name ?? invObj) : toDisplayString(invId ?? '-');
    }

    const totalPrice = toDisplayString(order.totalAmount ?? order.total ?? 0);
    const createdByName =
      usersMap.get(order.createdBy?._id ?? order.createdBy?.id ?? order.createdBy) ??
      (usersLoading ? t('loading_user') : toDisplayString(order.createdBy ?? '-'));
    const orderTime = order.createdAt ? new Date(order.createdAt).toLocaleString() : order.orderTime ?? '-';

    const action =
      activeTab === 'draft'
        ? t('approve')
        : activeTab === 'approved'
        ? t('ship')
        : activeTab === 'shipped'
        ? t('deliver')
        : t('invoice');

    return {
      orderNumber,
      customer: customerDisplay,
      inventory,
      totalPrice,
      createdByName,
      orderTime,
      action,
      customerIdForRequest,
    };
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t('inventory_management')}</h1>
        <div className="text-sm text-gray-500">
          {t('dashboard')} {'>'} {t('inventory')} {'>'} {t('sales_order')}
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        {(['draft', 'approved', 'shipped', 'delivered'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`px-6 py-2 rounded-full transition-colors ${
              activeTab === tab ? 'bg-slate-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab === 'draft'
              ? t('draft')
              : tab === 'approved'
              ? t('approved')
              : tab === 'shipped'
              ? t('shipped')
              : t('delivered')}
          </button>
        ))}
      </div>

      <div className="text-right text-sm text-gray-500 mb-4">
        {t('showing')} {data.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
        {Math.min(currentPage * itemsPerPage, data.length)} {t('of')} {data.length} {t('orders')}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3 font-medium">{t('order_number')}</th>
                <th className="pb-3 font-medium">{t('customer')}</th>
                <th className="pb-3 font-medium">{t('inventory')}</th>
                <th className="pb-3 font-medium">{t('total_price')}</th>
                <th className="pb-3 font-medium">{t('created_by')}</th>
                <th className="pb-3 font-medium">{t('order_time')}</th>
                <th className="pb-3 font-medium">{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => {
                const row = rowFor(item);
                // prefer _id, fallback to id
                const orderId = item._id ?? item.id;
                return (
                  <tr key={orderId ?? index} className="border-b last:border-0">
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
                          onClick={() => handleActionClick(orderId)}
                        >
                          {row.action}
                        </button>
                        <button
                          className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                          onClick={() => {
                            navigate(`/dashboard/stock-out-draft/${orderId}`, {
                              state: { status: activeTab },
                            });
                          }}
                        >
                          {t('view')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    {loading ? t('loading') : error ? `${t('failed_to_load')}: ${error.message}` : t('no_orders_found')}
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
