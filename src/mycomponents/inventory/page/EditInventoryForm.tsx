import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface EditInventoryFormProps {
  onSave?: (data: InventoryEditData) => void;
  onCancel?: () => void;
}

interface InventoryEditData {
  id: string;
  inventoryName: string;
  location: string;
  capacity: string;
  image: string | null;
}

const EditInventoryForm: React.FC<EditInventoryFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<InventoryEditData>({
    id: '#1346HC',
    inventoryName: 'Dakahlia Master Inventory',
    location: 'Mansura, Sandob',
    capacity: '90',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop'
  });

  const handleInputChange = (field: keyof InventoryEditData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDetails = () => {
    if (onSave) onSave(formData);
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
            <span>Dakahlia Master Inventory</span>
            <span>›</span>
            <span className="text-gray-700">Edit</span>
          </div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Edit Details</h2>
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location:</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-48 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Capacity:</label>
                <input
                  type="text"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full h-32 mb-3 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={formData.image || ''}
                  alt="Warehouse"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="px-6 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors inline-flex items-center gap-2">
                  <Upload size={16} />
                  Change Image
                </div>
              </label>
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
              onClick={handleSaveDetails}
              className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-blue-800 transition-colors"
            >
              Save Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInventoryForm;