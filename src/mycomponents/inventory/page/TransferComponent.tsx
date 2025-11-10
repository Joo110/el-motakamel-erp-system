import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useInventories } from '@/mycomponents/inventory/hooks/useInventories';
import { useStockTransfer } from '../hooks/useStockTransfer';
import { toast } from 'react-hot-toast';

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

const TransferComponent: React.FC = () => {
  // hooks
  const { inventories, getStocks } = useInventories();
  const { createStockTransfer, loading: creatingTransfer } = useStockTransfer();

  // local table state
  const [productsTable, setProductsTable] = useState<TransferredProduct[]>([]);

  // form fields
  const [reference, setReference] = useState('');
  const [shippingCost, setShippingCost] = useState('');

  const [selectedFrom, setSelectedFrom] = useState<string>('');
  const [selectedTo, setSelectedTo] = useState<string>('');
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProductStockId, setSelectedProductStockId] = useState<string>('');
  const [selectedProductCode, setSelectedProductCode] = useState<string>('');
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [selectedUnits, setSelectedUnits] = useState<number>(1);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  const [loadingProducts, setLoadingProducts] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [transferring, setTransferring] = useState(false);

  // helper to extract stocks array from service response
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

  // load available products when From changes
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
            typeof productObj === 'object' ? productObj._id ?? productObj.id : productObj;
          const name = productObj?.name ?? productObj?.productName ?? s.name ?? `Product ${idx + 1}`;
          const code = productObj?.code ?? productObj?.sku ?? s.code ?? '';
          const price = productObj?.price ? Number(productObj.price) : s.price ? Number(s.price) : 0;
          const availableUnits = typeof s.quantity === 'number' ? s.quantity : Number(s.quantity ?? 0);
          const stockId = s._id ?? s.id ?? `${productId ?? 'p'}-${idx}`;

          return {
            stockId,
            productId,
            name,
            code,
            price,
            availableUnits,
            raw: s,
          };
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
  }, [selectedFrom, getStocks]);

  // when selected product changes populate code/price/units
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

  // sorted inventory options
  const inventoryOptions = useMemo(() => {
    return (inventories || [])
      .slice()
      .sort((a: any, b: any) => (a.name ?? '').toString().toLowerCase().localeCompare((b.name ?? '').toString().toLowerCase()));
  }, [inventories]);

  // Transfer: add row to local table
  const handleTransfer = async () => {
    if (!selectedFrom) {
      toast.error('Please select "Transfer from" inventory first.');
      return;
    }
    if (!selectedProductStockId) {
      toast.error('Please select a product to transfer.');
      return;
    }
    if (!selectedTo) {
      toast.error('Please select "To" inventory.');
      return;
    }
    if (selectedFrom === selectedTo) {
      toast.error('Source and destination inventories must be different.');
      return;
    }
    if (!selectedUnits || selectedUnits <= 0) {
      toast.error('Units must be greater than 0.');
      return;
    }
    if (!selectedPrice || selectedPrice < 0) {
      toast.error('Price must be 0 or greater.');
      return;
    }

    const selected = availableProducts.find((p) => p.stockId === selectedProductStockId);
    const newRow: TransferredProduct = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: selected?.productId ?? undefined,
      name: selectedProductName,
      code: selectedProductCode,
      units: selectedUnits,
      price: selectedPrice,
      from: inventoryOptions.find((inv) => (inv._id ?? inv._id) === selectedFrom)?.name ?? selectedFrom,
      to: inventoryOptions.find((inv) => (inv._id ?? inv._id) === selectedTo)?.name ?? selectedTo,
      reference: reference || undefined,
      shippingCost: shippingCost || undefined,
    };

    setProductsTable((prev) => [newRow, ...prev]);

    // reset product selection (keep From/To for convenience)
    setSelectedProductStockId('');
    setSelectedProductCode('');
    setSelectedProductName('');
    setSelectedUnits(1);
    setSelectedPrice(0);
    setReference('');
    setShippingCost('');
  };

  const handleSaveTransfer = async () => {
    if (!selectedFrom) {
      toast('Please select "Transfer from" before saving.');
      return;
    }
    if (!selectedTo) {
      toast('Please select "To" before saving.');
      return;
    }
    if (productsTable.length === 0) {
      toast('No transferred products to save.');
      return;
    }

    const mergedProductsMap: Record<string, { productId: string; unit: number; price: number }> = {};

    for (const row of productsTable) {
      if (!row.productId) continue;
      if (!mergedProductsMap[row.productId]) {
        mergedProductsMap[row.productId] = {
          productId: row.productId,
          unit: Number(row.units),
          price: Number(row.price),
        };
      } else {
        mergedProductsMap[row.productId].unit += Number(row.units);
      }
    }

    const productsPayload = Object.values(mergedProductsMap);

    if (productsPayload.length === 0) {
      toast('None of the table rows contain valid productId — please add products from the product dropdown.');
      return;
    }

    const payload: any = {
      status: 'draft',
      reference: reference || `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      from: selectedFrom,
      to: selectedTo,
      products: productsPayload.map((p) => ({ productId: p.productId, unit: p.unit, price: p.price })),
      shippingCost: Number(shippingCost || 0),
    };

    try {
      // check available stock
      for (const row of productsTable) {
        const productInStock = availableProducts.find((p) => p.productId === row.productId);
        if (productInStock && row.units > productInStock.availableUnits) {
          toast(`❌ Requested quantity (${row.units}) exceeds available (${productInStock.availableUnits}) for product ${row.name}`);
          return;
        }
      }

      const res = await createStockTransfer(payload);
      console.log('✅ createStockTransfer success response:', res);
      toast('✅ Stock transfer created successfully');

      // reset all form
      setProductsTable([]);
      setSelectedFrom('');
      setSelectedTo('');
      setSelectedProductStockId('');
      setAvailableProducts([]);
      setSelectedUnits(1);
      setSelectedPrice(0);
      setReference('');
      setShippingCost('');
    } catch (err: any) {
      console.error('Failed to create stock transfer:', err);
      toast(`Failed to save transfer. See console for details. server status: ${err?.response?.status || err?.code || err?.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-500">Dashboard &gt; Inventory &gt; Transfer</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Transfer</h2>

        {/* Step 1: From Inventory */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transfer from</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                value={selectedFrom}
                onChange={(e) => setSelectedFrom(e.target.value)}
              >
                <option value="">{(inventories?.length ?? 0) === 0 ? 'Loading inventories...' : 'Select inventory'}</option>
                {inventoryOptions.map((inv: any) => (
                  <option key={inv._id ?? inv.id} value={inv._id ?? inv.id}>
                    {inv.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Step 2: Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 appearance-none text-sm"
                value={selectedProductStockId}
                onChange={(e) => setSelectedProductStockId(e.target.value)}
                disabled={!selectedFrom || loadingProducts || availableProducts.length === 0}
              >
                <option value="">
                  {!selectedFrom ? 'Select "From" inventory first' : loadingProducts ? 'Loading products...' : 'Select product'}
                </option>
                {availableProducts.map((p) => (
                  <option key={p.stockId} value={p.stockId} title={`${p.name} ${p.code ? `(${p.code})` : ''} — ${p.availableUnits ?? 0} available`}>
                    {p.name} {p.code ? `(${p.code})` : ''} — {p.availableUnits ?? 0} available
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Step 3: To Inventory */}
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
                  <option value="">{(inventories?.length ?? 0) === 0 ? 'Loading inventories...' : 'Select inventory'}</option>
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

        {/* Reference & Shipping */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter reference number"
              className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Cost</label>
            <input
              type="number"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm"
            />
          </div>
        </div>

        {/* Units & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
            <input
              type="number"
              min={1}
              value={selectedUnits}
              onChange={(e) => setSelectedUnits(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm"
            />
          </div>
          <div className="flex items-end justify-end">
            <div className="w-full sm:w-auto flex flex-col sm:flex-row justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setSelectedProductStockId('');
                  setSelectedProductCode('');
                  setSelectedProductName('');
                  setSelectedUnits(1);
                  setSelectedPrice(0);
                  setReference('');
                  setShippingCost('');
                }}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300"
              >
                Reset
              </button>
              <button
                onClick={handleTransfer}
                disabled={transferring}
                className="w-full sm:w-auto px-4 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-blue-800"
              >
                {transferring ? 'Transferring...' : 'Transfer'}
              </button>
            </div>
          </div>
        </div>

        {/* Transferred Products Table */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Transferred Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-600 pb-3 w-8"></th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Product</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Code</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Units</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Price</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">From</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">To</th>
                </tr>
              </thead>
              <tbody>
                {productsTable.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100">
                    <td className="py-3">
                      <input type="checkbox" className="w-4 h-4 rounded-full border-gray-300" />
                    </td>
                    <td className="py-3 text-sm text-gray-900 max-w-[220px] truncate">{product.name}</td>
                    <td className="py-3 text-sm text-gray-600">{product.code}</td>
                    <td className="py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {product.units}
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-600">${product.price.toFixed(2)}</td>
                    <td className="py-3 text-sm text-gray-600 max-w-[140px] truncate">{product.from}</td>
                    <td className="py-3 text-sm text-gray-600 max-w-[140px] truncate">{product.to}</td>
                  </tr>
                ))}
                {productsTable.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No transferred products yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={4}></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button
            className="w-full sm:w-auto px-6 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-blue-800"
            onClick={handleSaveTransfer}
            disabled={creatingTransfer}
          >
            {creatingTransfer ? 'Saving...' : 'Save Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferComponent;