import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useMobileStocks from '../hooks/useMobileStocks';

interface AddCarFormProps {
  onSave?: (data: CarFormData) => void;
  onCancel?: () => void;
  editingId?: string | null;
}

export interface CarFormData {
  id: string;
  carName: string;
  brand: string;
  year: string; // kept for UI compatibility
  // removed image
  // hidden/internal fields to satisfy API
  representative?: string;
  capacity?: string; // string to keep compatibility with input handlers
  // goods removed
}

const AddCarForm: React.FC<AddCarFormProps> = ({ onSave, onCancel, editingId = null }) => {
  const { t } = useTranslation();
  const { getById, createItem, updateItem, deleteItem } = useMobileStocks();

  const [formData, setFormData] = useState<CarFormData>({
    id: '#CAR001',
    carName: '',
    brand: '',
    year: '',
    representative: '',
    capacity: '',
  });

  const [errors, setErrors] = useState({
    carName: '',
    brand: '',
    year: ''
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!editingId) return;
      try {
        setLoading(true);
        const res: any = await getById(editingId);
        if (!mounted) return;
        if (res) {
          setFormData({
            id: res._id ?? res.id ?? String(editingId),
            carName: (res.name ?? res.carName ?? res.model ?? '') as string,
            brand: (res.brand ?? res.make ?? '') as string,
            year: String(res.year ?? res.capacity ?? ''),
            representative: res.representative ?? '',
            capacity: String(res.capacity ?? ''),
          });
        }
      } catch (err) {
        console.error('fetch car failed', err);
        toast.error(t('Error fetching car data'));
      } finally {
        setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [editingId, getById, t]);

  const handleInputChange = (field: keyof CarFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field as keyof typeof errors]: '' }));
  };

  const validate = () => {
    const newErrors = { carName: '', brand: '', year: '' };
    let valid = true;

    if (!formData.carName.trim()) {
      newErrors.carName = t('carNameRequired');
      valid = false;
    }
    if (!formData.brand.trim()) {
      newErrors.brand = t('brandRequired');
      valid = false;
    }
    if (!formData.year.trim()) {
      newErrors.year = t('yearRequired');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // representative: if provided and length looks like ObjectId keep it, else fallback to placeholder
      const repCandidate = formData.representative && formData.representative.length === 24
        ? formData.representative
        : (formData.representative || '000000000000000000000000');

      // capacity: prefer capacity field, fallback to year, ensure number >= 1
      let capacityNum = Number(formData.capacity ?? formData.year ?? 0);
      if (Number.isNaN(capacityNum) || capacityNum < 1) capacityNum = 1;

      const payload = {
        name: formData.carName,
        brand: formData.brand,
        year: Number(formData.year) || undefined,
        representative: repCandidate,
        capacity: capacityNum,
      };

      if (editingId) {
        await updateItem(editingId, payload);
        toast.success(t('carUpdatedSuccess'));
      } else {
        await createItem(payload);
        toast.success(t('carAddedSuccess'));
      }

      if (onSave) onSave(formData);
    } catch (err: any) {
      console.error('save car failed', err);
      const msg = err?.response?.data?.message ?? err?.message ?? t('Save failed');
      toast.error(msg);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    const ok = window.confirm(t('Are you sure you want to delete this car?'));
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteItem(editingId);
      toast.success(t('carDeletedSuccess'));
      if (onCancel) onCancel();
    } catch (err: any) {
      console.error('delete car failed', err);
      const msg = err?.response?.data?.message ?? err?.message ?? t('Delete failed');
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 md:mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-3 md:mb-4 flex-wrap">
            <span>{t('dashboard')}</span>
            <span>›</span>
            <span>{t('cars')}</span>
            <span>›</span>
            <span className="text-gray-700">{editingId ? t('editCarTitle') : t('addCarTitle')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">{t('carManagement')}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
            <h2 className="text-base sm:text-lg font-semibold">{editingId ? t('editCarTitle') : t('addCarTitle')}</h2>
            <div className="text-xs sm:text-sm flex items-center gap-3">
              <div>
                <span className="text-gray-600">{t('id')}:</span>
                <span className="ml-2 font-medium">{formData.id}</span>
              </div>
              {loading && <div className="text-xs sm:text-sm text-gray-400">{t('Loading...')}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
              <div>
                <label className="block text-sm font-medium mb-2">{t('carName')}:</label>
                <input
                  type="text"
                  value={formData.carName}
                  onChange={(e) => handleInputChange('carName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                {errors.carName && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.carName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('brand')}:</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                {errors.brand && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.brand}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('year')}:</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                {errors.year && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.year}</p>}
              </div>
            </div>

            <div className="flex flex-col items-stretch order-1 lg:order-2">
              {/* Replaced image area with representative & capacity inputs to keep layout similar */}
              <div className="rounded-lg h-full w-full flex flex-col justify-center bg-gray-50 p-4 mb-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('representative')}:</label>
                  <input
                    type="text"
                    value={formData.representative}
                    onChange={(e) => handleInputChange('representative', e.target.value)}
                    placeholder= {t('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('capacity')}:</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    placeholder="500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 md:mt-8">
            <button
              onClick={onCancel}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-sm sm:text-base"
              disabled={saving || deleting}
            >
              {t('cancel')}
            </button>

            {editingId && (
              <button
                onClick={handleDelete}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-all text-sm sm:text-base"
                disabled={deleting || saving}
                title={t('delete')}
              >
                {deleting ? t('Deleting...') : <><Trash2 size={14} className="inline-block mr-2" />{t('delete')}</>}
              </button>
            )}

            <button
              onClick={handleSave}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-full bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-sm transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              disabled={saving || deleting}
            >
              {saving ? t('Saving...') : t('saveCar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCarForm;
