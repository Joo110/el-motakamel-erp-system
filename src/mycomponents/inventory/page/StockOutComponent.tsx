import React, { useMemo, useState } from 'react';
import { Calendar, ChevronDown, Trash2 } from 'lucide-react';
import { useSaleOrders } from '../../Sales/hooks/useSaleOrders';
import { useProducts } from '../../product/hooks/useProducts';
import { useInventories } from '../../inventory/hooks/useInventories';
import { useCustomers } from '../../Sales/hooks/useCustomers';
import { toast } from 'react-hot-toast';

interface ProductRow {
  id: string;
  productId: string;
  inventoryId: string;
  name: string;
  inventoryName: string;
  code: string;
  units: number;
  price: number;
  discount: number;
  total: number;
}

const truncate = (s: string | undefined, n = 30) => {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
};

const StockOutComponent: React.FC = () => {
  const [products, setProducts] = useState<ProductRow[]>([
    { id: '1', productId: '1', inventoryId: 'a', name: 'Product 1', inventoryName: 'Abu Dhabi', code: '99282', units: 10, price: 1140.95, discount: 13, total: 9990.0 },
    { id: '2', productId: '2', inventoryId: 'a', name: 'Product 2', inventoryName: 'Abu Dhabi', code: '323-14', units: 10, price: 1710.55, discount: 13, total: 9400.0 },
    { id: '3', productId: '3', inventoryId: 'b', name: 'Wireless Bluetooth Earbuds', inventoryName: 'New capital', code: '326x1', units: 10, price: 1102.55, discount: 11, total: 9400.0 },
    { id: '4', productId: '4', inventoryId: 'a', name: 'Product 2', inventoryName: 'Abu Dhabi', code: '322-14', units: 10, price: 1710.55, discount: 23, total: 9400.0 },
  ]);

  const total = useMemo(() => products.reduce((sum, product) => sum + product.total, 0), [products]);

  // ===== form state for Add Products =====
  const [formProduct, setFormProduct] = useState({
    name: '',
    inventory: '',
    code: '96269',
    units: '0',
    price: '0',
    discount: '0',
  });

  // ===== selected ids =====
  const [customerId, setCustomerId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>('');

  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>('');
  const [currency, setCurrency] = useState<string>('SR');
  const [notes, setNotes] = useState<string>('');
  
  const [organizationId] = useState<string>('68c2d89e2ee5fae98d57bef1');
  const [createdBy] = useState<string>('68c699af13bdca2885ed4d27');

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // ===== hooks =====
  const { create, loading } = useSaleOrders(undefined, false);
  const { products: productsFromHook = [], loading: productsLoading = false } = useProducts() as any;
  const { inventories = [], isLoading: inventoriesLoading = false } = useInventories() as any;
  const { customers = [], loading: customersLoading = false } = useCustomers() as any;

  const computedFormTotal = useMemo(() => {
    const u = Number(formProduct.units || 0);
    const p = Number(formProduct.price || 0);
    const d = Number(formProduct.discount || 0);
    const tot = u * p * (1 - d / 100);
    return isFinite(tot) ? tot.toFixed(2) + ' SR' : '0.00 SR';
  }, [formProduct.units, formProduct.price, formProduct.discount]);

  // ===== handlers =====
  const handleFormChange = (key: keyof typeof formProduct, value: string) => {
    setFormProduct((s) => ({ ...s, [key]: value }));
  };

  const handleResetForm = () => {
    setFormProduct({ name: '', inventory: '', code: '96269', units: '0', price: '0', discount: '0' });
    setSelectedProductId('');
    setSelectedInventoryId('');
  };

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    const c = customers.find((x: any) => x._id === id);
    setFormProduct((f) => ({ ...f, name: c?.name ?? '' }));
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const p = productsFromHook.find((x: any) => x._id === productId || x.id === productId);
    setFormProduct((f) => ({ ...f, name: p?.name ?? '' }));
    if (p && (p.price || p.code)) {
      if (p.price) setFormProduct((f) => ({ ...f, price: String(p.price) }));
      if (p.code) setFormProduct((f) => ({ ...f, code: String(p.code) }));
    }
  };

  const handleInventorySelect = (inventoryId: string) => {
    setSelectedInventoryId(inventoryId);
    const inv = inventories.find((x: any) => x._id === inventoryId || x.id === inventoryId);
    setFormProduct((f) => ({ ...f, inventory: inv?.name ?? '' }));
  };

  const handleAddProduct = () => {
  // ✅ Validation لكل الحقول المهمة
  if (!selectedProductId) {
    toast.error('Please select a product.');
    return;
  }
  if (!selectedInventoryId) {
    toast.error('Please select an inventory.');
    return;
  }
  if (!formProduct.units || Number(formProduct.units) <= 0) {
    toast.error('Units must be greater than 0.');
    return;
  }
  if (!formProduct.price || Number(formProduct.price) <= 0) {
    toast.error('Price must be greater than 0.');
    return;
  }

  // ===== Add product logic =====
  const units = Number(formProduct.units);
  const price = Number(formProduct.price);
  const discount = Number(formProduct.discount || 0);
  const tot = units * price * (1 - discount / 100);

  const productName =
    productsFromHook.find((p: any) => p._id === selectedProductId || p.id === selectedProductId)?.name ??
    formProduct.name;
  const inventoryName =
    inventories.find((i: any) => i._id === selectedInventoryId || i.id === selectedInventoryId)?.name ??
    formProduct.inventory;

  const newProduct: ProductRow = {
    id: Date.now().toString(),
    productId: selectedProductId,
    inventoryId: selectedInventoryId,
    name: productName,
    inventoryName,
    code: formProduct.code || '96269',
    units,
    price,
    discount,
    total: Math.round((tot + Number.EPSILON) * 100) / 100,
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
    console.groupCollapsed('[StockOut] mapProductsForApi');
    console.log('Input products array:', p);
    const mapped = p.map((prod) => {
      const mappedItem = {
        productId: prod.productId,
        inventoryId: prod.inventoryId,
        name: prod.name,
        quantity: prod.units,
        price: prod.price,
        discount: prod.discount,
      };
      // log warnings if something suspicious
      if (!mappedItem.productId) console.warn('[StockOut] missing productId for', prod);
      if (!mappedItem.inventoryId) console.warn('[StockOut] missing inventoryId for', prod);
      if (typeof mappedItem.quantity !== 'number' || Number.isNaN(mappedItem.quantity)) console.warn('[StockOut] quantity is not a number for', prod);
      console.log('Mapped item:', mappedItem);
      return mappedItem;
    });
    console.groupEnd();
    return mapped;
  }

  // ===== حفظ الطلب وإرساله للـ API =====
  const handleSave = async () => {
    try {
      console.group('[StockOut] handleSave START');
      console.log('customerId:', customerId);
      console.log('organizationId:', organizationId);
      console.log('createdBy:', createdBy);
      console.log('products (local):', products);
      console.log('selectedProducts:', selectedProducts);
      console.log('expectedDeliveryDate:', expectedDeliveryDate);
      console.log('currency:', currency);
      console.log('notes:', notes);

      if (!customerId) {
        toast.error('Please select a customer before saving.');
        console.warn('[StockOut] missing customerId');
        console.groupEnd();
        return;
      }
      
      if (products.length === 0) {
        toast.error('Please add at least one product.');
        console.warn('[StockOut] products array empty');
        console.groupEnd();
        return;
      }

      const productsToSend = selectedProducts.length
        ? products.filter((p) => selectedProducts.includes(p.id))
        : products;

      console.log('[StockOut] productsToSend:', productsToSend);

      const mappedProducts = mapProductsForApi(productsToSend);

      // extra validation before sending
      const invalid = mappedProducts.find((mp) => !mp.productId || !mp.inventoryId || typeof mp.quantity !== 'number' || mp.quantity <= 0);
      if (invalid) {
        console.error('[StockOut] Found invalid mapped product before API call:', invalid);
        toast.error('One or more products are missing required fields (productId/inventoryId/quantity). Check console.');
        console.groupEnd();
        return;
      }

      const payload: any = {
        customerId,
        organizationId,
        products: mappedProducts,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        currency: currency || 'SR',
        notes: notes || undefined,
        createdBy,
      };
console.log('payload from React:', JSON.stringify(payload, null, 2));

      console.log('📤 Sending sale order payload to API:', payload);

      // call create and catch result
      try {
        const res = await create(payload);
        console.log('✅ create() resolved with:', res);
        toast.success('✅ Sale order saved successfully');
      } catch (err: any) {
        // Log full error details - helpful to inspect server response
        console.error('❌ create() threw error:', err);
        console.error('err.response?.status:', err?.response?.status);
        console.error('err.response?.data:', err?.response?.data);
        console.error('err.request:', err?.request);
        toast.error('Failed to save sale order. Check console for details.');
        console.groupEnd();
        return;
      }

      // reset UI state after success
      setProducts([]);
      setCustomerId('');
      setExpectedDeliveryDate('');
      setOrderDate('');
      setNotes('');
      setCurrency('SR');
      setSelectedProducts([]);

      console.groupEnd();
    } catch (err) {
      console.error('❌ Save sale order unexpected error:', err);
      toast.error('Failed to save sale order. Check console for details.');
    }
  };

  // ===== UI =====
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-500">Dashboard &gt; Inventory &gt; Stock out</p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Top Section */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                value={customerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
              >
                <option value="">{customersLoading ? 'Loading customers...' : 'Select customer'}</option>
                {customers.map((c: any) => (
                  <option key={c._id ?? c.id ?? c.name} value={c._id}>
                    {truncate(c.name, 36)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date</label>
            <div className="relative">
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              />
              <Calendar className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Date</label>
            <div className="relative">
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
              <Calendar className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add Products</h2>
          <div className="grid grid-cols-7 gap-3 items-end">
            {/* Product dropdown */}
            <div className="relative">
              <label className="block text-xs text-gray-600 mb-1">Product</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
              >
                <option value="">{productsLoading ? 'Loading' : 'Select pro'}</option>
                {productsFromHook.map((p: any) => (
                  <option key={p._id ?? p.id ?? p.productId ?? p.name} value={p._id ?? p.id}>
                    {truncate(p.name, 36)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-8 w-4 h-4 text-gray-400" />
            </div>

            {/* Inventory dropdown */}
            <div className="relative">
              <label className="block text-xs text-gray-600 mb-1">Inventory</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                value={selectedInventoryId}
                onChange={(e) => handleInventorySelect(e.target.value)}
              >
                <option value="">{inventoriesLoading ? 'Loading ' : 'Select inv'}</option>
                {inventories.map((inv: any) => (
                  <option key={inv._id ?? inv.id ?? inv.name} value={inv._id}>
                    {truncate(inv.name, 36)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-8 w-4 h-4 text-gray-400" />
            </div>

            {/* Code */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Code</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm"
                value={formProduct.code}
                onChange={(e) => handleFormChange('code', e.target.value)}
              />
            </div>

            {/* Units */}
            <div className="relative">
              <label className="block text-xs text-gray-600 mb-1">Units</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-6 text-sm"
                value={formProduct.units}
                onChange={(e) => handleFormChange('units', e.target.value)}
                min={0}
              />
              <ChevronDown className="absolute right-2 top-8 w-4 h-4 text-gray-400" />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Price</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm"
                value={formProduct.price}
                onChange={(e) => handleFormChange('price', e.target.value)}
                min={0}
                step="0.01"
              />
            </div>

            {/* Discount */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Discount</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm"
                value={formProduct.discount}
                onChange={(e) => handleFormChange('discount', e.target.value)}
                min={0}
                max={100}
              />
            </div>

            {/* Total */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Total</label>
              <input
                type="text"
                readOnly
                value={computedFormTotal}
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm bg-gray-50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleResetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300"
            >
              Reset
            </button>
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Received Products Section */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Received Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-600 pb-3 w-8"></th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Product</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Inventory</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Code</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Units</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Price</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Discount</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Total</th>
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
                    <td className="py-3 text-sm text-gray-600">{product.discount}%</td>
                    <td className="py-3 text-sm text-gray-900">{product.total.toFixed(2)} {currency}</td>
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
              <span className="text-sm font-medium text-gray-700">Total: </span>
              <span className="text-sm font-semibold text-gray-900">{total.toFixed(2)} {currency}</span>
            </div>
          </div>
        </div>

        {/* Notes & Action Buttons */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes here..."
          ></textarea>
        </div>

        <div className="flex justify-end gap-3">
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockOutComponent;
