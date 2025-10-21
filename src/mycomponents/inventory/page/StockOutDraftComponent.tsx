import React from 'react';
import { Eye, FileText, Download } from 'lucide-react';

const StockOutDraftComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-500">Dashboard &gt; Inventory &gt; Stock in</p>
      </div>

      {/* Main Form */}
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm">
        {/* Draft Status Header */}
        <div className="bg-slate-700 text-white px-6 py-3 rounded-t-lg flex items-center justify-center gap-2">
          <Eye className="w-5 h-5" />
          <span className="font-medium">Draft</span>
        </div>

        <div className="p-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice number:</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date:</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full" />
            </div>
          </div>

          {/* Customer and Company Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Customer Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name:</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone number:</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full" />
                </div>
              </div>
            </div>

            {/* Company Info Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requested By:</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse:</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address:</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date:</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Requested Products Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Requested Products</h2>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">Product</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">Inventory</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">Code</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">Units</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">Price</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">Discount</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-gray-400 text-sm">
                      No products added yet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes and Total Payment */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Notes</h3>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm" rows={4}></textarea>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Total Payment</h3>
              <div className="border border-gray-300 rounded-md px-3 py-2 h-24 bg-gray-50"></div>
            </div>
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
          <div className="flex justify-end gap-3">
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button className="px-6 py-2 bg-amber-400 text-gray-900 rounded-full text-sm hover:bg-amber-500 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Edit
            </button>
            <button className="px-6 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-blue-800 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="px-6 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-blue-800">
              Save Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockOutDraftComponent;