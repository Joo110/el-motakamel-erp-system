import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Suppliers } from "../hooks/Suppliers";
//import { toast } from 'react-hot-toast';

const SupplierDetails = () => {
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
    if (id && window.confirm("Are you sure you want to delete this supplier?")) {
      await removeSupplier(id);
      navigate("/precious/suppliers");
    }
  };

  if (!supplier)
    return <p className="p-6 text-gray-600">Loading supplier details...</p>;

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Precious Management
            </h1>
            <p className="text-sm text-gray-500">
              Dashboard &gt; Precious &gt; Details
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="bg-red-300 hover:bg-red-400 text-white px-4 py-2 rounded-full"
            >
              Delete Supplier
            </button>
          </div>
        </div>

        {/* Supplier Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between">
            <div className="flex-1">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {supplier.name || "Unnamed Supplier"}
                </h2>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Id:</p>
                  <p className="font-semibold text-gray-900">
                    #{supplier._id?.slice(-6) || "N/A"}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex">
                  <span className="font-semibold text-gray-700 w-32">
                    Location:
                  </span>
                  <span className="text-gray-600">
                    {supplier.address || "—"}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-gray-700 w-32">
                    Phone:
                  </span>
                  <span className="text-gray-600">
                    {supplier.phone || "—"}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-gray-700 w-32">
                    Email:
                  </span>
                  <span className="text-gray-600">
                    {supplier.email || "—"}
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-8 flex items-center justify-center">
              <div className="text-red-500 text-4xl font-bold">
                ⚡ {supplier.name?.split(" ")[0]?.toUpperCase() || "SUPPLIER"}
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
              <p className="text-sm text-gray-500">
                Showing 1–{orders.length} of 247 Orders
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Order number
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Inventory
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Total Price
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Created by
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Order Time
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-900">{order.number}</td>
                      <td className="py-4 px-4 text-blue-600 underline cursor-pointer hover:text-blue-800">
                        {order.inventory}
                      </td>
                      <td className="py-4 px-4 text-gray-600">{order.price}</td>
                      <td className="py-4 px-4 text-gray-600">{order.creator}</td>
                      <td className="py-4 px-4 text-gray-600">{order.time}</td>
                      <td className="py-4 px-4 text-gray-600">{order.status}</td>
                      <td className="py-4 px-4">
                        <button className="text-blue-600 hover:text-blue-800 underline text-sm rounded-full">
                          view
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show</span>
                <select className="border border-gray-300 rounded-full px-2 py-1 text-sm">
                  <option>10</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600">
                  Previous
                </button>
                <button className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600">
                  3
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-600">
                  Next
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