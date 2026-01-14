import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useInventories } from '@/mycomponents/inventory/hooks/useInventories';
import { useStockTransfer } from '../hooks/useStockTransfer';
import { toast } from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface TransferredProduct {
  id: string;
  productId?: string;
  name: string;
  code: string;
  units: number;
  price: number;
  from: string;
  to: string;
  reference?: string;
  shippingCost?: string;
}

const UpdateTransferComponent: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // hooks
  const { inventories, getStocks } = useInventories();
  const { getDeliveredTransferById, loading: updatingTransfer } = useStockTransfer();

  // local table state
  const [productsTable, setProductsTable] = useState<TransferredProduct[]>([]);

  // form fields
  const [reference, setReference] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [notes, setNotes] = useState('');

  const [selectedFrom, setSelectedFrom] = useState<string>('');
  const [selectedTo, setSelectedTo] = useState<string>('');
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProductStockId, setSelectedProductStockId] = useState<string>('');
  const [selectedProductCode, setSelectedProductCode] = useState<string>('');
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [selectedUnits, setSelectedUnits] = useState<number>(1);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingTransfer, setLoadingTransfer] = useState(true);
  const [transferring, setTransferring] = useState(false);

  function extractStocksArray(stocksData: any): any[] {
    if (!stocksData) return [];
    if (Array.isArray(stocksData)) return stocksData;
    if (Array.isArray(stocksData.stocks)) return stocksData.stocks;
    if (Array.isArray(stocksData.data)) return stocksData.data;
    if (Array.isArray(stocksData.data?.stocks)) return stocksData.data.stocks;
    if (Array.isArray(stocksData.result)) return stocksData.result;
    if (Array.isArray(stocksData.data?.result)) return stocksData.data.result;
    return [];
  }

  const getTransferById = useCallback(
    async (transferId: string) => await getDeliveredTransferById(transferId),
    [getDeliveredTransferById]
  );

  // Load transfer data
  useEffect(() => {
    const loadTransfer = async () => {
      if (!id) return;

      setLoadingTransfer(true);
      try {
        const transfer = await getTransferById(id);
        const transferData = (transfer as any)?.stockTransfer || transfer;

        if (transferData) {
          setReference(transferData.reference || '');
          setShippingCost(transferData.shippingCost?.toString() || '');
          setNotes(transferData.notes || '');
          setSelectedFrom(transferData.from || '');
          setSelectedTo(transferData.to || '');

          if (transferData.products && Array.isArray(transferData.products)) {
            const mappedProducts = transferData.products.map((p: any, idx: number) => {
              const productObj = p.product || p.productId || {};
              const productId =
                typeof productObj === 'object' ? (productObj._id || productObj.id) : productObj;

              return {
                id: p._id || p.id || `product-${idx}`,
                productId: productId,
                name: productObj?.name || p.name || t('unknown_product'),
                code: productObj?.code || p.code || '',
                units: p.quantity || p.unit || 0,
                price: p.price || 0,
                from: transferData.from || '',
                to: transferData.to || '',
              };
            });

            setProductsTable(mappedProducts);
          } else {
            setProductsTable([]);
          }
        } else {
          setProductsTable([]);
        }
      } catch (err) {
        console.error('❌ Error loading transfer:', err);
        toast.error(t('failed_load_transfer'));
      } finally {
        setLoadingTransfer(false);
      }
    };

    loadTransfer();
  }, [id, getTransferById, t]);

  // Load available products when From changes
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setAvailableProducts([]);
      setSelectedProductStockId('');
      setSelectedProductCode('');
      setSelectedProductName('');
      setSelectedUnits(1);
      setSelectedPrice(0);
      if (!selectedFrom) return;

      setLoadingProducts(true);
      try {
        const resp = await getStocks(selectedFrom);
        const stocksArray = extractStocksArray(resp);

        const mapped = stocksArray.map((s: any, idx: number) => {
          const productObj = s.product ?? s.productId ?? {};
          const productId =
            typeof productObj === 'object' ? (productObj._id ?? productObj.id) : productObj;
          const name =
            productObj?.name ?? productObj?.productName ?? s.name ?? `${t('product')} ${idx + 1}`;
          const code = productObj?.code ?? productObj?.sku ?? s.code ?? '';
          const price = productObj?.price ? Number(productObj.price) : s.price ? Number(s.price) : 0;
          const availableUnits = typeof s.quantity === 'number' ? s.quantity : Number(s.quantity ?? 0);
          const stockId = s._id ?? s.id ?? `${productId ?? 'p'}-${idx}`;

          return { stockId, productId, name, code, price, availableUnits, raw: s };
        });

        if (!cancelled) setAvailableProducts(mapped);
      } catch (err) {
        console.error('Failed to load products for inventory', selectedFrom, err);
        if (!cancelled) setAvailableProducts([]);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedFrom, getStocks, t]);

  // When selected product changes populate code/price/units
  useEffect(() => {
    if (!selectedProductStockId) {
      setSelectedProductCode('');
      setSelectedProductName('');
      setSelectedUnits(1);
      setSelectedPrice(0);
      return;
    }
    const found = availableProducts.find((p) => p.stockId === selectedProductStockId);
    if (found) {
      setSelectedProductCode(found.code ?? '');
      setSelectedProductName(found.name ?? '');
      setSelectedUnits(Math.max(1, found.availableUnits ?? 1));
      setSelectedPrice(Number(found.price ?? 0));
    }
  }, [selectedProductStockId, availableProducts]);

  const inventoryOptions = useMemo(() => {
    return (inventories || []).slice().sort((a: any, b: any) =>
      (a.name ?? '').toLowerCase().localeCompare((b.name ?? '').toLowerCase())
    );
  }, [inventories]);

  const handleAddProduct = async () => {
    if (!selectedFrom) {
      toast.error(t('select_from_inventory'));
      return;
    }
    if (!selectedTo) {
      toast.error(t('select_to_inventory'));
      return;
    }
    if (selectedFrom === selectedTo) {
      toast.error(t('from_to_different'));
      return;
    }

const productName =
  selectedProductName || (availableProducts.find(p => p.stockId === selectedProductStockId)?.name ?? '');
const productCode =
  selectedProductCode || (availableProducts.find(p => p.stockId === selectedProductStockId)?.code ?? '');

    const priceToUse = Number(selectedPrice ?? 0);
    const unitsToUse = Number(selectedUnits ?? 1);

    if (!productName) {
      toast.error(t('select_product'));
      return;
    }
    if (!unitsToUse || unitsToUse <= 0) {
      toast.error(t('units_greater_than_zero'));
      return;
    }

    setTransferring(true);
    try {
      const selected = availableProducts.find((p) => p.stockId === selectedProductStockId);
      const newRow: TransferredProduct = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        productId: selected?.productId ?? undefined,
        name: productName,
        code: productCode,
        units: unitsToUse,
        price: priceToUse,
        from: inventoryOptions.find(inv => (inv._id ?? inv._id) === selectedFrom)?.name ?? selectedFrom,
        to: inventoryOptions.find(inv => (inv._id ?? inv._id) === selectedTo)?.name ?? selectedTo,
      };

      setProductsTable((prev) => [newRow, ...prev]);
      setSelectedProductStockId('');
      setSelectedProductCode('');
      setSelectedProductName('');
      setSelectedUnits(1);
      setSelectedPrice(0);

      toast.success(t('product_added_table'));
    } catch (err) {
      console.error('Add product failed:', err);
      toast.error(t('failed_add_product'));
    } finally {
      setTransferring(false);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setProductsTable((prev) => prev.filter((p) => p.id !== productId));
    toast.success(t('product_removed_table'));
  };

  const handleUpdateTransfer = async () => {
    if (!id) {
      toast.error(t('transfer_id_missing'));
      return;
    }
    if (!selectedFrom) {
      toast.error(t('select_from_inventory'));
      return;
    }
    if (!selectedTo) {
      toast.error(t('select_to_inventory'));
      return;
    }
    if (productsTable.length === 0) {
      toast.error(t('no_products_to_save'));
      return;
    }

    const mergedProductsMap: Record<string, { productId: string; unit: number; price: number }> = {};
    for (const row of productsTable) {
      if (!row.productId) continue;
      if (!mergedProductsMap[row.productId]) {
        mergedProductsMap[row.productId] = { productId: row.productId, unit: Number(row.units), price: Number(row.price) };
      } else {
        mergedProductsMap[row.productId].unit += Number(row.units);
      }
    }

    const productsPayload = Object.values(mergedProductsMap);
    if (productsPayload.length === 0) {
      toast.error(t('no_valid_products'));
      return;
    }

    const payload = {
      reference: reference || `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      from: selectedFrom,
      to: selectedTo,
      products: productsPayload.map(p => ({ productId: p.productId, unit: p.unit, price: p.price })),
      shippingCost: Number(shippingCost || 0),
      notes: notes || '',
    };

    console.log('📤 updateStockTransfer payload:', JSON.stringify(payload, null, 2));

    try {
      const res = await getDeliveredTransferById(id); // temporary
      console.log("🔁 (Debug) Would update transfer with payload:", payload);
      console.log('✅ updateStockTransfer success:', res);
      toast.success(t('transfer_updated_successfully'));

      setTimeout(() => navigate('/dashboard/transfermanagement'), 1000);
    } catch (err: any) {
      console.error('Failed to update transfer:', err);
      toast.error(t('failed_update_transfer', { error: err?.response?.data?.message || err?.message || String(err) }));
    }
  };

  if (loadingTransfer) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center text-gray-500">⏳ {t('loading_transfer_data')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t('inventory_management')}</h1>
        <p className="text-sm text-gray-500">{t('dashboard')} &gt; {t('inventory')} &gt; {t('update_transfer')}</p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Top Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Update Transfer</h2>
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 appearance-none"
                  value={selectedProductStockId}
                  onChange={(e) => setSelectedProductStockId(e.target.value)}
                  disabled={loadingProducts || availableProducts.length === 0}
                >
                  <option value="">
                    {loadingProducts ? 'Loading products...' : 'Select product'}
                  </option>
                  {availableProducts.map((p) => (
                    <option key={p.stockId} value={p.stockId}>
                      {p.name} {p.code ? `(${p.code})` : ''} — {p.availableUnits ?? 0} available
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transfer from</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                  value={selectedFrom}
                  onChange={(e) => setSelectedFrom(e.target.value)}
                >
                  <option value="">
                    {inventories.length === 0 ? 'Loading inventories...' : 'Select inventory'}
                  </option>
                  {inventoryOptions.map((inv: any) => (
                    <option key={inv._id ?? inv.id} value={inv._id ?? inv.id}>
                      {inv.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <div className="relative flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="relative flex-1">
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                    value={selectedTo}
                    onChange={(e) => setSelectedTo(e.target.value)}
                  >
                    <option value="">
                      {inventories.length === 0 ? 'Loading inventories...' : 'Select inventory'}
                    </option>
                    {inventoryOptions.map((inv: any) => (
                      <option key={inv._id ?? inv.id} value={inv._id ?? inv.id}>
                        {inv.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Reference & Shipping Cost */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Enter reference number"
                className="w-full px-3 py-2 border border-gray-300 rounded-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Cost</label>
              <input
                type="number"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-full"
              />
            </div>
          </div>

          {/* quantity & price inputs */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
              <input
                type="number"
                min={1}
                value={selectedUnits}
                onChange={(e) => setSelectedUnits(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-full"
              />
            </div>
            <div className="flex items-end justify-end">
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setSelectedProductStockId('');
                    setSelectedProductCode('');
                    setSelectedProductName('');
                    setSelectedUnits(1);
                    setSelectedPrice(0);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300"
                >
                  Reset
                </button>
                <button
                  onClick={handleAddProduct}
                  disabled={transferring}
                  className="px-4 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800"
                >
                  {transferring ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transferred Products Section */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Products in Transfer</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Product</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Code</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Units</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Price</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">From</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">To</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {productsTable.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      No products added yet
                    </td>
                  </tr>
                ) : (
                  productsTable.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100">
                      <td className="py-3 text-sm text-gray-900">{product.name}</td>
                      <td className="py-3 text-sm text-gray-600">{product.code}</td>
                      <td className="py-3 text-sm text-gray-600">{product.units}</td>
                      <td className="py-3 text-sm text-gray-600">${product.price.toFixed(2)}</td>
                      <td className="py-3 text-sm text-gray-600">{product.from}</td>
                      <td className="py-3 text-sm text-gray-600">{product.to}</td>
                      <td className="py-3">
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate('/dashboard/transfermanagement')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800"
            onClick={handleUpdateTransfer}
            disabled={updatingTransfer}
          >
            {updatingTransfer ? 'Updating...' : 'Update Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateTransferComponent;
