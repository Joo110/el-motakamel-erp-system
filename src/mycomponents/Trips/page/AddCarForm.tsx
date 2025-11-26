import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface AddCarFormProps {
  onSave?: (data: CarFormData) => void;
  onCancel?: () => void;
}

interface CarFormData {
  id: string;
  carName: string;
  brand: string;
  year: string;
  image: string | null;
}

const AddCarForm: React.FC<AddCarFormProps> = ({ onSave, onCancel }) => {
  const { t } = useTranslation(); // تفعيل هوك الترجمة

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

  const handleInputChange = (field: keyof CarFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const handleSave = () => {
    if (!validate()) return;

    console.log('🚗 Car Data:', formData);
    toast.success(t('carAddedSuccess'));
    if (onSave) onSave(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>{t('dashboard')}</span>
            <span>›</span>
            <span>{t('cars')}</span>
            <span>›</span>
            <span className="text-gray-700">{t('addCarTitle')}</span>
          </div>
          <h1 className="text-2xl font-bold">{t('carManagement')}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">{t('addCarTitle')}</h2>
            <div className="text-sm">
              <span className="text-gray-600">{t('id')}:</span>
              <span className="ml-2 font-medium">{formData.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t('carName')}:</label>
                <input
                  type="text"
                  value={formData.carName}
                  onChange={(e) => handleInputChange('carName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.carName && <p className="text-red-500 text-sm mt-1">{errors.carName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('brand')}:</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-48 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('year')}:</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-80 w-full flex items-center justify-center bg-gray-50 mb-4 overflow-hidden">
                {formData.image ? (
                  <img src={formData.image} alt="Car preview"
                    className="w-full h-full object-contain object-center bg-gray-100" />
                ) : (
                  <span className="text-gray-400 text-sm">{t('imagePreview')}</span>
                )}
              </div>

              <div className="flex gap-3 w-full">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1f334d] text-white rounded-xl shadow-sm hover:bg-gray-900 transition-all font-medium">
                    <Upload size={18} />
                    <span>{formData.image ? t('changeImage') : t('uploadImage')}</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                {formData.image && (
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image: '' }));
                    }}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl shadow-sm hover:bg-red-600 transition-all font-medium"
                  >
                    {t('remove')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-full bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-sm transition-all flex items-center gap-2"
            >
              {t('saveCar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCarForm;