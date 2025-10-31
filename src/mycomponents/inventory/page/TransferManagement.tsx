import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

type TransferItem = {
  transferNumber: string;
  time: string;
  units: string;
  from: string;
  to: string;
  action: string;
};

type StatusType = "pending" | "approved" | "delivered";

const transfersData: Record<StatusType, TransferItem[]> = {
  pending: [
    { transferNumber: '39437043', time: '3/2/25', units: '10', from: 'Warehouse', to: 'Warehouse2', action: 'Approve' },
    { transferNumber: '39449874S', time: '3/2/1', units: '10', from: 'Warehouse', to: 'Warehouse2', action: 'Approve' },
    { transferNumber: '3646864135', time: '2/3x/1', units: '10', from: 'Warehouse', to: 'Warehouse2', action: 'Approve' },
    { transferNumber: '4395593936', time: '3/2/1', units: '10', from: 'Warehouse', to: 'Warehouse2', action: 'Approve' },
  ],
  approved: [
    { transferNumber: '39437043', time: '3/2/25', units: '10', from: 'Warehouse', to: 'Warehouse2', action: 'Delivered' },
    { transferNumber: '39449874S', time: '3/2/1', units: '10', from: 'Warehouse', to: 'Warehouse2', action: 'Delivered' },
    { transferNumber: '3646864135', time: '2/3x/1', units: '10', from: 'Warehouse', to: 'Warehouse2', action: 'Delivered' },
    { transferNumber: '4395593936', time: '3/2/1', units: '10', from: 'Warehouse', to: 'Warehouse2', action: 'Delivered' },
  ],
  delivered: [
    { transferNumber: '39437043', time: '3/2/25', units: '10', from: 'Warehouse', to: 'Warehouse2', action: 'Printed' },
    { transferNumber: '39449874S', time: '3/2/1', units: '10', from: 'Warehouse', to: 'Warehouse2', action: 'Printed' },
    { transferNumber: '3646864135', time: '2/3x/1', units: '10', from: 'Warehouse', to: 'Warehouse2', action: 'Printed' },
    { transferNumber: '4395593936', time: '3/2/1', units: '10', from: 'Warehouse', to: 'Warehouse2', action: 'Printed' },
  ],
};

const TransferManagement = () => {
  const [activeTab, setActiveTab] = useState<StatusType>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const data = transfersData[activeTab];
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Inventory Management</h1>
        <div className="text-sm text-gray-500">Dashboard {'>'} Inventory {'>'} Transfer Management</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-2 rounded-full transition-colors ${
            activeTab === 'pending'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Pending
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3 font-medium">Transfer number</th>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Units</th>
                <th className="pb-3 font-medium">From</th>
                <th className="pb-3 font-medium">To</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: any, index: number) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-4 text-sm">{item.transferNumber}</td>
                  <td className="py-4 text-sm">{item.time}</td>
                  <td className="py-4 text-sm">{item.units}</td>
                  <td className="py-4 text-sm">{item.from}</td>
                  <td className="py-4 text-sm">{item.to}</td>
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
    </div>
  );
};

export default TransferManagement;