import React, { useEffect } from "react"; 
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  TrendingDown,
  CreditCard,
  BarChart3
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStatistics } from "../hooks/useStatistics";

const DashboardHome = () => {
  const { t } = useTranslation();
  const { getStatistics, data, loading, error } = useStatistics();

 useEffect(() => {
  getStatistics();
}, [getStatistics]);


  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
        <div className="p-8 space-y-8">
          {/* Header Loading */}
          <div className="space-y-3">
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Stats Cards Loading */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="h-14 w-14 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Financial Overview Loading */}
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-0 shadow-md">
                  <CardContent className="p-5 space-y-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bottom Section Loading */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-0 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className="h-2 w-2 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="h-10 w-32 bg-gray-200/50 rounded-lg animate-pulse"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200/50 rounded-xl animate-pulse"></div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <Card className="border-0 shadow-lg max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t("error_loading_data")}</h3>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => getStatistics()}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              {t("retry")}
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statisticsData = data?.data;

  if (!statisticsData) return null;

  const stats = [
    {
      title: t("total_revenue"),
      value: `$${statisticsData.totalRevenue.toLocaleString()}`,
      change: statisticsData.revenuePercentage,
      trend: statisticsData.revenuePercentage.startsWith('+') ? "up" : "down",
      icon: DollarSign,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      lightBg: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: t("total_users"),
      value: statisticsData.totalUsers.toLocaleString(),
      change: statisticsData.userPercentage,
      trend: statisticsData.userPercentage.startsWith('+') ? "up" : "down",
      icon: Users,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      lightBg: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      title: t("total_products"),
      value: statisticsData.totalProducts.toLocaleString(),
      change: statisticsData.productPercentage,
      trend: statisticsData.productPercentage.startsWith('+') ? "up" : "down",
      icon: Package,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      lightBg: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: t("monthly_sales"),
      value: `$${statisticsData.monthlySales.toLocaleString()}`,
      change: statisticsData.monthlySalesPercentage,
      trend: statisticsData.monthlySalesPercentage.startsWith('+') ? "up" : "down",
      icon: ShoppingCart,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      lightBg: "bg-orange-50",
      iconColor: "text-orange-600"
    }
  ];

  const financialStats = [
    {
      label: t("total_profit"),
      value: `$${statisticsData.totalProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      label: t("total_expenses"),
      value: `$${statisticsData.totalExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600"
    },
    {
      label: t("total_bank"),
      value: `$${statisticsData.totalBank.toLocaleString()}`,
      icon: Wallet,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600"
    },
    {
      label: t("gross_profit"),
      value: `$${statisticsData.totalGrossProfit.toLocaleString()}`,
      icon: BarChart3,
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-50",
      textColor: "text-violet-600"
    }
  ];

  const accountingStats = [
    {
      label: t("total_receivable"),
      value: `$${statisticsData.totalReceivable.toLocaleString()}`,
      icon: CreditCard,
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      label: t("total_payable"),
      value: `$${statisticsData.totalPayable.toLocaleString()}`,
      icon: CreditCard,
      bgColor: "bg-red-50",
      textColor: "text-red-600"
    },
    {
      label: t("net_profit"),
      value: `$${statisticsData.netProfit.toLocaleString()}`,
      icon: DollarSign,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <div className="p-8 space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#334155] via-[#334155] to-[#334155] bg-clip-text text-transparent">
            {t("dashboard_overview")}
          </h1>
          <p className="text-gray-600">{t("dashboard_welcome")}</p>
        </div>

        {/* Main Stats Grid */}
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

        {/* Financial Overview Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("financial_overview")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {financialStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Accounting Stats */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("accounting_summary")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {accountingStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
                  <h2 className="text-xl font-bold text-gray-900">{t("recent_activity")}</h2>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  {t("view_all")}
                </button>
              </div>

              <div className="space-y-4">
                {statisticsData.recentActivities.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer group"
                  >
                    <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full group-hover:scale-150 transition-transform duration-200"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{activity.title}</p>
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
                  <h2 className="text-xl font-bold">{t("quick_insights")}</h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors duration-200 cursor-pointer">
                    <p className="text-sm text-white/80 mb-1">{t("conversion_rate")}</p>
                    <p className="text-2xl font-bold">{statisticsData.conversionRate}%</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors duration-200 cursor-pointer">
                    <p className="text-sm text-white/80 mb-1">{t("avg_order_value")}</p>
                    <p className="text-2xl font-bold">${statisticsData.avgOrderValue}</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors duration-200 cursor-pointer">
                    <p className="text-sm text-white/80 mb-1">{t("active_sessions")}</p>
                    <p className="text-2xl font-bold">{statisticsData.activeSessions.toLocaleString()}</p>
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
