// src/mycomponents/inventory/page/TransferDraftComponent.tsx
import React, { useEffect, useState } from 'react';
import { Eye, Download } from 'lucide-react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axiosClient from '@/lib/axiosClient';
import { toast } from 'react-hot-toast';

type StatusType = 'draft' | 'shipping' | 'delivered';

interface InventoryData {
  _id: string;
  name: string;
  location: string;
  capacity: number;
}

interface ProductData {
  _id?: string;
  productId?: any;
  name?: string;
  code?: string;
  quantity?: number;
  unit?: number;
  price?: number;
}

interface TransferData {
  _id: string;
  reference: string;
  from: string;
  to: string;
  products: ProductData[];
  notes?: string;
  status: string;
  shippingCost?: number;
  createdAt: string;
}

const TransferDraftComponent: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [transferData, setTransferData] = useState<TransferData | null>(null);
  const [sourceWarehouse, setSourceWarehouse] = useState<InventoryData | null>(null);
  const [destinationWarehouse, setDestinationWarehouse] = useState<InventoryData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const getInitialStatus = (): StatusType => {
    const stateStatus = location.state?.status;
    if (stateStatus === 'draft' || stateStatus === 'shipping' || stateStatus === 'delivered')
      return stateStatus;

    const params = new URLSearchParams(location.search);
    const q = params.get('status');
    if (q === 'draft' || q === 'shipping' || q === 'delivered')
      return q as StatusType;

    return 'draft';
  };

  const [activeStatus, setActiveStatus] = useState<StatusType>(getInitialStatus());

  // جلب بيانات المخزن
  const fetchInventoryData = async (inventoryId: string): Promise<InventoryData | null> => {
    try {
      const { data } = await axiosClient.get(`/inventories/${inventoryId}`);
      if (data?.status === 'success' && data?.data?.inventory) {
        return data.data.inventory;
      }
      return null;
    } catch (err) {
      console.error('❌ Error fetching inventory:', err);
      return null;
    }
  };

  // جلب بيانات التحويل مباشرة بـ axios
  const fetchTransferData = async (transferId: string) => {
    try {
      // استخدام الـ endpoint الصحيح حسب الـ status
      const { data } = await axiosClient.get(`/stockTransfer/status=${activeStatus}/${transferId}`);

      // محاولة استخراج البيانات من أي structure
      let transfer = null;
      if (data?.data?.trasnfer) {  // ملاحظة: في typo في الباك اند "trasnfer" بدل "transfer"
        transfer = data.data.trasnfer;
      } else if (data?.data?.transfer) {
        transfer = data.data.transfer;
      } else if (data?.data?.stockTransfer) {
        transfer = data.data.stockTransfer;
      } else if (data?.stockTransfer) {
        transfer = data.stockTransfer;
      } else if (data?.data) {
        transfer = data.data;
      } else if (data) {
        transfer = data;
      }

      return transfer;
    } catch (err) {
      console.error('❌ Error fetching transfer:', err);
      throw err;
    }
  };

  // جلب بيانات التحويل
  useEffect(() => {
    const loadTransferData = async () => {
      if (!id) {
        toast.error('Transfer ID is missing');
        setApiError('Transfer ID is missing');
        return;
      }

      setLoading(true);
      setApiError(null);

      try {
        const transfer = await fetchTransferData(id);
        console.log('📦 Transfer data:', transfer);

        if (transfer) {
          setTransferData(transfer);

          // جلب بيانات المخازن
          if (transfer.from) {
            const source = await fetchInventoryData(transfer.from);
            setSourceWarehouse(source);
          } else {
            setSourceWarehouse(null);
          }

          if (transfer.to) {
            const destination = await fetchInventoryData(transfer.to);
            setDestinationWarehouse(destination);
          } else {
            setDestinationWarehouse(null);
          }
        } else {
          toast.error('Transfer not found');
          setApiError('Transfer not found');
          setTransferData(null);
        }
      } catch (err: any) {
        console.error('❌ Error loading transfer:', err);
        const msg = err?.response?.data?.message || err?.message || 'Failed to load transfer data';
        toast.error('Failed to load transfer data');
        setApiError(String(msg));
      } finally {
        setLoading(false);
      }
    };

    loadTransferData();
    // نعيد التحميل لما يتغير الـ status أو id
  }, [id, activeStatus]);

  useEffect(() => {
    const newStatus = getInitialStatus();
    setActiveStatus(newStatus);
  }, [location.key, location.search, JSON.stringify(location.state)]);

  // استخراج اسم المنتج
  const getProductName = (product: ProductData): string => {
    if (product.name) return product.name;
    if (typeof product.productId === 'object' && product.productId?.name)
      return product.productId.name;
    return 'Unknown Product';
  };

  // استخراج كود المنتج
  const getProductCode = (product: ProductData): string => {
    if (product.code) return product.code;
    if (typeof product.productId === 'object' && product.productId?.code)
      return product.productId.code;
    return '-';
  };

  // استخراج الكمية
  const getProductQuantity = (product: ProductData): number => {
    return product.quantity || product.unit || 0;
  };

  // معالجة زر Export/Download
  const handleExport = () => {
    window.print();
  };

  // معالجة زر Cancel
  const handleCancel = () => {
    navigate('/dashboard/transfermanagement');
  };

  // الحصول على النص المناسب للحالة
  const getStatusLabel = (status: StatusType): string => {
    const labels: Record<StatusType, string> = {
      draft: 'Draft',
      shipping: 'Shipping',
      delivered: 'Invoice'
    };
    return labels[status] || 'Draft';
  };

  const headerText = getStatusLabel(activeStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-2">⏳ Loading transfer data...</div>
        </div>
      </div>
    );
  }

  if (!transferData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">❌ Transfer not found</div>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800"
          >
            Back to Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-500">
          Dashboard &gt; Inventory &gt; Transfer {getStatusLabel(activeStatus)}
        </p>
      </div>

      {/* Show API error banner if detected */}
      {apiError && (
        <div className="max-w-5xl mx-auto mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800">
          <strong>Error:</strong> {apiError}
        </div>
      )}

      {/* Main Form */}
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm print-area">
        {/* Status Header */}
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
                value={transferData.reference || '-'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date:</label>
              <input
                type="text"
                value={
                  transferData.createdAt
                    ? new Date(transferData.createdAt).toLocaleDateString('en-GB')
                    : '-'
                }
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
              />
            </div>
          </div>

          {/* Source and Destination Warehouse */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Source Warehouse Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Source Warehouse</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name:</label>
                  <input
                    type="text"
                    value={sourceWarehouse?.name || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location:</label>
                  <input
                    type="text"
                    value={sourceWarehouse?.location || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity:</label>
                  <input
                    type="text"
                    value={sourceWarehouse?.capacity || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Destination Warehouse Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Destination Warehouse</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name:</label>
                  <input
                    type="text"
                    value={destinationWarehouse?.name || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location:</label>
                  <input
                    type="text"
                    value={destinationWarehouse?.location || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity:</label>
                  <input
                    type="text"
                    value={destinationWarehouse?.capacity || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Transferred Products Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transferred Products</h2>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">Product</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">Code</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">Units</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">Price</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">From</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">To</th>
                  </tr>
                </thead>
                <tbody>
                  {!transferData.products || transferData.products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center text-gray-400 text-sm">
                        No products transferred yet
                      </td>
                    </tr>
                  ) : (
                    transferData.products.map((product, index) => (
                      <tr key={product._id || index} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {getProductName(product)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {getProductCode(product)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {getProductQuantity(product)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          ${(product.price || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {sourceWarehouse?.name || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {destinationWarehouse?.name || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shipping Cost */}
          {transferData.shippingCost !== undefined && (
            <div className="mb-8">
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Shipping Cost:</span>
                    <span className="text-sm text-gray-900">${transferData.shippingCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Notes</h3>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
              rows={4}
              value={transferData.notes || ''}
              readOnly
            ></textarea>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Requited By:</label>
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 no-print">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={handleExport}
              className="px-6 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export/Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Print styles (نفس الستايل المستخدم في StockOutDraftComponent)
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

export default TransferDraftComponent;