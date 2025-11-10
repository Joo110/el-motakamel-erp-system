import React, { useMemo, useState } from 'react';
import { Calendar, ChevronDown, Trash2 } from 'lucide-react';
import { useCreatePurchaseOrder } from '../../Precious/hooks/useCreatePurchaseOrder';
import { useProducts } from '../../product/hooks/useProducts';
import { useInventories } from '../../inventory/hooks/useInventories';
import { useSuppliers } from '../../Precious/hooks/useSuppliers';
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

const StockInComponent: React.FC = () => {
  const [products, setProducts] = useState<ProductRow[]>([]);

  const total = useMemo(() => products.reduce((sum, product) => sum + product.total, 0), [products]);

  const [formProduct, setFormProduct] = useState({
    name: '',
    inventory: '',
    code: '96060',
    units: '0',
    price: '0',
    discount: '0',
  });

  const [supplierId, setSupplierId] = useState<string>('');
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
  const { create, loading } = useCreatePurchaseOrder();
  const { products: productsFromHook = [], loading: productsLoading = false } = useProducts() as any;
  const { inventories = [], isLoading: inventoriesLoading = false } = useInventories() as any;
  const { suppliers = [], loading: suppliersLoading = false } = useSuppliers() as any;

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
    setFormProduct({ name: '', inventory: '', code: '96060', units: '0', price: '0', discount: '0' });
    setSelectedProductId('');
    setSelectedInventoryId('');
  };

  const handleSupplierSelect = (id: string) => {
    setSupplierId(id);
    const s = suppliers.find((x: any) => x._id === id);
    setFormProduct((f) => ({ ...f, name: s?.name ?? '' }));
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
    // ✅ Validation
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
      code: formProduct.code || '96060',
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
    return p.map((prod) => ({
      productId: prod.productId,
      inventoryId: prod.inventoryId,
      name: prod.name,
      quantity: prod.units,
      price: prod.price,
      discount: prod.discount,
    }));
  }

  const handleSave = async () => {
    try {
      if (!supplierId) {
        toast.error('Please select a supplier before saving.');
        return;
      }

      if (products.length === 0) {
        toast.error('Please add at least one product.');
        return;
      }

      const payload: any = {
        supplierId,
        organizationId,
        products: mapProductsForApi(products),
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        currency: currency || 'SR',
        notes: notes || undefined,
        createdBy,
      };

      console.log('📤 Sending payload to API:', payload);
      await create(payload);
      toast.success('✅ Order saved successfully');

      setProducts([]);
      setSupplierId('');
      setExpectedDeliveryDate('');
      setOrderDate('');
      setNotes('');
      setCurrency('SR');
    } catch (err) {
      console.error('❌ Save purchase order error:', err);
      toast.error('Failed to save order. Check console for details.');
    }
  };

  // ===== UI =====
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-500">Dashboard &gt; Inventory &gt; Stock in</p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Top Section */}
        {/* responsive: 1 col on xs, 2 on sm, 4 on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                value={supplierId}
                onChange={(e) => handleSupplierSelect(e.target.value)}
              >
                <option value="">{suppliersLoading ? 'Loading suppliers...' : 'Select supplier'}</option>
                {suppliers.map((s: any) => (
                  <option key={s._id ?? s.id ?? s.name} value={s._id}>
                    {truncate(s.name, 36)}
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

          {/* responsive grid:
              - xs: 1 col (stack)
              - sm: 2 cols
              - md: 3 cols
              - lg: 7 cols (matches original wide layout)
           */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 items-end">
            {/* Product dropdown */}
            <div className="relative">
              <label className="block text-xs text-gray-600 mb-1">Product</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
              >
                <option value="">{productsLoading ? 'Loading products...' : 'Select product'}</option>
                {productsFromHook.map((p: any) => (
                  <option key={p._id ?? p.id ?? p.productId ?? p.name} value={p._id ?? p.id}>
                    {truncate(p.name, 36)}
                  </option>
                ))}
              </select>
              {/* on small screens the top offset must be smaller; keep consistent */}
              <ChevronDown className="absolute right-2 top-8 sm:top-8 w-4 h-4 text-gray-400" />
            </div>

            {/* Inventory dropdown */}
            <div className="relative">
              <label className="block text-xs text-gray-600 mb-1">Inventory</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                value={selectedInventoryId}
                onChange={(e) => handleInventorySelect(e.target.value)}
              >
                <option value="">{inventoriesLoading ? 'Loading inventories...' : 'Select inventory'}</option>
                {inventories.map((inv: any) => (
                  <option key={inv._id ?? inv.id ?? inv.name} value={inv._id}>
                    {truncate(inv.name, 36)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-8 sm:top-8 w-4 h-4 text-gray-400" />
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
              <ChevronDown className="absolute right-2 top-8 sm:top-8 w-4 h-4 text-gray-400" />
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

          {/* buttons: on small screens stack, on larger show inline to the right */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
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
            <table className="w-full min-w-[600px] sm:min-w-full">
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

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
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

export default StockInComponent;
