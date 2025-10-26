import React, { useState } from "react";

// ✅ أولاً: نعرف نوع البيانات
type PreciousItem = {
  orderNumber: string;
  supplier: string;
  inventory: string;
  totalPrice: string;
  requestedBy: string;
  orderTime: string;
  action: string;
};

// ✅ ثانياً: نحدد أنواع الحالات (التبويبات)
type TabType = "draft" | "approved" | "delivered";

// ✅ ثالثاً: نُعرّف الداتا بشكل مضبوط
const preciousData: Record<TabType, PreciousItem[]> = {
  draft: [
    {
      orderNumber: "3523543235",
      supplier: "GCC",
      inventory: "Market Detricks",
      totalPrice: "10",
      requestedBy: "Mahmoud Magdy",
      orderTime: "2:13pm",
      action: "Approve",
    },
    {
      orderNumber: "093599362",
      supplier: "Abujo",
      inventory: "New Capital",
      totalPrice: "10",
      requestedBy: "Mahmoud Magdy",
      orderTime: "2 oct 2025",
      action: "Approve",
    },
    {
      orderNumber: "23512x223",
      supplier: "Fresh",
      inventory: "Abu Station",
      totalPrice: "10",
      requestedBy: "Mahmoud Magdy",
      orderTime: "3 NOV 2025",
      action: "Approve",
    },
  ],
  approved: [
    {
      orderNumber: "3523543235",
      supplier: "GCC",
      inventory: "Market Detricks",
      totalPrice: "10",
      requestedBy: "Mahmoud Magdy",
      orderTime: "2:13pm",
      action: "Delivered",
    },
    {
      orderNumber: "093599362",
      supplier: "Abujo",
      inventory: "New Capital",
      totalPrice: "10",
      requestedBy: "Mahmoud Magdy",
      orderTime: "2 oct 2025",
      action: "Delivered",
    },
    {
      orderNumber: "23512x223",
      supplier: "Fresh",
      inventory: "Abu Station",
      totalPrice: "10",
      requestedBy: "Mahmoud Magdy",
      orderTime: "3 NOV 2025",
      action: "Delivered",
    },
  ],
  delivered: [
    {
      orderNumber: "3523543235",
      supplier: "GCC",
      inventory: "Market Detricks",
      totalPrice: "10",
      requestedBy: "Mahmoud Magdy",
      orderTime: "2:13pm",
      action: "Invoice",
    },
    {
      orderNumber: "093599362",
      supplier: "Abujo",
      inventory: "New Capital",
      totalPrice: "10",
      requestedBy: "Mahmoud Magdy",
      orderTime: "2 oct 2025",
      action: "Invoice",
    },
    {
      orderNumber: "23512x223",
      supplier: "Fresh",
      inventory: "Abu Station",
      totalPrice: "10",
      requestedBy: "Mahmoud Magdy",
      orderTime: "3 NOV 2025",
      action: "Invoice",
    },
  ],
};

const PreciousManagement = () => {
  // ✅ نحدد نوع الحالة هنا علشان TypeScript يعرف المفاتيح اللي مسموح بيها
  const [activeTab, setActiveTab] = useState<TabType>("draft");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const data = preciousData[activeTab];
  const totalPages = Math.ceil(data.length / itemsPerPage);
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Precious Management</h1>
        <div className="text-sm text-gray-500">Dashboard {'>'} Inventory {'>'} Precious</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('draft')}
          className={`px-6 py-2 rounded-full transition-colors ${
            activeTab === 'draft'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Draft
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-6 py-2 rounded-full transition-colors ${
            activeTab === 'approved'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          className={`px-6 py-2 rounded-full transition-colors ${
            activeTab === 'delivered'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Delivered
        </button>
      </div>

      {/* Info Text */}
      <div className="text-right text-sm text-gray-500 mb-4">
        Showing 1-10 of 247 products
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3 font-medium">Order number</th>
                <th className="pb-3 font-medium">Supplier</th>
                <th className="pb-3 font-medium">Inventory</th>
                <th className="pb-3 font-medium">Total Price</th>
                <th className="pb-3 font-medium">Requested by</th>
                <th className="pb-3 font-medium">Order Time</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-4 text-sm">{item.orderNumber}</td>
                  <td className="py-4 text-sm">{item.supplier}</td>
                  <td className="py-4 text-sm text-blue-600">{item.inventory}</td>
                  <td className="py-4 text-sm">{item.totalPrice}</td>
                  <td className="py-4 text-sm">{item.requestedBy}</td>
                  <td className="py-4 text-sm">{item.orderTime}</td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button className="px-4 py-1.5 text-sm text-white bg-slate-700 rounded-full hover:bg-slate-800 transition-colors">
                        {item.action}
                      </button>
                      <button className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        view
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2 text-sm">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-4 py-1.5 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-slate-700"
            >
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-full ${
                  currentPage === page
                    ? 'bg-slate-700 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition-colors">
          Save Order
        </button>
      </div>
    </div>
  );
};

export default PreciousManagement;