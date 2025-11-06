import React, { useState, useEffect, useMemo } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventories } from '@/mycomponents/inventory/hooks/useInventories';
import axiosClient from '@/lib/axiosClient';
import { toast } from 'react-hot-toast';

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
  raw?: any;
}

interface InventoryDetailsViewProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

interface RawStock {
  _id?: string;
  product?: any;
  productId?: any;
  quantity?: number | string;
  inventoryId?: string;
  name?: string;
}

const InventoryDetailsView: React.FC<InventoryDetailsViewProps> = ({ onEdit }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
const { inventories, getStocks, isLoading, remove, isMutating } = useInventories();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [products, setProducts] = useState<Product[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editLoading, setEditLoading] = useState(false);

  const inventory = useMemo(() => {
    return inventories.find((inv) => (inv as any)._id === id);
  }, [inventories, id]);

  useEffect(() => {
    if (id && inventory) {
      loadStocks();
    } else {
      setProducts([]);
    }
  }, [id, inventory, inventories, getStocks]);

  const loadStocks = async () => {
    if (!id) return;
    setStocksLoading(true);
    try {
      const stocksData = await getStocks(id);

      const stocksArray: RawStock[] = (() => {
        if (!stocksData) return [];
        if (Array.isArray(stocksData)) return stocksData;
        if (Array.isArray(stocksData.stocks)) return stocksData.stocks;
        if (Array.isArray(stocksData.data)) return stocksData.data;
        if (Array.isArray(stocksData.data?.stocks)) return stocksData.data.stocks;
        if (Array.isArray(stocksData.result)) return stocksData.result;
        if (Array.isArray(stocksData.data?.result)) return stocksData.data.result;
        return [];
      })();

      const mappedProducts: Product[] = stocksArray.map((stock, idx) => {
        const prod = stock.product ?? stock.productId ?? {};
        const priceVal = prod?.price ? Number(prod.price) : 0;
        const qty = typeof stock.quantity === 'number' ? stock.quantity : Number(stock.quantity || 0);

        return {
          id: stock._id || stock._id || `prod-${idx}`,
          name: prod?.name || stock.name || 'Unknown Product',
          category: (prod?.category && typeof prod.category === 'object' ? prod.category.name : prod?.category) || 'N/A',
          units: prod?.sku || 'N/A',
          unitCount: qty,
          price: `${priceVal.toFixed(2)} SR`,
          priceValue: priceVal,
          total: `${(qty * priceVal).toFixed(2)} SR`,
          totalValue: qty * priceVal,
          raw: stock,
        };
      });

      setProducts(mappedProducts);
    } catch (err) {
      console.error("Error loading stocks:", err);
      setProducts([]);
    } finally {
      setStocksLoading(false);
    }
  };

  const inventoryData = useMemo(() => {
    if (!inventory) return null;
    const inv = inventory as any;
    const image = inv.image ?? inv.img ?? inv.avatar ?? `https://picsum.photos/seed/${encodeURIComponent(inv._id || 'default')}/400/300`;

    return {
      id: inv._id || 'N/A',
      name: inv.name || 'Unnamed Inventory',
      location: inv.location || 'N/A',
      capacity: typeof inv.capacity === 'number' ? String(inv.capacity) : inv.capacity || 'N/A',
      image
    };
  }, [inventory]);

  const totalProducts = products.length;
  const startEntry = totalProducts === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalProducts);

  const paginatedProducts = useMemo(() => {
    return products.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  }, [products, currentPage, entriesPerPage]);

  const maxPages = Math.max(1, Math.ceil(totalProducts / entriesPerPage));

  const handleEditClickHeader = () => {
    if (onEdit) {
      onEdit();
    } else if (id) {
      navigate(`/dashboard/edit-inventory/${id}`);
    }
  };

const handleDeleteInventory = async () => {
  if (!id) return;
  if (!confirm('Are you sure you want to delete this inventory? This action cannot be undone.')) return;

  try {
    await remove(id);
    navigate('/dashboard/inventories');
  } catch (err) {
    console.error('Error deleting inventory:', err);
    toast.error('Failed to delete inventory');
  }
};

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditQty(product.unitCount);
    setEditPrice(product.priceValue ?? 0);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditQty(0);
    setEditPrice(0);
  };

  const submitEdit = async () => {
    if (!editingProduct || !editingProduct.raw) return;
    const stockId = editingProduct.raw._id || editingProduct.id;
    if (!stockId) {
      alert('Cannot determine stock id for update.');
      return;
    }

    const payload: any = { quantity: Number(editQty) };
    if (!Number.isNaN(Number(editPrice))) payload.price = Number(editPrice);
    if (editingProduct.raw.productId) {
      payload.productId = typeof editingProduct.raw.productId === 'object'
        ? editingProduct.raw.productId._id ?? editingProduct.raw.productId.id
        : editingProduct.raw.productId;
    }
    if (editingProduct.raw.inventoryId) payload.inventoryId = editingProduct.raw.inventoryId;

    try {
      setEditLoading(true);
      const resp = await axiosClient.patch(`/stocks/${stockId}`, payload);
      const updatedStock = resp?.data ?? resp;
      const newQty = Number(updatedStock?.quantity ?? payload.quantity);
      const newPrice = Number(updatedStock?.price ?? payload.price ?? editPrice);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                unitCount: newQty,
                priceValue: newPrice,
                price: `${newPrice.toFixed(2)} SR`,
                totalValue: newQty * newPrice,
                total: `${(newQty * newPrice).toFixed(2)} SR`,
                raw: updatedStock?.data ?? updatedStock ?? p.raw,
              }
            : p
        )
      );
      closeEditModal();
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Failed to update stock. Check console for details.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    if (!confirm('Are you sure you want to delete this product from the inventory?')) return;

    const stockId = p.raw?._id || p.id;
    if (!stockId) {
      setProducts((prev) => prev.filter(x => x.id !== productId));
      return;
    }

    try {
      await axiosClient.delete(`/stocks/${stockId}`);
      setProducts((prev) => prev.filter(x => x.id !== productId));
    } catch (err) {
      console.error('Error deleting stock:', err);
      alert('Failed to delete stock. Check console for details.');
    }
  };

  const handleEditProduct = (productId: string) => {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    openEditModal(p);
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
    onClick={handleEditClickHeader}
    className="px-5 py-2 bg-slate-700 text-white rounded-full hover:bg-blue-800 transition-colors"
  >
    Edit Details
  </button>

  <button
    onClick={handleDeleteInventory}
    disabled={isMutating}
    className="px-5 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
  >
    Delete
  </button>
</div>

              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-600">Id:</span>
                  <span className="ml-2 font-medium">{inventoryData.id}</span>
                </div>
                <div className="w-40 h-27 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={inventoryData.image}
                    alt="Warehouse"
                    className="w-full h-full object-contain object-center bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Inventory Products</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Showing {startEntry}-{endEntry} of {totalProducts} products
              </span>
              {/* === NEW BUTTON (doesn't change other layout) === */}
              <button
                onClick={() => {
                  // navigate to a page to manage/view stocks for this inventory
                  navigate(`/dashboard/addstocktoinventory/${id}`, { state: { inventoryId: id } });
                }}
                className="px-5 py-2 bg-slate-700 text-white rounded-full hover:bg-blue-800 transition-colors"
              >
                Manage Stocks
              </button>
            </div>
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
                        <span className="ml-2">{product.unitCount}</span>
                      </td>
                      <td className="py-4">
                        <span className="ml-2">{product.total}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-gray-600">{product.totalValue.toFixed(2)} SR</span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProduct(product.id)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                            title="Edit product"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                            title="Delete product"
                          >
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

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium mb-4">Edit Product</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Product</label>
                <div className="text-sm text-gray-900">{editingProduct.name}</div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Quantity</label>
                <input
                  type="number"
                  value={editQty}
                  onChange={(e) => setEditQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Price per unit (SR)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  min={0}
                  step="0.01"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 border rounded-full text-sm hover:bg-gray-50"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={submitEdit}
                  className="px-4 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800 disabled:opacity-50"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDetailsView;
