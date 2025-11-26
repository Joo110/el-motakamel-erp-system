import React, { useState, useEffect, useMemo } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventories } from '@/mycomponents/inventory/hooks/useInventories';
import axiosClient from '@/lib/axiosClient';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          id: stock._id || `prod-${idx}`,
          name: prod?.name || stock.name || t('unknown_product'),
          category: (prod?.category && typeof prod.category === 'object' ? prod.category.name : prod?.category) || t('n_a'),
          units: prod?.sku || t('n_a'),
          unitCount: qty,
          price: `${priceVal.toFixed(2)} ${t('currency_sr')}`,
          priceValue: priceVal,
          total: `${(qty * priceVal).toFixed(2)} ${t('currency_sr')}`,
          totalValue: qty * priceVal,
          raw: stock,
        };
      });

      setProducts(mappedProducts);
    } catch (err) {
      console.error(t('failed_load_stocks'), err);
      setProducts([]);
    } finally {
      setStocksLoading(false);
    }
  };

  const inventoryData = useMemo(() => {
    if (!inventory) return null;
    const inv = inventory as any;
    const image =
      inv.image ??
      inv.img ??
      inv.avatar ??
      `https://picsum.photos/seed/${encodeURIComponent(inv._id || 'default')}/400/300`;

    return {
      id: inv._id || t('n_a'),
      name: inv.name || t('unnamed_inventory'),
      location: inv.location || t('n_a'),
      capacity: typeof inv.capacity === 'number' ? String(inv.capacity) : inv.capacity || t('n_a'),
      image,
    };
  }, [inventory, t]);

  const totalProducts = products.length;
  const startEntry = totalProducts === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalProducts);

  const paginatedProducts = useMemo(() => {
    return products.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  }, [products, currentPage, entriesPerPage]);

  const maxPages = Math.max(1, Math.ceil(totalProducts / entriesPerPage));

  const handleEditClickHeader = () => {
    if (onEdit) onEdit();
    else if (id) navigate(`/dashboard/edit-inventory/${id}`);
  };

  const handleDeleteInventory = async () => {
    if (!id) return;
    if (!window.confirm(t('confirm_delete_inventory'))) return;
    try {
      await remove(id);
      navigate('/dashboard/inventories');
    } catch (err) {
      console.error('Error deleting inventory:', err);
      toast.error(t('failed_delete_inventory'));
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
      alert(t('cannot_determine_stock_id'));
      return;
    }

    const payload: any = { quantity: Number(editQty) };
    if (!Number.isNaN(Number(editPrice))) payload.price = Number(editPrice);
    if (editingProduct.raw.productId) {
      payload.productId =
        typeof editingProduct.raw.productId === 'object'
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
                price: `${newPrice.toFixed(2)} ${t('currency_sr')}`,
                totalValue: newQty * newPrice,
                total: `${(newQty * newPrice).toFixed(2)} ${t('currency_sr')}`,
                raw: updatedStock?.data ?? updatedStock ?? p.raw,
              }
            : p
        )
      );
      closeEditModal();
    } catch (err) {
      console.error('Error updating stock:', err);
      alert(t('failed_update_stock'));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    if (!window.confirm(t('confirm_delete_product'))) return;
    const stockId = p.raw?._id || p.id;
    try {
      await axiosClient.delete(`/stocks/${stockId}`);
      setProducts((prev) => prev.filter((x) => x.id !== productId));
    } catch (err) {
      console.error('Error deleting stock:', err);
      toast.error(t('failed_delete_stock'));
    }
  };

  const handleEditProduct = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (p) openEditModal(p);
  };

  if (isLoading || !inventoryData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-500">{t('loading_inventory_details')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
            <span>{t('dashboard')}</span>
            <span>›</span>
            <span>{t('inventories')}</span>
            <span>›</span>
            <span className="text-gray-700">{inventoryData.name}</span>
          </div>
          <h1 className="text-2xl font-bold">{t('inventory_management')}</h1>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">{inventoryData.name}</h2>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-600">{t('location_label')}</span>
                  <span className="ml-2">{inventoryData.location}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('capacity_label')}</span>
                  <span className="ml-2">{inventoryData.capacity}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
              <div className="flex gap-2 sm:gap-3 flex-wrap justify-end">
                <button
                  onClick={handleEditClickHeader}
                  className="px-4 py-2 bg-slate-700 text-white rounded-full hover:bg-blue-800 text-sm"
                >
                  {t('edit_details_btn')}
                </button>
                <button
                  onClick={handleDeleteInventory}
                  disabled={isMutating}
                  className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 text-sm disabled:opacity-50"
                >
                  {t('delete_btn')}
                </button>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="text-xs sm:text-sm">
                  <span className="text-gray-600">{t('id_label')}</span>
                  <span className="ml-1 sm:ml-2 font-medium">{inventoryData.id}</span>
                </div>
                <div className="w-24 sm:w-40 h-20 sm:h-28 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={inventoryData.image}
                    alt="Warehouse"
                    className="w-full h-full object-contain bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold">{t('inventory_products')}</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span className="text-gray-500">
                {t('showing')} {startEntry}-{endEntry} {t('of')} {totalProducts}
              </span>
              <button
                onClick={() => navigate(`/dashboard/addstocktoinventory/${id}`, { state: { inventoryId: id } })}
                className="px-4 py-2 bg-slate-700 text-white rounded-full hover:bg-blue-800"
              >
                {t('manage_stocks')}
              </button>
            </div>
          </div>

          {/* scrollable table */}
          <div className="w-full overflow-x-auto">
            <table className="min-w-max w-full text-xs sm:text-sm">
              <thead className="border-b bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="pb-3 font-medium px-2">{t('product_col')}</th>
                  <th className="pb-3 font-medium px-2">{t('category_col')}</th>
                  <th className="pb-3 font-medium px-2">{t('units_col')}</th>
                  <th className="pb-3 font-medium px-2">{t('price_col')}</th>
                  <th className="pb-3 font-medium px-2">{t('total_col')}</th>
                  <th className="pb-3 font-medium px-2">{t('actions_col')}</th>
                </tr>
              </thead>
              <tbody>
                {stocksLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      {t('loading_products')}
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      {t('no_products_found')}
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr key={product.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-2 flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full" />
                        <span className="truncate max-w-[120px] sm:max-w-none">{product.name}</span>
                      </td>
                      <td className="py-3 px-2">{product.category}</td>
                      <td className="py-3 px-2">{product.unitCount}</td>
                      <td className="py-3 px-2">{product.price}</td>
                      <td className="py-3 px-2">{product.total}</td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => handleEditProduct(product.id)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                            title={t('edit_label')}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                            title={t('delete_product')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="flex flex-wrap items-center justify-between mt-4 gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <span>{t('show_label')}</span>
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
              <span>{t('entries_label')}</span>
            </div>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 border rounded-full hover:bg-gray-50 disabled:opacity-50"
              >
                {t('previous_label')}
              </button>
              {Array.from({ length: Math.min(3, maxPages) }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2 sm:px-3 py-1 rounded-full ${
                    currentPage === pageNum ? 'bg-slate-700 text-white' : 'border hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(maxPages, currentPage + 1))}
                disabled={currentPage >= maxPages}
                className="px-2 sm:px-3 py-1 border rounded-full hover:bg-gray-50 disabled:opacity-50"
              >
                {t('next_label')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* edit modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium mb-4">{t('edit_product_title')}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('product_col')}</label>
                <div className="text-sm text-gray-900">{editingProduct.name}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('edit_quantity_label')}</label>
                <input
                  type="number"
                  value={editQty}
                  onChange={(e) => setEditQty(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('edit_price_label')}</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeEditModal} className="px-4 py-2 bg-gray-200 rounded-full text-sm">
                {t('cancel_label')}
              </button>
              <button
                onClick={submitEdit}
                disabled={editLoading}
                className="px-4 py-2 bg-slate-700 text-white rounded-full text-sm disabled:opacity-50"
              >
                {editLoading ? t('saving_label') : t('save_label')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDetailsView;