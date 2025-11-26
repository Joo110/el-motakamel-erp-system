import React, { useState, useMemo } from 'react'; 
import { Search, RotateCcw, MapPin, Calendar, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// ==================== Types ====================
interface Car {
  id: string;
  name: string;
  location: string;
  capacity: string;
  avatar?: string;
  lastUpdate: string;
  image: string;
}

interface CarsListViewProps {
  onAddCar?: () => void;
  onCarClick?: (id: string) => void;
  onEditCar?: (id: string) => void;
}

// ==================== Component ====================
const CarsListView: React.FC<CarsListViewProps> = ({
  onAddCar,
  onCarClick,
  onEditCar,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(6);

  // Sample cars data (replace with API hook if needed)
  const rawCars: Car[] = [
    { id: 'CAR001', name: 'Toyota Corolla', location: 'Alex Road', capacity: '5', lastUpdate: '12 Nov 2025', image: '' },
    { id: 'CAR002', name: 'Nissan Patrol', location: 'Cairo', capacity: '7', lastUpdate: '10 Nov 2025', image: '' },
    { id: 'CAR003', name: 'Ford Ranger', location: 'Giza', capacity: '2', lastUpdate: '3 Oct 2025', image: '' },
  ];

  const mappedCars: Car[] = useMemo(() => {
    return rawCars.map((car, idx) => ({
      ...car,
      id: car.id ?? `car-${idx}`,
      name: car.name ?? t('Unnamed_Car'),
      location: car.location ?? '',
      capacity: car.capacity ?? '',
      lastUpdate: car.lastUpdate ?? '',
      image: car.image ?? '',
    }));
  }, [rawCars, t]);

  const filteredCars = useMemo(() => {
    if (!searchQuery.trim()) return mappedCars;
    const query = searchQuery.toLowerCase();
    return mappedCars.filter(
      (car) =>
        car.name.toLowerCase().includes(query) ||
        car.location.toLowerCase().includes(query) ||
        car.id.toLowerCase().includes(query)
    );
  }, [mappedCars, searchQuery]);

  const handleSearch = () => setCurrentPage(1);
  const handleReset = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleAddCar = () => {
    if (onAddCar) {
      onAddCar();
    } else {
      navigate('/dashboard/Trips/AddCarForm'); // Add car page
    }
  };

  const totalCars = filteredCars.length;
  const maxPages = Math.max(1, Math.ceil(totalCars / entriesPerPage));
  const startEntry = totalCars === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalCars);
  const paginated = filteredCars.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleCarClick = (id: string) => {
    if (onCarClick) onCarClick(id);
    else navigate(`/dashboard/Trips/CarDetailsView`);
  };

  const handleEditClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onEditCar) onEditCar(id);
    else navigate(`/dashboard/Trips/AddCarForm`);
  };

  const getPageNumbers = () => {
    if (maxPages === 0) return [];
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(maxPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  React.useEffect(() => {
    if (currentPage > maxPages) setCurrentPage(maxPages || 1);
  }, [maxPages]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>{t('Dashboard')}</span>
            <span>›</span>
            <span className="text-gray-700">{t('Cars')}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <h1 className="text-2xl font-bold">{t('Cars_Management')}</h1>
            <button
              onClick={handleAddCar}
              className="mt-3 sm:mt-0 px-5 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <span className="text-xl">+</span>
              <span>{t('Add_Car')}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('Car_Search')}</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t('search_car_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition-colors flex items-center gap-2 w-full sm:w-auto whitespace-nowrap flex-shrink-0"
              >
                <Search size={18} />
                {t('Search')}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition-colors flex items-center gap-2 w-full sm:w-auto whitespace-nowrap flex-shrink-0"
              >
                <RotateCcw size={18} />
                {t('Reset')}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{t('Cars')}</h2>
          <span className="text-sm text-gray-500">
            {t('Showing')} {startEntry}-{endEntry} {t('of')} {totalCars} {t('Cars')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {paginated.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              {t('no_cars_found')}
            </div>
          ) : (
            paginated.map((car, index) => (
              <div
                key={`${car.id}-${index}`}
                onClick={() => handleCarClick(car.id)}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative group"
              >
                <div className="h-40 bg-gray-200 overflow-hidden relative">
                  {car.image ? (
                    <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-amber-100"></div>
                  )}
                  <button
                    onClick={(e) => handleEditClick(e, car.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Edit car"
                  >
                    <Edit2 size={16} className="text-slate-700" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{car.name}</h3>
                    <span className="text-xs text-gray-500">{car.id}</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{car.location}</span>
                    </div>
                    {car.capacity && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-3 h-3 border-2 border-gray-400 rounded-sm"></div>
                        </div>
                        <span>{car.capacity}</span>
                      </div>
                    )}
                    {car.lastUpdate && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{t('Last_Updated')}: {car.lastUpdate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-lg shadow-sm gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span>{t('Show')}</span>
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
            <span>{t('entries')}</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {t('Previous')}
            </button>

            <div className="flex gap-2 px-1">
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-full flex-shrink-0 ${
                    currentPage === pageNum ? 'bg-slate-700 text-white' : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(maxPages, currentPage + 1))}
              disabled={currentPage >= maxPages}
              className="px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {t('Next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarsListView;