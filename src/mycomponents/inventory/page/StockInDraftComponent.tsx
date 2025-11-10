// src/mycomponents/inventory/page/StockInDraftComponent.tsx
import React, { useEffect, useState } from 'react';
import { Eye, Download } from 'lucide-react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { usePurchaseOrder } from '../../Precious/hooks/useCreatePurchaseOrder';
import { useOrganization } from '../../organizations/hooks/useOrganization';
import axiosClient from '@/lib/axiosClient';
import { toast } from 'react-hot-toast';

type StatusType = 'Draft' | 'Approved' | 'Invoice';

const StockInDraftComponent: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { item: orderData, loading, error } = usePurchaseOrder(id);
  const { organization: organizationData } = useOrganization(orderData?.organizationId);

  const [creating, setCreating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null); // new: show banner when backend returns unexpected HTML

  const parseStatus = (raw?: any): StatusType | null => {
    if (!raw) return null;
    const s = String(raw).toLowerCase();
    if (s === 'draft') return 'Draft';
    if (s === 'approved') return 'Approved';
    if (s === 'invoice' || s === 'delivered') return 'Invoice';
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

  const headerText = `Purchase Order (${activeStatus})`;

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

  const handleCreateInvoice = async () => {
    if (!id) return;
    setApiError(null);
    setCreating(true);
    try {
      const resp = await axiosClient.post(`/purchaseInvoices/${id}`);

      // Normalize headers access (axios response has headers object)
const contentType =
  typeof resp?.headers?.get === 'function'
    ? (resp.headers.get('content-type') ?? '')
    : String((resp?.headers as any)?.['content-type'] ?? '');

      const body = resp?.data;

      // Detect HTML/text response like "Welcome to ERP"
      const isHtmlText =
        typeof body === 'string' ||
        (typeof contentType === 'string' && contentType.includes('text/html'));

      if (isHtmlText) {
        // If body includes "Welcome to ERP" or it's HTML, treat as unexpected/error
   if (typeof resp?.data === "string") {
  const normalized = resp.data.toLowerCase().trim();
  if (normalized.includes("welcome to erp")) {
    toast.error("Unexpected server response — please contact your administrator.");
    return;
  }
}

      }

      // If backend uses envelope like { status, data: { invoice: ... } } or returns invoice directly:
      const returnedInvoice = resp?.data?.data?.invoice ?? resp?.data?.invoice ?? resp?.data ?? resp;
      console.log('Create invoice response:', returnedInvoice);
      toast.success('Invoice created successfully!');
      // navigate to invoice page (optional)
      navigate(`/dashboard/preciousmanagement`);
    } catch (err: any) {
      console.error('Create invoice error:', err?.response?.data ?? err);
      // If server returned HTML message in error.response.data, detect and show friendly message:
      const serverBody = err?.response?.data;
      if (typeof serverBody === 'string' && serverBody.includes('Welcome to ERP')) {
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
        ⏳ Loading purchase order details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-lg">
        ❌ Failed to load purchase order: {error.message}
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        ⚠️ No purchase order data found for ID: {id}
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
        <p className="text-sm text-gray-500">Dashboard &gt; Inventory &gt; Stock in Draft</p>
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

          {/* Supplier & Company Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Supplier */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Supplier</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier ID:</label>
                  <input
                    type="text"
                    value={orderData?.supplierId || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency:</label>
                  <input
                    type="text"
                    value={orderData?.currency || '-'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">WarehouseId:</label>
                  <input
                    type="text"
                    value={warehouseName}
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
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 text-left">Quantity</th>
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
                        <td className="px-4 py-3 text-sm">{p.quantity ?? 0}</td>
                        <td className="px-4 py-3 text-sm">{((p.price ?? 0) as number).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">{p.discount ?? 0}%</td>
                        <td className="px-4 py-3 text-sm font-medium">{((p.total ?? 0) as number).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-400">
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

          {/* Buttons */}
          <div className="flex justify-end gap-3 no-print">
            <button
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50"
              onClick={() => window.history.back()}
            >
              Back
            </button>

            {activeStatus !== 'Invoice' && (
              <button
                className="px-6 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800 flex items-center gap-2"
                onClick={() => {
                  if (!id) return;
                  navigate(`/dashboard/EditPurchaseOrderComponent/${id}`, {
                    state: { orderData },
                  });
                }}
              >
                Edit
              </button>
            )}

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

// Print styles injection (kept as earlier)
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

export default StockInDraftComponent;
