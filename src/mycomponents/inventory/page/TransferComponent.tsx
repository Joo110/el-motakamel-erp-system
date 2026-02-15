import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useInventories } from '@/mycomponents/inventory/hooks/useInventories';
import { useStockTransfer } from '../hooks/useStockTransfer';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import axiosClient from '@/lib/axiosClient';

/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
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
  const { inventories } = useInventories();
  const { createStockTransfer, loading: creatingTransfer } = useStockTransfer();

  // local table state
  const [productsTable, setProductsTable] = useState<TransferredProduct[]>([]);

  // form fields
  const [reference, setReference] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [notes, setNotes] = useState('');

  const [selectedFrom, setSelectedFrom] = useState<string>(''); // inventory id (string)
  const [selectedTo, setSelectedTo] = useState<string>('');
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProductStockId, setSelectedProductStockId] = useState<string>('');
  const [selectedProductCode, setSelectedProductCode] = useState<string>('');
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [selectedUnits, setSelectedUnits] = useState<number>(1);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [transferring, setTransferring] = useState(false);

  // helper to extract stocks array from service response
  function extractStocksArray(stocksData: any): any[] {
    if (!stocksData) return [];
    if (Array.isArray(stocksData)) return stocksData;
    if (Array.isArray(stocksData.data)) return stocksData.data;
    if (Array.isArray(stocksData.stocks)) return stocksData.stocks;
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

    // dedupe ids
    const unique = Array.from(new Set(productIds.filter(Boolean).map(String)));

    // fetch in parallel with Promise.allSettled
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
        // payload may be the product object or { data: product } or { product: {...} }
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
        // skip failures silently (could log)
        // console.warn('Failed to fetch product', item.id, item.error);
      }
    }

    return map;
  }

  // load available products when selectedFrom changes
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      // reset product selection state
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

        // call stocks endpoint (you gave: /api/v1/stocks/stocks/:inventoryId)
        const response = await axiosClient.get(`/stocks/stocks/${selectedFrom}`, {
          signal: controller.signal,
        });

        // response.data likely contains { message, data: [ ... ] }
        const raw = response?.data ?? response;
        console.log('[TransferComponent] raw axios response:', raw);

        // extract stocks array
        const stocksArray = extractStocksArray(raw);
        console.log('[TransferComponent] extracted stocks array:', stocksArray);

        if (!Array.isArray(stocksArray) || stocksArray.length === 0) {
          if (!cancelled) {
            setAvailableProducts([]);
            toast(t('no_products_available') || 'No products available in selected inventory');
          }
          return;
        }

        // collect productIds (they might be strings)
        const productIds = stocksArray.map((s: any) => {
          // s.productId may be the id string or object
          const pid = s.productId ?? s.product?._id ?? s.product?.id;
          return pid;
        }).filter(Boolean).map(String);

        // fetch names map
        const namesMap = await fetchProductNamesMap(productIds, controller.signal);

        // map stocks into dropdown items (robust)
        const mapped = stocksArray.map((s: any, idx: number) => {
          const productObj = s.product ?? {};
          const productId =
            typeof s.productId === 'string' ? s.productId : productObj?._id ?? productObj?.id ?? s.productId;
          const pidStr = productId ? String(productId) : undefined;

          // try name from fetched map first
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
            typeof s.quantity === 'number'
              ? s.quantity
              : typeof s.availableQuantity === 'number'
              ? s.availableQuantity
              : typeof s.availableUnits === 'number'
              ? s.availableUnits
              : Number(s.quantity ?? s.availableQuantity ?? s.availableUnits ?? s.qty ?? 0);

          const stockId = s.id ?? s._id ?? s.stockId ?? `stock-${idx}`;

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

        if (!cancelled) {
          setAvailableProducts(mapped);
        }
      } catch (err: any) {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
          console.log('[TransferComponent] fetch aborted');
        } else {
          console.error('[TransferComponent] failed to load products for inventory', selectedFrom, err);
          toast.error(t('failed_load_products') || 'Failed to load products for selected inventory');
          setAvailableProducts([]);
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
  }, [selectedFrom, t]);

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

  // Transfer: add row to local table
  const handleTransfer = async () => {
    if (!selectedFrom) {
      toast.error(t('please_select_inventory') || 'Please select "Transfer from" inventory first.');
      return;
    }
    if (!selectedProductStockId) {
      toast.error(t('please_select_product') || 'Please select a product to transfer.');
      return;
    }
    if (!selectedTo) {
      toast.error(t('please_select_inventory') || 'Please select "To" inventory.');
      return;
    }
    if (selectedFrom === selectedTo) {
      toast.error(t('source_destination_must_different') || 'Source and destination inventories must be different.');
      return;
    }
    if (!selectedUnits || selectedUnits <= 0) {
      toast.error(t('quantity_gt_zero') || 'Units must be greater than 0.');
      return;
    }
    if (selectedPrice < 0) {
      toast.error(t('price_must_greater_zero') || 'Price must be 0 or greater.');
      return;
    }

    const selected = availableProducts.find((p) => String(p.stockId) === String(selectedProductStockId));

    // Check if quantity exceeds available stock
    if (selected && selectedUnits > selected.availableUnits) {
      toast.error(t('requested_exceeds_available') || `Requested quantity (${selectedUnits}) exceeds available (${selected.availableUnits})`);
      return;
    }

    const newRow: TransferredProduct = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: selected?.productId ?? undefined,
      name: selectedProductName,
      code: selectedProductCode,
      units: selectedUnits,
      price: selectedPrice,
      from: inventoryOptions.find((inv) => String(inv._id ?? inv._id) === String(selectedFrom))?.name ?? selectedFrom,
      to: inventoryOptions.find((inv) => String(inv._id ?? inv._id) === String(selectedTo))?.name ?? selectedTo,
      reference: reference || undefined,
      shippingCost: shippingCost || undefined,
    };

    setProductsTable((prev) => [newRow, ...prev]);
    toast.success(t('product_added_to_table') || 'Product added to transfer table');

    // reset product selection (keep From/To for convenience)
    setSelectedProductStockId('');
    setSelectedProductCode('');
    setSelectedProductName('');
    setSelectedUnits(1);
    setSelectedPrice(0);
  };

  const handleRemoveProduct = (id: string) => {
    setProductsTable((prev) => prev.filter((p) => p.id !== id));
    toast.success(t('product_removed') || 'Product removed from table');
  };

  const handleSaveTransfer = async () => {
    if (!selectedFrom) {
      toast.error(t('please_select_inventory') || 'Please select "Transfer from" before saving.');
      return;
    }
    if (!selectedTo) {
      toast.error(t('please_select_inventory') || 'Please select "To" before saving.');
      return;
    }
    if (productsTable.length === 0) {
      toast.error(t('no_transferred_products') || 'No transferred products to save.');
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
      toast.error(t('invalid_product_fields_check_console') || 'None of the table rows contain valid productId — please add products from the product dropdown.');
      return;
    }

    const payload: any = {
      status: 'draft',
      reference: reference || `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      from: selectedFrom,
      to: selectedTo,
      products: productsPayload.map((p) => ({
        productId: p.productId,
        unit: p.unit,
        price: p.price,
      })),
      shippingCost: Number(shippingCost || 0),
      notes: notes || undefined,
    };

    try {
      setTransferring(true);

      const res = await createStockTransfer(payload);
      console.log('✅ createStockTransfer success response:', res);
      toast.success(t('stock_transfer_created') || '✅ Stock transfer created successfully');

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
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to save transfer';
      toast.error(`${t('failed_save_transfer') || 'Failed to save transfer'}: ${errorMessage}`);
    } finally {
      setTransferring(false);
    }
  };

  const handleReset = () => {
    setSelectedProductStockId('');
    setSelectedProductCode('');
    setSelectedProductName('');
    setSelectedUnits(1);
    setSelectedPrice(0);
  };

  const handleCancel = () => {
    if (productsTable.length > 0) {
      const confirmed = window.confirm(t('confirm_cancel_transfer') || 'Are you sure you want to cancel? All unsaved changes will be lost.');
      if (!confirmed) return;
    }

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
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{t('inventory_management') || 'Inventory Management'}</h1>
        <p className="text-xs sm:text-sm text-gray-500">{t('breadcrumb_dashboard') || 'Dashboard'} &gt; {t('inventories') || 'Inventory'} &gt; {t('transfer') || 'Transfer'}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">{t('transfer') || 'Transfer'}</h2>

        {/* Step 1: From Inventory */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('transfer_from') || 'Transfer from'}</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                value={selectedFrom}
                onChange={(e) => setSelectedFrom(e.target.value)}
              >
                <option value="">{(inventories?.length ?? 0) === 0 ? t('loading_inventories') || 'Loading inventories...' : t('select_inventory') || 'Select inventory'}</option>
                {inventoryOptions.map((inv: any) => (
                  <option key={inv._id ?? inv.id} value={String(inv._id ?? inv.id)}>
                    {inv.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Step 2: Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('product_label') || 'Product'}</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 appearance-none text-sm focus:ring-2 focus:ring-slate-700 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={selectedProductStockId}
                onChange={(e) => setSelectedProductStockId(e.target.value)}
                disabled={!selectedFrom || loadingProducts || availableProducts.length === 0}
              >
                <option value="">
                  {!selectedFrom
                    ? (t('select_from_first') || 'Select "From" inventory first')
                    : loadingProducts
                    ? (t('loading_products') || 'Loading products...')
                    : availableProducts.length === 0
                    ? (t('no_products_available') || 'No products available')
                    : (t('select_product') || 'Select product')}
                </option>
                {availableProducts.map((p) => (
                  <option
                    key={p.stockId}
                    value={String(p.stockId)}
                    title={`${p.name} ${p.code ? `(${p.code})` : ''} — ${p.availableUnits ?? 0} available`}
                  >
                    {p.name} {p.code ? `(${p.code})` : ''} — {p.availableUnits ?? 0} units
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Step 3: To Inventory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('to_label') || 'To'}</label>
            <div className="relative flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="relative flex-1">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                  value={selectedTo}
                  onChange={(e) => setSelectedTo(e.target.value)}
                >
                  <option value="">{(inventories?.length ?? 0) === 0 ? t('loading_inventories') || 'Loading inventories...' : t('select_inventory') || 'Select inventory'}</option>
                  {inventoryOptions.map((inv: any) => (
                    <option key={inv._id ?? inv.id} value={String(inv._id ?? inv.id)}>
                      {inv.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Reference & Shipping */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('reference_label') || 'Reference'}</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t('enter_reference') || 'Enter reference number (optional)'}
              className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-slate-700 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('shipping_cost') || 'Shipping Cost'}</label>
            <input
              type="number"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-slate-700 focus:border-transparent"
            />
          </div>
        </div>

        {/* Units & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('units_label') || 'Units'}</label>
            <input
              type="number"
              min={1}
              value={selectedUnits}
              onChange={(e) => setSelectedUnits(Number(e.target.value))}
              disabled={!selectedProductStockId}
              className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-slate-700 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('price_label') || 'Price'}</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(Number(e.target.value))}
              disabled={!selectedProductStockId}
              className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-slate-700 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div className="sm:col-span-2 flex items-end gap-2">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-colors"
            >
              {t('reset') || 'Reset'}
            </button>
            <button
              onClick={handleTransfer}
              disabled={transferring || !selectedProductStockId}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {transferring ? (t('transferring') || 'Transferring...') : (t('transfer') || 'Transfer')}
            </button>
          </div>
        </div>

        {/* Transferred Products Table */}
        <div className="mb-6">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4">{t('transferred_products') || 'Transferred Products'}</h2>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('product_col') || 'Product'}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('code_col') || 'Code'}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('units_col') || 'Units'}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('price_col') || 'Price'}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('from_label') || 'From'}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('to_label') || 'To'}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('actions_col') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {productsTable.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100">
                    <td className="py-3 text-sm text-gray-900 max-w-[220px] truncate" title={product.name}>{product.name}</td>
                    <td className="py-3 text-sm text-gray-600">{product.code || '-'}</td>
                    <td className="py-3 text-sm text-gray-600">{product.units}</td>
                    <td className="py-3 text-sm text-gray-600">${product.price.toFixed(2)}</td>
                    <td className="py-3 text-sm text-gray-600 max-w-[140px] truncate" title={product.from}>{product.from}</td>
                    <td className="py-3 text-sm text-gray-600 max-w-[140px] truncate" title={product.to}>{product.to}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        {t('remove') || 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
                {productsTable.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      {t('no_transferred_products') || 'No transferred products yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {productsTable.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                {t('no_transferred_products') || 'No transferred products yet'}
              </div>
            ) : (
              productsTable.map((product) => (
                <div key={product.id} className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      {product.code && <div className="text-sm text-gray-500">{product.code}</div>}
                    </div>
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
                    >
                      {t('remove') || 'Remove'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">{t('units_label')}:</span> {product.units}
                    </div>
                    <div>
                      <span className="text-gray-500">{t('price_label')}:</span> ${product.price.toFixed(2)}
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">{t('from_label')}:</span> {product.from}
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">{t('to_label')}:</span> {product.to}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('notes_label') || 'Notes'}</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-700 focus:border-transparent"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('add_notes_optional') || 'Add notes (optional)'}
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={creatingTransfer}
            className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('cancel_label') || 'Cancel'}
          </button>
          <button
            className="w-full sm:w-auto px-6 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSaveTransfer}
            disabled={creatingTransfer || productsTable.length === 0}
          >
            {creatingTransfer ? (t('saving_label') || 'Saving...') : (t('save_transfer_label') || 'Save Transfer')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferComponent;
