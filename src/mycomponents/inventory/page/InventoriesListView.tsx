import React, { useState } from 'react';
import { Search, RotateCcw, MapPin, Calendar } from 'lucide-react';

interface Inventory {
  id: string;
  name: string;
  location: string;
  capacity: string;
  lastUpdate: string;
  image: string;
}

interface InventoriesListViewProps {
  onAddProduct?: () => void;
  onInventoryClick?: (id: string) => void;
}

const InventoriesListView: React.FC<InventoriesListViewProps> = ({ 
  onAddProduct, 
  onInventoryClick 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(6);

  const inventories: Inventory[] = [
    {
      id: '#1346HC',
      name: 'Dakahlia Master',
      location: 'Mansura, Sandob',
      capacity: '18/90',
      lastUpdate: '10 NOV 2024',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop'
    },
    {
      id: '#1346HC',
      name: 'Inventory Name',
      location: 'Location',
      capacity: '',
      lastUpdate: '',
      image: ''
    },
    {
      id: '#1346HC',
      name: 'Inventory Name',
      location: 'Location',
      capacity: '',
      lastUpdate: '',
      image: ''
    },
    {
      id: '#1346HC',
      name: 'Inventory Name',
      location: 'Location',
      capacity: '',
      lastUpdate: '',
      image: ''
    }
  ];

  const totalInventories = 24;
  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalInventories);

  const handleInventoryClick = (id: string) => {
    if (onInventoryClick) onInventoryClick(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>Dashboard</span>
            <span>›</span>
            <span className="text-gray-700">Inventories</span>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <button
              onClick={onAddProduct}
              className="px-5 py-2 bg-slate-700 text-white rounded-full hover:bg-blue-800 transition-colors flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Add Product
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Inventory Search</h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search Inventory by name, id, or location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Inventories</h2>
          <span className="text-sm text-gray-500">
            Showing {startEntry}-{endEntry} of {totalInventories} Inventory
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {inventories.map((inventory, index) => (
            <div
              key={`${inventory.id}-${index}`}
              onClick={() => handleInventoryClick(inventory.id)}
              className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="h-40 bg-gray-200 overflow-hidden">
                {inventory.image ? (
                  <img
                    src={inventory.image}
                    alt={inventory.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-amber-100"></div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{inventory.name}</h3>
                  <span className="text-xs text-gray-500">{inventory.id}</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{inventory.location}</span>
                  </div>
                  {inventory.capacity && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-gray-400 rounded-sm"></div>
                      </div>
                      <span>{inventory.capacity}</span>
                    </div>
                  )}
                  {inventory.lastUpdate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span>Last Updated: {inventory.lastUpdate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-full px-2 py-1"
            >
              <option value="6">6</option>
              <option value="12">12</option>
              <option value="24">24</option>
            </select>
            <span>entries</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-3 py-1 rounded-full ${
                currentPage === 1 ? 'bg-blue-900 text-white' : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`px-3 py-1 rounded-full ${
                currentPage === 2 ? 'bg-blue-900 text-white' : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`px-3 py-1 rounded-full ${
                currentPage === 3 ? 'bg-blue-900 text-white' : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              3
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoriesListView;