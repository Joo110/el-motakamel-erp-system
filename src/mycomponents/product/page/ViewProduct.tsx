import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "@/mycomponents/category/hooks/useCategories";
import type { Product } from "../services/productService";
import { useTranslation } from "react-i18next";

/* ✅ Type Guard لحل مشكلة File | string */
const isFile = (value: unknown): value is File => {
  return value instanceof File;
};

const ViewProduct: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getProductById, loading, error } = useProducts();
  const { categories: apiCategories } = useCategories();

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    const fetch = async () => {
      try {
        const p = await getProductById(id);
        if (!mounted) return;
        setProduct(p ?? null);
      } catch (err) {
        console.error(err);
      }
    };

    fetch();
    return () => {
      mounted = false;
    };
  }, [id, getProductById]);

  if (loading || !product) return <p>{t("loading")}</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const total =
    Number(product.wholesalePrice || 0) * Number(product.unit || 0) +
    Number(product.tax || 0);

  const resolveCategoryName = (prodCat: any) => {
    if (!prodCat) return t("unknown");

    if (typeof prodCat === "string") {
      const found = (apiCategories ?? []).find(
        (c: any) => (c._id ?? c.id) === prodCat
      );
      return found?.name ?? found?.category ?? found?.title ?? prodCat;
    }

    if (typeof prodCat === "object") {
      const name = prodCat.name ?? prodCat.category;
      if (name) return name;

      const idCandidate = prodCat._id ?? prodCat.id;
      if (idCandidate) {
        const found = (apiCategories ?? []).find(
          (c: any) => (c._id ?? c.id) === idCandidate
        );
        return found?.name ?? found?.category ?? found?.title ?? idCandidate;
      }
    }

    return t("unknown");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("products_management")}
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{t("dashboard")}</span>
          <ChevronRight className="w-4 h-4" />
          <span>{t("products")}</span>
          <ChevronRight className="w-4 h-4" />
          <span>{t("view_product")}</span>
        </div>
      </div>

      {/* Product Details Card */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          {t("product_details")}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Details */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                {t("product_name")}
              </label>
              <p className="text-lg text-gray-900 font-medium">
                {product.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                {t("category")}
              </label>
              <p className="text-lg text-gray-900">
                {resolveCategoryName(product.category)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                {t("description")}
              </label>
              <p className="text-gray-900 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                {t("code")}
              </label>
              <p className="text-lg text-gray-900 font-mono">
                {product.code}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  {t("price")}
                </label>
                <p className="text-lg text-gray-900 font-medium">
                  {product.wholesalePrice} SR
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  {t("tax")}
                </label>
                <p className="text-lg text-gray-900 font-medium">
                  {product.tax} SR
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  {t("units")}
                </label>
                <p className="text-lg text-gray-900 font-medium">
                  {product.unit}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900">
                  {t("total_amount")}
                </span>
                <span className="text-2xl font-bold text-slate-700">
                  {total} SR
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="flex flex-col items-center justify-start">
            <div className="w-full max-w-md">
              <div className="bg-gray-50 rounded-2xl p-8 flex items-center justify-center">
                <img
                  src={(() => {
                    const img = product.img?.[0];

                    if (isFile(img)) {
                      return URL.createObjectURL(img);
                    }

                    if (typeof img === "string") {
                      return img;
                    }

                    return "https://via.placeholder.com/200";
                  })()}
                  alt={product.name}
                  className="w-64 h-64 object-contain"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  {t("product_image")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate("/dashboard/products")}
            className="px-6 py-2.5 rounded-xl bg-white border border-gray-300 shadow-sm text-gray-700 font-medium transition-all hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            {t("back_to_products")}
          </button>

          <button
            onClick={() =>
              navigate(`/dashboard/products/edit/${product._id}`)
            }
            className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            {t("edit_product")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
