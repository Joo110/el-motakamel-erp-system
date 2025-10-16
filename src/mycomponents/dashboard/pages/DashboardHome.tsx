import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const DashboardHome = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-md border rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
            <p className="text-2xl font-bold mt-2">1,240</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-700">Total Products</h2>
            <p className="text-2xl font-bold mt-2">325</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-700">Monthly Sales</h2>
            <p className="text-2xl font-bold mt-2">$12,540</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;