import React, { useMemo, useState } from 'react';
import { Calendar, ChevronDown, Trash2 } from 'lucide-react';
import { useCreatePurchaseOrder } from '../../Precious/hooks/useCreatePurchaseOrder';
import { useProducts } from '../../product/hooks/useProducts';
import { useInventories } from '../../inventory/hooks/useInventories';
import { useSuppliers } from '../../Precious/hooks/useSuppliers';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface ProductRow {
  id: string;
  productId: string;
  inventoryId: string;
  name: string;
  inventoryName: string;
  code: string;
  units: number;
  price: number; // chosen price (depends on saleType)
  wholesalePrice?: number;
  retailPrice?: number;
  discount: number;
  total: number;
  saleType: string;
}

const truncate = (s: string | undefined, n = 30) => {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
};

const StockInComponent: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<ProductRow[]>([]);

  const total = useMemo(() => products.reduce((sum, product) => sum + product.total, 0), [products]);

  const [formProduct, setFormProduct] = useState({
    name: '',
    inventory: '',
    code: '96060',
    units: '0',
    price: '0', // retail price input (default)
    wholesalePrice: '0', // new input for wholesale
    discount: '0',
    saleType: 'جملة',
  });

  const [supplierId, setSupplierId] = useState<string>('696e9534a81dce22d907b0bc'); // <-- supplier id state
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>('');

  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>('');
  const [currency, setCurrency] = useState<string>('SR');
  const [notes, setNotes] = useState<string>('');

  const [organizationId] = useState<string>('6963ef29d4010f957c2de3f6');
  const [createdBy] = useState<string>('68c699af13bdca2885ed4d27');

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // ===== hooks =====
  const { create, loading } = useCreatePurchaseOrder();
  const { products: productsFromHook = [], loading: productsLoading = false } = useProducts() as any;
  const { inventories = [], isLoading: inventoriesLoading = false } = useInventories() as any;
  const { suppliers = [], loading: suppliersLoading = false } = useSuppliers() as any;

  const computedFormTotal = useMemo(() => {
    const u = Number(formProduct.units || 0);
    // choose price according to saleType: if جملة use wholesalePrice else use retail price (formProduct.price)
    const p = Number(formProduct.saleType === 'جملة' ? formProduct.wholesalePrice : formProduct.price);
    const d = Number(formProduct.discount || 0);
    const tot = u * p * (1 - d / 100);
    return isFinite(tot) ? tot.toFixed(2) + ' ' : '0.00 ';
  }, [formProduct.units, formProduct.price, formProduct.wholesalePrice, formProduct.discount, formProduct.saleType, t]);

  // ===== handlers =====
  const handleFormChange = (key: keyof typeof formProduct, value: string) => {
    setFormProduct((s) => ({ ...s, [key]: value }));
  };

  const handleResetForm = () => {
    setFormProduct({
      name: '',
      inventory: '',
      code: '96060',
      units: '0',
      price: '0',
      wholesalePrice: '0',
      discount: '0',
      saleType: 'جملة'
    });
    setSelectedProductId('');
    setSelectedInventoryId('');
  };

  // NOTE: suppliers returned from API use `id` (not `_id`) — be tolerant and check both
  const handleSupplierSelect = (id: string) => {
    setSupplierId(id);
    const s = suppliers.find((x: any) => x.id === id || x._id === id);
    setFormProduct((f) => ({ ...f, name: s?.name ?? '' }));
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const p = productsFromHook.find((x: any) => x._id === productId || x.id === productId);
    setFormProduct((f) => ({ ...f, name: p?.name ?? '' }));
    // if product provides wholesalePrice/retailPrice, fill both inputs
    if (p) {
      if (p.wholesalePrice || p.retailPrice) {
        if (p.wholesalePrice !== undefined) setFormProduct((f) => ({ ...f, wholesalePrice: String(p.wholesalePrice) }));
        if (p.retailPrice !== undefined) setFormProduct((f) => ({ ...f, price: String(p.retailPrice) }));
      } else if (p.price) {
        setFormProduct((f) => ({ ...f, price: String(p.price), wholesalePrice: String(p.price) }));
      }
      if (p.code) setFormProduct((f) => ({ ...f, code: String(p.code) }));
    }
  };

  const handleInventorySelect = (inventoryId: string) => {
    setSelectedInventoryId(inventoryId);
    const inv = inventories.find((x: any) => x._id === inventoryId || x.id === inventoryId);
    setFormProduct((f) => ({ ...f, inventory: inv?.name ?? '' }));
  };



  // When setting expected delivery, if it's before orderDate -> show error and don't set
  const handleExpectedDeliveryChange = (value: string) => {
    if (orderDate && value) {
      const expected = new Date(value);
      const order = new Date(orderDate);
      // expected must be on or after order date (not before)
      if (expected.getTime() < order.getTime()) {
        toast.error(t('expected_delivery_must_be_after_order') || 'تاريخ التسليم يجب أن يكون بعد أو مساوي لتاريخ الطلب');
        return;
      }
    }
    setExpectedDeliveryDate(value);
  };

  // When setting order date, ensure it's not after expectedDeliveryDate
  const handleOrderDateChange = (value: string) => {
    if (expectedDeliveryDate && value) {
      const expected = new Date(expectedDeliveryDate);
      const order = new Date(value);
      if (order.getTime() > expected.getTime()) {
        toast.error(t('order_date_cannot_be_after_expected') || 'تاريخ الطلب لا يمكن أن يكون بعد تاريخ التسليم المتوقع');
        return;
      }
    }
    setOrderDate(value);
  };

  const handleAddProduct = () => {
    if (!selectedProductId) {
      toast.error(t('please_select_product'));
      return;
    }
    if (!selectedInventoryId) {
      toast.error(t('please_select_inventory'));
      return;
    }

    // Validate that selected product and inventory actually exist in the lists
    const foundProduct = productsFromHook.find((x: any) => x._id === selectedProductId || x.id === selectedProductId);
    const foundInventory = inventories.find((x: any) => x._id === selectedInventoryId || x.id === selectedInventoryId);
    if (!foundProduct) {
      toast.error(t('selected_product_not_found') || 'Selected product not found in list');
      return;
    }
    if (!foundInventory) {
      toast.error(t('selected_inventory_not_found') || 'Selected inventory not found in list');
      return;
    }

    if (!formProduct.units || Number(formProduct.units) <= 0) {
      toast.error(t('units_must_greater_zero'));
      return;
    }

    // discount validation
    const discountVal = Number(formProduct.discount || 0);
    if (discountVal < 0 || discountVal > 100) {
      toast.error(t('discount_must_between_0_100') || 'خصم غير صالح (يجب أن يكون بين 0 و 100)');
      return;
    }

    // choose price according to saleType
    const chosenPrice = Number(formProduct.saleType === 'جملة' ? formProduct.wholesalePrice : formProduct.price);
    if (!chosenPrice || chosenPrice <= 0) {
      toast.error(t('price_must_greater_zero'));
      return;
    }

    // prevent duplicate item with same product+inventory+saleType
    const duplicate = products.some(
      (p) => p.productId === selectedProductId && p.inventoryId === selectedInventoryId && p.saleType === formProduct.saleType
    );
    if (duplicate) {
      toast.error(t('product_already_added') || 'تم إضافة هذا المنتج في نفس المخزن ونفس نوع البيع بالفعل');
      return;
    }

    const units = Number(formProduct.units);
    const price = chosenPrice;
    const wholesalePriceVal = Number(formProduct.wholesalePrice || 0);
    const retailPriceVal = Number(formProduct.price || 0);
    const discount = Number(formProduct.discount || 0);
    const tot = units * price * (1 - discount / 100);

    const productName =
      productsFromHook.find((p: any) => p._id === selectedProductId || p.id === selectedProductId)?.name ??
      formProduct.name;
    const inventoryName =
      inventories.find((i: any) => i._id === selectedInventoryId || i.id === selectedInventoryId)?.name ??
      formProduct.inventory;

    const newProduct: ProductRow = {
      id: `${selectedProductId}-${selectedInventoryId}-${formProduct.saleType}`, // فريد لكل نوع بيع
      productId: selectedProductId,
      inventoryId: selectedInventoryId,
      name: productName,
      inventoryName,
      code: formProduct.code || '96060',
      units,
      price,
      wholesalePrice: wholesalePriceVal,
      retailPrice: retailPriceVal,
      discount,
      total: Math.round((tot + Number.EPSILON) * 100) / 100,
      saleType: formProduct.saleType || 'جملة',
    };

    setProducts((prev) => [...prev, newProduct]);
    handleResetForm();
  };

  const handleCheckboxToggle = (id: string) => {
    setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedProducts((prev) => prev.filter((x) => x !== id));
  };

  function mapProductsForApi(p: ProductRow[]) {
    return p.map((prod) => ({
      productId: prod.productId,
      inventoryId: prod.inventoryId,
      name: prod.name,
      quantity: prod.units,
      wholesalePrice: prod.wholesalePrice ?? prod.price,
      retailPrice: prod.retailPrice ?? prod.price,
      discount: prod.discount,
    }));
  }

  const handleSave = async () => {
    try {
      if (!supplierId) {
        toast.error(t('please_select_supplier_before_saving'));
        return;
      }

      if (products.length === 0) {
        toast.error(t('please_add_at_least_one_product'));
        return;
      }

      // validate dates before save
      if (orderDate && expectedDeliveryDate) {
        const order = new Date(orderDate);
        const expected = new Date(expectedDeliveryDate);
        if (expected.getTime() < order.getTime()) {
          toast.error(t('expected_delivery_must_be_after_order') || 'تاريخ التسليم يجب أن يكون بعد أو مساوي لتاريخ الطلب');
          return;
        }
      }

      const payload: any = {
        supplierId: supplierId,
        organizationId,
        products: mapProductsForApi(products),
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        currency: currency || 'SR',
        notes: notes || undefined,
        createdBy,
      };

      // debug log to confirm correct id is used
      console.log('🧪 supplierId (to send):', supplierId);
      console.log('📤 Sending payload to API:', payload);

      await create(payload);
      toast.success(t('order_saved_successfully'));

      setProducts([]);
      setSupplierId('');
      setExpectedDeliveryDate('');
      setOrderDate('');
      setNotes('');
      setCurrency('SR');
    } catch (err) {
      console.error('❌ Save purchase order error:', err);
      toast.error(t('failed_save_order_check_console'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t('request_order')}</h1>
        <p className="text-sm text-gray-500">{t('dashboard')} &gt; {t('inventory')} &gt; {t('stock_in')}</p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('supplier_label')}</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                value={supplierId}
                onChange={(e) => handleSupplierSelect(e.target.value)}
              >
                <option value="">{suppliersLoading ? t('loading_suppliers') : t('select_supplier')}</option>
                {suppliers.map((s: any) => (
                  // API returns suppliers with `id` (not always `_id`) so use whichever exists
                  <option key={s.id ?? s._id ?? s.name} value={s.id ?? s._id ?? ''}>
                    {truncate(s.name, 36)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('expected_delivery_date')}</label>
            <div className="relative">
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm"
                value={expectedDeliveryDate}
                onChange={(e) => handleExpectedDeliveryChange(e.target.value)}
              />
              <Calendar className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('order_date')}</label>
            <div className="relative">
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm"
                value={orderDate}
                onChange={(e) => handleOrderDateChange(e.target.value)}
              />
              <Calendar className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('currency_label')}</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="SR">SR</option>
                <option value="EGP">EGP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Add Products Section */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('add_products')}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-3 items-end">
            <div className="relative">
              <label className="block text-xs text-gray-600 mb-1">{t('product_label')}</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
              >
                <option value="">{productsLoading ? t('loading_products') : t('select_product')}</option>
                {productsFromHook.map((p: any) => (
                  <option key={p._id ?? p.id ?? p.productId ?? p.name} value={p._id ?? p.id}>
                    {truncate(p.name, 36)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-8 sm:top-8 w-4 h-4 text-gray-400" />
            </div>

            <div className="relative">
              <label className="block text-xs text-gray-600 mb-1">{t('inventory_label')}</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                value={selectedInventoryId}
                onChange={(e) => handleInventorySelect(e.target.value)}
              >
                <option value="">{inventoriesLoading ? t('loading_inventories') : t('select_inventory')}</option>
                {inventories.map((inv: any) => (
                  <option key={inv._id ?? inv.id ?? inv.name} value={inv._id}>
                    {truncate(inv.name, 36)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-8 sm:top-8 w-4 h-4 text-gray-400" />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('code_label')}</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm"
                value={formProduct.code}
                onChange={(e) => handleFormChange('code', e.target.value)}
              />
            </div>

            <div className="relative">
              <label className="block text-xs text-gray-600 mb-1">{t('units_label')}</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-6 text-sm"
                value={formProduct.units}
                onChange={(e) => handleFormChange('units', e.target.value)}
                min={0}
              />
              <ChevronDown className="absolute right-2 top-8 sm:top-8 w-4 h-4 text-gray-400" />
            </div>

            {/* Retail price input (existing) */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('retail_price_label') || t('price_label')}</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm"
                value={formProduct.price}
                onChange={(e) => handleFormChange('price', e.target.value)}
                min={0}
                step="0.01"
              />
            </div>

            {/* Wholesale price input (NEW) */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('wholesale_price_label') || 'سعر الجملة'}</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm"
                value={formProduct.wholesalePrice}
                onChange={(e) => handleFormChange('wholesalePrice', e.target.value)}
                min={0}
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('discount_label')}</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm"
                value={formProduct.discount}
                onChange={(e) => handleFormChange('discount', e.target.value)}
                min={0}
                max={100}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('total_label')}</label>
              <input
                type="text"
                readOnly
                value={computedFormTotal}
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm bg-gray-50"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
            <button
              onClick={handleResetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300"
            >
              {t('reset_btn')}
            </button>
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800"
            >
              {t('add_product_btn')}
            </button>
          </div>
        </div>

        {/* Received Products Section */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('received_products')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] sm:min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-600 pb-3 w-8"></th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('product_col')}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('inventory_col')}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('code_col')}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('units_col')}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('price_col')}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('wholesale_price_col') || 'سعر الجملة'}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('retail_price_col') || 'سعر التجزئة'}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('discount_col')}</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">{t('total_col')}</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100">
                    <td className="py-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleCheckboxToggle(product.id)}
                      />
                    </td>
                    <td className="py-3 text-sm text-gray-900">{product.name}</td>
                    <td className="py-3 text-sm text-gray-600">{product.inventoryName}</td>
                    <td className="py-3 text-sm text-gray-600">{product.code}</td>
                    <td className="py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {product.units}
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{product.price.toFixed(2)}</td>
                    <td className="py-3 text-sm text-gray-600">
                      {product.wholesalePrice != null ? product.wholesalePrice.toFixed(2) : '-'}
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {product.retailPrice != null ? product.retailPrice.toFixed(2) : '-'}
                    </td>
                    <td className="py-3 text-sm text-gray-600">{product.discount}%</td>
                    <td className="py-3 text-sm text-gray-900">{product.total.toFixed(2)}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-gray-400 hover:text-red-500 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <div className="text-right">
              <span className="text-sm font-medium text-gray-700">{t('total_label')}: </span>
              <span className="text-sm font-semibold text-gray-900">{total.toFixed(2)} {currency}</span>
            </div>
          </div>
        </div>

        {/* Notes & Action Buttons */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('notes_label')}</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('add_notes_placeholder')}
          ></textarea>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50">
            {t('cancel_label')}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('saving_label') : t('save_order_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockInComponent;
