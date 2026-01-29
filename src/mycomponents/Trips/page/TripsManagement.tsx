import React, { useState, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import useTrips from "../hooks/useTrips";

interface TripRow {
  tripNumber: string | number;
  agent: string;
  driver: string;
  expenses: string;
  sales: string;
  area: string;
  date: string;
  status: string;
}

const TripsManagement: React.FC = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const navigate = useNavigate();

  const { trips: apiTrips, loading } = useTrips();

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
      tripNumber: t.tripNumber ?? t._id ?? t.id ?? '-',
      agent:
        typeof t.representative === "string"
          ? t.representative
          : (t.representative as any)?.name ?? "-",
      driver: t.driver ?? "-",
      expenses: (t as any).expenses ? `${(t as any).expenses}` : "-",
      sales: (t as any).sales ? `${(t as any).sales}` : "-",
      area: t.location ?? "-",
      date: formatDate(t.date ?? t.createdAt ?? ""),
      status: (t.status ?? "inprogress") as string,
    }));
  }, [apiTrips]);

  const totalTrips = uiTrips.length;

  // ---------------------- NEW PAGINATION LOGIC ----------------------
  const totalPages = Math.max(1, Math.ceil(totalTrips / entriesPerPage));

  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return uiTrips.slice(start, start + entriesPerPage);
  }, [uiTrips, currentPage, entriesPerPage]);

  const pageNumbers = [...Array(totalPages)].map((_, i) => i + 1);
  // ------------------------------------------------------------------

  const handleContinue = (tripNumber: string | number) => {
    // navigate by id if available; try to find underlying trip id
    // if tripNumber is actually the trip id, fine; otherwise navigate with it
    navigate(`/dashboard/Trips/DelegatesManagement/${tripNumber}`);
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
                  {t('Agent')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('Driver')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('Expenses')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('Sales')}
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
                  key={String(trip.tripNumber ?? index)}
                  className="hover:bg-blue-50 transition-all duration-200"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{trip.tripNumber}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{trip.agent}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{trip.driver}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{trip.expenses}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{trip.sales}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{trip.area}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{trip.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleContinue(trip.tripNumber)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      {t('Continue')}
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && paginatedTrips.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    {t('No trips found')}
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
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
    </div>
  );
};

export default TripsManagement;
