import React, { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import type { Inventory, InventoryInput } from "@/types/inventory";
import {
  getInventoryByIdService,
  updateInventoryService,
} from "@/mycomponents/inventory/services/inventories";

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
  image: string | null;
}

const EditInventoryForm: React.FC<EditInventoryFormProps> = ({
  inventoryId,
  onSave,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [original, setOriginal] = useState<Inventory | null>(null);

  const [formData, setFormData] = useState<InventoryEditData>({
    id: inventoryId ?? "#1346HC",
    inventoryName: "",
    location: "",
    capacity: "",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop",
  });

  // ✅ Fetch data
  useEffect(() => {
    let mounted = true;

    const fetchInventory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const inv = await getInventoryByIdService(inventoryId);
        if (!mounted) return;

        setOriginal(inv);

        const id = inv._id ?? inventoryId;
        const inventoryName = inv.name ?? "";
        const location = inv.location ?? "";
        const capacity =
          typeof inv.capacity === "number"
            ? String(inv.capacity)
            : inv.capacity ?? "";

        let image: string | null = null;
        if ((inv as { image?: string }).image) image = (inv as any).image;
        else if ((inv as { img?: string }).img) image = (inv as any).img;
        else
          image =
            "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop";

        setFormData({
          id,
          inventoryName,
          location,
          capacity,
          image,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load inventory data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
    return () => {
      mounted = false;
    };
  }, [inventoryId]);

  // ✅ handle input changes
  const handleInputChange = (field: keyof InventoryEditData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ detect changed fields only
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
    if (formData.image && formData.image !== (original as any).image)
      changes.image = formData.image;

    return changes;
  };

  // ✅ Save handler
  const handleSaveDetails = async () => {
    const changes = getChangedFields();
    if (Object.keys(changes).length === 0) {
      alert("No changes detected.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updated = await updateInventoryService(
        formData.id.replace(/^#/, ""),
        changes
      );

      alert("Inventory updated successfully!");
      setOriginal(updated);
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
      setError("Failed to update inventory.");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ UI (no changes in design)
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>Dashboard</span>
            <span>›</span>
            <span>Inventories</span>
            <span>›</span>
            <span>{formData.inventoryName || "Inventory"}</span>
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
                <label className="block text-sm font-medium mb-2">
                  Inventory Name:
                </label>
                <input
                  type="text"
                  value={formData.inventoryName}
                  onChange={(e) =>
                    handleInputChange("inventoryName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location:
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  className="w-48 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Capacity:
                </label>
                <input
                  type="text"
                  value={formData.capacity}
                  onChange={(e) =>
                    handleInputChange("capacity", e.target.value)
                  }
                  className="w-32 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full h-32 mb-3 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={formData.image || ""}
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
              disabled={isSaving || isLoading}
              className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-blue-800 transition-colors disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Details"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInventoryForm;
