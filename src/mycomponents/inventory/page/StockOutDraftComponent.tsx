// src/mycomponents/inventory/page/StockOutDraftComponent.tsx
import React, { useEffect, useState } from 'react';
import { Eye, Download } from 'lucide-react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { usePurchaseOrder } from '../../Sales/hooks/useSaleOrders';
import { useOrganization } from '../../organizations/hooks/useOrganization';
import { toast } from 'react-hot-toast';
import axiosClient from '@/lib/axiosClient';
import { createInvoiceForSaleOrder } from '../../Sales/services/saleInvoices';

type StatusType = 'Draft' | 'Sales Order Approved' | 'Quotation' | 'Invoice';

const StockOutDraftComponent: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { item: orderData, loading, error } = usePurchaseOrder(id);
  const { organization: organizationData } = useOrganization(orderData?.organizationId);

  const [creating, setCreating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const parseStatus = (raw?: any): StatusType | null => {
    if (!raw) return null;
    const s = String(raw).trim().toLowerCase();

    if (s === 'draft') return 'Draft';
    if (s === 'sales order approved' || s === 'salesorderapproved' || s === 'sales_order_approved' || 
        s === 'sales-order-approved' || (s.includes('sales') && s.includes('approved'))) {
      return 'Sales Order Approved';
    }
    if (s === 'quotation' || s === 'quote') return 'Quotation';
    if (s === 'invoice') return 'Invoice';

    return null;
  };

  const getInitialStatus = (): StatusType => {
    const stateStatus = parseStatus(location.state?.status);
    if (stateStatus) return stateStatus;

    const queryParams = new URLSearchParams(location.search);
    const q = parseStatus(queryParams.get('status') || undefined);
    if (q) return q;

    return 'Draft';
  };

  const [activeStatus, setActiveStatus] = useState<StatusType>(getInitialStatus());

  useEffect(() => {
    setActiveStatus(getInitialStatus());
  }, [location.key, location.search, JSON.stringify(location.state)]);

  const headerText = activeStatus;

  const extractOrgName = (org: any): string | null => {
    if (!org) return null;
    if (typeof org === 'string') return null;
    if (org.name) return org.name;
    if (org.data?.organization?.name) return org.data.organization.name;
    if (org.organization?.name) return org.organization.name;
    if (org.data?.name) return org.data.name;
    return null;
  };

  const warehouseName = extractOrgName(organizationData) || orderData?.organizationId || '-';

// وضع هذه الدوال داخل نفس الكمبوننت (فوق أو أسفل handleCreateInvoice)
const findExistingInvoice = (resp: any, saleOrderId: string) => {
  if (!resp) return null;
  const payload = resp?.data ?? resp;

  // حسب الـ response اللي بعته: payload.data.saleorderInvoices is the array
  const invoices = payload?.data?.saleorderInvoices ?? payload?.saleorderInvoices ?? null;
  if (!Array.isArray(invoices) || invoices.length === 0) return null;

  // filter invoices that match the saleOrder id (some entries might belong to other orders)
  const matches = invoices.filter((inv: any) => String(inv.saleOrder) === String(saleOrderId));
  if (matches.length === 0) return null;

  // اختر الأحدث حسب createdAt (fallback إلى أول عنصر لو ما فيش createdAt)
  matches.sort((a: any, b: any) => {
    const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

  return matches[0];
};

const handleCreateInvoice = async () => {
  if (!id) return;
  setApiError(null);
  setCreating(true);

  try {
    // 1) استخدم الـ endpoint اللي بعته بالظبط
    const checkResp = await axiosClient.get('/api/v1/saleInvoices', { params: { saleOrder: id } });

    // 2) حاول نوجد فاتورة موجودة لنفس saleOrder
    const existing = findExistingInvoice(checkResp, id);
    if (existing) {
      const invoiceId = existing._id ?? existing.id ?? null;
      toast.success('Invoice already exists — opening it now.');
      if (invoiceId) {
        navigate(`/dashboard/sales-invoices/${invoiceId}`);
      } else {
        navigate(`/dashboard/sales-invoices/${id}`);
      }
      return; // ما ننشئش فاتورة جديدة
    }

    // 3) لو ما لقيتش -> انشئ الفاتورة
    const created = await createInvoiceForSaleOrder(id);

    // حماية ضد استجابة نصية أو HTML غير متوقعة
    const rawString = typeof created === 'string' ? created : JSON.stringify(created ?? '');
    if (rawString.toLowerCase().includes('welcome to erp')) {
      const msg = 'Unexpected server response — please contact your administrator.';
      setApiError(msg);
      toast.error(msg);
      return;
    }

    // محاولة استخراج كائن الفاتورة من الرد
    const invoiceObj = created?.data?.invoice ?? created?.invoice ?? created;
    const invoiceId = invoiceObj?._id ?? invoiceObj?.id ?? null;

    console.log('Create invoice response:', created);
    toast.success('Invoice created successfully!');

    if (invoiceId) {
      navigate(`/dashboard/sales-invoices/${invoiceId}`);
    } else {
      navigate(`/dashboard/sales-invoices/${id}`);
    }
  } catch (err: any) {
    console.error('Create invoice error:', err?.response?.data ?? err);
    const serverBody = err?.response?.data;
    if (typeof serverBody === 'string' && serverBody.toLowerCase().includes('welcome to erp')) {
      const msg = 'Server returned "Welcome to ERP" — request hit wrong endpoint (dev server).';
      setApiError(msg);
      toast.error(msg);
    } else {
      const msg = err?.response?.data?.message || err?.message || String(err);
      setApiError(String(msg));
      toast.error('Failed to create invoice: ' + msg);
    }
  } finally {
    setCreating(false);
  }
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        ⏳ Loading sales order details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-lg">
        ❌ Failed to load sales order: {error.message}
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        ⚠️ No sales order data found for ID: {id}
      </div>
    );
  }

  const subtotal =
    orderData?.products?.reduce((sum: number, item: any) => sum + (item.total ?? 0), 0) || 0;
  const tax = subtotal * 0.14;
  const total = orderData?.totalAmount ?? subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-500">Dashboard &gt; Inventory &gt; Stock Out Draft</p>
      </div>

      {/* Show API error banner if detected */}
      {apiError && (
        <div className="max-w-5xl mx-auto mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800">
          <strong>Error:</strong> {apiError}
        </div>
      )}

      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm print-area">
        {/* Header Bar */}
        <div className="bg-slate-700 text-white px-6 py-3 rounded-t-lg flex items-center justify-center gap-2">
          <Eye className="w-5 h-5" />
          <span className="font-medium">{headerText}</span>
        </div>

        <div className="p-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice number:</label>
              <input
                type="text"
                value={orderData?.invoiceNumber || '-'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date:</label>
              <input
                type="text"
                value={
                  orderData?.createdAt ? new Date(orderData.createdAt).toLocaleDateString('en-GB') : '-'
                }
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
              />
            </div>
          </div>

          {/* Customer & Company Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Customer */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CustomerId:</label>
                  <input
                    type="text"
                    value={orderData?.customerName || orderData?.customerId || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone number:</label>
                  <input
                    type="text"
                    value={orderData?.customerPhone || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
                  <input
                    type="text"
                    value={orderData?.customerEmail || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Company */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requested By:</label>
                  <input
                    type="text"
                    value={orderData?.requestedBy || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WarehouseId:</label>
                  <input
                    type="text"
                    value={warehouseName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address:</label>
                  <input
                    type="text"
                    value={orderData?.address || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date:</label>
                  <input
                    type="text"
                    value={
                      orderData?.expectedDeliveryDate
                        ? new Date(orderData.expectedDeliveryDate).toLocaleDateString('en-GB')
                        : '-'
                    }
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Requested Products</h2>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 text-left">Product</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 text-left">Inventory</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 text-left">Code</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 text-left">Units</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 text-left">Price</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 text-left">Discount</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderData?.products?.length ? (
                    orderData.products.map((p: any, i: number) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-4 py-3 text-sm">{p.name || '-'}</td>
                        <td className="px-4 py-3 text-sm">{p.inventory ?? '-'}</td>
                        <td className="px-4 py-3 text-sm">{p.code || '-'}</td>
                        <td className="px-4 py-3 text-sm">{p.quantity ?? 0}</td>
                        <td className="px-4 py-3 text-sm">{((p.price ?? 0) as number).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">{p.discount ?? 0}%</td>
                        <td className="px-4 py-3 text-sm font-medium">{((p.total ?? 0) as number).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes + Totals */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Notes</h3>
              <textarea
                readOnly
                value={orderData?.notes || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                rows={4}
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Total Payment</h3>
              <div className="border border-gray-300 rounded-md px-4 py-3 bg-gray-50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{subtotal.toFixed(2)} {orderData?.currency || 'EGP'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (14%):</span>
                  <span>{tax.toFixed(2)} {orderData?.currency || 'EGP'}</span>
                </div>
                <div className="flex justify-between text-base font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>{total.toFixed(2)} {orderData?.currency || 'EGP'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Requested By:</label>
              <div className="w-full h-16 border-b border-gray-300"></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Approved By:</label>
              <div className="w-full h-16 border-b border-gray-300"></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Received By:</label>
              <div className="w-full h-16 border-b border-gray-300"></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 no-print">
            <button
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50"
              onClick={() => window.history.back()}
            >
              Back
            </button>

            <button
              className="px-6 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800 flex items-center gap-2"
              onClick={() => {
                if (!id) return;
                navigate(`/dashboard/EditSaleOrderComponent/${id}`, {
                  state: { orderData },
                });
              }}
            >
              Edit
            </button>

            {/* Create Invoice button - only show when status is Invoice */}
            {activeStatus === 'Invoice' && (
              <button
                className="px-6 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateInvoice}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Invoice'}
              </button>
            )}

            <button
              className="px-6 py-2 bg-amber-400 text-gray-900 rounded-full text-sm hover:bg-amber-500 flex items-center gap-2"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Print styles
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-area, .print-area * {
      visibility: visible;
    }
    .print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      box-shadow: none !important;
      border-radius: 0 !important;
    }
    .no-print {
      display: none !important;
    }
    input, textarea {
      border: none !important;
      background: transparent !important;
      padding: 0 !important;
      font-weight: 500;
    }
    .rounded-full {
      border-radius: 0 !important;
    }
  }
`;

if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = printStyles;
  document.head.appendChild(styleTag);
}

export default StockOutDraftComponent;
