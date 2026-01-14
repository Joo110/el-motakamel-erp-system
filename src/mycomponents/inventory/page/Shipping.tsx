import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStockTransfer } from '../hooks/useStockTransfer';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface FormData {
  shippingFees: string;
  operationDate: string;
}

const Shipping: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const orderId = (location.state as any)?.orderId;

  const [formData, setFormData] = useState<FormData>({
    shippingFees: '',
    operationDate: ''
  });

  const { updateShippingCost, loading } = useStockTransfer();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setFormData({
      shippingFees: '',
      operationDate: ''
    });
  };

  console.log('📦 OrderId from location:', orderId);

  const handleSave = async () => {
    try {
      if (!orderId) {
        toast.error(t('order_id_missing') ?? 'Order ID is missing.');
        return;
      }

      if (!formData.shippingFees) {
        toast.error(t('please_fill_shipping_fees') ?? 'Please fill in the Shipping fees.');
        return;
      }

      const cost = parseFloat(formData.shippingFees);
      if (isNaN(cost)) {
        toast.error(t('shipping_fees_must_number') ?? 'Shipping fees must be a number.');
        return;
      }

      const res = await updateShippingCost(orderId, cost);
      console.log('✅ API Response:', res);

      toast.success(t('shipping_cost_updated') ?? 'Shipping cost updated successfully!');
    } catch (err: any) {
      console.error('❌ Error:', err);
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
            <span>{t('inventories')}</span>
            <span>›</span>
            <span>{t('shipping_label') ?? 'Shipping'}</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">{t('shipping_cost')}</h2>
            {orderId && (
              <span className="text-sm text-gray-500">{t('order_number_label') ?? 'Order #:'} {orderId}</span>
            )}
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('shipping_fees_label') ?? 'Shipping Fees'}
                </label>
                <input
                  type="text"
                  name="shippingFees"
                  value={formData.shippingFees}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('operation_date_label') ?? 'Operation Date'}
                </label>
                <input
                  type="date"
                  name="operationDate"
                  value={formData.operationDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {t('cancel_label')}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50"
            >
              {loading ? t('saving_label') : t('save_transfer_label') ?? 'Save Transfer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
