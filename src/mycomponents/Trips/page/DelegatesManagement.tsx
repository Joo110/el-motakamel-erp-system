import React, { useState } from 'react';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ==================== Page 1: Delegates Management ====================
const DelegatesManagement: React.FC = () => {
  const { t } = useTranslation();
  const [showNewOrder, setShowNewOrder] = useState(false);

  // Sample orders data
  const orders = [
    { orderNumber: '392304.9235', customer: 'EGC', totalPrice: '10', orderTime: '2:13 pm', action: 'Invoice' },
    { orderNumber: '093509302', customer: 'Akarab', totalPrice: '10', orderTime: '2 oct 2025', action: 'Invoice' },
    { orderNumber: '235324223', customer: 'Fresh', totalPrice: '10', orderTime: '3 Nov 2025', action: 'Invoice' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>{t('Dashboard')}</span>
          <span>{'>'}</span>
          <span className="text-gray-700">{t('Delegates')}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('Delegates Management')}</h1>
      </div>

      {/* Trip Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Trip')}</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
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

      {/* New Order Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowNewOrder(!showNewOrder)}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all font-medium"
        >
          <Plus size={20} />
          {t('New Order')}
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('Orders')}</h2>
          <span className="text-sm text-gray-600">{t('Showing 1-10 of 47 products')}</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t('Order number')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t('Customer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t('Total Price')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t('Order Time')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t('Action')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.totalPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.orderTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded transition-all text-sm">
                        {t('view')}
                      </button>
                      <button className="px-4 py-1.5 text-white bg-slate-700 hover:bg-slate-800 rounded transition-all text-sm">
                        {t('Invoice')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer - Pagination */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('Show')}</span>
            <select className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">{t('entries')}</span>
          </div>

          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
              {t('Previous')}
            </button>
            <button className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded">1</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">2</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">3</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
              {t('Next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== Page 2: Sales Management ====================
const SalesManagement: React.FC = () => {
  const { t } = useTranslation();
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>{t('Dashboard')}</span>
          <span>{'>'}</span>
          <span>{t('Inventory')}</span>
          <span>{'>'}</span>
          <span className="text-gray-700">{t('Stock out')}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('Sales Management')}</h1>
      </div>

      {/* Stock Out Card */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-blue-400 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t('Stock out')}</h2>
          <div className="flex gap-8">
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('Invoice number:')}</label>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('Created by')}</label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">{t('Customer')}</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white">
              <option value="">{t('Select customer...')}</option>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Add Products')}</h2>
        
        <div className="grid grid-cols-6 gap-3 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">{t('Product')}</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">{t('Select...')}</option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
              readOnly
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium">
            {t('Cancel')}
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all font-medium">
            <Plus size={18} />
            {t('Add Product')}
          </button>
        </div>
      </div>

      {/* Received Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('Received Products')}</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-12">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('Product')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('Inventory')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('Code')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('Units')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('Price')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('Discount')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('Total')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-12"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{product.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{product.inventory}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{product.code}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{product.units}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{product.price}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{product.discount}</td>
                  <td className="px-4 py-4 text-sm text-gray-900 font-medium">{product.total}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <div className="text-right">
            <span className="text-sm text-gray-600 mr-4">{t('Total')}:</span>
            <span className="text-lg font-bold text-gray-900">{calculateTotal()} SR</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Notes')}</h2>
        <textarea
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          placeholder={t('Add notes here...')}
        />
      </div>
    </div>
  );
};

// ==================== Main App Component ====================
const App: React.FC = () => {
      const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState<'delegates' | 'sales'>('delegates');

  return (
    <div>
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-4">
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

      {/* Page Content */}
      {currentPage === 'delegates' ? <DelegatesManagement /> : <SalesManagement />}
    </div>
  );
};

export default App;
