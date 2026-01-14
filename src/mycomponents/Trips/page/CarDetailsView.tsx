import React, { useState, useEffect, useMemo } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// import './i18n'; // تأكد من استدعاء ملف التهيئة هنا أو في ملف الجذر (App.tsx)

// ==================== Types ====================
interface CarItem {
  id: string;
  name: string;
  category: string;
  units: string;
  unitCount: number;
  price: string;
  priceValue: number;
  total: string;
  totalValue: number;
}

interface CarDetailsViewProps {
  onEdit?: () => void;
}

// ==================== Component ====================
const CarDetailsView: React.FC<CarDetailsViewProps> = ({ onEdit }) => {
  const { t } = useTranslation(); // تفعيل هوك الترجمة

  const [currentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [cars, setCars] = useState<CarItem[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [editingCar, setEditingCar] = useState<CarItem | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);

  // Dummy car data
  const carData = {
    id: '#CAR001',
    name: 'Tesla Model S',
    location: 'Alex Road',
    capacity: '5 seats',
    image: 'https://picsum.photos/seed/car1/400/300',
  };

  // Dummy stock items
  useEffect(() => {
    setStocksLoading(true);
    const dummyItems: CarItem[] = [
      {
        id: 'c1',
        name: 'Engine Oil',
        category: 'Fluids',
        units: 'EO-1',
        unitCount: 2,
        price: '50.00 SR',
        priceValue: 50,
        total: '100.00 SR',
        totalValue: 100,
      },
      {
        id: 'c2',
        name: 'Brake Pads',
        category: 'Parts',
        units: 'BP-1',
        unitCount: 4,
        price: '120.00 SR',
        priceValue: 120,
        total: '480.00 SR',
        totalValue: 480,
      },
      {
        id: 'c3',
        name: 'Air Filter',
        category: 'Filters',
        units: 'AF-1',
        unitCount: 1,
        price: '80.00 SR',
        priceValue: 80,
        total: '80.00 SR',
        totalValue: 80,
      },
    ];
    setCars(dummyItems);
    setStocksLoading(false);
  }, []);

  const paginatedCars = useMemo(
    () => cars.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage),
    [cars, currentPage, entriesPerPage]
  );

  const openEditModal = (car: CarItem) => {
    setEditingCar(car);
    setEditQty(car.unitCount);
    setEditPrice(car.priceValue);
  };
  const closeEditModal = () => {
    setEditingCar(null);
    setEditQty(0);
    setEditPrice(0);
  };

  const submitEdit = () => {
    if (!editingCar) return;
    setCars(prev =>
      prev.map(p =>
        p.id === editingCar.id
          ? {
              ...p,
              unitCount: editQty,
              priceValue: editPrice,
              price: `${editPrice.toFixed(2)} SR`,
              totalValue: editQty * editPrice,
              total: `${(editQty * editPrice).toFixed(2)} SR`,
            }
          : p
      )
    );
    closeEditModal();
  };

  const handleDeleteCarItem = (id: string) => {
    if (!confirm(t('deleteItemConfirm'))) return;
    setCars(prev => prev.filter(x => x.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>{t('dashboard')}</span>
            <span>›</span>
            <span>{t('cars')}</span>
            <span>›</span>
            <span className="text-gray-700">{carData.name}</span>
          </div>
          <h1 className="text-2xl font-bold">{t('carManagement')}</h1>
        </div>

        {/* Car Info */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">{carData.name}</h2>
            <div className="space-y-1 text-sm mt-1">
              <div>
                <span className="text-gray-600">{t('location')}:</span> {carData.location}
              </div>
              <div>
                <span className="text-gray-600">{t('capacity')}:</span> {carData.capacity}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-slate-700 text-white rounded-full hover:bg-blue-800 text-sm"
            >
              {t('editDetails')}
            </button>
            <div className="w-32 h-20 overflow-hidden rounded-lg bg-gray-100">
              <img src={carData.image} alt="Car" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        {/* Car Items Table */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">{t('carItemsTitle')}</h2>
          <div className="w-full overflow-x-auto">
            <table className="min-w-max w-full text-xs sm:text-sm">
              <thead className="border-b bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="pb-3 px-2">{t('tableItem')}</th>
                  <th className="pb-3 px-2">{t('tableCategory')}</th>
                  <th className="pb-3 px-2">{t('tableUnits')}</th>
                  <th className="pb-3 px-2">{t('tablePrice')}</th>
                  <th className="pb-3 px-2">{t('tableTotal')}</th>
                  <th className="pb-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {stocksLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">{t('loadingItems')}</td>
                  </tr>
                ) : paginatedCars.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">{t('noItemsFound')}</td>
                  </tr>
                ) : (
                  paginatedCars.map(item => (
                    <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-2">{item.name}</td>
                      <td className="py-3 px-2">{item.category}</td>
                      <td className="py-3 px-2">{item.unitCount}</td>
                      <td className="py-3 px-2">{item.price}</td>
                      <td className="py-3 px-2">{item.total}</td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          <button onClick={() => openEditModal(item)} className="p-1 text-blue-600">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteCarItem(item.id)} className="p-1 text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium mb-4">{t('editCarItemTitle')}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('labelItem')}</label>
                <div className="text-sm text-gray-900">{editingCar.name}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('labelQuantity')}</label>
                <input
                  type="number"
                  value={editQty}
                  onChange={e => setEditQty(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('labelPriceSR')}</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={e => setEditPrice(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeEditModal} className="px-4 py-2 bg-gray-200 rounded-full text-sm">
                {t('cancel')}
              </button>
              <button onClick={submitEdit} className="px-4 py-2 bg-slate-700 text-white rounded-full text-sm">
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDetailsView;