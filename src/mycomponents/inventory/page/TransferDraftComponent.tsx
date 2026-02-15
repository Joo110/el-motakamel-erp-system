import React, { useEffect, useState } from 'react';
import { Eye, Download } from 'lucide-react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axiosClient from '@/lib/axiosClient';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
    if (q === 'draft' || q === 'shipping' || q === 'delivered') return q as StatusType;

    return 'draft';
  };

  const [activeStatus, setActiveStatus] = useState<StatusType>(getInitialStatus());

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

  const fetchTransferData = async (transferId: string) => {
    try {
      const { data } = await axiosClient.get(`/stockTransfer/status=${activeStatus}/${transferId}`);

      let transfer = null;
      if (data?.data?.trasnfer) {
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

  useEffect(() => {
    const loadTransferData = async () => {
      if (!id) {
        toast.error(t('transfer_id_missing'));
        setApiError(t('transfer_id_missing'));
        return;
      }

      setLoading(true);
      setApiError(null);

      try {
        const transfer = await fetchTransferData(id);
        console.log('📦 Transfer data:', transfer);

        if (transfer) {
          setTransferData(transfer);

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
          toast.error(t('transfer_not_found'));
          setApiError(t('transfer_not_found'));
          setTransferData(null);
        }
      } catch (err: any) {
        console.error('❌ Error loading transfer:', err);
        const msg = err?.response?.data?.message || err?.message || t('failed_load_transfer');
        toast.error(t('failed_load_transfer'));
        setApiError(String(msg));
      } finally {
        setLoading(false);
      }
    };

    loadTransferData();
  }, [id, activeStatus, t]);

  useEffect(() => {
    const newStatus = getInitialStatus();
    setActiveStatus(newStatus);
  }, [location.key, location.search, JSON.stringify(location.state)]);

  const getProductName = (product: ProductData): string => {
    if (product.name) return product.name;
    if (typeof product.productId === 'object' && product.productId?.name) return product.productId.name;
    return t('unknown_product');
  };

  const getProductCode = (product: ProductData): string => {
    if (product.code) return product.code;
    if (typeof product.productId === 'object' && product.productId?.code) return product.productId.code;
    return '-';
  };

  const getProductQuantity = (product: ProductData): number => {
    return product.quantity || product.unit || 0;
  };

  const handleExport = () => {
    window.print();
  };

  const handleCancel = () => {
    navigate('/dashboard/transfermanagement');
  };

  const getStatusLabel = (status: StatusType): string => {
    const labels: Record<StatusType, string> = {
      draft: t('status_draft'),
      shipping: t('status_shipping'),
      delivered: t('status_delivered'),
    };
    return labels[status] || t('status_draft');
  };

  const headerText = getStatusLabel(activeStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-2">⏳ {t('loading_transfer_data')}</div>
        </div>
      </div>
    );
  }

  if (!transferData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">❌ {t('transfer_not_found')}</div>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800"
          >
            {t('back_to_management')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t('inventory_management')}</h1>
        <p className="text-sm text-gray-500">
          {t('dashboard')} &gt; {t('inventory_management')} &gt; {t('transfer')} {getStatusLabel(activeStatus)}
        </p>
      </div>

      {/* Show API error banner if detected */}
      {apiError && (
        <div className="max-w-5xl mx-auto mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800">
          <strong>{t('error_label')}:</strong> {apiError}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('invoice_number')}</label>
              <input
                type="text"
                value={transferData.reference || '-'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('invoice_date')}</label>
              <input
                type="text"
                value={
                  transferData.createdAt ? new Date(transferData.createdAt).toLocaleDateString('en-GB') : '-'
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('source_warehouse')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('name_label')}</label>
                  <input
                    type="text"
                    value={sourceWarehouse?.name || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('location_label')}</label>
                  <input
                    type="text"
                    value={sourceWarehouse?.location || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('capacity_label')}</label>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('destination_warehouse')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('name_label')}</label>
                  <input
                    type="text"
                    value={destinationWarehouse?.name || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('location_label')}</label>
                  <input
                    type="text"
                    value={destinationWarehouse?.location || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('capacity_label')}</label>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('transferred_products')}</h2>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">{t('product_col')}</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">{t('code_col')}</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">{t('units_col')}</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">{t('price_col')}</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">{t('from_label')}</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">{t('to_label')}</th>
                  </tr>
                </thead>
                <tbody>
                  {!transferData.products || transferData.products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center text-gray-400 text-sm">
                        {t('no_products_transferred')}
                      </td>
                    </tr>
                  ) : (
                    transferData.products.map((product, index) => (
                      <tr key={product._id || index} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-900">{getProductName(product)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{getProductCode(product)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{getProductQuantity(product)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">${(product.price || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{sourceWarehouse?.name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{destinationWarehouse?.name || '-'}</td>
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
                    <span className="text-sm font-medium text-gray-700">{t('shipping_cost')}</span>
                    <span className="text-sm text-gray-900">${transferData.shippingCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 mb-3">{t('notes_label')}</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('requested_by')}</label>
              <div className="w-full h-16 border-b border-gray-300"></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('approved_by')}</label>
              <div className="w-full h-16 border-b border-gray-300"></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('received_by')}</label>
              <div className="w-full h-16 border-b border-gray-300"></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 no-print">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50"
            >
              {t('cancel_label')}
            </button>

            <button
              onClick={handleExport}
              className="px-6 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800 flex items-center gap-2"
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
