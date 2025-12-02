// src/mycomponents/Trips/components/AddCarForm.tsx
import React, { useEffect, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useMobileStocks from '../hooks/useMobileStocks'; // عدّل المسار لو لازم

interface AddCarFormProps {
  onSave?: (data: CarFormData) => void;
  onCancel?: () => void;
  /** لو بعت editingId الكمبوننت هتشتغل في وضع التعديل وتجيب الداتا من الهُوك */
  editingId?: string | null;
}

export interface CarFormData {
  id: string;
  carName: string;
  brand: string;
  year: string;
  image: string | null;
}

const AddCarForm: React.FC<AddCarFormProps> = ({ onSave, onCancel, editingId = null }) => {
  const { t } = useTranslation();
  const { getById, createItem, updateItem, deleteItem } = useMobileStocks();

  const [formData, setFormData] = useState<CarFormData>({
    id: '#CAR001',
    carName: '',
    brand: '',
    year: '',
    image: ''
  });

  const [errors, setErrors] = useState({
    carName: '',
    brand: '',
    year: ''
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  // لو فيه editingId → جلب الداتا من الهُوك وعبي الفورم
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!editingId) return;
      try {
        setLoading(true);
        const res: any = await getById(editingId);
        if (!mounted) return;
        if (res) {
          // حاول نطابق الحقول اللي ممكن يردها السيرفر
          setFormData({
            id: res._id ?? res.id ?? String(editingId),
            carName: (res.name ?? res.carName ?? res.model ?? '') as string,
            brand: (res.brand ?? res.make ?? '') as string,
            year: (res.year ?? res.productionYear ?? '') as string,
            image: (res.image ?? res.photo ?? res.avatar ?? '') as string | null
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
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // لو تحب تبعت FormData للـ API غيّر هنا، الآن بنعرض preview فقط
    setFormData(prev => ({ ...prev, image: URL.createObjectURL(file) }));
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
      // جهّز الـ payload على حسب الـ API المتوقع
      const payload: Record<string, any> = {
        name: formData.carName,
        brand: formData.brand,
        year: formData.year,
        image: formData.image ?? '',
      };

      if (editingId) {
        await updateItem(editingId, payload);
        toast.success(t('carUpdatedSuccess'));
      } else {
        await createItem(payload);
        toast.success(t('carAddedSuccess'));
      }

      // callback للمستخدم إذا عايز يتعامل مع النتيجة
      if (onSave) onSave(formData);
    } catch (err: any) {
      console.error('save car failed', err);
      const msg = err?.response?.data?.message ?? err?.message ?? t('Save failed');
      toast.error(msg);
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
              {/* مؤشر تحميل بسيط */}
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

            <div className="flex flex-col items-center order-1 lg:order-2">
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 sm:h-72 md:h-80 w-full flex items-center justify-center bg-gray-50 mb-4 overflow-hidden">
                {formData.image ? (
                  <img src={formData.image} alt="Car preview"
                    className="w-full h-full object-contain object-center bg-gray-100" />
                ) : (
                  <span className="text-gray-400 text-xs sm:text-sm text-center px-4">{t('imagePreview')}</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#1f334d] text-white rounded-xl shadow-sm hover:bg-gray-900 transition-all font-medium text-sm">
                    <Upload size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>{formData.image ? t('changeImage') : t('uploadImage')}</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                {formData.image && (
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image: '' }));
                    }}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-red-500 text-white rounded-xl shadow-sm hover:bg-red-600 transition-all font-medium text-sm"
                  >
                    {t('remove')}
                  </button>
                )}
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