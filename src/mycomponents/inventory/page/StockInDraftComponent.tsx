// src/mycomponents/inventory/page/StockInDraftComponent.tsx
import React, { useEffect, useState } from 'react';
import { Eye, Download } from 'lucide-react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { usePurchaseOrder } from '../../Precious/hooks/useCreatePurchaseOrder';
import { useOrganization } from '../../organizations/hooks/useOrganization';
import axiosClient from '@/lib/axiosClient';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

type StatusType = 'Draft' | 'Approved' | 'Invoice';

const StockInDraftComponent: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { item: orderData } = usePurchaseOrder(id);
  const { organization: organizationData } = useOrganization(orderData?.organizationId);

  const [creating, setCreating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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

  const headerText = `${t('purchase_order')} (${activeStatus})`;

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
    const resp = await axiosClient.post(
      `/purchase-invoices/${id}`,
      {
        notes: 'Invoice created from purchase order',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const returnedInvoice =
      resp?.data?.data?.invoice ??
      resp?.data?.invoice ??
      resp?.data ??
      resp;

    console.log('Create invoice response:', returnedInvoice);

    toast.success(t('invoice_created_successfully'));
    navigate(`/dashboard/preciousmanagement`);
  } catch (err: any) {
    console.error('Create invoice error:', err?.response?.data ?? err);

    const msg =
      err?.response?.data?.message ||
      err?.message ||
      'Unknown error';

    setApiError(msg);
    toast.error(t('failed_create_invoice') + ': ' + msg);
  } finally {
    setCreating(false);
  }
};


  // ---- Helpers to safely extract/display values ----
  const safeText = (v: any): string => {
    if (v === null || v === undefined) return '-';
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (typeof v === 'object') {
      if (Array.isArray(v)) return v.join(', ');
      if (v.name) return String(v.name);
      if (v.productName) return String(v.productName);
      if (v.tradeName) return String(v.tradeName);
      if (v._id) return String(v._id);
      if (v.id) return String(v.id);
      try {
        const s = JSON.stringify(v);
        return s.length > 80 ? s.slice(0, 77) + '…' : s;
      } catch {
        return '[Object]';
      }
    }
    return String(v);
  };

  const getQuantity = (p: any): number => {
    return Number(p.quantity ?? p.qty ?? p.units ?? 0) || 0;
  };

  const getWholesalePrice = (p: any): number => {
    // prioritize explicit wholesalePrice, then product.wholesalePrice, then fallbacks
    return Number(p.wholesalePrice ?? p.product?.wholesalePrice ?? p.wholesale ?? p.price ?? p.retailPrice ?? 0) || 0;
  };

  const getRetailPrice = (p: any): number => {
    return Number(p.retailPrice ?? p.product?.retailPrice ?? p.retailPrice ?? p.retail ?? 0) || 0;
  };

  const getDiscount = (p: any): number => {
    return Number(p.discount ?? 0) || 0;
  };

  // compute subtotal based on wholesale price (quantity * wholesale * (1 - discount))
  const subtotal =
    (orderData?.products ?? []).reduce((sum: number, item: any) => {
      const q = getQuantity(item);
      const w = getWholesalePrice(item);
      const d = getDiscount(item);
      const line = w * q * (1 - d / 100);
      return sum + (Number.isFinite(line) ? line : 0);
    }, 0) || 0;

  const tax = subtotal * 0.14;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t('inventory_management')}</h1>
        <p className="text-sm text-gray-500">{t('dashboard')} &gt; {t('inventory')} &gt; {t('stock_in_draft')}</p>
      </div>

      {apiError && (
        <div className="max-w-5xl mx-auto mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800">
          <strong>{t('error_label')}:</strong> {apiError}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('invoice_number')}:</label>
              <input
                type="text"
                value={safeText(orderData?.invoiceNumber ?? '-')}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('invoice_date')}:</label>
              <input
                type="text"
                value={
                  orderData?.createdAt ? new Date(orderData.createdAt).toLocaleDateString('ar-EG') : '-'
                }
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
              />
            </div>
          </div>

          {/* Supplier & Company Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('supplier_label')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('supplier_id')}:</label>
                  <input
                    type="text"
                    value={safeText(orderData?.supplierId ??  '-')}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('currency_label')}:</label>
                  <input
                    type="text"
                    value={safeText(orderData?.currency ?? '-') }
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('company_info')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('warehouse_id')}:</label>
                  <input
                    type="text"
                    value={safeText(warehouseName)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('expected_delivery_date')}:</label>
                  <input
                    type="text"
                    value={
                      orderData?.expectedDeliveryDate
                        ? new Date(orderData.expectedDeliveryDate).toLocaleDateString('ar-EG')
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('requested_products')}</h2>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 text-left">{t('product_col')}</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 text-left">{t('quantity_label')}</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 text-left">{t('wholesale_price_col') || 'Wholesale'}</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 text-left">{t('retail_price_col') || 'Retail'}</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 text-left">{t('discount_col')}</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 text-left">{t('total_col')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orderData?.products?.length ? (
                    orderData.products.map((p: any, i: number) => {
                       console.log('DEBUG PRODUCT', {
    retailPrice: p.retailPrice,
    wholesalePrice: p.wholesalePrice,
    full: p
  });
                      const q = getQuantity(p);
                      const wholesale = getWholesalePrice(p);
                      const retail = getRetailPrice(p);
                      const discount = getDiscount(p);
                      const lineTotal = wholesale * q * (1 - discount / 100);

                      // product name may be nested under `product`
                      const productName = p.product?.name ?? p.productName ?? p.name ?? p.product?.title ?? '-';

                      return (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-4 py-3 text-sm">{safeText(productName)}</td>
                          <td className="px-4 py-3 text-sm">{q}</td>
                          <td className="px-4 py-3 text-sm">{wholesale.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm">{retail.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm">{discount ?? 0}%</td>
                          <td className="px-4 py-3 text-sm font-medium">{lineTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">
                        {t('no_products_found')}
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
              <h3 className="text-base font-semibold text-gray-900 mb-3">{t('notes_label')}</h3>
              <textarea
                readOnly
                value={orderData?.notes || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                rows={4}
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">{t('total_payment')}</h3>
              <div className="border border-gray-300 rounded-md px-4 py-3 bg-gray-50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('subtotal_label')}:</span>
                  <span>{subtotal.toFixed(2)} {orderData?.currency || 'EGP'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('tax_14')}:</span>
                  <span>{tax.toFixed(2)} {orderData?.currency || 'EGP'}</span>
                </div>
                <div className="flex justify-between text-base font-semibold border-t pt-2">
                  <span>{t('total_label')}:</span>
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
              {t('back_btn')}
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
                {t('edit_btn')}
              </button>
            )}

            {activeStatus === 'Invoice' && (
              <button
                className="px-6 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateInvoice}
                disabled={creating}
              >
                {creating ? t('creating_label') : t('create_invoice_btn')}
              </button>
            )}

            <button
              className="px-6 py-2 bg-amber-400 text-gray-900 rounded-full text-sm hover:bg-amber-500 flex items-center gap-2"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4" />
              {t('export_btn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Print styles injection
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
