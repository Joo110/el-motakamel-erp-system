import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePurchaseInvoices } from '../hooks/useAllinvoices';

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
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header - Hidden in print */}
      <div className="mb-6 no-print">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>Dashboard</span>
          <span>›</span>
          <span>Inventory</span>
          <span>›</span>
          <span>Stock in</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Precious Management</h1>
      </div>

      {/* Invoice Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg print-area">
        {/* Invoice Header */}
        <div className="bg-[#4a5f7a] text-white px-6 py-4 rounded-t-lg flex items-center justify-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-lg font-semibold">Invoice</span>
        </div>

        <div className="p-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order number:</label>
              <input
                type="text"
                value={invoiceData?.invoiceNumber ?? invoiceData?._id ?? ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Date:</label>
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
              <h3 className="font-semibold text-gray-900 mb-3">Supplier</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Supplier ID:</label>
                  <input
                    type="text"
                    value={String(invoiceData?.supplier ?? invoiceData?.supplierId ?? '')}
                    readOnly
                    className="w-full px-2 py-1 text-sm border-b border-gray-200 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Invoice ID:</label>
                  <input
                    type="text"
                    value={String(invoiceData?._id ?? '')}
                    readOnly
                    className="w-full px-2 py-1 text-sm border-b border-gray-200 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Payment Status:</label>
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
              <h3 className="font-semibold text-gray-900 mb-3">Organization / Order</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Organization ID:</label>
                  <input
                    type="text"
                    value={String(invoiceData?.organization ?? '')}
                    readOnly
                    className="w-full px-2 py-1 text-sm border-b border-gray-200 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Purchase Order ID:</label>
                  <input
                    type="text"
                    value={String(invoiceData?.pruchaseOrder ?? invoiceData?.purchaseOrder ?? '')}
                    readOnly
                    className="w-full px-2 py-1 text-sm border-b border-gray-200 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Last Updated:</label>
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
            <h3 className="font-semibold text-gray-900 mb-3">Requested Products</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '15%'}}>Product</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '12%'}}>Inventory</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '10%'}}>Code</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '8%'}}>Units</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '10%'}}>Delivered</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '12%'}}>Price</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '8%'}}>Tax</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600" style={{width: '12%'}}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-3 py-2">
                        <div className="text-sm break-words">{product.name}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm break-words">{product.inventory}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm break-words">{product.code}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm">{product.units}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm">{product.delivered}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm">{product.price}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm">{product.tax}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm">{product.total}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-2">
              <div className="text-sm font-medium text-gray-700">
                Total: <span className="ml-2">{calculateTotal()} SR</span>
              </div>
            </div>
          </div>

          {/* Notes and Payment */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Notes</label>
              <textarea
                rows={4}
                value={invoiceData?.notes ?? invoiceData?.note ?? ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            {/* Payment */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Payment</label>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <input
                    type="text"
                    value={String(invoiceData?.tax ?? '0')}
                    readOnly
                    className="w-32 px-2 py-1 text-right bg-gray-50"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <input
                    type="text"
                    value={String(invoiceData?.shipping ?? '0')}
                    readOnly
                    className="w-32 px-2 py-1 text-right bg-gray-50"
                  />
                </div>
                <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                  <span>Total Payment:</span>
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
              <label className="block text-xs text-gray-600 mb-1">Reported By:</label>
              <input
                type="text"
                value={invoiceData?.reportedBy ?? ''}
                readOnly
                className="w-full px-2 py-1 text-sm border-b border-gray-300 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Approved By:</label>
              <input
                type="text"
                value={invoiceData?.approvedBy ?? ''}
                readOnly
                className="w-full px-2 py-1 text-sm border-b border-gray-300 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Received By:</label>
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
              Print
            </button>
            <button 
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={handleDownloadPDF}
            >
              Download PDF
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
      margin: 0 !important;
      padding: 0 !important;
      font-size: 8px !important;
      box-shadow: none !important;
      border-radius: 0 !important;
    }
    .no-print {
      display: none !important;
    }
    input, textarea {
      border: none !important;
      background: transparent !important;
      padding: 1px 0 !important;
      font-weight: 500;
      font-size: 8px !important;
    }
    .rounded-md, .rounded-lg {
      border-radius: 0 !important;
    }
    .shadow-lg {
      box-shadow: none !important;
    }

    .overflow-x-auto {
      overflow: visible !important;
    }

    table {
      width: 100% !important;
      table-layout: fixed !important;
      font-size: 7.5px !important;
    }

    th, td {
      padding: 2px 1px !important;
      font-size: 7.5px !important;
      word-wrap: break-word !important;
      overflow: hidden !important;
    }

    /* Adjust column widths for print */
    th:nth-child(1), td:nth-child(1) { width: 14% !important; } /* Product */
    th:nth-child(2), td:nth-child(2) { width: 11% !important; } /* Inventory */
    th:nth-child(3), td:nth-child(3) { width: 9% !important; }  /* Code */
    th:nth-child(4), td:nth-child(4) { width: 7% !important; }  /* Units */
    th:nth-child(5), td:nth-child(5) { width: 9% !important; }  /* Delivered */
    th:nth-child(6), td:nth-child(6) { width: 12% !important; } /* Price */
    th:nth-child(7), td:nth-child(7) { width: 7% !important; }  /* Tax */
    th:nth-child(8), td:nth-child(8) { width: 12% !important; } /* Total */

    table .break-words {
      word-break: break-word !important;
      white-space: normal !important;
    }

    .border-b {
      border-bottom: 1px solid #e5e7eb !important;
    }
  }

  @page {
    margin: 0.3cm;
    size: A4 landscape;
  }
`;

if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = printStyles;
  document.head.appendChild(styleTag);
}

export default InvoiceScreen;