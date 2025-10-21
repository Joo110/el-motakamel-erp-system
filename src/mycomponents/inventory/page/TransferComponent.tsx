import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';

interface TransferredProduct {
  id: string;
  name: string;
  code: string;
  units: number;
  from: string;
  to: string;
}

const TransferComponent: React.FC = () => {
  const [products] = useState<TransferredProduct[]>([
    { id: '1', name: 'Product 1', code: '99282', units: 10, from: 'Wherehouse', to: 'Wherehouse2' },
    { id: '2', name: 'Product 2', code: '322-14', units: 10, from: 'Wherehouse', to: 'Wherehouse2' },
    { id: '3', name: 'Wireless Bluetooth Earbuds', code: '326x1', units: 10, from: 'Wherehouse', to: 'Wherehouse2' },
    { id: '4', name: 'Product 2', code: '322-14', units: 10, from: 'Wherehouse', to: 'Wherehouse2' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-500">Dashboard &gt; Inventory &gt; Transfer</p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Top Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Transfer</h2>
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
              <div className="relative">
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8" />
                <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transfer from</label>
              <div className="relative">
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8" />
                <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <div className="relative flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="relative flex-1">
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8" />
                  <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
              Reset
            </button>
            <button className="px-4 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-blue-800">
              Transfer
            </button>
          </div>
        </div>

        {/* Transferred Products Section */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Transferred Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-600 pb-3 w-8"></th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Product</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Code</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Units</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">From</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">To</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100">
                    <td className="py-3">
                      <input type="checkbox" className="w-4 h-4 rounded-full border-gray-300" />
                    </td>
                    <td className="py-3 text-sm text-gray-900">{product.name}</td>
                    <td className="py-3 text-sm text-gray-600">{product.code}</td>
                    <td className="py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {product.units}
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{product.from}</td>
                    <td className="py-3 text-sm text-gray-600">{product.to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            Save Transfer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferComponent;