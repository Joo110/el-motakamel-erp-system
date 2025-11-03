import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronDown, Trash2, Save } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePurchaseOrder } from '../../Sales/hooks/useSaleOrders'; // ✅ استخدم نفس الـ hook
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

const EditSaleOrderComponent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ✅ استخدم نفس الـ hook اللي في StockOutDraftComponent
  const { item, loading: orderLoading, error: orderError, patch } = usePurchaseOrder(id);
  const { products: productsFromHook = [], loading: productsLoading = false } = useProducts() as any;
  const { inventories = [], isLoading: inventoriesLoading = false } = useInventories() as any;
  const { suppliers = [], loading: suppliersLoading = false } = useSuppliers() as any;

  // ===== State =====
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [supplierId, setSupplierId] = useState<string>('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>('');
  const [currency, setCurrency] = useState<string>('SR');
  const [notes, setNotes] = useState<string>('');

  const [formProduct, setFormProduct] = useState({
    name: '',
    inventory: '',
    code: '96060',
    units: '0',
    price: '0',
    discount: '0',
  });
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // ✅ تحميل البيانات من الـ API
  useEffect(() => {
    if (item) {
      console.log('📦 Loaded Sale Order Data:', item);
      
      setSupplierId(item.supplierId || '');
      setExpectedDeliveryDate(item.expectedDeliveryDate || '');
      setOrderDate(item.createdAt ? item.createdAt.split('T')[0] : '');
      setCurrency(item.currency || 'SR');
      setNotes(item.notes || '');

      if (item.products && item.products.length > 0) {
        const mappedProducts: ProductRow[] = item.products.map((p: any, idx: number) => ({
          id: p._id || `product-${idx}`,
          productId: p.productId || '',
          inventoryId: p.inventoryId || '',
          name: p.name || '-',
          inventoryName: p.inventoryName || '-',
          code: p.code || '96060',
          units: p.quantity || 0,
          price: p.price || 0,
          discount: p.discount || 0,
          total: (p.quantity || 0) * (p.price || 0) * (1 - (p.discount || 0) / 100),
        }));
        setProducts(mappedProducts);
      }
    }
  }, [item]);

  const total = useMemo(() => products.reduce((sum, product) => sum + product.total, 0), [products]);

  const computedFormTotal = useMemo(() => {
    const u = Number(formProduct.units || 0);
    const p = Number(formProduct.price || 0);
    const d = Number(formProduct.discount || 0);
    const tot = u * p * (1 - d / 100);
    return isFinite(tot) ? tot.toFixed(2) + ' ' + currency : '0.00 ' + currency;
  }, [formProduct.units, formProduct.price, formProduct.discount, currency]);

  // ===== Handlers =====
  const handleFormChange = (key: keyof typeof formProduct, value: string) => {
    setFormProduct((s) => ({ ...s, [key]: value }));
  };

  const handleResetForm = () => {
    setFormProduct({ name: '', inventory: '', code: '96060', units: '0', price: '0', discount: '0' });
    setSelectedProductId('');
    setSelectedInventoryId('');
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
    if (!selectedProductId || !selectedInventoryId || Number(formProduct.units) <= 0 || Number(formProduct.price) <= 0) {
      toast.error('Please select product & inventory and fill Units (>0) and Price (>0)');
      return;
    }

    const units = Number(formProduct.units);
    const price = Number(formProduct.price);
    const discount = Number(formProduct.discount || 0);
    const tot = units * price * (1 - discount / 100);

    const productName =
      productsFromHook.find((p: any) => p._id === selectedProductId || p.id === selectedProductId)?.name ?? formProduct.name;
    const inventoryName =
      inventories.find((i: any) => i._id === selectedInventoryId || i.id === selectedInventoryId)?.name ?? formProduct.inventory;

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
    toast.success('✅ Product added');
  };

  const handleCheckboxToggle = (id: string) => {
    setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedProducts((prev) => prev.filter((x) => x !== id));
    toast.success('🗑️ Product removed');
  };

  const mapProductsForApi = (p: ProductRow[]) => {
    return p.map((prod) => ({
      productId: prod.productId,
      inventoryId: prod.inventoryId,
      name: prod.name,
      quantity: prod.units,
      price: prod.price,
      discount: prod.discount,
    }));
  };

  // ✅ استخدم patch بدل update
  const handleUpdate = async () => {
    try {
      if (!supplierId) {
        toast.error('Please select a supplier before updating.');
        return;
      }

      if (products.length === 0) {
        toast.error('Please add at least one product.');
        return;
      }

      const payload: any = {
        supplierId,
        products: mapProductsForApi(products),
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        currency: currency || 'SR',
        notes: notes || undefined,
      };

      console.log('🔄 Updating sale order with payload:', payload);
      await patch(payload);
      toast.success('✅ Sale order updated successfully');
      
      setTimeout(() => navigate(-1), 1000);
    } catch (err: any) {
      console.error('❌ Update error:', err);
      toast.error('Failed to update sale order. Check console for details.');
    }
  };

  // ===== Loading & Error States =====
  if (orderLoading) return <div className="min-h-screen flex items-center justify-center">Loading sale order...</div>;
  if (orderError) return <div className="min-h-screen flex items-center justify-center text-red-600">Error: {orderError.message}</div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center">Sale order not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Sale Order</h1>
        <p className="text-sm text-gray-500">Dashboard &gt; Sales Orders &gt; Edit #{item.invoiceNumber || id}</p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Top Section */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-gray-50"
                value={orderDate}
                readOnly
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add More Products</h2>
          <div className="grid grid-cols-7 gap-3 items-end">
            <div className="relative">
              <label className="block text-xs text-gray-600 mb-1">Product</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
              >
                <option value="">{productsLoading ? 'Loading...' : 'Select'}</option>
                {productsFromHook.map((p: any) => (
                  <option key={p._id ?? p.id} value={p._id ?? p.id}>
                    {truncate(p.name, 36)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-8 w-4 h-4 text-gray-400" />
            </div>

            <div className="relative">
              <label className="block text-xs text-gray-600 mb-1">Inventory</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-full pr-8 text-sm bg-white appearance-none"
                value={selectedInventoryId}
                onChange={(e) => handleInventorySelect(e.target.value)}
              >
                <option value="">{inventoriesLoading ? 'Loading...' : 'Select'}</option>
                {inventories.map((inv: any) => (
                  <option key={inv._id ?? inv.id} value={inv._id}>
                    {truncate(inv.name, 36)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-8 w-4 h-4 text-gray-400" />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Code</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm"
                value={formProduct.code}
                onChange={(e) => handleFormChange('code', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Units</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm"
                value={formProduct.units}
                onChange={(e) => handleFormChange('units', e.target.value)}
                min={0}
              />
            </div>

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

        {/* Products Table */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Products</h2>
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
                    <td className="py-3 text-sm text-gray-600">{product.units}</td>
                    <td className="py-3 text-sm text-gray-600">{product.price.toFixed(2)}</td>
                    <td className="py-3 text-sm text-gray-600">{product.discount}%</td>
                    <td className="py-3 text-sm text-gray-900">
                      {product.total.toFixed(2)} {currency}
                    </td>
                    <td className="py-3">
                      <button onClick={() => handleDeleteProduct(product.id)} className="text-gray-400 hover:text-red-500">
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
              <span className="text-sm font-semibold text-gray-900">
                {total.toFixed(2)} {currency}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={orderLoading}
            className="px-6 py-2 bg-slate-700 text-white rounded-full text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {orderLoading ? 'Updating...' : 'Update Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSaleOrderComponent;