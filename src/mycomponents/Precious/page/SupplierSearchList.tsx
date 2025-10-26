import React from 'react';
import { Search, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const SupplierSearchList = () => {
  const suppliers = [
    { name: 'Ninja Gyd', address: 'Alghref st, 1st Nasr City', email: 'adsnwha@gmail.com', phone: '01092783654', logo: null },
    { name: 'Osman Taylor', address: 'Mokhtayam 12, al obour', email: 'ajaooadk@gmail.com', phone: '01587268393', logo: null },
    { name: 'Fresh Electronics', address: '4 madersh St. Rehab', email: 'dkadjad@hasda.com', phone: '01187765654', logo: 'FRESH' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Precious Management</h1>
            <p className="text-sm text-gray-500">Dashboard &gt; Precious</p>
          </div>
          <Link
            to="/dashboard/precious/supplier/new"
            className="bg-gray-800 hover:bg-blue-800 text-white px-4 py-2 rounded-full flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Supplier
          </Link>
        </div>

        {/* Supplier Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Supplier Search</h2>
            <button className="text-gray-400">▼</button>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name, phone, or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="bg-gray-800 hover:bg-blue-800 text-white px-6 py-2 rounded-full flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        {/* Supplier Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Supplier</h2>
              <p className="text-sm text-gray-500">Showing 1-10 of 247 Supplier</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Address</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <Link
                          to="/dashboard/precious/supplier"
                          className="flex items-center gap-3"
                        >
                          {supplier.logo ? (
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">⚡ FRESH</span>
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          )}
                          <span className="font-medium text-gray-900">{supplier.name}</span>
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{supplier.address}</td>
                      <td className="py-4 px-4 text-gray-600">{supplier.email}</td>
                      <td className="py-4 px-4 text-gray-600">{supplier.phone}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Link
                            to="/dashboard/precious/supplier/edit"
                            className="text-blue-600 hover:text-blue-800 rounded-full p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button className="text-red-600 hover:text-red-800 rounded-full p-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show</span>
                <select className="border border-gray-300 rounded-full px-2 py-1 text-sm">
                  <option>10</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600">Previous</button>
                <button className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600">2</button>
                <button className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600">3</button>
                <button className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierSearchList;