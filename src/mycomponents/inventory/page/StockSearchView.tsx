import React, { useState } from 'react';
import { Search, RotateCcw, ChevronDown } from 'lucide-react';

interface StockItem {
  id: string;
  name: string;
  category: string;
  inventory: string;
  unitsInventory: number;
  totalUnits: number;
  lastUpdate: string;
}

interface Transaction {
  id: string;
  product: string;
  category: string;
  transNumber: string;
  units: number;
  type: 'In' | 'Out' | 'Transfer';
  from?: string;
  to?: string;
  timeDate: string;
}

const StockSearchView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transfer' | 'stock-out' | 'stock-in'>('transfer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const stockItems: StockItem[] = [
    {
      id: '1',
      name: 'Product 1',
      category: 'Footwear',
      inventory: 'Master Dakahla',
      unitsInventory: 10,
      totalUnits: 25,
      lastUpdate: '2:13 pm'
    },
    {
      id: '2',
      name: 'Wireless Bluetooth Earbuds',
      category: 'Electronics',
      inventory: 'New Capital',
      unitsInventory: 10,
      totalUnits: 20,
      lastUpdate: '2 oct 2025'
    },
    {
      id: '3',
      name: 'Wireless Bluetooth Earbuds',
      category: 'Electronics',
      inventory: 'Alex Station',
      unitsInventory: 10,
      totalUnits: 20,
      lastUpdate: '3 NOV 2025'
    }
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      product: 'Product 1',
      category: 'Footwear',
      transNumber: '126592',
      units: 10,
      type: 'In',
      timeDate: '2:13 pm'
    },
    {
      id: '2',
      product: 'Wireless Bluetooth Earbuds',
      category: 'Electronics',
      transNumber: '126592',
      units: 10,
      type: 'Transfer',
      timeDate: '2 oct 2025'
    },
    {
      id: '3',
      product: 'Wireless Bluetooth Earbuds',
      category: 'Electronics',
      transNumber: '126592',
      units: 10,
      type: 'Out',
      timeDate: '3 NOV 2025'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>Dashboard</span>
            <span>›</span>
            <span className="text-gray-700">Stock</span>
          </div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-6 py-2 rounded-full transition-colors ${
              activeTab === 'transfer'
                ? 'bg-amber-200 text-gray-800'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Transfer
          </button>
          <button
            onClick={() => setActiveTab('stock-out')}
            className={`px-6 py-2 rounded-full transition-colors ${
              activeTab === 'stock-out'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Stock out
          </button>
          <button
            onClick={() => setActiveTab('stock-in')}
            className={`px-6 py-2 rounded-full transition-colors ${
              activeTab === 'stock-in'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Stock in
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Stock Search</h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products by name, code, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-full bg-white focus:outline-none"
              >
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Footwear</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
            <button className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-blue-800 transition-colors flex items-center gap-2">
              <Search size={18} />
              Search
            </button>
            <button className="px-6 py-2 bg-amber-200 text-gray-800 rounded-full hover:bg-amber-300 transition-colors flex items-center gap-2">
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Stock</h2>
            <span className="text-sm text-gray-500">Showing 1-10 of 247 products</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Inventory</th>
                  <th className="pb-3 font-medium">Units/Inventory</th>
                  <th className="pb-3 font-medium">Total Units</th>
                  <th className="pb-3 font-medium">Last update</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <span>{item.name}</span>
                    </td>
                    <td className="py-4">{item.category}</td>
                    <td className="py-4 text-blue-600 underline cursor-pointer">{item.inventory}</td>
                    <td className="py-4">{item.unitsInventory}</td>
                    <td className="py-4">{item.totalUnits}</td>
                    <td className="py-4 text-sm text-gray-600">{item.lastUpdate}</td>
                    <td className="py-4">
                      <button className="px-4 py-1.5 bg-amber-200 text-gray-800 rounded-full hover:bg-amber-300 transition-colors text-sm">
                        Transfer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm">
              <span>Show</span>
              <select className="border border-gray-300 rounded-full px-2 py-1">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded-full hover:bg-gray-50">Previous</button>
              <button className="px-3 py-1 bg-slate-700 text-white rounded-full">1</button>
              <button className="px-3 py-1 border rounded-full hover:bg-gray-50">2</button>
              <button className="px-3 py-1 border rounded-full hover:bg-gray-50">3</button>
              <button className="px-3 py-1 border rounded-full hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Transactions</h2>
            <span className="text-sm text-gray-500">Showing 1-10 of 247 transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Trans. Number</th>
                  <th className="pb-3 font-medium">Units</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">From</th>
                  <th className="pb-3 font-medium">To</th>
                  <th className="pb-3 font-medium">Time/Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((trans) => (
                  <tr key={trans.id} className="border-b last:border-b-0">
                    <td className="py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <span>{trans.product}</span>
                    </td>
                    <td className="py-4">{trans.category}</td>
                    <td className="py-4">{trans.transNumber}</td>
                    <td className="py-4">{trans.units}</td>
                    <td className="py-4">{trans.type}</td>
                    <td className="py-4">{trans.from || '-'}</td>
                    <td className="py-4">{trans.to || '-'}</td>
                    <td className="py-4 text-sm text-gray-600">{trans.timeDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm">
              <span>Show</span>
              <select className="border border-gray-300 rounded-full px-2 py-1">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded-full hover:bg-gray-50">Previous</button>
              <button className="px-3 py-1 bg-slate-700 text-white rounded-full">1</button>
              <button className="px-3 py-1 border rounded-full hover:bg-gray-50">2</button>
              <button className="px-3 py-1 border rounded-full hover:bg-gray-50">3</button>
              <button className="px-3 py-1 border rounded-full hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockSearchView;