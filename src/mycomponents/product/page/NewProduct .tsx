import React, { useState, useEffect } from "react";
import { Upload, Edit2 } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { toast } from 'react-hot-toast';
import { useCategories } from "@/mycomponents/category/hooks/useCategories";
import { useTranslation } from "react-i18next";

const NewProduct: React.FC = () => {
  const { t } = useTranslation();
  const { addProduct } = useProducts();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { categories: apiCategories, isLoading: catLoading } = useCategories();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    code: "",
    price: "",
    tax: "",
    unit: "",
  });
  const [image, setImage] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (apiCategories && apiCategories.length > 0 && !formData.category) {
      const firstId = apiCategories[0]._id ?? apiCategories[0].id;
      setFormData((prev) => ({ ...prev, category: firstId }));
    }
  }, [apiCategories]); // keep same behavior

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFile(file);
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const selectedCategoryId = formData.category;
      if (!selectedCategoryId) {
        toast.error(t("select_valid_category"));
        setSaving(false);
        return;
      }

      if (imageFile && imageFile.size > 3 * 1024 * 1024) {
        toast.error(t("image_too_large"));
        setSaving(false);
        return;
      }

      // Build FormData
      const form = new FormData();
      form.append("name", formData.name);
      form.append("code", formData.code);

      // backend expects retailPrice & wholesalePrice (we only have one input 'price' in UI)
      // send both so endpoint accepts the payload
      form.append("retailPrice", String(parseFloat(formData.price) || 0));
      form.append("wholesalePrice", String(parseFloat(formData.price) || 0));

      form.append("tax", String(parseFloat(formData.tax) || 0));
      form.append("description", formData.description);
      form.append("category", String(selectedCategoryId));
      form.append("unit", String(parseInt(formData.unit) || 1));

      if (imageFile) {
        form.append("img", imageFile);
      }

      // call hook (which expects FormData)
      await addProduct(form);

      toast.success(t("product_created_success"));
      handleCancel();
    } catch (error: any) {
      console.error("❌ Error creating product:", error);

      // server duplicate key
      if (error?.response?.data?.err?.code === 11000 || error?.err?.code === 11000) {
        toast.error(t("duplicate_code_error"));
      } else if (
        error?.response?.data?.err?.statusCode === 413 ||
        error?.err?.statusCode === 413 ||
        error?.statusCode === 413 ||
        error?.response?.status === 413
      ) {
        toast.error(t("image_too_large"));
      } else {
        toast.error(t("error_creating_product"));
      }
    } finally {
      setSaving(false);
    }
  };

  const calculateTotal = () => {
    const price = parseFloat(formData.price) || 0;
    const tax = parseFloat(formData.tax) || 0;
    return (price + tax).toFixed(2);
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      code: "",
      price: "",
      tax: "",
      unit: "",
    });
    setImage(null);
    setImageFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-3 flex items-center gap-4 flex-wrap">
        <h1 className="text-3xl font-bold text-gray-800">{t("products_management_header")}</h1>

        <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <span>{t("breadcrumb_dashboard")}</span>
          <span>›</span>
          <span>{t("breadcrumb_products")}</span>
          <span>›</span>
          <span className="text-gray-700">{t("new_product")}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">{t("new_product_title")}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("product_name_label")}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                placeholder=""
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("category_label")}</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                  paddingRight: "2.5rem",
                }}
              >
                <option value="">{t("category_placeholder")}</option>
                {apiCategories && apiCategories.length > 0 ? (
                  apiCategories.map((c: any) => (
                    <option key={c._id ?? c.id} value={c._id ?? c.id}>
                      {c.name ?? c.category ?? c.title}
                    </option>
                  ))
                ) : (
                  null
                )}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("description_label")}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("code_label")}</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                placeholder={t("enter_product_code_placeholder")}
              />
            </div>

            {/* Price, Tax, Unit Row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("price_label")}</label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                    placeholder=""
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">SR</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("tax_label")}</label>
                <div className="relative">
                  <input
                    type="number"
                    name="tax"
                    value={formData.tax}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                    placeholder=""
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">SR</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("unit_label")}</label>
                <input
                  type="number"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder=""
                />
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">{t("total_label")}</span>
              <span className="text-lg font-semibold text-gray-800">{calculateTotal()} SR</span>
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {/* Image Preview */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-80 flex items-center justify-center bg-gray-50 mb-4 overflow-hidden">
                {image ? (
                  <img src={image} alt={t("image_preview")} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">{t("image_preview")}</span>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1f334d] text-white rounded-xl shadow-sm hover:bg-gray-900 transition-all font-medium">
                    <Edit2 size={18} />
                    <span>{t("edit_image")}</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-400 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-all font-medium">
                    <Upload size={18} />
                    <span>{t("upload_image")}</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition-all font-medium"
          >
            {t("cancel")}
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`px-6 py-2.5 text-white rounded-xl shadow-md font-medium transition-all ${
              saving ? "bg-gray-400 cursor-not-allowed" : "bg-[#1f334d] hover:bg-gray-900"
            }`}
          >
            {saving ? t("saving") : t("save_product")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewProduct;
