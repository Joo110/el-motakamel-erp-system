import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Suppliers } from "../hooks/Suppliers";
import { useTranslation } from 'react-i18next';

const SupplierDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchSupplierById, removeSupplier } = Suppliers(false);
  const [supplier, setSupplier] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchSupplierById(id).then((data) => setSupplier(data));
    }
  }, [id, fetchSupplierById]);

  const handleDelete = async () => {
    if (id && window.confirm(t('confirm_delete_supplier'))) {
      await removeSupplier(id);
      navigate("/dashboard/precious/suppliers");
    }
  };

  if (!supplier)
    return <p className="p-6 text-gray-600 text-center">{t('loading_supplier_details')}</p>;

  const orders = [
    {
      number: "3523543235",
      inventory: "Master Dakahlia",
      price: "10",
      creator: "Mahmoud Magdy",
      time: "2:13 pm",
      status: "Draft",
    },
    {
      number: "093509342",
      inventory: "New Capital",
      price: "10",
      creator: "Mahmoud Magdy",
      time: "2 oct 2025",
      status: "Delivered",
    },
    {
      number: "235324223",
      inventory: "Alw Station",
      price: "10",
      creator: "Mahmoud Magdy",
      time: "3 NOV 2025",
      status: "Approved",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div className="min-w-[200px]">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t('precious_management')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {t('dashboard')} &gt; {t('precious')} &gt; {t('details')}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleDelete}
              className="bg-red-400 hover:bg-red-500 text-white px-3 sm:px-4 py-2 rounded-full text-sm w-full sm:w-auto"
            >
              {t('delete_supplier')}
            </button>
          </div>
        </div>

        {/* Supplier Info Card */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {supplier.name || t('unnamed_supplier')}
                </h2>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-500">{t('id')}:</p>
                  <p className="font-semibold text-gray-900">
                    #{supplier._id?.slice(-6) || "N/A"}
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex flex-wrap">
                  <span className="font-semibold text-gray-700 w-32">{t('location')}:</span>
                  <span className="text-gray-600 break-all">
                    {supplier.address || "—"}
                  </span>
                </div>
                <div className="flex flex-wrap">
                  <span className="font-semibold text-gray-700 w-32">{t('phone')}:</span>
                  <span className="text-gray-600 break-all">
                    {supplier.phone || "—"}
                  </span>
                </div>
                <div className="flex flex-wrap">
                  <span className="font-semibold text-gray-700 w-32">{t('email')}:</span>
                  <span className="text-gray-600 break-all">
                    {supplier.email || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                {t('orders')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {t('showing_orders', { start: 1, end: orders.length, total: 247 })}
              </p>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-100">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                      {t('order_number')}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                      {t('inventory')}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                      {t('total_price')}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                      {t('created_by')}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                      {t('order_time')}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                      {t('status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr
                      key={idx}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-900 whitespace-nowrap">
                        {order.number}
                      </td>
                      <td className="py-3 px-4 text-blue-600 underline cursor-pointer hover:text-blue-800 whitespace-nowrap">
                        {order.inventory}
                      </td>
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        {order.price}
                      </td>
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        {order.creator}
                      </td>
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        {order.time}
                      </td>
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        {order.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap justify-between items-center mt-4 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">{t('show')}</span>
                <select className="border border-gray-300 rounded-full px-2 py-1 text-gray-700">
                  <option>10</option>
                </select>
                <span className="text-gray-600">{t('entries')}</span>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded-full text-gray-600 text-sm">
                  {t('previous')}
                </button>
                <button className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-full text-gray-600 text-sm">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-full text-gray-600 text-sm">
                  3
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-full text-gray-600 text-sm">
                  {t('next')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetails;
