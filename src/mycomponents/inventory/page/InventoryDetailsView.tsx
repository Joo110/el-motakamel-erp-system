import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  units: string;
  unitCount: number;
  price: string;
  priceValue: number;
  total: string;
  totalValue: number;
}

interface InventoryDetailsViewProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

const InventoryDetailsView: React.FC<InventoryDetailsViewProps> = ({ onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const inventoryData = {
    id: '#1346HC',
    name: 'Dakahlia Master Inventory',
    location: 'Mansura, Sandob',
    capacity: '18/90',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop'
  };

  const products: Product[] = [
    {
      id: '1',
      name: 'Product 1',
      category: 'Electronics',
      units: '30282',
      unitCount: 10,
      price: '999.00 SR',
      priceValue: 9999,
      total: '19.00 SR',
      totalValue: 19
    },
    {
      id: '2',
      name: 'Product 2',
      category: 'Footwear',
      units: '32214',
      unitCount: 10,
      price: '849.00 SR',
      priceValue: 849,
      total: '11.00 SR',
      totalValue: 11
    },
    {
      id: '3',
      name: 'Wireless Bluetooth Earbuds',
      category: 'Electronics',
      units: '32441',
      unitCount: 10,
      price: '849.00 SR',
      priceValue: 849,
      total: '11.00 SR',
      totalValue: 11
    }
  ];

  const totalProducts = 747;
  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalProducts);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>Dashboard</span>
            <span>›</span>
            <span>Inventories</span>
            <span>›</span>
            <span className="text-gray-700">Dakahlia Master Inventory</span>
          </div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">{inventoryData.name}</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-3">{inventoryData.location}</span>
                </div>
                <div>
                  <span className="text-gray-600">Capacity:</span>
                  <span className="ml-3">{inventoryData.capacity}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="flex gap-3">
                <button
                  onClick={onDelete}
                  className="px-5 py-2 bg-amber-200 text-gray-800 rounded-full hover:bg-amber-300 transition-colors"
                >
                  Delete Inventory
                </button>
                <button
                  onClick={onEdit}
                  className="px-5 py-2 bg-slate-700 text-white rounded-full hover:bg-blue-800 transition-colors"
                >
                  Edit Details
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-600">Id:</span>
                  <span className="ml-2 font-medium">{inventoryData.id}</span>
                </div>
                <div className="w-40 h-24 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={inventoryData.image}
                    alt="Warehouse"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Inventory Products</h2>
            <span className="text-sm text-gray-500">
              Showing {startEntry}-{endEntry} of {totalProducts} products
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Units</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-b-0">
                    <td className="py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <span>{product.name}</span>
                    </td>
                    <td className="py-4">{product.category}</td>
                    <td className="py-4">
                      <span className="text-gray-600">{product.units}</span>
                      <span className="ml-2">{product.unitCount}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-600">{product.price}</span>
                      <span className="ml-2">{product.total}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-600">{product.totalValue.toFixed(2)} SR</span>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded-full">
                          <Edit2 size={18} />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded-full">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm">
              <span>Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded-full px-2 py-1"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className={`px-3 py-1 rounded-full ${
                  currentPage === 1 ? 'bg-slate-700 text-white' : 'border hover:bg-gray-50'
                }`}
              >
                1
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                className={`px-3 py-1 rounded-full ${
                  currentPage === 2 ? 'bg-slate-700 text-white' : 'border hover:bg-gray-50'
                }`}
              >
                2
              </button>
              <button
                onClick={() => setCurrentPage(3)}
                className={`px-3 py-1 rounded-full ${
                  currentPage === 3 ? 'bg-slate-700 text-white' : 'border hover:bg-gray-50'
                }`}
              >
                3
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 border rounded-full hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailsView;