// src/mycomponents/Trips/components/CarDetailsView.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import axiosClient from '@/lib/axiosClient';

interface CarItem {
  id: string;
  stockId?: string;
  name: string;
  category: string;
  units: string;
  unitCount: number;
  status?: string;
  minQuantity?: number;
  maxQuantity?: number;
  lastUpdated?: string;
  transactions?: any[];
  raw?: any;
}

interface InventoryStatistics {
  totalItems?: number;
  totalQuantity?: number;
  totalValue?: number;
  lowStockCount?: number;
  outOfStockCount?: number;
  inStockCount?: number;
  overstockCount?: number;
  [key: string]: any;
}

interface CapacityInfo {
  total?: number;
  used?: number;
  available?: number;
  percentage?: number;
  [key: string]: any;
}

interface CarDetailsViewProps {
  onEdit?: () => void;
  id?: string;
  data?: any; // accepts an already-fetched mobile-stock payload or full response
}

const CarDetailsView: React.FC<CarDetailsViewProps> = ({ id: propId, data: propData }) => {
  const { t } = useTranslation();
  const params = useParams<{ id?: string }>();
  const location = useLocation();

  const [currentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [cars, setCars] = useState<CarItem[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);

  const [carData, setCarData] = useState({
    id: '',
    name: '',
    location: '',
    capacity: '',
    year: '' as string | number,
    brand: '',
    representative: '',
    createdAt: '',
    updatedAt: '',
  });

  const [inventoryStats, setInventoryStats] = useState<InventoryStatistics | null>(null);
  const [capacityInfo, setCapacityInfo] = useState<CapacityInfo | null>(null);

  // which items' transactions are expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const routeId =
    propId ??
    params.id ??
    (() => {
      const segs = location.pathname.split('/').filter(Boolean);
      return segs.length ? segs[segs.length - 1] : undefined;
    })();

  const toggleExpanded = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // helper to map payload -> state (used both for propData and fetched data)
  const processPayload = (payloadRaw: any) => {
    if (!payloadRaw) {
      setCarData({
        id: '',
        name: '',
        location: '',
        capacity: '',
        year: '',
        brand: '',
        representative: '',
        createdAt: '',
        updatedAt: '',
      });
      setCars([]);
      setInventoryStats(null);
      setCapacityInfo(null);
      return;
    }

    let payload = payloadRaw;

    // If the passed-in is a wrapper { message, data: { ... } }
    if (payload?.data && Object.keys(payload).length > 1) {
      // e.g. full response
      payload = payload.data;
    }

    // if array, take first
    if (Array.isArray(payload) && payload.length > 0) payload = payload[0];

    // Basic header fields
    const name = payload?.name ?? payload?.title ?? '';
    const capacityVal = payload?.capacity ?? payload?.inventory?.capacity ?? payload?.inventory?.capacityInfo?.total ?? '';
    const locationStr = payload?.location ?? payload?.name ?? '';

    setCarData({
      id: payload?.id ?? payload?._id ?? '',
      name,
      location: locationStr,
      capacity: capacityVal !== '' ? String(capacityVal) : '',
      year: payload?.year ?? '',
      brand: payload?.brand ?? '',
      representative: payload?.representative ?? '',
      createdAt: payload?.createdAt ?? '',
      updatedAt: payload?.updatedAt ?? '',
    });

    // Inventory: prefer payload.inventory.items (new format)
    const inventory = payload?.inventory ?? {};
    const items = Array.isArray(inventory?.items)
      ? inventory.items
      : Array.isArray(payload?.topProducts)
      ? payload.topProducts
      : [];

    // statistics & capacity info
    setInventoryStats(inventory?.statistics ?? null);
    setCapacityInfo(inventory?.capacityInfo ?? {
      total: payload?.capacity ?? payload?.capacityInfo?.total ?? undefined,
      used: undefined,
      available: undefined,
      percentage: undefined,
    });

    const mapped: CarItem[] = Array.isArray(items)
      ? items.map((it: any, index: number) => {
          const product = it?.product ?? {};
          const id = it?._id ?? product?.id ?? `item-${index}-${Math.random().toString(36).slice(2, 6)}`;
          const qty = Number(it?.quantity ?? it?.qty ?? 0) || 0;
          const unitLabel =
            product?.unit ?? product?.units ?? product?.unitName ?? (typeof product?.unit === 'number' ? String(product.unit) : undefined) ?? 'pcs';

          return {
            id,
            stockId: product?.id ?? product?._id,
            name: product?.name ?? product?.title ?? `${t('tableItem')} ${index + 1}`,
            category: product?.code ?? product?.category ?? '—',
            units: String(unitLabel),
            unitCount: qty,
            status: it?.status ?? undefined,
            minQuantity: it?.minQuantity ?? undefined,
            maxQuantity: it?.maxQuantity ?? undefined,
            lastUpdated: it?.lastUpdated ?? undefined,
            transactions: Array.isArray(it?.transactions) ? it.transactions : [],
            raw: it,
          } as CarItem;
        })
      : [];

    setCars(mapped);
  };

  useEffect(() => {
    // if caller passed data prop, use it and skip fetch
    if (propData) {
      processPayload(propData);
      return;
    }

    if (!routeId) return;

    const fetchCar = async () => {
      try {
        setStocksLoading(true);
        const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || 'Token';
        const res = await axiosClient.get(`/mobile-stocks/${routeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res?.data ?? res;
        let payload = data?.data ?? data;

        // if API returned array, take first
        if (Array.isArray(payload) && payload.length > 0) {
          payload = payload[0];
        }

        processPayload(payload);
      } catch (err) {
        // silent console for debug
        // eslint-disable-next-line no-console
        console.error('Failed to fetch mobile stock:', err);
      } finally {
        setStocksLoading(false);
      }
    };

    void fetchCar();
  }, [routeId, location.pathname, propId, params.id, propData]);

  const paginatedCars = useMemo(
    () => cars.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage),
    [cars, currentPage, entriesPerPage]
  );

  const handleDeleteCarItem = (id: string) => {
    if (!confirm(t('deleteItemConfirm'))) return;
    setCars(prev => prev.filter(x => x.id !== id));
  };

  // small helper to format date strings (fallback safe)
  const fmtDate = (d?: string) => {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return d;
      return dt.toLocaleString();
    } catch {
      return d;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex justify-between items-start gap-6">
            <div>
              <h2 className="text-lg font-semibold">{carData.name}</h2>
              <div className="space-y-1 text-sm mt-1">
                <div>
                  <span className="text-gray-600">{t('location')}:</span> {carData.location || '—'}
                </div>
                <div>
                  <span className="text-gray-600">{t('capacity')}:</span> {carData.capacity || '—'}
                </div>
                <div>
                  <span className="text-gray-600">{t('brand')}:</span> {carData.brand || '—'}
                </div>
                <div>
                  <span className="text-gray-600">{t('year')}:</span> {carData.year || '—'}
                </div>
              </div>
            </div>

            <div className="text-sm space-y-1 text-right">
              <div>
                <span className="text-gray-600">{t('representative')}:</span> {carData.representative || '—'}
              </div>
              <div>
                <span className="text-gray-600">{t('created')}:</span> {fmtDate(carData.createdAt)}
              </div>
              <div>
                <span className="text-gray-600">{t('updated')}:</span> {fmtDate(carData.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Inventory summary + capacity info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold mb-3">{t('inventorySummary')}</h3>
            {inventoryStats ? (
              <ul className="text-sm space-y-1">
                <li>
                  <strong>{t('inventory.totalItems')}:</strong> {inventoryStats.totalItems ?? '—'}
                </li>
                <li>
                  <strong>{t('inventory.totalQuantity')}:</strong> {inventoryStats.totalQuantity ?? '—'}
                </li>
                <li>
                  <strong>{t('inventory.totalValue')}:</strong> {inventoryStats.totalValue ?? '—'}
                </li>
                <li>
                  <strong>{t('inventory.inStockCount')}:</strong> {inventoryStats.inStockCount ?? '—'}
                </li>
                <li>
                  <strong>{t('inventory.lowStockCount')}:</strong> {inventoryStats.lowStockCount ?? '—'}
                </li>
                <li>
                  <strong>{t('inventory.outOfStockCount')}:</strong> {inventoryStats.outOfStockCount ?? '—'}
                </li>
              </ul>
            ) : (
              <div className="text-sm text-gray-500">{t('noItemsFound')}</div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold mb-3">{t('capacityInfo')}</h3>
            {capacityInfo ? (
              <ul className="text-sm space-y-1">
                <li>
                  <strong>{t('capacity.total')}:</strong> {capacityInfo.total ?? '—'}
                </li>
                <li>
                  <strong>{t('capacity.used')}:</strong> {capacityInfo.used ?? '—'}
                </li>
                <li>
                  <strong>{t('capacity.available')}:</strong> {capacityInfo.available ?? '—'}
                </li>
                <li>
                  <strong>{t('capacity.percentage')}:</strong> {capacityInfo.percentage ?? '—'}
                </li>
              </ul>
            ) : (
              <div className="text-sm text-gray-500">{t('noItemsFound')}</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">{t('carItemsTitle')}</h2>
          <div className="w-full overflow-x-auto">
            <table className="min-w-max w-full text-xs sm:text-sm">
              <thead className="border-b bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="pb-3 px-2">{t('tableItem')}</th>
                  <th className="pb-3 px-2">{t('tableCategory')}</th>
                  <th className="pb-3 px-2">{t('tableUnits')}</th>
                  <th className="pb-3 px-2">{t('status')}</th>
                  <th className="pb-3 px-2" />
                </tr>
              </thead>
              <tbody>
                {stocksLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      {t('loadingItems')}
                    </td>
                  </tr>
                ) : paginatedCars.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      {t('noItemsFound')}
                    </td>
                  </tr>
                ) : (
                  paginatedCars.map(item => (
                    <React.Fragment key={item.id}>
                      <tr className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 px-2">{item.name}</td>
                        <td className="py-3 px-2">{item.category}</td>
                        <td className="py-3 px-2">{item.unitCount} {item.units}</td>
                        <td className="py-3 px-2">{item.status ?? '—'}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteCarItem(item.id)}
                              className="p-1 text-red-600"
                              aria-label={t('deleteItemAria')}
                              title={t('removeLocal')}
                            >
                              <Trash2 size={16} />
                            </button>

                            <button
                              onClick={() => toggleExpanded(item.id)}
                              className="p-1 text-gray-600 flex items-center gap-1"
                              aria-label={t('toggleTransactionsAria')}
                              title={t('toggleTransactions')}
                            >
                              {expanded[item.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* transactions row (expandable) */}
                      {expanded[item.id] && (
                        <tr className="bg-gray-50">
                          <td colSpan={5} className="py-2 px-4">
                            <div className="text-sm">
                              <div className="mb-2 font-medium">{t('transactions')}</div>
                              {item.transactions && item.transactions.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-xs">
                                    <thead className="text-left text-gray-600">
                                      <tr>
                                        <th className="pb-2 pr-4">{t('transactions.type')}</th>
                                        <th className="pb-2 pr-4">{t('transactions.quantity')}</th>
                                        <th className="pb-2 pr-4">{t('transactions.reference')}</th>
                                        <th className="pb-2 pr-4">{t('transactions.notes')}</th>
                                        <th className="pb-2 pr-4">{t('transactions.performedBy')}</th>
                                        <th className="pb-2 pr-4">{t('transactions.date')}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.transactions.map((tx: any, idx: number) => (
                                        <tr key={idx} className="align-top">
                                          <td className="py-1 pr-4">{tx.type ?? '—'}</td>
                                          <td className="py-1 pr-4">{tx.quantity ?? '—'}</td>
                                          <td className="py-1 pr-4">{tx.referenceId ?? '—'}</td>
                                          <td className="py-1 pr-4">{tx.notes ?? '—'}</td>
                                          <td className="py-1 pr-4">{tx.performedBy ?? '—'}</td>
                                          <td className="py-1 pr-4">{fmtDate(tx.date)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-gray-500">{t('noTransactions')}</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsView;
