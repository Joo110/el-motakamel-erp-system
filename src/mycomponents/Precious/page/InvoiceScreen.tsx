import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePurchaseInvoices } from '../hooks/useAllinvoices';
import { useTranslation } from 'react-i18next';

interface Product {
  name: string;
  inventory: string;
  code: string;
  units: string;
  delivered: string;
  price: string;
  tax: string;
  total: string;
}

const InvoiceScreen: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { getInvoice, loading } = usePurchaseInvoices();

  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([
    { name: '', inventory: '', code: '', units: '', delivered: '', price: '', tax: '', total: '' }
  ]);

  // Load invoice function
  const loadInvoice = async () => {
    if (!id) return;
    try {
      const raw = await getInvoice(id);
      if (!raw) {
        setInvoiceData(null);
        setProducts([
          { name: '', inventory: '', code: '', units: '', delivered: '', price: '', tax: '', total: '' }
        ]);
        return;
      }

      const pureInvoice =
        raw.purchaseInvoice ||
        raw.data?.purchaseInvoice ||
        raw.data ||
        raw;

      const normalized = {
        _id: pureInvoice._id ?? pureInvoice.id ?? null,
        invoiceNumber: pureInvoice.invoiceNumber ?? pureInvoice.orderNumber ?? '',
        supplier: pureInvoice.supplier ?? null,
        organization: pureInvoice.organization ?? null,
        pruchaseOrder: pureInvoice.pruchaseOrder ?? pureInvoice.purchaseOrder ?? null,
        totalPayment: pureInvoice.totalPayment ?? pureInvoice.total ?? 0,
        paymentStatus: pureInvoice.paymentStatus ?? pureInvoice.status ?? '',
        createdAt: pureInvoice.createdAt ?? pureInvoice.orderDate ?? '',
        updatedAt: pureInvoice.updatedAt ?? '',
        raw: pureInvoice,
        ...pureInvoice,
      };

      setInvoiceData(normalized);

      const prodArr = Array.isArray(pureInvoice.products) ? pureInvoice.products : [];
      if (prodArr.length > 0) {
        setProducts(
          prodArr.map((p: any) => ({
            name: String(p.name ?? p.product ?? p.productName ?? ''),
            inventory: String(p.inventory ?? p.inventoryId ?? ''),
            code: String(p.code ?? ''),
            units: (p.quantity ?? p.units ?? p.unitsCount ?? '').toString(),
            delivered: (p.deliveredQuantity ?? p.delivered ?? p.deliveredQty ?? '').toString(),
            price: (p.price ?? p.unitPrice ?? '').toString(),
            tax: (p.tax ?? '').toString(),
            total: (p.total ?? p.lineTotal ?? '').toString(),
          }))
        );
      } else {
        setProducts([
          { name: '', inventory: '', code: '', units: '', delivered: '', price: '', tax: '', total: '' }
        ]);
      }
    } catch (err) {
      console.error('loadInvoice error', err);
      setInvoiceData(null);
      setProducts([
        { name: '', inventory: '', code: '', units: '', delivered: '', price: '', tax: '', total: '' }
      ]);
    }
  };

  useEffect(() => {
    if (id) {
      void loadInvoice();
    }
  }, [id]);

  const calculateTotal = () => {
    return products.reduce((sum, product) => {
      const total = parseFloat(product.total) || 0;
      return sum + total;
    }, 0).toFixed(2);
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Download PDF handler (using browser print to PDF)
  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading_invoice')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header - Hidden in print */}
      <div className="mb-6 no-print">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>{t('dashboard')}</span>
          <span>›</span>
          <span>{t('inventory')}</span>
          <span>›</span>
          <span>{t('stock_in')}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('precious_management')}</h1>
      </div>

      {/* Invoice Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg print-area">
        {/* Invoice Header */}
        <div className="bg-[#4a5f7a] text-white px-6 py-4 rounded-t-lg flex items-center justify-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-lg font-semibold">{t('invoice')}</span>
        </div>

        <div className="p-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('order_number')}:</label>
              <input
                type="text"
                value={invoiceData?.invoiceNumber ?? invoiceData?._id ?? ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('order_date')}:</label>
              <input
                type="text"
                value={invoiceData?.createdAt ? new Date(invoiceData.createdAt).toLocaleString() : (invoiceData?.orderDate ?? '')}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>

          {/* Supplier and Company Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Supplier */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{t('supplier')}</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('supplier_id')}:</label>
                  <input
                    type="text"
                    value={String(invoiceData?.supplier ?? invoiceData?.supplierId ?? '')}
                    readOnly
                    className="w-full px-2 py-1 text-sm border-b border-gray-200 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('invoice_id')}:</label>
                  <input
                    type="text"
                    value={String(invoiceData?._id ?? '')}
                    readOnly
                    className="w-full px-2 py-1 text-sm border-b border-gray-200 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('payment_status')}:</label>
                  <input
                    type="text"
                    value={String(invoiceData?.paymentStatus ?? '')}
                    readOnly
                    className="w-full px-2 py-1 text-sm border-b border-gray-200 bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{t('organization_order')}</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('organization_id')}:</label>
                  <input
                    type="text"
                    value={String(invoiceData?.organization ?? '')}
                    readOnly
                    className="w-full px-2 py-1 text-sm border-b border-gray-200 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('purchase_order_id')}:</label>
                  <input
                    type="text"
                    value={String(invoiceData?.pruchaseOrder ?? invoiceData?.purchaseOrder ?? '')}
                    readOnly
                    className="w-full px-2 py-1 text-sm border-b border-gray-200 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('last_updated')}:</label>
                  <input
                    type="text"
                    value={invoiceData?.updatedAt ? new Date(invoiceData.updatedAt).toLocaleString() : ''}
                    readOnly
                    className="w-full px-2 py-1 text-sm border-b border-gray-200 bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Requested Products */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">{t('requested_products')}</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '15%'}}>{t('product')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '12%'}}>{t('inventory_column')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '10%'}}>{t('code')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '8%'}}>{t('units')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '10%'}}>{t('delivered')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '12%'}}>{t('price')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '8%'}}>{t('tax')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '12%'}}>{t('total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-3 py-2"><div className="text-sm break-words">{product.name}</div></td>
                      <td className="px-3 py-2"><div className="text-sm break-words">{product.inventory}</div></td>
                      <td className="px-3 py-2"><div className="text-sm break-words">{product.code}</div></td>
                      <td className="px-3 py-2"><div className="text-sm">{product.units}</div></td>
                      <td className="px-3 py-2"><div className="text-sm">{product.delivered}</div></td>
                      <td className="px-3 py-2"><div className="text-sm">{product.price}</div></td>
                      <td className="px-3 py-2"><div className="text-sm">{product.tax}</div></td>
                      <td className="px-3 py-2"><div className="text-sm">{product.total}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-2">
              <div className="text-sm font-medium text-gray-700">
                {t('total')}: <span className="ml-2">{calculateTotal()} SR</span>
              </div>
            </div>
          </div>

          {/* Notes and Payment */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{t('notes')}</label>
              <textarea
                rows={4}
                value={invoiceData?.notes ?? invoiceData?.note ?? ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{t('payment')}</label>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('tax')}:</span>
                  <input
                    type="text"
                    value={String(invoiceData?.tax ?? '0')}
                    readOnly
                    className="w-32 px-2 py-1 text-right bg-gray-50"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('shipping')}:</span>
                  <input
                    type="text"
                    value={String(invoiceData?.shipping ?? '0')}
                    readOnly
                    className="w-32 px-2 py-1 text-right bg-gray-50"
                  />
                </div>
                <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                  <span>{t('total_payment')}:</span>
                  <input
                    type="text"
                    value={String(invoiceData?.totalPayment ?? '0')}
                    readOnly
                    className="w-32 px-2 py-1 text-right bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('reported_by')}:</label>
              <input
                type="text"
                value={invoiceData?.reportedBy ?? ''}
                readOnly
                className="w-full px-2 py-1 text-sm border-b border-gray-300 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('approved_by')}:</label>
              <input
                type="text"
                value={invoiceData?.approvedBy ?? ''}
                readOnly
                className="w-full px-2 py-1 text-sm border-b border-gray-300 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('received_by')}:</label>
              <input
                type="text"
                value={invoiceData?.receivedBy ?? ''}
                readOnly
                className="w-full px-2 py-1 text-sm border-b border-gray-300 bg-gray-50"
              />
            </div>
          </div>

          {/* Action Buttons - Hidden in print */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t no-print">
            <button 
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={handlePrint}
            >
              {t('print')}
            </button>
            <button 
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={handleDownloadPDF}
            >
              {t('download_pdf')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Print styles injection (unchanged)
const printStyles = `
  @media print {
    body * { visibility: hidden; }
    .print-area, .print-area * { visibility: visible; }
    .print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0 !important; padding: 0 !important; font-size: 8px !important; box-shadow: none !important; border-radius: 0 !important; }
    .no-print { display: none !important; }
    input, textarea { border: none !important; background: transparent !important; padding: 1px 0 !important; font-weight: 500; font-size: 8px !important; }
    .rounded-md, .rounded-lg { border-radius: 0 !important; }
    .shadow-lg { box-shadow: none !important; }
    .overflow-x-auto { overflow: visible !important; }
    table { width: 100% !important; table-layout: fixed !important; font-size: 7.5px !important; }
    th, td { padding: 2px 1px !important; font-size: 7.5px !important; word-wrap: break-word !important; overflow: hidden !important; }
    th:nth-child(1), td:nth-child(1) { width: 14% !important; }
    th:nth-child(2), td:nth-child(2) { width: 11% !important; }
    th:nth-child(3), td:nth-child(3) { width: 9% !important; }
    th:nth-child(4), td:nth-child(4) { width: 7% !important; }
    th:nth-child(5), td:nth-child(5) { width: 9% !important; }
    th:nth-child(6), td:nth-child(6) { width: 12% !important; }
    th:nth-child(7), td:nth-child(7) { width: 7% !important; }
    th:nth-child(8), td:nth-child(8) { width: 12% !important; }
    table .break-words { word-break: break-word !important; white-space: normal !important; }
    .border-b { border-bottom: 1px solid #e5e7eb !important; }
  }
  @page { margin: 0.3cm; size: A4 landscape; }
`;

if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = printStyles;
  document.head.appendChild(styleTag);
}

export default InvoiceScreen;
