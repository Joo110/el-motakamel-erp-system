import React, { useState } from 'react';
import { Calendar, ChevronDown, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  inventory: string;
  code: string;
  units: number;
  price: number;
  discount: number;
  total: number;
}

const StockInComponent: React.FC = () => {
  const [products] = useState<Product[]>([
    { id: '1', name: 'Product 1', inventory: 'Abu Dhabi', code: '99282', units: 10, price: 1140.95, discount: 13, total: 9990.0 },
    { id: '2', name: 'Product 2', inventory: 'Abu Dhabi', code: '322-14', units: 10, price: 1710.55, discount: 13, total: 9400.0 },
    { id: '3', name: 'Wireless Bluetooth Earbuds', inventory: 'New capital', code: '326x1', units: 10, price: 1102.55, discount: 11, total: 9400.0 },
    { id: '4', name: 'Product 2', inventory: 'Abu Dhabi', code: '322-14', units: 10, price: 1710.55, discount: 23, total: 9400.0 },
  ]);

  const total = products.reduce((sum, product) => sum + product.total, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-500">Dashboard &gt; Inventory &gt; Stock in</p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Top Section */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
            <div className="relative">
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8" />
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date</label>
            <div className="relative">
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8" />
              <Calendar className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Date</label>
            <div className="relative">
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8" />
              <Calendar className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <div className="relative">
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8" />
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Add Products Section */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add Products</h2>
          <div className="grid grid-cols-7 gap-3 items-end">
            <div className="relative">
              <label className="block text-xs text-gray-600 mb-1">Product</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm" />
              <ChevronDown className="absolute right-2 top-8 w-4 h-4 text-gray-400" />
            </div>
            <div className="relative">
              <label className="block text-xs text-gray-600 mb-1">Inventory</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm" />
              <ChevronDown className="absolute right-2 top-8 w-4 h-4 text-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Code</label>
              <input type="text" defaultValue="96060" className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm" />
            </div>
            <div className="relative">
              <label className="block text-xs text-gray-600 mb-1">Units</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full pr-6 text-sm" />
              <ChevronDown className="absolute right-2 top-8 w-4 h-4 text-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Price</label>
              <input type="text" defaultValue="SR" className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Discount</label>
              <input type="text" defaultValue="%" className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Total</label>
              <input type="text" defaultValue="9990.00 SR" className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm" readOnly />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
              Reset
            </button>
            <button className="px-4 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-blue-800">
              + Add Product
            </button>
          </div>
        </div>

        {/* Received Products Section */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Received Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-600 pb-3 w-8"></th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Product</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Inventory</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Code</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Units</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Price</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Discount</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Total</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100">
                    <td className="py-3">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                    </td>
                    <td className="py-3 text-sm text-gray-900">{product.name}</td>
                    <td className="py-3 text-sm text-gray-600">{product.inventory}</td>
                    <td className="py-3 text-sm text-gray-600">{product.code}</td>
                    <td className="py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {product.units}
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{product.price.toFixed(2)}</td>
                    <td className="py-3 text-sm text-gray-600">{product.discount}%</td>
                    <td className="py-3 text-sm text-gray-900">{product.total.toFixed(2)} SR</td>
                    <td className="py-3">
                      <button className="text-gray-400 hover:text-red-500 rounded-full">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4">
            <div className="text-right">
              <span className="text-sm font-medium text-gray-700">Total: </span>
              <span className="text-sm font-semibold text-gray-900">{total.toFixed(2)} SR</span>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm" rows={4}></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button className="px-6 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-blue-800">
            Save Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockInComponent;