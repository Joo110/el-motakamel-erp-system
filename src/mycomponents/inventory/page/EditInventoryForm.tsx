import React, { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import type { Inventory, InventoryInput } from "@/types/inventory";
import {
  getInventoryByIdService,
  updateInventoryService,
} from "@/mycomponents/inventory/services/inventories";
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface EditInventoryFormProps {
  inventoryId: string;
  onSave?: (data: InventoryEditData) => void;
  onCancel?: () => void;
}

export interface InventoryEditData {
  id: string;
  inventoryName: string;
  location: string;
  capacity: string;
  image?: string;
}

interface RawInventory extends Inventory {
  avatar?: string;
  img?: string;
  image?: string;
}

const EditInventoryForm: React.FC<EditInventoryFormProps> = ({
  inventoryId,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [original, setOriginal] = useState<RawInventory | null>(null);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  const [formData, setFormData] = useState<InventoryEditData>({
    id: inventoryId ?? "#1346HC",
    inventoryName: "",
    location: "",
    capacity: "",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop",
  });

  const [errors, setErrors] = useState({
    inventoryName: "",
    location: "",
    capacity: "",
  });

  useEffect(() => {
    let mounted = true;

    const fetchInventory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const inv: RawInventory = await getInventoryByIdService(inventoryId);
        if (!mounted) return;

        setOriginal(inv);

        const id = inv._id ?? inventoryId;
        const inventoryName = inv.name ?? "";
        const location = inv.location ?? "";
        const capacity =
          typeof inv.capacity === "number"
            ? String(inv.capacity)
            : inv.capacity ?? "";

        const image = inv.image ?? inv.img ?? inv.avatar ?? "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop";

        setFormData({
          id,
          inventoryName,
          location,
          capacity,
          image,
        });
      } catch (err) {
        console.error(err);
        setError(t('failed_load_inventory'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
    return () => {
      mounted = false;
    };
  }, [inventoryId, t]);

  const handleInputChange = (field: keyof InventoryEditData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getChangedFields = (): Partial<InventoryInput> => {
    if (!original) return {};
    const changes: Partial<InventoryInput> = {};

    if (formData.inventoryName.trim() !== (original.name ?? "").trim())
      changes.name = formData.inventoryName;
    if (formData.location.trim() !== (original.location ?? "").trim())
      changes.location = formData.location;
    if (
      String(formData.capacity).trim() !==
      String(original.capacity ?? "").trim()
    )
      changes.capacity = formData.capacity;
    if (formData.image && formData.image !== (original.image ?? original.avatar))
      changes.image = formData.image;

    return changes;
  };

  const validate = () => {
    const newErrors = { inventoryName: "", location: "", capacity: "" };
    let valid = true;

    if (!formData.inventoryName.trim()) {
      newErrors.inventoryName = t('inventory_name_required');
      valid = false;
    }
    if (!formData.location.trim()) {
      newErrors.location = t('location_required');
      valid = false;
    }
    if (!formData.capacity.trim()) {
      newErrors.capacity = t('capacity_required');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSaveDetails = async () => {
    if (!validate()) return;

    const changes = getChangedFields();
    if (Object.keys(changes).length === 0) {
      toast.success(t('no_changes_detected'));
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updated = await updateInventoryService(
        formData.id.replace(/^#/, ""),
        changes,
        imageFile // ✅ استخدم الملف من الـ state هنا
      );

      toast.success(t('inventory_updated_success'));
      setOriginal(updated as RawInventory);

      if (onSave) {
        onSave({
          id: updated._id ?? formData.id,
          inventoryName: updated.name ?? formData.inventoryName,
          location: updated.location ?? formData.location,
          capacity:
            typeof updated.capacity === "number"
              ? String(updated.capacity)
              : formData.capacity,
          image: (updated as any).image ?? formData.image,
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(t('failed_update_inventory'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>{t('dashboard')}</span>
            <span>›</span>
            <span>{t('inventories')}</span>
            <span>›</span>
            <span>{formData.inventoryName || t('inventory')}</span>
            <span>›</span>
            <span className="text-gray-700">{t('edit_details')}</span>
          </div>
          <h1 className="text-2xl font-bold">{t('inventory_management')}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">{t('edit_details')}</h2>
            <div className="text-sm">
              <span className="text-gray-600">{t('id')}</span>
              <span className="ml-2 font-medium">{formData.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('inventory_name')}:
                </label>
                <input
                  type="text"
                  value={formData.inventoryName}
                  onChange={(e) =>
                    handleInputChange("inventoryName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.inventoryName && (
                  <p className="text-red-500 text-sm mt-1">{errors.inventoryName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('location')}:
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  className="w-48 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('capacity')}:
                </label>
                <input
                  type="text"
                  value={formData.capacity}
                  onChange={(e) =>
                    handleInputChange("capacity", e.target.value)
                  }
                  className="w-32 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.capacity && (
                  <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
                )}
              </div>

              {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full h-45 mb-3 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={formData.image || ""}
                  alt="Warehouse"
                  className="w-full h-full object-contain object-center bg-gray-100"
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
                  {t('change_image')}
                </div>
              </label>
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
              onClick={handleSaveDetails}
              disabled={isSaving || isLoading}
              className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-blue-800 transition-colors disabled:opacity-60"
            >
              {isSaving ? t('loading') : t('save_details')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInventoryForm;
