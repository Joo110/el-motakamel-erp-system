// FILE: src/mycomponents/Trips/page/TripsManagement.tsx
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useTrips from "../hooks/useTrips";
import type { Trip } from "../services/tripsService";
import { toast } from 'react-hot-toast';

interface TripRow {
  id?: string;
  tripNumber: string | number;
  driver: string;
  expenses: string;
  area: string;
  date: string;
  status: string;
}

const TripsManagement: React.FC = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // useTrips provides trips array, loading, and actions
  const { trips: apiTrips, loading, getTrip, completeTrip, refresh } = useTrips();

  // modal / overlay state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [expensesInput, setExpensesInput] = useState<string>('');
  const [modalLoading, setModalLoading] = useState(false);

  const uiTrips: TripRow[] = useMemo(() => {
    const formatDate = (d?: string) => {
      if (!d) return '-';
      try {
        const dateObj = new Date(d);
        if (isNaN(dateObj.getTime())) return d;
        return dateObj.toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } catch {
        return d;
      }
    };

    return (apiTrips || []).map((t) => ({
      id: t._id ?? t.id ?? undefined,
      tripNumber: t.tripNumber ?? t._id ?? t.id ?? '-',
      driver: t.driver ?? "-",
      // show expense field if exists else '-'
      expenses: (t as any).expenseses || (t as any).expenses ? `${(t as any).expenseses ?? (t as any).expenses}` : "-",
      area: t.location ?? "-",
      date: formatDate(t.date ?? t.createdAt ?? ""),
      status: (t.status ?? "inprogress") as string,
    }));
  }, [apiTrips]);

  const totalTrips = uiTrips.length;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(totalTrips / entriesPerPage));
  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return uiTrips.slice(start, start + entriesPerPage);
  }, [uiTrips, currentPage, entriesPerPage]);

  const pageNumbers = [...Array(totalPages)].map((_, i) => i + 1);

  // Open overlay modal to enter expenses (no navigation away from current page)
  const handleContinue = async (tripIdOrNumber: string | number) => {
    // try to map trip id: prefer real id from uiTrips array
    const row = uiTrips.find(r => r.tripNumber === tripIdOrNumber || r.id === String(tripIdOrNumber));
    const id = row?.id ?? String(tripIdOrNumber);
    setSelectedTripId(id);
    setModalOpen(true);

    try {
      // fetch full trip details (uses useTrips.getTrip)
      const trip = id ? await getTrip(id) : null;
      setSelectedTrip(trip ?? null);

      // prefill expenses input if backend already has value
      const existingExpenses = (trip as any)?.expenseses ?? (trip as any)?.expenses ?? '';
      setExpensesInput(existingExpenses ? String(existingExpenses) : '');
    } catch (err) {
      console.error('Failed to load trip details', err);
      toast.error(t('Error loading trip details'));
      setSelectedTrip(null);
      setExpensesInput('');
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTripId(null);
    setSelectedTrip(null);
    setExpensesInput('');
    setModalLoading(false);
  };

  const handleSubmitExpenses = async () => {
    if (!selectedTripId) {
      toast.error(t('No trip selected'));
      return;
    }

    // basic validation
    const val = Number(expensesInput);
    if (isNaN(val) || val < 0) {
      toast.error(t('Please enter a valid non-negative number for expenses'));
      return;
    }

    setModalLoading(true);
    try {
      // call completeTrip to send payload { expenseses: <number> }
      await completeTrip(selectedTripId, { expenseses: val });
      toast.success(t('Expenses saved successfully'));
      // refresh trips list to reflect changes
      await refresh();
      closeModal();
    } catch (err: any) {
      console.error('Failed to submit expenses', err);
      toast.error(err?.response?.data?.message ?? t('Error submitting expenses'));
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <div className="min-w-[200px]">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t('Trips Management')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {t('Dashboard > Delegates')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-b-2 border-blue-600">
          <button className="px-6 py-3 text-blue-600 border-b-2 border-blue-600 font-semibold -mb-0.5">
            {t('Delegates')}
          </button>
        </div>
      </div>

      {/* Trips Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-bold text-gray-900">{t('Trips')}</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('Trip number')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('Driver')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('Expenses')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('Area')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('Date')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('Status')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('Action')}
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedTrips.map((trip, index) => (
                <tr
                  key={trip.id ?? String(trip.tripNumber ?? index)}
                  className="hover:bg-blue-50 transition-all duration-200"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{trip.tripNumber}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{trip.driver}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{trip.expenses}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{trip.area}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{trip.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleContinue(trip.id ?? trip.tripNumber)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      {t('Continue')}
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && paginatedTrips.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {t('No trips found')}
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {t('Loading...')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex justify-between items-center px-6 py-5 border-t bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <span className="text-sm">{t('Show')}</span>
            <select
              value={entriesPerPage}
              className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm"
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm">{t('entries')}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
            >
              {t('Previous')}
            </button>

            {pageNumbers.map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-4 py-2 text-sm rounded-lg font-semibold ${
                  currentPage === num
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
            >
              {t('Next')}
            </button>
          </div>
        </div>
      </div>

      {/* Modal / Overlay to enter expenses */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-4">{t('Enter_Expenses')}</h3>

            <div className="mb-4">
              <label className="text-sm text-gray-700 block mb-2">{t('Trip')}</label>
              <div className="text-sm text-gray-900">
                #{selectedTrip?.tripNumber ?? selectedTripId} • {selectedTrip?.driver ?? ''}
                {selectedTrip?.car ? ` • ${ (selectedTrip.car as any)?.name ?? '' }` : ''}
              </div>
            </div>

            {/* show products summary (optional) */}
            {selectedTrip?.products && selectedTrip.products.length > 0 && (
              <div className="mb-4">
                <label className="text-sm text-gray-700 block mb-2">{t('Products')}</label>
                <div className="max-h-40 overflow-auto border rounded p-3 bg-gray-50 text-sm">
                  {selectedTrip.products.map((p: any) => (
                    <div key={p._id ?? p.product?._id ?? `${p.product}-${p._id}`} className="flex justify-between py-1">
                      <div>{(p.product as any)?.name ?? p.product ?? '-'}</div>
                      <div className="text-gray-600">{p.quantity} × {p.price} = {(p.total ?? (p.quantity * p.price))}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses input */}
            <div className="mb-6">
              <label className="text-sm text-gray-700 block mb-2">{t('Expenses')}</label>
              <input
                type="number"
                min={0}
                value={expensesInput}
                onChange={(e) => setExpensesInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="1500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded-md text-sm"
                disabled={modalLoading}
              >
                {t('Cancel')}
              </button>

              <button
                onClick={handleSubmitExpenses}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow"
                disabled={modalLoading}
              >
                {modalLoading ? t('Saving...') : t('Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsManagement;
