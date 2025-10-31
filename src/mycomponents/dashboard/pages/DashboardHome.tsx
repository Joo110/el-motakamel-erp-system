import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Package, DollarSign, TrendingUp, ShoppingCart, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

const DashboardHome = () => {
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231",
      change: "+20.1%",
      trend: "up",
      icon: DollarSign,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      lightBg: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Total Users",
      value: "1,240",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      lightBg: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      title: "Total Products",
      value: "325",
      change: "+8.2%",
      trend: "up",
      icon: Package,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      lightBg: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Monthly Sales",
      value: "$12,540",
      change: "-3.4%",
      trend: "down",
      icon: ShoppingCart,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      lightBg: "bg-orange-50",
      iconColor: "text-orange-600"
    }
  ];

  const recentActivity = [
    { id: 1, action: "New order received", time: "2 minutes ago", type: "order" },
    { id: 2, action: "Product stock updated", time: "15 minutes ago", type: "update" },
    { id: 3, action: "New user registered", time: "1 hour ago", type: "user" },
    { id: 4, action: "Payment received", time: "2 hours ago", type: "payment" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#334155] via-[#334155] to-[#334155] bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              >
                <CardContent className="p-6">
                  {/* Icon Circle */}
                  <div className={`w-14 h-14 ${stat.lightBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                      <div className={`flex items-center gap-1 text-sm font-semibold ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        <span>{stat.change}</span>
                      </div>
                    </div>
                  </div>

                  {/* Decorative gradient */}
                  <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${stat.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer group"
                  >
                    <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full group-hover:scale-150 transition-transform duration-200"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">Quick Insights</h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors duration-200">
                    <p className="text-sm text-white/80 mb-1">Conversion Rate</p>
                    <p className="text-2xl font-bold">3.24%</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors duration-200">
                    <p className="text-sm text-white/80 mb-1">Avg. Order Value</p>
                    <p className="text-2xl font-bold">$142.50</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors duration-200">
                    <p className="text-sm text-white/80 mb-1">Active Sessions</p>
                    <p className="text-2xl font-bold">1,429</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;