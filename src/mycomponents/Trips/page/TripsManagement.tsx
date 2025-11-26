import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

interface Trip {
  tripNumber: string;
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

  const trips: Trip[] = [
    {
      tripNumber: '392304.9235',
      agent: 'EGC',
      driver: '3922 SR',
      expenses: '2331 SR',
      sales: '2331 SR',
      area: 'koko',
      date: '12 Nov 2025',
      status: 'In Progress'
    },
    {
      tripNumber: '093509302',
      agent: 'Akarab',
      driver: '2211 SR',
      expenses: '2331 SR',
      sales: '2331 SR',
      area: 'koko',
      date: '10 Nov 2025',
      status: 'In Progress'
    },
    {
      tripNumber: '235324223',
      agent: 'Fresh',
      driver: '3882 SR',
      expenses: '2331 SR',
      sales: '2331 SR',
      area: 'koko',
      date: '3 Oct 2025',
      status: 'In Progress'
    }
  ];

  const totalTrips = 247;

  const handleContinue = (tripNumber: string) => {
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
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-bold text-gray-900">{t('Trips')}</h2>
          <span className="text-sm text-gray-600 font-medium">
            {t('Showing 1-10 of {totalTrips} Trips', { totalTrips })}
          </span>
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
              {trips.map((trip, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-blue-50 transition-all duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {trip.tripNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {trip.agent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {trip.driver}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {trip.expenses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {trip.sales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {trip.area}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {trip.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleContinue(trip.tripNumber)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      {t('Continue')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 font-medium">{t('Show')}</span>
            <select 
              className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm hover:border-gray-400 transition-colors"
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-700 font-medium">{t('entries')}</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              className="px-4 py-2 text-sm text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-all duration-200"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            >
              {t('Previous')}
            </button>
            <button className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg shadow-md">
              1
            </button>
            <button className="px-4 py-2 text-sm text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-all duration-200">
              2
            </button>
            <button className="px-4 py-2 text-sm text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-all duration-200">
              3
            </button>
            <button 
              className="px-4 py-2 text-sm text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-all duration-200"
              onClick={() => setCurrentPage(currentPage + 1)}
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
