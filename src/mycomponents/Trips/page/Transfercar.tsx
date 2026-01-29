import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useInventories } from '@/mycomponents/inventory/hooks/useInventories';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import axiosClient from '@/lib/axiosClient';

/* eslint-disable no-unused-vars */
/* eslint-disable */

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
  const { t } = useTranslation();

  // hooks
  const { inventories, getStocks } = useInventories();

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
  const [creatingTransfer, setCreatingTransfer] = useState(false);

  // mobile stocks (cars) for "To" dropdown
  const [mobileStocks, setMobileStocks] = useState<any[]>([]);
  const [loadingMobileStocks, setLoadingMobileStocks] = useState(false);

  // helper to extract stocks array from service response
  function extractStocksArray(stocksData: any): any[] {
    if (!stocksData) return [];
    if (Array.isArray(stocksData)) return stocksData;
    if (Array.isArray(stocksData.stocks)) return stocksData.stocks;
    if (Array.isArray(stocksData.data)) return stocksData.data;
    if (Array.isArray(stocksData.data?.stocks)) return stocksData.data.stocks;
    if (Array.isArray(stocksData.result)) return stocksData.result;
    if (Array.isArray(stocksData.data?.result)) return stocksData.data.result;
    if (Array.isArray(stocksData.data?.data)) return stocksData.data.data;
    if (Array.isArray(stocksData.items)) return stocksData.items;
    if (Array.isArray(stocksData.data?.items)) return stocksData.data.items;

    const body = stocksData.data ?? stocksData;
    if (body && typeof body === 'object') {
      for (const k of Object.keys(body)) {
        if (Array.isArray(body[k])) return body[k];
      }
    }

    return [];
  }

  // fetch product names for multiple productIds using axiosClient
  async function fetchProductNamesMap(productIds: string[], signal?: AbortSignal) {
    const map = new Map<string, string>();
    if (!productIds || productIds.length === 0) return map;

    const unique = Array.from(new Set(productIds.filter(Boolean).map(String)));

    const promises = unique.map((id) =>
      axiosClient
        .get(`/products/${id}`, { signal })
        .then((res: any) => ({ id, data: res?.data ?? res }))
        .catch((err: any) => ({ id, error: err }))
    );

    const settled = await Promise.all(promises);

    for (const item of settled) {
      if (item && !('error' in item)) {
        const payload = item.data;
        const product =
          payload?.data?.product ??
          payload?.product ??
          payload?.data ??
          payload;
        const name =
          (product && (product.name ?? product.title ?? product.productName)) ??
          undefined;
        if (name) map.set(String(item.id), String(name));
      } else {
        // silent skip on failure
      }
    }

    return map;
  }

  // load available products when From changes
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      setAvailableProducts([]);
      setSelectedProductStockId('');
      setSelectedProductCode('');
      setSelectedProductName('');
      setSelectedUnits(1);
      setSelectedPrice(0);
      if (!selectedFrom) {
        setLoadingProducts(false);
        return;
      }

      setLoadingProducts(true);
      try {
        console.log('[TransferComponent] fetching stocks for inventory:', selectedFrom);

        // use axiosClient to call your stocks endpoint
        const response = await axiosClient.get(`/stocks/stocks/${selectedFrom}`, {
          signal: controller.signal,
        });

        const raw = response?.data ?? response;
        console.log('[TransferComponent] raw axios response:', raw);

        const stocksArray = extractStocksArray(raw);
        console.log('[TransferComponent] extracted stocks array:', stocksArray);

        if (!Array.isArray(stocksArray) || stocksArray.length === 0) {
          if (!cancelled) {
            setAvailableProducts([]);
            toast(t('no_products_available') || 'No products available in selected inventory');
          }
          return;
        }

        // gather productIds to fetch names
        const productIds = stocksArray
          .map((s: any) => {
            const pid = s.productId ?? s.product?._id ?? s.product?.id;
            return pid;
          })
          .filter(Boolean)
          .map(String);

        const namesMap = await fetchProductNamesMap(productIds, controller.signal);

        const mapped = stocksArray.map((s: any, idx: number) => {
          const productObj = s.product ?? {};
          const productId =
            typeof s.productId === 'string' ? s.productId : productObj?._id ?? productObj?.id ?? s.productId;
          const pidStr = productId ? String(productId) : undefined;

          const fetchedName = pidStr ? namesMap.get(pidStr) : undefined;

          const name =
            fetchedName ??
            productObj?.name ??
            productObj?.productName ??
            s.name ??
            s.productName ??
            `Product ${idx + 1}`;

          const code =
            productObj?.code ?? productObj?.sku ?? s.code ?? s.sku ?? '';

          const price =
            productObj?.price !== undefined
              ? Number(productObj.price)
              : s.price !== undefined
              ? Number(s.price)
              : 0;

          const availableUnits =
            typeof s.availableQuantity === 'number'
              ? s.availableQuantity
              : typeof s.quantity === 'number'
              ? s.quantity
              : typeof s.availableUnits === 'number'
              ? s.availableUnits
              : Number(s.quantity ?? s.availableQuantity ?? s.availableUnits ?? s.qty ?? 0);

          const stockId = s.id ?? s._id ?? s.stockId ?? `${productId ?? 'p'}-${idx}`;

          return {
            stockId,
            productId: pidStr,
            name,
            code,
            price,
            availableUnits,
            raw: s,
          };
        });

        if (!cancelled) setAvailableProducts(mapped);
      } catch (err: any) {
        const isAbort = err?.name === 'CanceledError' || err?.name === 'AbortError' || err?.code === 'ERR_CANCELED';
        if (isAbort) {
          console.log('[TransferComponent] fetch aborted');
        } else {
          console.error('Failed to load products for inventory', selectedFrom, err);
          if (!cancelled) setAvailableProducts([]);
          toast.error(t('failed_load_products') || 'Failed to load products for selected inventory');
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFrom]); // intentionally not including getStocks to keep behavior consistent

  // load mobile stocks (cars) for "To" dropdown on mount
  useEffect(() => {
    let cancelled = false;
    const loadMobileStocks = async () => {
      setLoadingMobileStocks(true);
      try {
        const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || 'Token';
        const res = await axiosClient.get('/mobile-stocks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res?.data ?? res;
        const payload = data?.data ?? data;

        let items: any[] = [];
        if (Array.isArray(payload)) items = payload;
        else if (Array.isArray(payload.mobileStocks)) items = payload.mobileStocks;
        else if (Array.isArray(payload.docs)) items = payload.docs;
        else if (Array.isArray(payload.items)) items = payload.items;
        else if (Array.isArray(data?.mobileStocks)) items = data.mobileStocks;
        else if (Array.isArray(data?.data)) items = data.data;

        if (!cancelled) setMobileStocks(items);
      } catch (err) {
        console.error('Failed to load mobile stocks (cars):', err);
        if (!cancelled) setMobileStocks([]);
      } finally {
        if (!cancelled) setLoadingMobileStocks(false);
      }
    };

    void loadMobileStocks();
    return () => {
      cancelled = true;
    };
  }, []);

  // when selected product changes populate code/price/units
  useEffect(() => {
    if (!selectedProductStockId) {
      setSelectedProductCode('');
      setSelectedProductName('');
      setSelectedUnits(1);
      setSelectedPrice(0);
      return;
    }
    const found = availableProducts.find((p) => String(p.stockId) === String(selectedProductStockId));
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

  // sorted mobile stocks options
  const mobileStockOptions = useMemo(() => {
    return (mobileStocks || [])
      .slice()
      .sort((a: any, b: any) => (a.name ?? '').toString().toLowerCase().localeCompare((b.name ?? '').toString().toLowerCase()));
  }, [mobileStocks]);

  // Transfer: add row to local table
  const handleTransfer = async () => {
    if (!selectedFrom) {
      toast.error(t('select_transfer_from_first'));
      return;
    }
    if (!selectedProductStockId) {
      toast.error(t('select_product_transfer'));
      return;
    }
    if (!selectedTo) {
      toast.error(t('select_to_inventory'));
      return;
    }
    if (!selectedUnits || selectedUnits <= 0) {
      toast.error(t('units_greater_zero'));
      return;
    }
    if (!selectedPrice || selectedPrice < 0) {
      toast.error(t('price_zero_greater'));
      return;
    }

    const selected = availableProducts.find((p) => String(p.stockId) === String(selectedProductStockId));
    const toName = mobileStockOptions.find((m: any) => String(m._id ?? m.id) === String(selectedTo))?.name ?? selectedTo;
    const fromName = inventoryOptions.find((inv: any) => String(inv._id ?? inv.id) === String(selectedFrom))?.name ?? selectedFrom;

    const newRow: TransferredProduct = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: selected?.productId ?? undefined,
      name: selectedProductName,
      code: selectedProductCode,
      units: selectedUnits,
      price: selectedPrice,
      from: fromName,
      to: toName,
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
      toast.error(t('select_from_before_saving'));
      return;
    }
    if (!selectedTo) {
      toast.error(t('select_to_before_saving'));
      return;
    }
    if (productsTable.length === 0) {
      toast.error(t('no_products_to_save'));
      return;
    }

    const mergedProductsMap: Record<string, { productId: string; unit: number; price: number; name?: string; code?: string }> = {};

    for (const row of productsTable) {
      if (!row.productId) continue;
      if (!mergedProductsMap[row.productId]) {
        mergedProductsMap[row.productId] = {
          productId: row.productId,
          unit: Number(row.units),
          price: Number(row.price),
          name: row.name,
          code: row.code,
        };
      } else {
        mergedProductsMap[row.productId].unit += Number(row.units);
      }
    }

    const productsPayload = Object.values(mergedProductsMap);

    if (productsPayload.length === 0) {
      toast.error(t('invalid_product_rows'));
      return;
    }

    for (const row of productsTable) {
      const productInStock = availableProducts.find((p) => p.productId === row.productId);
      if (productInStock && row.units > productInStock.availableUnits) {
        toast.error(
          t('quantity_exceeds_available', {
            requested: row.units,
            available: productInStock.availableUnits,
            name: row.name,
          }) || `Requested ${row.units} > available ${productInStock.availableUnits} for ${row.name}`
        );
        return;
      }
    }

    const payload: any = {
      from: selectedFrom,
      toMobileStock: selectedTo,
      products: productsPayload.map((p) => ({
        productId: p.productId,
        unit: p.unit,
        name: p.name,
        code: p.code,
      })),
      notes: notes || '',
      shippingCost: Number(shippingCost || 0),
    };

    try {
      setCreatingTransfer(true);
      const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || 'Token';
      const res = await axiosClient.post('/stock-transfers', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ stock transfer created:', res?.data ?? res);
      toast.success(t('transfer_created_success') || 'Transfer created');

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
      setNotes('');
    } catch (err: any) {
      console.error('Failed to create stock transfer:', err);
      const status = err?.response?.status ?? err?.code ?? err?.message;
      toast.error(`${t('failed_save_transfer') || 'Failed to save transfer'} ${status}`);
    } finally {
      setCreatingTransfer(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t('Transfer_Management')}</h1>
        <p className="text-sm text-gray-500">
          {t('Dashboard')} &gt; {t('Transfer')} &gt; {t('car')}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('Transfer')}</h2>

        {/* Step 1: From Inventory */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('Transfer_from')}</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                value={selectedFrom}
                onChange={(e) => setSelectedFrom(e.target.value)}
              >
                <option value="">
                  {(inventories?.length ?? 0) === 0 ? t('Loading_inventory') : t('Select_inventory')}
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

          {/* Step 2: Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('Product')}</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 appearance-none text-sm"
                value={selectedProductStockId}
                onChange={(e) => setSelectedProductStockId(e.target.value)}
                disabled={!selectedFrom || loadingProducts || availableProducts.length === 0}
              >
                <option value="">
                  {!selectedFrom
                    ? t('select_from_first')
                    : loadingProducts
                    ? t('Loading_products')
                    : t('Select_product')}
                </option>
                {availableProducts.map((p) => (
                  <option
                    key={p.stockId}
                    value={p.stockId}
                    title={`${p.name} ${p.code ? `(${p.code})` : ''} — ${p.availableUnits ?? 0} ${t('available')}`}
                  >
                    {p.name} {p.code ? `(${p.code})` : ''} — {p.availableUnits ?? 0} {t('available')}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Step 3: To (mobile stocks / cars) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('To')}</label>
            <div className="relative flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="relative flex-1">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                  value={selectedTo}
                  onChange={(e) => setSelectedTo(e.target.value)}
                >
                  <option value="">
                    {loadingMobileStocks ? t('Loading_car') : t('Select_car')}
                  </option>
                  {mobileStockOptions.map((m: any) => (
                    <option key={m._id ?? m.id} value={m._id ?? m.id}>
                      {m.name}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('Reference')}</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t('Enter_reference_number')}
              className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('Shipping_Cost')}</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('Units')}</label>
            <input
              type="number"
              min={1}
              value={selectedUnits}
              onChange={(e) => setSelectedUnits(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('Price')}</label>
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
                {t('Reset')}
              </button>
              <button
                onClick={handleTransfer}
                disabled={false}
                className="w-full sm:w-auto px-4 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-blue-800"
              >
                {t('Transfer')}
              </button>
            </div>
          </div>
        </div>

        {/* Transferred Products Table */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('Transferred_Products')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-600 pb-3 w-8"></th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('Product')}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('Code')}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('Units')}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('Price')}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('From')}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('To')}</th>
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
                      {t('no_transferred_products_yet')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('Notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            rows={4}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50">
            {t('Cancel')}
          </button>
          <button
            className="w-full sm:w-auto px-6 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-blue-800"
            onClick={handleSaveTransfer}
            disabled={creatingTransfer}
          >
            {creatingTransfer ? t('Saving') : t('Save_Transfer')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferComponent;
