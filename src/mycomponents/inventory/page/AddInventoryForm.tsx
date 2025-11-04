import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useInventories } from '@/mycomponents/inventory/hooks/useInventories';
import { toast } from 'react-hot-toast';

interface AddInventoryFormProps {
  onSave?: (data: InventoryFormData) => void;
  onCancel?: () => void;
}

interface InventoryFormData {
  id: string;
  inventoryName: string;
  location: string;
  capacity: string;
  image: string | null;
}

const AddInventoryForm: React.FC<AddInventoryFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<InventoryFormData>({
    id: '#1346HC',
    inventoryName: '',
    location: '',
    capacity: '',
    image: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [errors, setErrors] = useState({
    inventoryName: '',
    location: '',
    capacity: ''
  });

  const { create } = useInventories();

  const handleInputChange = (field: keyof InventoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    setFormData(prev => ({ ...prev, image: URL.createObjectURL(file) }));
  };

  const validate = () => {
    const newErrors = { inventoryName: '', location: '', capacity: '' };
    let valid = true;

    if (!formData.inventoryName.trim()) {
      newErrors.inventoryName = 'Inventory Name is required';
      valid = false;
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
      valid = false;
    }
    if (!formData.capacity.trim()) {
      newErrors.capacity = 'Capacity is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const form = new FormData();
      form.append('name', formData.inventoryName);
      form.append('location', formData.location);
      form.append('capacity', String(formData.capacity));

      if (imageFile) {
        form.append('avatar', imageFile);
      }

      console.log('📦 FormData Contents:');
      for (const [key, value] of form.entries()) {
        console.log(`${key}:`, value);
      }

      const created = await (create as unknown as (payload: any) => Promise<any>)(form);

      console.log('✅ Create response:', created);

      const newId = (created?.data?.newInventory?._id) ?? formData.id;

      if (onSave) {
        onSave({
          ...formData,
          id: newId,
        });
      }

      toast.success('Inventory added successfully!');
    } catch (error: any) {
      console.error('❌ Create inventory failed', error);
      if (error?.response?.data) {
        console.error('Server response:', error.response.data);
      }
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>Dashboard</span>
            <span>›</span>
            <span>Inventories</span>
            <span>›</span>
            <span className="text-gray-700">Add Inventory</span>
          </div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Add inventory</h2>
            <div className="text-sm">
              <span className="text-gray-600">Id:</span>
              <span className="ml-2 font-medium">{formData.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Inventory Name:</label>
                <input
                  type="text"
                  value={formData.inventoryName}
                  onChange={(e) => handleInputChange('inventoryName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.inventoryName && <p className="text-red-500 text-sm mt-1">{errors.inventoryName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location:</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-48 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Capacity:</label>
                <input
                  type="text"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-80 w-full flex items-center justify-center bg-gray-50 mb-4 overflow-hidden">
                {formData.image ? (
                  <img src={formData.image} alt="Warehouse preview" 
                  className="w-full h-full object-contain object-center bg-gray-100" />
                ) : (
                  <span className="text-gray-400 text-sm">image preview</span>
                )}
              </div>

              <div className="flex gap-3 w-full">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1f334d] text-white rounded-xl shadow-sm hover:bg-gray-900 transition-all font-medium">
                    <Upload size={18} />
                    <span>{formData.image ? 'Edit image' : 'Upload image'}</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                {formData.image && (
                  <button
                    onClick={() => { setFormData(prev => ({ ...prev, image: '' })); setImageFile(null); }}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl shadow-sm hover:bg-red-600 transition-all font-medium"
                  >
                    Remove
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
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-full bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-sm transition-all flex items-center gap-2"
            >
              Save Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInventoryForm;