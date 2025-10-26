import React, { useEffect, useState } from 'react';
import { Eye, FileText, Download } from 'lucide-react';
import { useLocation } from 'react-router-dom';

type StatusType = 'Draft' | 'Invoice';

const TransferDraftComponent: React.FC = () => {
  const location = useLocation();

  // نحاول نقرأ الحالة من location.state أولًا، بعدين من query param، وإلا نفّض على 'Draft'
  const getInitialStatus = (): StatusType => {
    // 1) check location.state (react-router state)
    const stateStatus = location.state?.status;
    if (stateStatus === 'Draft' || stateStatus === 'Invoice') return stateStatus;

    // 2) check query param ?status=Invoice
    const params = new URLSearchParams(location.search);
    const q = params.get('status');
    if (q === 'Draft' || q === 'Invoice') return q;

    // fallback
    return 'Draft';
  };

  const [activeStatus, setActiveStatus] = useState<StatusType>(getInitialStatus());

  // لو حصل navigation داخلي وغيرنا location، نحدّث الحالة تلقائيًا
  useEffect(() => {
    const newStatus = getInitialStatus();
    setActiveStatus(newStatus);
    // نريد أن يعمل effect عندما يتغير الـ location
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, location.search, JSON.stringify(location.state)]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-500">Dashboard &gt; Inventory &gt; Transfer {activeStatus}</p>
      </div>

      {/* Main Form */}
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm">
        {/* Status Header */}
        <div className="bg-slate-700 text-white px-6 py-3 rounded-t-lg flex items-center justify-center gap-2">
          <Eye className="w-5 h-5" />
          <span className="font-medium">{activeStatus}</span>
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

          {/* Source and Destination Warehouse */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Source Warehouse Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Source Warehouse</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Id:</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location:</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity:</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full" />
                </div>
              </div>
            </div>

            {/* Destination Warehouse Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Destination Warehouse</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Id:</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location:</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity:</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-full" />
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
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">From</th>
                    <th className="text-left text-xs font-medium text-gray-600 px-4 py-3">To</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-gray-400 text-sm">
                      No products transferred yet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Notes</h3>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm" rows={4}></textarea>
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
              Save Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferDraftComponent;
