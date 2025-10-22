import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, MapPin, Calendar } from 'lucide-react';
import { useInventories } from '@/mycomponents/inventory/hooks/useInventories';
import { useNavigate } from 'react-router-dom';

interface Inventory {
  id: string;
  name: string;
  location: string;
  capacity: string;
  lastUpdate: string;
  image: string;
}

interface InventoriesListViewProps {
  onAddProduct?: () => void;
  onInventoryClick?: (id: string) => void;
}

const InventoriesListView: React.FC<InventoriesListViewProps> = ({
  onAddProduct,
  onInventoryClick,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(6);

  const { inventories: rawInventories, isLoading } = useInventories();

  const mappedInventories: Inventory[] = useMemo(() => {
    return rawInventories.map((inv, idx) => {
      const id = (inv as any)._id ?? `inv-${idx}`; // safe fallback id
      const name = inv.name ?? 'Unnamed Inventory';
      const location = inv.location ?? '';
      const capacity =
        typeof inv.capacity === 'number'
          ? String(inv.capacity)
          : inv.capacity ?? '';
      const dateStr = (inv as any).updatedAt ?? (inv as any).createdAt ?? '';
      let lastUpdate = '';
      if (dateStr) {
        try {
          const d = new Date(dateStr);
          const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
          lastUpdate = d.toLocaleDateString('en-GB', opts).toUpperCase();
        } catch {
          lastUpdate = String(dateStr).toUpperCase();
        }
      }

      // placeholder image per item (picsum using seed to keep images stable)
      const image = `https://picsum.photos/seed/${encodeURIComponent(id)}/400/300`;

      return {
        id,
        name,
        location,
        capacity,
        lastUpdate,
        image,
      };
    });
  }, [rawInventories]);

  // client-side search: filter locally by name, location, or id
  const filteredInventories = useMemo(() => {
    if (!searchQuery.trim()) {
      return mappedInventories;
    }
    const query = searchQuery.toLowerCase();
    return mappedInventories.filter(
      (inv) =>
        inv.name.toLowerCase().includes(query) ||
        inv.location.toLowerCase().includes(query) ||
        inv.id.toLowerCase().includes(query)
    );
  }, [mappedInventories, searchQuery]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleAddInventory = () => {
    if (onAddProduct) {
      onAddProduct();
    } else {
      navigate('/dashboard/add-inventory');
    }
  };

  // pagination
  const totalInventories = filteredInventories.length;
  const maxPages = Math.max(1, Math.ceil(totalInventories / entriesPerPage));
  const startEntry = totalInventories === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalInventories);

  const paginated = filteredInventories.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleInventoryClick = (id: string) => {
    if (onInventoryClick) {
      onInventoryClick(id);
    } else {
      // لو مفيش callback، ممكن نروح لصفحة التفاصيل
      navigate(`/inventories/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>Dashboard</span>
            <span>›</span>
            <span className="text-gray-700">Inventories</span>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <button
              onClick={handleAddInventory}
              className="px-5 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Add Inventory
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Inventory Search</h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search Inventory by name, id, or location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Search size={18} />
              Search
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Inventories</h2>
          <span className="text-sm text-gray-500">
            Showing {startEntry}-{endEntry} of {totalInventories} Inventory
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {isLoading ? (
            // keep layout: show placeholders while loading (simple boxes)
            Array.from({ length: entriesPerPage }).map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse h-64" />
            ))
          ) : paginated.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No inventories found matching your search.
            </div>
          ) : (
            paginated.map((inventory, index) => (
              <div
                key={`${inventory.id}-${index}`}
                onClick={() => handleInventoryClick(inventory.id)}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="h-40 bg-gray-200 overflow-hidden">
                  {inventory.image ? (
                    <img
                      src={inventory.image}
                      alt={inventory.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-amber-100"></div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{inventory.name}</h3>
                    <span className="text-xs text-gray-500">{inventory.id}</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{inventory.location}</span>
                    </div>
                    {inventory.capacity && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-3 h-3 border-2 border-gray-400 rounded-sm"></div>
                        </div>
                        <span>{inventory.capacity}</span>
                      </div>
                    )}
                    {inventory.lastUpdate && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span>Last Updated: {inventory.lastUpdate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-full px-2 py-1"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
            <span>entries</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(3, maxPages) }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 rounded-full ${
                  currentPage === pageNum ? 'bg-slate-700 text-white' : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(maxPages, currentPage + 1))}
              disabled={currentPage >= maxPages}
              className="px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoriesListView;