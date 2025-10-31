import React, { useEffect, useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "@/mycomponents/category/hooks/useCategories";
import type { Product } from "../services/productService";

interface CategoryItem {
  id: string;
  name: string;
}

const ProductsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);

  const { products, loading, error, fetchProducts, deleteProduct } = useProducts();
  const { categories: apiCategories } = useCategories();

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories: CategoryItem[] = useMemo(() => {
    // Build a map of id -> display name using API categories first
    const map = new Map<string, string>();

    // Normalize API categories: API might return { _id, category } or { _id, name }
    (apiCategories ?? []).forEach((c: any) => {
      const id = c._id ?? c.id ?? String(c);
      const name = c.name ?? c.category ?? c.title ?? id;
      map.set(id, name);
    });

    const arr: CategoryItem[] = [{ id: "All Categories", name: "All Categories" }];
    for (const [id, name] of map.entries()) {
      arr.push({ id, name });
    }
    return arr;
  }, [products, apiCategories]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const name = (p.name || "").toString().toLowerCase();
      const code = (p.code || "").toString().toLowerCase();
      const desc = (p.description || "").toString().toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = name.includes(term) || code.includes(term) || desc.includes(term);

      if (selectedCategory === "All Categories") return matchesSearch;
      const cat = (p as any).category;
      if (!cat) return false;

      if (typeof cat === "string") {
        return matchesSearch && cat === selectedCategory;
      } else if (typeof cat === "object") {
        const id = cat._id ?? cat.id ?? "";
        return matchesSearch && id === selectedCategory;
      }

      return false;
    });
  }, [products, searchTerm, selectedCategory]);

  // Pagination
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / entriesPerPage);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(totalPages, startPage + maxPages - 1);
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  const handleReset = async () => {
    setSearchTerm("");
    setSelectedCategory("All Categories");
    await fetchProducts();
    setCurrentPage(1);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleViewProduct = (product: Product) => {
    navigate(`/dashboard/products/view/${product._id}`);
  };

  const handleEdit = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    navigate(`/dashboard/products/edit/${product._id}`);
  };

  const getProductImage = (img: (string | File)[] | undefined): string => {
    if (!img || img.length === 0) return "";
    const firstImg = img[0];
    if (typeof firstImg === "string") return firstImg;
    return "";
  };

  const calculateTotal = (price: number, tax: number): number => {
    return price * (1 + tax / 100);
  };

  // helper to resolve category name by id from apiCategories (with fallbacks)
  const resolveCategoryNameById = (id: string | undefined) => {
    if (!id) return "—";
    const found = (apiCategories ?? []).find((c: any) => (c._id ?? c.id) === id);
    if (found) return found.name ?? found.category ?? found.title ?? id;
    return id;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <span>Dashboard</span>
              <ChevronRight className="w-4 h-4" />
              <span>Products</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/add-product")}
            className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Products Search</h2>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && setCurrentPage(1)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>
          </div>

          <div className="w-64 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 opacity-0">Reset</label>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium shadow-sm transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Products <span className="text-gray-500">({currentPage}/{totalPages || 1})</span>
            </h2>
            <span className="text-sm text-gray-500">
              Showing {totalProducts > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, totalProducts)} of {totalProducts} products
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
              <p className="mt-2">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-500 mb-2">Failed to load products</div>
              <p className="text-sm text-gray-500">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 px-4 py-2 rounded-full bg-slate-700 text-white hover:bg-slate-800 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No products found.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Units</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tax</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.map((product) => {
                  const productImage = getProductImage(product.img);
                  const total = calculateTotal(product.price, product.tax);

                  // Resolve category name: prefer API categories, else product object content
                  let categoryName = "—";
                  const cat = (product as any).category;
                  if (cat) {
                    if (typeof cat === "string") {
                      categoryName = resolveCategoryNameById(cat);
                    } else if (typeof cat === "object") {
                      categoryName = cat.name ?? cat.category ?? resolveCategoryNameById(cat._id ?? cat.id ?? undefined);
                    }
                  }

                  return (
                    <tr
                      key={product._id}
                      onClick={() => handleViewProduct(product)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {productImage ? (
                              <img
                                src={productImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-gray-500 text-xs font-semibold">{product.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{categoryName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-mono text-sm">{product.code}</td>
                      <td className="px-6 py-4 text-gray-700">{product.unit}</td>
                      <td className="px-6 py-4 text-gray-700">{Number(product.price).toFixed(2)} SR</td>
                      <td className="px-6 py-4 text-gray-700">{Number(product.tax).toFixed(2)}%</td>
                      <td className="px-6 py-4 text-gray-700 font-semibold">{total.toFixed(2)} SR</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full transition-colors"
                            onClick={(e) => handleEdit(e, product)}
                            title="Edit Product"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 p-2 rounded-full transition-colors"
                            onClick={(e) => handleDelete(e, product._id || "")}
                            title="Delete Product"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && totalProducts > 0 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700">entries</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 text-sm rounded-full transition-colors ${
                      currentPage === pageNum
                        ? "text-white bg-blue-600 border border-blue-600"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsManagement;