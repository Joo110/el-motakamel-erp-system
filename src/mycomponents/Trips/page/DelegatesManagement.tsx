// src/mycomponents/Trips/page/AppWithInvoices.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTripInvoices } from '../hooks/useTripInvoices';
import { useProducts } from '../../product/hooks/useProducts';
import { useCustomers } from '../../Sales/hooks/useCustomers';
import { useTrips } from '../hooks/useTrips';
import { useSalesTrips } from '../hooks/useSalesTrips';
import type { Invoice } from '../services/tripInvoicesService';
import { toast } from 'react-hot-toast';

// ==================== Page 1: Delegates Management ====================
const DelegatesManagement: React.FC = () => {
  const { t } = useTranslation();
  const [showNewOrder, setShowNewOrder] = useState(false);

  // invoices (for orders)
  const { invoices, fetch: fetchInvoices, loading: invLoading } = useTripInvoices();

  // trips hook (for complete)
  const { trips, fetch: fetchTrips, completeTrip } = useTrips();

  useEffect(() => {
    void fetchInvoices();
    void fetchTrips();
  }, [fetchInvoices, fetchTrips]);

  // Map invoices -> orders display (preserve column names)
  const orders = useMemo(() => {
    if (!invoices) return [];
    return invoices.map((inv: Invoice) => {
      const so = (inv as any).saleOrder ?? {};
      return {
        orderNumber: so?.orderNumber ? String(so.orderNumber) : (so?._id ?? inv._id ?? ''),
        customer:
          typeof so?.customer === 'string'
            ? so.customer
            : so?.customer?.name ?? String(so?.customer ?? '-'),
        totalPrice: so?.total != null ? String(so.total) : '-',
        orderTime: so?.orderDate
          ? new Date(so.orderDate).toLocaleDateString()
          : inv?.createdAt
          ? new Date(inv.createdAt).toLocaleDateString()
          : '-',
        action: 'Invoice',
      };
    });
  }, [invoices]);

  // --------- PAGINATION (dynamic) ----------
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const total = orders.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const startEntry = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, total);

  const paginatedOrders = useMemo(
    () => orders.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [orders, currentPage, pageSize]
  );

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };
  // -----------------------------------------

  // complete handler using useTrips.completeTrip
  const handleComplete = async () => {
    try {
      // priority: try to find tripId from invoices.saleOrder._id, else from trips list
      const firstInvoice: any = invoices && invoices.length ? invoices[0] : null;
      const invoiceTripId = firstInvoice?.saleOrder?._id ?? firstInvoice?._id ?? null;
      const tripIdFromTrips =
        trips && trips.length ? trips[0]._id ?? trips[0]._id ?? null : null;
      const tripId = invoiceTripId ?? tripIdFromTrips;

      if (!tripId) {
        toast.error(t('No trip id available to complete'));
        return;
      }

      await completeTrip(tripId);
      await fetchInvoices();
      toast.success(t('Trip completed'));
    } catch (err) {
      console.error('complete error', err);
      toast.error(t('Completing trip failed'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
            <span>{t('Dashboard')}</span>
            <span>{'>'}</span>
            <span className="text-gray-700">{t('Delegates')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t('Delegates Management')}
          </h1>
        </div>

        {/* Trip Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Trip')}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t('Expenses')}</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t('End Time')}</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* New Order Button + Complete Button */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mb-6">
          <div className="flex gap-3 justify-end w-full sm:w-auto">
            <button
              onClick={() => setShowNewOrder(!showNewOrder)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all font-medium whitespace-nowrap"
            >
              <Plus size={18} />
              {t('New Order')}
            </button>

            <button
              onClick={handleComplete}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium whitespace-nowrap"
              aria-label={t('compelete')}
            >
              {t('compelete')}
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-4 border-b border-gray-200 gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{t('Orders')}</h2>
            <span className="text-sm text-gray-600">
              {t('Showing')} {startEntry}-{endEntry} {t('of')} {total} {t('products')}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('Order number')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('Customer')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('Total Price')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('Order Time')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('Action')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOrders.map((order, index) => (
                  <tr key={order.orderNumber || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.customer}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.totalPrice}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.orderTime}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button className="px-3 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded transition-all text-sm">
                          {t('view')}
                        </button>
                        <button className="px-3 py-1.5 text-white bg-slate-700 hover:bg-slate-800 rounded transition-all text-sm">
                          {t('Invoice')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && !invLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      {t('No orders found')}
                    </td>
                  </tr>
                )}
                {invLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      {t('Loading...')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer - Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-3 border-t border-gray-200 gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">{t('Show')}</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">{t('entries')}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('Previous')}
              </button>

              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 text-sm ${currentPage === p ? 'bg-slate-700 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded transition-colors`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('Next')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== Page 2: Sales Management ====================
const SalesManagement: React.FC = () => {
  const { t } = useTranslation();

  // local products state (kept for UI behaviour like removeProduct / calculateTotal)
  const [products, setProducts] = useState([
    { id: 1, name: 'Product 1', inventory: 'Alex Road', code: '39282', units: '10', price: '1160.50', discount: '13%', total: '10990.00 SR' },
    { id: 2, name: 'Product 2', inventory: 'Alex Road', code: '32216', units: '10', price: '1160.50', discount: '13%', total: '10250.00 SR' },
    { id: 3, name: 'Wireless Bluetooth Earbuds', inventory: 'New capital', code: '32641', units: '10', price: '1160.50', discount: '11%', total: '10300.00 SR' },
    { id: 4, name: 'Product 2', inventory: 'Alex Road', code: '32216', units: '10', price: '1160.50', discount: '22%', total: '8940.00 SR' }
  ]);

  const calculateTotal = () => {
    return products.reduce((sum, product) => {
      const price = parseFloat(product.total.replace(' SR', '').replace(',', ''));
      return sum + price;
    }, 0).toFixed(2);
  };

  const removeProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // hooks
  const { invoices, fetch: fetchInvoices } = useTripInvoices();
  const { products: apiProducts, fetchProducts } = useProducts();
  const { customers: apiCustomers, fetchCustomers } = useCustomers();
  const { trips, fetch: fetchTrips } = useTrips();
  const { create: createSalesTrip } = useSalesTrips();

  useEffect(() => {
    void fetchInvoices();
    void fetchProducts();
    void fetchCustomers();
    void fetchTrips();
  }, [fetchInvoices, fetchProducts, fetchCustomers, fetchTrips]);

  // derive customers list from apiCustomers (fallback to invoices if no customers)
  const customersList = useMemo(() => {
    if (Array.isArray(apiCustomers) && apiCustomers.length) {
      return apiCustomers.map((c: any) => ({
        id: c._id ?? c.id ?? (c?.customerId ?? JSON.stringify(c)),
        name: c.name ?? c.fullName ?? c.title ?? String(c),
      }));
    }
    // fallback: extract from invoices
    const map = new Map<string, { id: string; name: string }>();
    (invoices || []).forEach((inv: Invoice) => {
      const so = (inv as any).saleOrder ?? {};
      const cust = so?.customer;
      if (!cust) return;
      if (typeof cust === 'string') {
        if (!map.has(cust)) map.set(cust, { id: cust, name: cust });
      } else if (typeof cust === 'object') {
        const id = cust._id ?? cust.id ?? JSON.stringify(cust);
        const name = cust.name ?? cust.fullName ?? id;
        if (!map.has(id)) map.set(id, { id, name });
      }
    });
    return Array.from(map.values());
  }, [apiCustomers, invoices]);

  // derive products list from apiProducts (fallback to local products)
  const productsList = useMemo(() => {
    if (Array.isArray(apiProducts) && apiProducts.length) {
      return apiProducts.map((p: any) => ({
        id: p._id ?? p.id ?? JSON.stringify(p),
        name: p.name ?? p.title ?? p.productName ?? String(p),
      }));
    }
    // fallback to local products
    return products.map((p) => ({ id: String(p.id), name: p.name }));
  }, [apiProducts, products]);

  // derive sale orders list from invoices
  const saleOrders = useMemo(() => {
    if (!invoices) return [];
    return invoices.map((inv: Invoice) => (inv as any).saleOrder).filter(Boolean);
  }, [invoices]);

  // local selection state
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedSaleOrderId, setSelectedSaleOrderId] = useState<string>('');

  // when saleOrders loaded, default select first
  useEffect(() => {
    if (saleOrders.length && !selectedSaleOrderId) {
      setSelectedSaleOrderId(saleOrders[0]._id ?? saleOrders[0].orderNumber ?? '');
    }
  }, [saleOrders, selectedSaleOrderId]);

  // helper to find chosen saleOrder object
  const findSelectedSaleOrder = () => {
    if (!selectedSaleOrderId) return null;
    return saleOrders.find((so: any) => {
      const id = so._id ?? String(so.orderNumber ?? '');
      return String(id) === String(selectedSaleOrderId);
    }) ?? null;
  };

  // get a tripId to attach salesTrip to (priority: trips[0]._id, else first invoice.saleOrder._id)
  const resolveTripId = () => {
    const tripFromTrips = (trips && trips.length) ? (trips[0]._id ?? trips[0]._id ?? null) : null;
    const tripFromInvoices = (invoices && invoices.length) ? (invoices[0] as any)?.saleOrder?._id ?? (invoices[0] as any)?._id ?? null : null;
    return tripFromTrips ?? tripFromInvoices ?? null;
  };

  // Create order: send saleOrder payload into createSalesTrip (hook)
  const handleCreateOrder = async () => {
    const tripId = resolveTripId();
    if (!tripId) {
      toast.error(t('No trip id available to attach order'));
      return;
    }

    const selectedSO = findSelectedSaleOrder();
    if (!selectedSO) {
      // no full sale order available, build minimal payload
      const payload = {
        customer: selectedCustomer || undefined,
        orderDate: new Date().toISOString(),
        goods: selectedProduct ? [{ product: selectedProduct, code: '', unit: 1, discount: 0, total: 0 }] : [],
        total: 0,
      };
      try {
        await createSalesTrip(tripId, payload as any);
        await fetchInvoices();
        toast.success(t('Order created'));
      } catch (err) {
        console.error('create order failed', err);
        toast.error(t('Create failed'));
      }
      return;
    }

    // build payload from selected saleOrder
    const payload = {
      customer: selectedSO.customer,
      orderDate: selectedSO.orderDate ?? new Date().toISOString(),
      goods: Array.isArray(selectedSO.goods) ? selectedSO.goods.map((g: any) => ({
        product: g.product,
        code: g.code,
        unit: g.unit,
        discount: g.discount,
        total: g.total,
      })) : [],
      total: selectedSO.total ?? 0,
    };

    try {
      await createSalesTrip(tripId, payload as any);
      await fetchInvoices();
      toast.success(t('Order created'));
    } catch (err) {
      console.error('create order failed', err);
      toast.error(t('Create failed'));
    }
  };

  // Save order does same create but different toast message (as requested)
  const handleSaveOrder = async () => {
    const tripId = resolveTripId();
    if (!tripId) {
      toast.error(t('No trip id available to attach order'));
      return;
    }

    const selectedSO = findSelectedSaleOrder();
    if (!selectedSO) {
      const payload = {
        customer: selectedCustomer || undefined,
        orderDate: new Date().toISOString(),
        goods: selectedProduct ? [{ product: selectedProduct, code: '', unit: 1, discount: 0, total: 0 }] : [],
        total: 0,
      };
      try {
        await createSalesTrip(tripId, payload as any);
        await fetchInvoices();
        toast.success(t('Order saved'));
      } catch (err) {
        console.error('save order failed', err);
        toast.error(t('Saving order failed'));
      }
      return;
    }

    const payload = {
      customer: selectedSO.customer,
      orderDate: selectedSO.orderDate ?? new Date().toISOString(),
      goods: Array.isArray(selectedSO.goods) ? selectedSO.goods.map((g: any) => ({
        product: g.product,
        code: g.code,
        unit: g.unit,
        discount: g.discount,
        total: g.total,
      })) : [],
      total: selectedSO.total ?? 0,
    };

    try {
      await createSalesTrip(tripId, payload as any);
      await fetchInvoices();
      toast.success(t('Order saved'));
    } catch (err) {
      console.error('save order failed', err);
      toast.error(t('Saving order failed'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
            <span>{t('Dashboard')}</span>
            <span>{'>'}</span>
            <span>{t('Inventory')}</span>
            <span>{'>'}</span>
            <span className="text-gray-700">{t('Stock out')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('Sales Management')}</h1>
        </div>

        {/* Stock Out Card */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-blue-400 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('Stock out')}</h2>
            <div className="flex gap-6 flex-wrap">
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('Invoice number:')}</label>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('Created by')}</label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t('Customer')}</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">{t('Select customer...')}</option>
                {customersList.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t('Order Date')}</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Add Products Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Add Products')}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t('Product')}</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">{t('Select...')}</option>
                {productsList.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t('Code')}</label>
              <input
                type="text"
                placeholder="39282"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t('Units')}</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t('Price')}</label>
              <input
                type="text"
                placeholder="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t('Discount')}</label>
              <input
                type="text"
                placeholder="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t('Total')}</label>
              <input
                type="text"
                placeholder="0990.00 SR"
                className="w-full px-3 py-2 border border-gray-300 text-sm bg-gray-50 rounded-lg"
                readOnly
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <button className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium">
              {t('Cancel')}
            </button>

            <button
              onClick={handleCreateOrder}
              className="flex items-center gap-2 px-5 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all font-medium"
            >
              <Plus size={16} />
              {t('Received Products')}
            </button>

            <button
              onClick={handleSaveOrder}
              className="ml-0 sm:ml-3 flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium"
            >
              {t('Save_order')}
            </button>
          </div>
        </div>

        {/* Received Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('Received Products')}</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-12">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('Product')}</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('Inventory')}</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('Code')}</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('Units')}</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('Price')}</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('Discount')}</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('Total')}</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-12"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-4">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-3 sm:px-4 py-4 text-sm text-gray-900">{product.name}</td>
                    <td className="px-3 sm:px-4 py-4 text-sm text-gray-700">{product.inventory}</td>
                    <td className="px-3 sm:px-4 py-4 text-sm text-gray-700">{product.code}</td>
                    <td className="px-3 sm:px-4 py-4 text-sm text-gray-700">{product.units}</td>
                    <td className="px-3 sm:px-4 py-4 text-sm text-gray-700">{product.price}</td>
                    <td className="px-3 sm:px-4 py-4 text-sm text-gray-700">{product.discount}</td>
                    <td className="px-3 sm:px-4 py-4 text-sm text-gray-900 font-medium">{product.total}</td>
                    <td className="px-3 sm:px-4 py-4">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        aria-label={t('delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex justify-end">
            <div className="text-right">
              <span className="text-sm text-gray-600 mr-4">{t('Total')}:</span>
              <span className="text-lg font-bold text-gray-900">{calculateTotal()} SR</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Notes')}</h2>
          <textarea
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            placeholder={t('Add notes here...')}
          />
        </div>
      </div>
    </div>
  );
};

// ==================== Main App Component ====================
const App: React.FC = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState<'delegates' | 'sales'>('delegates');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setCurrentPage('delegates')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                currentPage === 'delegates'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-800'
              }`}
            >
              {t('Delegates Management')}
            </button>
            <button
              onClick={() => setCurrentPage('sales')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                currentPage === 'sales'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-800'
              }`}
            >
              {t('Sales Management')}
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      {currentPage === 'delegates' ? <DelegatesManagement /> : <SalesManagement />}
    </div>
  );
};

export default App;
