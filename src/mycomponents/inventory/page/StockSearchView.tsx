import React, { useState, useMemo, useEffect } from 'react';
import { Search, RotateCcw, ChevronDown } from 'lucide-react';
import { useInventories } from "@/mycomponents/inventory/hooks/useInventories";
import { useProducts } from "@/mycomponents/product/hooks/useProducts";
import { useCategories } from "@/mycomponents/category/hooks/useCategories";
import { getInventoriesService } from "@/mycomponents/inventory/services/inventories";

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

interface CategoryItem {
  id: string;
  name: string;
}

const StockSearchView: React.FC = () => {
  const {
    getAllStocks,
    getAllStockTransfers,
    isLoading,
    error,
    inventories,
  } = useInventories();

  const { getProductById } = useProducts();
  const { categories: apiCategories } = useCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [stockPageSize, setStockPageSize] = useState(5);
  const [transPageSize, setTransPageSize] = useState(5);
  const [stockCurrentPage, setStockCurrentPage] = useState(1);
  const [transCurrentPage, setTransCurrentPage] = useState(1);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadAllStocksAndTransfers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories: CategoryItem[] = useMemo(() => {
    const map = new Map<string, string>();

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
  }, [apiCategories]);

  const resolveCategoryNameById = (id: string | undefined) => {
    if (!id) return "—";
    const found = (apiCategories ?? []).find((c: any) => (c._id ?? c.id) === id);
    if (found) return found.name ?? found.category ?? found.title ?? id;
    return id;
  };

  const loadAllStocksAndTransfers = async () => {
    try {
      const stockRes = await getAllStocks();
      const transferRes = await getAllStockTransfers();

      const stockPayload = stockRes?.data?.data ?? stockRes?.data ?? stockRes;
      const transferPayload = transferRes?.data?.data ?? transferRes?.data ?? transferRes;

      const rawStocks = stockPayload?.stocks ?? stockPayload?.data?.stocks ?? [];
      const rawTransfers = transferPayload?.stockTransfers ?? transferPayload?.data?.stockTransfers ?? [];

      console.log("📦 rawStocks length:", Array.isArray(rawStocks) ? rawStocks.length : 'not-array');
      console.log("📦 rawStocks sample:", rawStocks);
      console.log("🚚 rawTransfers length:", Array.isArray(rawTransfers) ? rawTransfers.length : 'not-array');
      console.log("🚚 rawTransfers sample:", rawTransfers);

      const mappedStocks: StockItem[] = (Array.isArray(rawStocks) ? rawStocks : []).map((s: any) => {
        const productObj =
          s.productId ??
          s.product ??
          (s.productInfo ? s.productInfo : undefined);

        const inventoryObj = s.inventoryId ?? s.inventory ?? (s.location ?? undefined);

        let categoryId: string | undefined = undefined;
        if (productObj) {
          if (typeof productObj.category === 'string') {
            categoryId = productObj.category;
          } else if (productObj.category?._id) {
            categoryId = productObj.category._id;
          } else if (productObj.category?.id) {
            categoryId = productObj.category.id;
          }
        } else if (s.category) {
          if (typeof s.category === 'string') {
            categoryId = s.category;
          } else {
            categoryId = s.category._id ?? s.category.id;
          }
        }

        const quantity = s.quantity ?? s.unit ?? s.qty ?? 0;

        return {
          _id: s._id ?? s.stockId ?? (productObj?._id ?? productObj?.id ?? "N/A"),
          product: {
            _id: productObj?._id ?? productObj?.id ?? "",
            name: productObj?.name ?? productObj?.title ?? s.productName ?? "N/A",
            category: categoryId,
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

      if (Array.isArray(rawTransfers) && rawTransfers.length > 0) {
        const transfersArr = rawTransfers;

        const productIdsToFetch = new Set<string>();
        transfersArr.forEach((t: any) => {
          const firstProduct = t.products?.[0] ?? null;
          const pid = firstProduct?.productId;
          if (pid && typeof pid === 'string') productIdsToFetch.add(pid);
        });

        const productIdArray = Array.from(productIdsToFetch);
        const productIdNameMap: Record<string, string> = {};

        if (productIdArray.length > 0) {
          await Promise.all(
            productIdArray.map(async (id) => {
              try {
                const p = await getProductById(id);
                const name = p?.name ?? String(id);
                productIdNameMap[id] = name;
              } catch (err) {
                productIdNameMap[id] = String(id);
                console.warn("Failed to fetch product for id", id, err);
              }
            })
          );
        }

        let inventoryArray: any[] = Array.isArray(inventories) && inventories.length > 0 ? inventories : [];

        if (!inventoryArray || inventoryArray.length === 0) {
          try {
            const invRes = await getInventoriesService();
            const invPayload = invRes?.data ?? invRes?.data ?? invRes;
            inventoryArray = invPayload?.inventories ?? invPayload ?? [];
          } catch (err) {
            console.warn("Failed to fetch inventories from service, falling back to hook state", err);
            inventoryArray = Array.isArray(inventories) ? inventories : [];
          }
        }

        const inventoryMap: Record<string, string> = {};
        (inventoryArray ?? []).forEach((inv: any) => {
          if (!inv) return;
          const key = inv._id ?? inv.id;
          if (key) inventoryMap[key] = inv.name ?? inv.title ?? key;
        });

        console.log("📍 Inventory Map built:", inventoryMap);

        const mappedTransactions: Transaction[] = transfersArr.map((t: any) => {
          const firstProduct = t.products?.[0] ?? null;

          let prodName = "N/A";
          let categoryId: string | undefined = undefined;

          if (firstProduct) {
            const pid = firstProduct.productId;
            if (!pid) {
              prodName = firstProduct.name ?? t.productName ?? "N/A";
            } else if (typeof pid === 'string') {
              prodName = productIdNameMap[pid] ?? pid;
            } else if (typeof pid === 'object') {
              prodName = pid.name ?? pid.title ?? "N/A";
              if (typeof pid.category === 'string') {
                categoryId = pid.category;
              } else if (pid.category?._id) {
                categoryId = pid.category._id;
              }
            } else {
              prodName = firstProduct.name ?? "N/A";
            }

            if (!categoryId && firstProduct.category) {
              if (typeof firstProduct.category === 'string') {
                categoryId = firstProduct.category;
              } else {
                categoryId = firstProduct.category._id ?? firstProduct.category.id;
              }
            }
          } else {
            prodName = t.productName ?? "N/A";
          }

          const resolveInventoryName = (invField: any, fieldName: string) => {
            if (!invField) return "N/A";
            if (typeof invField === 'string') {
              const resolved = inventoryMap[invField] ?? invField;
              console.log(`🔍 Resolving ${fieldName}:`, invField, "→", resolved);
              return resolved;
            }
            if (typeof invField === 'object') {
              const idCandidate = invField._id ?? invField.id;
              if (idCandidate && inventoryMap[idCandidate]) return inventoryMap[idCandidate];
              return invField.name ?? invField.title ?? (idCandidate ?? "N/A");
            }
            return "N/A";
          };

          const fromName = resolveInventoryName(t.from, 'from');
          const toName = resolveInventoryName(t.to, 'to');

          return {
            _id: t._id ?? t.transferId ?? "N/A",
            product: {
              name: prodName,
              category: categoryId,
            },
            transactionNumber: t.reference ?? t.ref ?? t.transferNumber ?? "N/A",
            quantity: firstProduct?.unit ?? firstProduct?.quantity ?? t.quantity ?? 0,
            type: 'Transfer',
            fromInventory: { name: fromName },
            toInventory: { name: toName },
            createdAt: t.createdAt ?? t.updatedAt ?? undefined,
          } as Transaction;
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

      if (selectedCategory === 'All Categories') return matchesSearch;

      const cat = item.product?.category;
      if (!cat) return false;

      return matchesSearch && cat === selectedCategory;
    });
  }, [searchQuery, selectedCategory, stockItems]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(trans => {
      const productName = trans.product?.name?.toLowerCase() || '';
      const transNum = trans.transactionNumber?.toLowerCase() || '';
      const matchesSearch = productName.includes(searchQuery.toLowerCase()) ||
                           transNum.includes(searchQuery.toLowerCase());

      if (selectedCategory === 'All Categories') return matchesSearch;

      const cat = trans.product?.category;
      if (!cat) return false;

      return matchesSearch && cat === selectedCategory;
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
// Helper to generate pagination buttons dynamically
const getPaginationPages = (current: number, total: number, maxVisible = 5) => {
  const pages: number[] = [];
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, current + half);

  if (end - start + 1 < maxVisible) {
    if (start === 1) {
      end = Math.min(total, start + maxVisible - 1);
    } else if (end === total) {
      start = Math.max(1, end - maxVisible + 1);
    }
  }

  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
};

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
          </div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <span>Dashboard</span>
            <span> › </span>
            <span className="text-gray-700">Stock Search</span>
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
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
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
              className="px-6 py-2 bg-gray-400 text-gray-800 rounded-full hover:bg-gray-500 transition-colors flex items-center gap-2"
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
                </tr>
              </thead>
              <tbody>
                {paginatedStockItems.length > 0 ? (
                  paginatedStockItems.map((item) => {
                    const categoryName = resolveCategoryNameById(item.product?.category);
                    
                    return (
                      <tr key={item._id} className="border-b last:border-b-0">
                        <td className="py-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div>
                            <div className="font-medium">{item.product?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{categoryName}</div>
                          </div>
                        </td>
                        <td className="py-4 text-blue-600 underline cursor-pointer">
                          {item.inventory?.name || '-'}
                        </td>
                        <td className="py-4">{item.quantity || 0}</td>
                        <td className="py-4 text-sm text-gray-600">
                          {formatDate(item.lastUpdate)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
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

  {getPaginationPages(stockCurrentPage, stockTotalPages).map(page => (
    <button
      key={page}
      onClick={() => setStockCurrentPage(page)}
      className={`px-3 py-1 rounded-full ${
        stockCurrentPage === page ? 'bg-slate-700 text-white' : 'border hover:bg-gray-50'
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
                  paginatedTransactions.map((trans) => {
                    const categoryName = resolveCategoryNameById(trans.product?.category);
                    
                    return (
                      <tr key={trans._id} className="border-b last:border-b-0">
                        <td className="py-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div>
                            <div className="font-medium">{trans.product?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{categoryName}</div>
                          </div>
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
                    );
                  })
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
              {getPaginationPages(transCurrentPage, transTotalPages).map(page => (
  <button
    key={page}
    onClick={() => setTransCurrentPage(page)}
    className={`px-3 py-1 rounded-full ${
      transCurrentPage === page ? 'bg-slate-700 text-white' : 'border hover:bg-gray-50'
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