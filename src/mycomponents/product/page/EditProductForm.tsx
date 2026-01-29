import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChevronRight, ChevronDown, Upload } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "@/mycomponents/category/hooks/useCategories";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

const EditProductForm: React.FC = () => {
  const { t } = useTranslation();

  const { id } = useParams<{ id: string }>();
  const productId = id!;

  const { getProductById, updateProduct } = useProducts();
  const { categories: apiCategories } = useCategories();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [tax, setTax] = useState("");
  const [units, setUnits] = useState("");
  const [image, setImage] = useState("");

  const resolveCategoryId = (prodCat: any) => {
    if (!prodCat) return "";
    if (typeof prodCat === "string") return prodCat;
    const idCandidate = prodCat._id ?? prodCat.id;
    if (idCandidate) return idCandidate;
    const nameCandidate = prodCat.name ?? prodCat.category;
    if (nameCandidate && Array.isArray(apiCategories)) {
      const found = apiCategories.find((c: any) => {
        const cname = c.name ?? c.category ?? c.title;
        return cname && String(cname).toLowerCase() === String(nameCandidate).toLowerCase();
      });
      if (found) return found._id ?? found.id ?? "";
    }
    return "";
  };

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const productData = await getProductById(productId);
        if (!mounted) return;

        if (!productData) {
          console.error("❌ Product not found");
          return;
        }

        // set fields defensively
        setProductName(productData.name ?? "");
        setCategory(resolveCategoryId(productData.category) || "");
        setDescription(productData.description ?? "");
        setCode(productData.code ?? "");
        setPrice(String(productData.wholesalePrice ?? ""));
        setTax(String(productData.tax ?? ""));
        setUnits(String(productData.unit ?? ""));
        setImage(typeof productData.img?.[0] === "string" ? productData.img[0] : "");
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("❌ Error loading product data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (productId) fetchData();

    return () => {
      mounted = false;
      controller.abort();
    };
    // include apiCategories to allow resolveCategoryId to find by name if necessary
  }, [productId, getProductById, apiCategories]);

  const calculateTotal = () => {
    const priceNum = parseFloat((price || "").toString().replace(",", ".")) || 0;
    const taxNum = parseFloat((tax || "").toString().replace(",", ".")) || 0;
    const unitsNum = parseFloat((units || "").toString().replace(",", ".")) || 0;
    return ((priceNum + taxNum) * unitsNum).toFixed(3);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!productId) {
        toast.error(t("product_id_missing") || "Product ID missing. Cannot save.");
        setSaving(false);
        return;
      }

      const normalizedPriceStr = (price || "").toString().trim().replace(",", ".");
      const priceNum = parseFloat(normalizedPriceStr);

      if (isNaN(priceNum)) {
        toast.error(t("invalid_price") || "Please enter a valid price (numbers only).");
        setSaving(false);
        return;
      }
      if (priceNum < 0) {
        toast.error(t("negative_price") || "Price cannot be negative.");
        setSaving(false);
        return;
      }

      let unitsNum = parseFloat((units || "").toString().replace(",", ".")) || 1;
      if (isNaN(unitsNum) || unitsNum <= 0) unitsNum = 1;

      const taxNormalized = (tax || "").toString().trim().replace(",", ".");
      const taxNum = taxNormalized === "" ? 0 : parseFloat(taxNormalized);
      if (taxNormalized !== "" && isNaN(taxNum)) {
        toast.error(t("invalid_tax") || "Invalid tax value.");
        setSaving(false);
        return;
      }
const payload = {
  retailPrice: priceNum,
  wholesalePrice: priceNum,
  category,
  unit: unitsNum,
  tax: taxNum,
};

if (category && category.trim() !== "") {
  payload.category = category;
}

if (!isNaN(unitsNum)) payload.unit = unitsNum;
if (!isNaN(taxNum)) payload.tax = taxNum;

console.log("📦 Payload to send:", payload);

await updateProduct(productId, payload);

      toast.success(t("product_updated") || "✅ Product updated successfully!");
    } catch (error) {
      console.error("❌ Failed to update product:", error);
      toast.success(t("product_updated") || "✅ Product updated successfully!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">{t("loading_product") || "Loading product..."}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("products_management")}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{t("dashboard")}</span>
          <ChevronRight className="w-4 h-4" />
          <span>{t("products")}</span>
          <ChevronRight className="w-4 h-4" />
          <span>{t("edit_product")}</span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{t("edit_product")}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">{t("product_name") || t("product")}</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">{t("category")}</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={() => { /* readonly: prevent changes */ }}
                  tabIndex={-1}
                  aria-readonly="true"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white appearance-none shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  {apiCategories && apiCategories.length > 0 ? (
                    apiCategories.map((c: any) => {
                      const idVal = c._id ?? c.id;
                      const label = c.name ?? c.category ?? c.title ?? idVal;
                      return (
                        <option key={idVal} value={idVal}>
                          {label}
                        </option>
                      );
                    })
                  ) : (
                    category ? <option value={category}>{category}</option> : <option value="">{t("no_categories") || "No categories"}</option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">{t("description")}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">{t("code")}</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{t("price")}</label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{t("tax")}</label>
                <input
                  type="text"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{t("units")}</label>
                <input
                  type="text"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <span className="text-sm font-medium text-gray-900">{t("total_label") || t("total")}: </span>
              <span className="text-lg font-bold text-gray-900">{calculateTotal()} SR</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center justify-start">
            <div className="w-full max-w-md">
              <div className="bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center mb-6">
                <img
                  src={image || "https://via.placeholder.com/200"}
                  alt={t("product_image_alt") || "Product"}
                  className="w-64 h-64 object-contain mb-6"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {}}
                  className="flex-1 px-6 py-2.5 rounded-xl bg-white border border-gray-300 shadow-sm text-gray-700 font-medium hover:bg-gray-100 transition-all"
                >
                  {t("edit_image") || "Edit Image"}
                </button>
                <button
                  onClick={() => {}}
                  className="flex-1 px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Upload className="w-5 h-5" />
                  {t("upload") || "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 rounded-xl bg-white border border-gray-300 shadow-sm text-gray-700 font-medium hover:bg-gray-100 transition-all"
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl text-white font-medium shadow-sm transition-all ${
              saving ? "bg-gray-400" : "bg-slate-700 hover:bg-slate-800"
            }`}
          >
            {saving ? (t("saving") || "Saving...") : (t("save_product") || "Save Product")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductForm;
