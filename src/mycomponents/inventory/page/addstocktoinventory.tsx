import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useProducts } from '../../product/hooks/useProducts';
import { useInventories } from '@/mycomponents/inventory/hooks/useInventories';
import { toast } from 'react-hot-toast';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface StockInPayload {
  productId: string;
  quantity: number;
}

interface AddStockToInventoryProps {
  inventoryId?: string;
}

const AddStockToInventory: React.FC<AddStockToInventoryProps> = ({ inventoryId: propInventoryId }) => {
  const { t } = useTranslation();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('5');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [createdBy, setCreatedBy] = useState<string>('');
  const [shippingFees, setShippingFees] = useState<string>('');
  const [operationDate, setOperationDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { products = [], loading: productsLoading = false } = useProducts() as any;
  const { addStockToInventory } = useInventories();

  // Router hooks
  const location = useLocation();
  const params = useParams<{ inventoryId?: string }>();

  const inventoryId =
    propInventoryId ||
    (location?.state as any)?.inventoryId ||
    params.inventoryId ||
    '690c9832cf15ff51195cc828';

  useEffect(() => {
    console.log('✅ Products loaded:', products);
    console.log('🔎 Resolved inventoryId:', inventoryId);
  }, [products, inventoryId]);

  const handleCancel = () => {
    setSelectedProductId('');
    setQuantity('5');
    setOrderNumber('');
    setCreatedBy('');
    setShippingFees('');
    setOperationDate('');
  };

  const handleSave = async () => {
    try {
      console.group('[StockIn] handleSave START');

      if (!selectedProductId) {
        toast.error(t('please_select_product'));
        console.warn('[StockIn] missing productId');
        console.groupEnd();
        return;
      }

      const qty = Number(quantity);
      if (!qty || qty <= 0) {
        toast.error(t('quantity_gt_zero'));
        console.warn('[StockIn] invalid quantity');
        console.groupEnd();
        return;
      }

      if (!inventoryId) {
        toast.error(t('missing_inventory_id'));
        console.warn('[StockIn] missing inventoryId');
        console.groupEnd();
        return;
      }

      const payload: StockInPayload = {
        productId: selectedProductId,
        quantity: qty,
      };

      console.log('📤 Sending stock in payload:', JSON.stringify(payload, null, 2));
      console.log('Additional form data:', {
        orderNumber,
        createdBy,
        shippingFees,
        operationDate,
        inventoryId,
      });

      setLoading(true);

      const res = await addStockToInventory(inventoryId, selectedProductId, qty);

      console.log('✅ Stock added successfully:', res);
      toast.success(t('stock_saved_success'));

      handleCancel();
      console.groupEnd();
    } catch (err: any) {
      console.error('❌ Stock in error:', err);
      console.error('err.response?.status:', err?.response?.status);
      console.error('err.response?.data:', err?.response?.data);
      toast.error(t('failed_save_stock'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('inventory_management')}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{t('dashboard')}</span>
            <span>›</span>
            <span>{t('inventory')}</span>
            <span>›</span>
            <span>{t('add_stock_to_inventory')}</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('add_stock_to_inventory')}</h2>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('product')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md pr-8 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    disabled={productsLoading}
                  >
                    <option value="">
                      {productsLoading ? t('loading_products') : t('select_product')}
                    </option>
                    {products.map((product: any) => (
                      <option key={product._id || product.id} value={product._id || product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('quantity')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 flex justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !selectedProductId || !quantity}
              className="px-6 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('loading') : t('add_stock_to_inventory')}
            </button>
          </div>
        </div>

        {selectedProductId && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">{t('debug_info')}</h3>
            <pre className="text-xs text-blue-800">
              {JSON.stringify(
                {
                  productId: selectedProductId,
                  quantity: Number(quantity),
                  inventoryId,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStockToInventory;
