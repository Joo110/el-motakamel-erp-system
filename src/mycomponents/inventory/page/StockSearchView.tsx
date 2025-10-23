import React, { useState, useMemo, useEffect } from 'react';
import { Search, RotateCcw, ChevronDown } from 'lucide-react';
import { useInventories } from "@/mycomponents/inventory/hooks/useInventories";

interface StockItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    category?: string;
  };
  inventory: {
    _id: string;
    name: string;
  };
  quantity: number;
  lastUpdate?: string;
}

interface Transaction {
  _id: string;
  product: {
    name: string;
    category?: string;
  };
  transactionNumber: string;
  quantity: number;
  type: 'In' | 'Out' | 'Transfer';
  fromInventory?: {
    name: string;
  };
  toInventory?: {
    name: string;
  };
  createdAt: string;
}

const StockSearchView: React.FC = () => {
  const { getAllStocks, getAllStockTransfers, isLoading, error } = useInventories();
  
  const [activeTab, setActiveTab] = useState<'transfer' | 'stock-out' | 'stock-in'>('transfer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [stockPageSize, setStockPageSize] = useState(5);
  const [transPageSize, setTransPageSize] = useState(5);
  const [stockCurrentPage, setStockCurrentPage] = useState(1);
  const [transCurrentPage, setTransCurrentPage] = useState(1);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>(['All Categories']);

  useEffect(() => {
    loadAllStocksAndTransfers();
  }, []);

  const loadAllStocksAndTransfers = async () => {
    try {
      const stockRes = await getAllStocks();
      const transferRes = await getAllStockTransfers();

      // مرن في التعامل مع طبقات الـ response المختلفة
      const stockPayload = stockRes?.data?.data ?? stockRes?.data ?? stockRes;
      const transferPayload = transferRes?.data?.data ?? transferRes?.data ?? transferRes;

      const rawStocks = stockPayload?.stocks ?? stockPayload?.data?.stocks ?? [];
      const rawTransfers = transferPayload?.stockTransfers ?? transferPayload?.data?.stockTransfers ?? [];

      console.log("📦 rawStocks length:", Array.isArray(rawStocks) ? rawStocks.length : 'not-array');
      console.log("📦 rawStocks sample:", rawStocks);
      console.log("🚚 rawTransfers length:", Array.isArray(rawTransfers) ? rawTransfers.length : 'not-array');
      console.log("🚚 rawTransfers sample:", rawTransfers);

      // Mapping مرن يدعم الحقول المختلفة اللي ممكن تجي من الـ API
      const mappedStocks: StockItem[] = (Array.isArray(rawStocks) ? rawStocks : []).map((s: any) => {
        // product يمكن يكون داخل productId أو product أو مجرد كائن/id
        const productObj =
          s.productId ??
          s.product ??
          (s.productInfo ? s.productInfo : undefined);

        // inventory ممكن يكون داخل inventoryId أو inventory
        const inventoryObj = s.inventoryId ?? s.inventory ?? (s.location ?? undefined);

        // category ممكن يكون string أو object with name
        let category: string | undefined = undefined;
        if (productObj) {
          if (typeof productObj.category === 'string') category = productObj.category;
          else if (productObj.category?.name) category = productObj.category.name;
        } else if (s.category) {
          category = typeof s.category === 'string' ? s.category : s.category?.name;
        }

        // quantity ممكن يجي كـ quantity أو unit
        const quantity = s.quantity ?? s.unit ?? s.qty ?? 0;

        return {
          _id: s._id ?? s.stockId ?? (productObj?._id ?? productObj?.id ?? "N/A"),
          product: {
            _id: productObj?._id ?? productObj?.id ?? "",
            name: productObj?.name ?? productObj?.title ?? s.productName ?? "N/A",
            category,
          },
          inventory: {
            _id: inventoryObj?._id ?? inventoryObj?.id ?? "",
            name: inventoryObj?.name ?? inventoryObj?.title ?? s.inventoryName ?? "N/A",
          },
          quantity,
          lastUpdate: s.updatedAt ?? s.createdAt ?? undefined,
        } as StockItem;
      });

      setStockItems(mappedStocks);

      // بناء قائمة الفئات من الماب
      const cats = new Set<string>();
      mappedStocks.forEach((stock) => {
        if (stock.product?.category) cats.add(stock.product.category);
      });
      setCategories(["All Categories", ...Array.from(cats)]);

      // Transactions mapping (نفس اللي اشتغل مع الترانسفيرز)
      if (Array.isArray(rawTransfers) && rawTransfers.length > 0) {
        const mappedTransactions: Transaction[] = rawTransfers.map((t: any) => {
          const firstProduct = t.products?.[0] ?? null;
          // product name might be populated object or id — try to read name if populated
          const prodName =
            firstProduct?.productId?.name ??
            (typeof firstProduct?.productId === 'string' ? firstProduct.productId : undefined) ??
            firstProduct?.name ??
            t.productName ??
            "N/A";

          return {
            _id: t._id,
            product: {
              name: prodName,
              category: firstProduct?.productId?.category ?? undefined,
            },
            transactionNumber: t.reference ?? t.ref ?? "N/A",
            quantity: firstProduct?.unit ?? firstProduct?.quantity ?? 0,
            type: 'Transfer',
            fromInventory: { name: (t.from && typeof t.from === 'string') ? t.from : (t.from?.name ?? "N/A") },
            toInventory: { name: (t.to && typeof t.to === 'string') ? t.to : (t.to?.name ?? "N/A") },
            createdAt: t.createdAt ?? t.updatedAt ?? undefined,
          };
        });

        setTransactions(mappedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error("Error loading stocks or transfers:", err);
    }
  };

  const filteredStockItems = useMemo(() => {
    return stockItems.filter(item => {
      const productName = item.product?.name?.toLowerCase() || '';
      const productId = item._id?.toLowerCase() || '';
      const matchesSearch = productName.includes(searchQuery.toLowerCase()) ||
                           productId.includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || 
                             item.product?.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, stockItems]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(trans => {
      const productName = trans.product?.name?.toLowerCase() || '';
      const transNum = trans.transactionNumber?.toLowerCase() || '';
      const matchesSearch = productName.includes(searchQuery.toLowerCase()) ||
                           transNum.includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || 
                             trans.product?.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, transactions]);

  const paginatedStockItems = useMemo(() => {
    const startIndex = (stockCurrentPage - 1) * stockPageSize;
    return filteredStockItems.slice(startIndex, startIndex + stockPageSize);
  }, [filteredStockItems, stockCurrentPage, stockPageSize]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (transCurrentPage - 1) * transPageSize;
    return filteredTransactions.slice(startIndex, startIndex + transPageSize);
  }, [filteredTransactions, transCurrentPage, transPageSize]);

  const stockTotalPages = Math.ceil(filteredStockItems.length / stockPageSize);
  const transTotalPages = Math.ceil(filteredTransactions.length / transPageSize);

  const handleSearch = () => {
    setStockCurrentPage(1);
    setTransCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setStockCurrentPage(1);
    setTransCurrentPage(1);
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && stockItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading inventory data</p>
          <button 
            onClick={loadAllStocksAndTransfers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>Dashboard</span>
            <span>›</span>
            <span className="text-gray-700">Stock</span>
          </div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-6 py-2 rounded-full transition-colors ${
              activeTab === 'transfer'
                ? 'bg-amber-200 text-gray-800'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Transfer
          </button>
          <button
            onClick={() => setActiveTab('stock-out')}
            className={`px-6 py-2 rounded-full transition-colors ${
              activeTab === 'stock-out'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Stock out
          </button>
          <button
            onClick={() => setActiveTab('stock-in')}
            className={`px-6 py-2 rounded-full transition-colors ${
              activeTab === 'stock-in'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Stock in
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Stock Search</h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products by name, code, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-full bg-white focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
            <button 
              onClick={handleSearch}
              className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-blue-800 transition-colors flex items-center gap-2"
            >
              <Search size={18} />
              Search
            </button>
            <button 
              onClick={handleReset}
              className="px-6 py-2 bg-amber-200 text-gray-800 rounded-full hover:bg-amber-300 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Stock</h2>
            <span className="text-sm text-gray-500">
              Showing {filteredStockItems.length > 0 ? (stockCurrentPage - 1) * stockPageSize + 1 : 0}-{Math.min(stockCurrentPage * stockPageSize, filteredStockItems.length)} of {filteredStockItems.length} products
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Inventory</th>
                  <th className="pb-3 font-medium">Units/Inventory</th>
                  <th className="pb-3 font-medium">Last update</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStockItems.length > 0 ? (
                  paginatedStockItems.map((item) => (
                    <tr key={item._id} className="border-b last:border-b-0">
                      <td className="py-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <span>{item.product?.name || 'N/A'}</span>
                      </td>
                      <td className="py-4 text-blue-600 underline cursor-pointer">
                        {item.inventory?.name || '-'}
                      </td>
                      <td className="py-4">{item.quantity || 0}</td>
                      <td className="py-4 text-sm text-gray-600">
                        {formatDate(item.lastUpdate)}
                      </td>
                      <td className="py-4">
                        <button className="px-4 py-1.5 bg-amber-200 text-gray-800 rounded-full hover:bg-amber-300 transition-colors text-sm">
                          Transfer
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm">
              <span>Show</span>
              <select 
                value={stockPageSize}
                onChange={(e) => {
                  setStockPageSize(Number(e.target.value));
                  setStockCurrentPage(1);
                }}
                className="border border-gray-300 rounded-full px-2 py-1"
              >
                <option>5</option>
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setStockCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={stockCurrentPage === 1}
                className="px-3 py-1 border rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(3, stockTotalPages) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setStockCurrentPage(page)}
                  className={`px-3 py-1 rounded-full ${
                    stockCurrentPage === page
                      ? 'bg-slate-700 text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button 
                onClick={() => setStockCurrentPage(prev => Math.min(stockTotalPages, prev + 1))}
                disabled={stockCurrentPage === stockTotalPages}
                className="px-3 py-1 border rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Transactions</h2>
            <span className="text-sm text-gray-500">
              Showing {filteredTransactions.length > 0 ? (transCurrentPage - 1) * transPageSize + 1 : 0}-{Math.min(transCurrentPage * transPageSize, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
  <tr className="text-left text-sm text-gray-600">
    <th className="pb-3 font-medium">Product</th>
    <th className="pb-3 font-medium">Trans. Number</th>
    <th className="pb-3 font-medium">Units</th>
    <th className="pb-3 font-medium">Type</th>
    <th className="pb-3 font-medium">From</th>
    <th className="pb-3 font-medium">To</th>
    <th className="pb-3 font-medium">Time/Date</th>
  </tr>
</thead>
<tbody>
  {paginatedTransactions.length > 0 ? (
    paginatedTransactions.map((trans) => (
      <tr key={trans._id} className="border-b last:border-b-0">
        <td className="py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <span>{trans.product?.name || 'N/A'}</span>
        </td>
        <td className="py-4">{trans.transactionNumber || '-'}</td>
        <td className="py-4">{trans.quantity || 0}</td>
        <td className="py-4">
          <span className={`px-2 py-1 rounded-full text-xs ${
            trans.type === 'In' ? 'bg-green-100 text-green-700' :
            trans.type === 'Out' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {trans.type}
          </span>
        </td>
        <td className="py-4">{trans.fromInventory?.name || '-'}</td>
        <td className="py-4">{trans.toInventory?.name || '-'}</td>
        <td className="py-4 text-sm text-gray-600">
          {formatDate(trans.createdAt)}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={7} className="py-8 text-center text-gray-500">
        No transactions found
      </td>
    </tr>
  )}
</tbody>

            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm">
              <span>Show</span>
              <select 
                value={transPageSize}
                onChange={(e) => {
                  setTransPageSize(Number(e.target.value));
                  setTransCurrentPage(1);
                }}
                className="border border-gray-300 rounded-full px-2 py-1"
              >
                <option>5</option>
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setTransCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={transCurrentPage === 1}
                className="px-3 py-1 border rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(3, transTotalPages) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setTransCurrentPage(page)}
                  className={`px-3 py-1 rounded-full ${
                    transCurrentPage === page
                      ? 'bg-slate-700 text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button 
                onClick={() => setTransCurrentPage(prev => Math.min(transTotalPages, prev + 1))}
                disabled={transCurrentPage === transTotalPages}
                className="px-3 py-1 border rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default StockSearchView;