import React, { useState } from "react";
import { Search, Plus, Edit2, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Product } from "src/types/Product";

const ProductsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);

  const allProducts: Product[] = [
    { id: 1, name: "Product 1", description: "Description...", category: "Electronics", code: "39282", units: 10, price: 999.0, tax: 19.0, total: 9990.0, image: "" },
    { id: 2, name: "Product 2", description: "Description...", category: "Electronics", code: "32214", units: 10, price: 849.0, tax: 11.0, total: 8490.0, image: "" },
    { id: 3, name: "Product 3", description: "Description...", category: "Footwear", code: "32441", units: 10, price: 849.0, tax: 11.0, total: 8490.0, image: "" },
    { id: 4, name: "Product 4", description: "Description...", category: "Electronics", code: "39283", units: 10, price: 999.0, tax: 19.0, total: 9990.0, image: "" },
    { id: 5, name: "Product 5", description: "Description...", category: "Footwear", code: "32215", units: 10, price: 849.0, tax: 11.0, total: 8490.0, image: "" },
    { id: 6, name: "Product 6", description: "Description...", category: "Electronics", code: "32442", units: 10, price: 849.0, tax: 11.0, total: 8490.0, image: "" },
    { id: 7, name: "Product 7", description: "Description...", category: "Electronics", code: "39284", units: 10, price: 999.0, tax: 19.0, total: 9990.0, image: "" },
    { id: 8, name: "Product 8", description: "Description...", category: "Footwear", code: "32216", units: 10, price: 849.0, tax: 11.0, total: 8490.0, image: "" },
    { id: 9, name: "Product 9", description: "Description...", category: "Electronics", code: "32443", units: 10, price: 849.0, tax: 11.0, total: 8490.0, image: "" },
    { id: 10, name: "Product 10", description: "Description...", category: "Electronics", code: "39285", units: 10, price: 999.0, tax: 19.0, total: 9990.0, image: "" },
  ];


  
  // Get current page products
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const products = allProducts.slice(0, entriesPerPage);

  const totalProducts = 247;
  const totalPages = Math.ceil(totalProducts / entriesPerPage);

  // Generate page numbers to display (max 5)
  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleSearch = () => {
    console.log("Searching for:", searchTerm, "Category:", selectedCategory);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategory("All Categories");
  };

  const handleViewProduct = (product: Product) => {
    navigate(`/dashboard/products/view/${product.id}`);
  };

  const handleEdit = (e: React.MouseEvent, product: Product) => {
    navigate(`/dashboard/products/edit/${product.id}`);
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
  onClick={() => navigate('/dashboard/add-product')}
  className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-sm transition-all flex items-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
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
    <button className="text-gray-400 hover:text-gray-600">
    </button>
  </div>

  <div className="flex flex-wrap gap-4 items-end">
    {/* 🔍 Search Input */}
    <div className="flex-1 min-w-[250px]">
      <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search products by name, code, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
        />
      </div>
    </div>

    {/* 📂 Category Select */}
    <div className="w-64 min-w-[200px]">
      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
      <div className="relative">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer"
        >
          <option>All Categories</option>
          <option>Electronics</option>
          <option>Footwear</option>
          <option>Clothing</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      </div>
    </div>

    {/* 🔎 Search Button */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 opacity-0">Search</label>
      <button
        onClick={handleSearch}
        className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-sm transition-all flex items-center gap-2"
      >
        <Search className="w-5 h-5" />
        Search
      </button>
    </div>

    {/* ♻️ Reset Button */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 opacity-0">Reset</label>
      <button
        onClick={handleReset}
        className="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium shadow-sm transition-all flex items-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
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
              Product <span className="text-gray-500">({currentPage}/{totalPages})</span>
            </h2>
            <span className="text-sm text-gray-500">Showing {startIndex + 1}-{Math.min(endIndex, totalProducts)} of {totalProducts} products</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Units</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tax</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr 
                  key={product.id} 
                  onClick={() => handleViewProduct(product)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{product.category}</td>
                  <td className="px-6 py-4 text-gray-700">{product.code}</td>
                  <td className="px-6 py-4 text-gray-700">{product.units}</td>
                  <td className="px-6 py-4 text-gray-700">{product.price.toFixed(2)} SR</td>
                  <td className="px-6 py-4 text-gray-700">{product.tax.toFixed(2)} SR</td>
                  <td className="px-6 py-4 text-gray-700">{product.total.toFixed(2)} SR</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 transition-colors"
                        onClick={(e) => handleEdit(e, product)}
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800 p-1 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Delete product:', product.id);
                        }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
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
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
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
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsManagement;