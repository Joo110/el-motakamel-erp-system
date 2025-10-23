import React, { useState, useEffect, useMemo } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventories } from '@/mycomponents/inventory/hooks/useInventories';

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

const InventoryDetailsView: React.FC<InventoryDetailsViewProps> = ({ onEdit }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { inventories, getStocks, isLoading } = useInventories();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [products, setProducts] = useState<Product[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);

  const inventory = useMemo(() => {
    return inventories.find((inv) => (inv as any)._id === id);
  }, [inventories, id]);

  useEffect(() => {
    if (id && inventory) {
      loadStocks();
    }
  }, [id, inventory]);

const loadStocks = async () => {
  if (!id) return;
  
  setStocksLoading(true);
  try {
    const stocksData = await getStocks(id);

    const stocksArray = Array.isArray(stocksData)
      ? stocksData
      : Array.isArray(stocksData?.data)
      ? stocksData.data
      : Array.isArray(stocksData?.data?.stocks)
      ? stocksData.data.stocks
      : [];

    const mappedProducts: Product[] = stocksArray.map((stock: any, idx: number) => ({
      id: stock._id || `prod-${idx}`,
      name: stock.product?.name || 'Unknown Product',
      category: stock.product?.category?.name || 'N/A',
      units: stock.product?.sku || 'N/A',
      unitCount: stock.quantity || 0,
      price: `${stock.product?.price?.toFixed(2) || '0.00'} SR`,
      priceValue: stock.product?.price || 0,
      total: `${(stock.quantity * (stock.product?.price || 0)).toFixed(2)} SR`,
      totalValue: stock.quantity * (stock.product?.price || 0),
    }));
    setProducts(mappedProducts);
  } catch (err) {
    console.error('Error loading stocks:', err);
    setProducts([]);
  } finally {
    setStocksLoading(false);
  }
};


  const inventoryData = useMemo(() => {
    if (!inventory) return null;
    
    const inv = inventory as any;
    return {
      id: inv._id || 'N/A',
      name: inv.name || 'Unnamed Inventory',
      location: inv.location || 'N/A',
      capacity: typeof inv.capacity === 'number' ? String(inv.capacity) : inv.capacity || 'N/A',
      image: `https://picsum.photos/seed/${encodeURIComponent(inv._id || 'default')}/400/300`
    };
  }, [inventory]);

  const totalProducts = products.length;
  const startEntry = totalProducts === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalProducts);
  
  const paginatedProducts = useMemo(() => {
    return products.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  }, [products, currentPage, entriesPerPage]);

  const maxPages = Math.max(1, Math.ceil(totalProducts / entriesPerPage));

  const handleEditClick = () => {
    if (onEdit) {
      onEdit();
    } else if (id) {
      navigate(`/dashboard/edit-inventory/${id}`);
    }
  };


  if (isLoading || !inventoryData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading inventory details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>Dashboard</span>
            <span>›</span>
            <span>Inventories</span>
            <span>›</span>
            <span className="text-gray-700">{inventoryData.name}</span>
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
                  onClick={handleEditClick}
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
                {stocksLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Loading products...
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No products found in this inventory
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm">
              <span>Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
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
              {Array.from({ length: Math.min(3, maxPages) }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-full ${
                    currentPage === pageNum ? 'bg-slate-700 text-white' : 'border hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(maxPages, currentPage + 1))}
                disabled={currentPage >= maxPages}
                className="px-3 py-1 border rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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