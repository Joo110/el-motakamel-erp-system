import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useEmployees from '../../HR/hooks/useEmployees';
import useMobileStocks from '../hooks/useMobileStocks';
import useTrips from '../hooks/useTrips';
import type { TripPayload as ServiceTripPayload } from '../services/tripsService';
import axiosClient from "@/lib/axiosClient";

// local form types
interface ProductRow {
  id: string;
  product: string; // will hold product ID
  quantity: number | '';
  price: number | '';
  notes?: string;
}

interface TripFormData {
  location: string;
  representative: string; // agent id
  driver: string;
  car: string;
  area: string;
  date: string;
  products: ProductRow[];
}

const emptyProduct = (): ProductRow => ({ id: String(Date.now()) + Math.random(), product: '', quantity: '', price: '', notes: '' });

const NewTrip: React.FC = () => {
  const { t } = useTranslation();

  // hooks
  const { employees, loading: employeesLoading, refresh: refreshEmployees } = useEmployees();
  const { mobileStocks: carsList, loading: carsLoading, fetch: fetchCars } = useMobileStocks();
  const { createTrip } = useTrips();

  // products from /api/v1/products
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [formData, setFormData] = useState<TripFormData>({
    location: '',
    representative: '',
    driver: '',
    car: '',
    area: '',
    date: '',
    products: [emptyProduct()],
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void refreshEmployees?.();
    void fetchCars?.();
    void fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await axiosClient.get('/products');
      const d = res.data ?? {};
      let arr: any[] = [];
      if (Array.isArray(d)) arr = d;
      else if (Array.isArray(d.data)) arr = d.data;
      else if (Array.isArray(res.data?.data)) arr = res.data.data;
      else if (Array.isArray(d.results?.data)) arr = d.results.data;
      // fallback: try to find first array value
      if (!arr.length && d && typeof d === 'object') {
        for (const key of Object.keys(d)) {
          if (Array.isArray((d as any)[key])) {
            arr = (d as any)[key];
            break;
          }
        }
      }
      setProducts(arr || []);
    } catch (err) {
      console.error('fetchProducts failed', err);
      toast.error(t('Error loading products'));
    } finally {
      setProductsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev,
      [name]: value }));
  };

  const handleProductChange = (id: string, key: keyof ProductRow, value: any) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, [key]: value } : p),
    }));
  };

  const addProduct = () => setFormData(prev => ({ ...prev, products: [...prev.products, emptyProduct()] }));
  const removeProduct = (id: string) => setFormData(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));

  const getEmployeeName = (e: any) => e?.name ?? e?.fullName ?? e?.title ?? e?._id ?? e?.id ?? String(e);
  const getCarName = (c: any) => c?.name ?? c?.title ?? c?.plateNumber ?? c?._id ?? c?.id ?? String(c);
  const getProductName = (p: any) => p?.name ?? p?.title ?? p?.productName ?? p?._id ?? p?.id ?? String(p);

  const validate = () => {
    if (!formData.location?.trim()) return t('Location is required');
    if (!formData.representative) return t('Agent is required');
    if (!formData.driver?.trim()) return t('Driver is required');
    for (const p of formData.products) {
      if (p.product && (!p.quantity || Number(p.quantity) <= 0)) return t('Please provide a valid quantity for each product');
    }
    return null;
  };

const buildPayload = (): ServiceTripPayload => {
  return {
    location: formData.location,
    representative: formData.representative,
    driver: formData.driver,

    car: formData.car || '',
    date: formData.date || '',

    area: formData.area || undefined,

    products: formData.products
      .filter(p => p.product)
      .map(p => ({
        product: p.product,     // product ID
        quantity: Number(p.quantity) || 0,
        price: Number(p.price) || 0,
        notes: p.notes || undefined,
      })),
  };
};


  const handleSubmit = async () => {
    const vErr = validate();
    if (vErr) {
      toast.error(String(vErr));
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      await createTrip(payload as any);
      toast.success(t('Trip created successfully!'));
      setFormData({ location: '', representative: '', driver: '', car: '', area: '', date: '', products: [emptyProduct()] });
    } catch (err: any) {
      console.error('Error creating trip', err);
      const msg = err?.response?.data?.message ?? err?.message ?? t('Error creating trip.');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-3 flex items-center gap-4 flex-wrap">
        <h1 className="text-3xl font-bold text-gray-800">{t('Trips Management')}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <span>{t('Dashboard')}</span>
          <span>›</span>
          <span>{t('Delegates')}</span>
          <span>›</span>
          <span className="text-gray-700">{t('NewTrip')}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">{t('NewTrip')}</h2>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('Location')} <span className="text-red-500">*</span></label>
              <input name="location" value={formData.location} onChange={handleInputChange} placeholder={t('Enter Location...')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Agent')} <span className="text-red-500">*</span></label>
                <select name="representative" value={formData.representative} onChange={handleInputChange} disabled={employeesLoading} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white">
                  <option value="">{employeesLoading ? t('Loading...') : t('Select Agent...')}</option>
                  {employees?.map((emp: any) => (
                    <option key={emp._id ?? emp.id} value={emp._id ?? emp.id}>{getEmployeeName(emp)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Driver')} <span className="text-red-500">*</span></label>
                <input name="driver" value={formData.driver} onChange={handleInputChange} placeholder={t('Enter_Driver_Name')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('Cars')}</label>
              <select name="car" value={formData.car} onChange={handleInputChange} disabled={carsLoading} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white">
                <option value="">{carsLoading ? t('Loading...') : t('Select Car...')}</option>
                {carsList?.map((car: any) => (
                  <option key={car._id ?? car.id} value={car._id ?? car.id}>{getCarName(car)}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Area')}</label>
                <select name="area" value={formData.area} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white">
                  <option value="">{t('Select Area...')}</option>
                  <option value="Riyadh">Riyadh</option>
                  <option value="Jeddah">Jeddah</option>
                  <option value="Dammam">Dammam</option>
                  <option value="Mecca">Mecca</option>
                  <option value="Medina">Medina</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Date')}</label>
                <input name="date" type="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            {/* Products section */}
            <div className="pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{t('Products')}</h3>
                <button type="button" onClick={addProduct} className="text-sm px-3 py-1 border rounded-md">{t('Add_product')}</button>
              </div>

              <div className="space-y-3 mt-4">
                {formData.products.map((p) => (
                  <div key={p.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                    <select value={p.product} onChange={(e) => handleProductChange(p.id, 'product', e.target.value)} className="md:col-span-2 px-3 py-2 border rounded-md">
                      <option value="">{productsLoading ? t('Loading...') : t('Select_product')}</option>
                      {products.map(prod => (
                        <option key={prod._id ?? prod.id} value={prod._id ?? prod.id}>{getProductName(prod)}</option>
                      ))}
                    </select>

                    <input placeholder={t('Qty')} value={String(p.quantity)} onChange={(e) => handleProductChange(p.id, 'quantity', e.target.value ? Number(e.target.value) : '')} className="px-3 py-2 border rounded-md" type="number" min={0} />

                    <input placeholder={t('Price')} value={String(p.price)} onChange={(e) => handleProductChange(p.id, 'price', e.target.value ? Number(e.target.value) : '')} className="px-3 py-2 border rounded-md" type="number" min={0} />

                    <input placeholder={t('Notes')} value={p.notes} onChange={(e) => handleProductChange(p.id, 'notes', e.target.value)} className="px-3 py-2 border rounded-md md:col-span-2" />

                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => removeProduct(p.id)} className="px-3 py-1 text-sm border rounded-md">{t('Remove')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <button onClick={() => setFormData({ location: '', representative: '', driver: '', car: '', area: '', date: '', products: [emptyProduct()] })} className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition-all font-medium">{t('Cancel')}</button>

            <button onClick={handleSubmit} disabled={saving} className={`px-6 py-2.5 text-white rounded-xl shadow-md font-medium transition-all ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-800'}`}>
              {saving ? t('Saving...') : t('SaveTrip')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTrip;
