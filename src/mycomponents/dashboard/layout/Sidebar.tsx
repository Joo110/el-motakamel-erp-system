import { useState } from "react";
import { ChevronDown, Users, Package, Warehouse, CreditCard, ClipboardList } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    products: true,
    inventory: false,
    purchases: false,
    sales: false,
    customer: false,
    suppliers: false,
    hr: false
  });
  const location = useLocation();

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="h-full w-72 bg-white flex flex-col border-r border-gray-200">
      <nav className="flex-1 overflow-y-auto pt-4">
        {/* User Management Items - Multiple */}
        {[...Array(2)].map((_, i) => (
          <div key={`user-${i}`} className="mb-1 relative">
            <button
              onClick={() => toggleMenu(`user-${i}`)}
              className="flex justify-between items-center w-full px-6 py-3 hover:text-[#334155] transition-colors group"
            >
              <span className="flex items-center gap-3 text-sm text-gray-600 group-hover:text-[#334155]">
                <Users size={18} strokeWidth={1.5} />
                <span>User management</span>
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 group-hover:text-[#334155] transition-all ${
                  openMenus[`user-${i}`] ? "rotate-180" : ""
                }`}
              />
            </button>
            <div className="absolute right-0 top-0 h-full w-1 bg-[#334155] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}

        {/* Products Management */}
        <div className="mb-1 relative group">
          <button
            onClick={() => toggleMenu("products")}
            className={`flex justify-between items-center w-full px-6 py-3 transition-colors ${
              openMenus["products"]
                ? "text-[#334155] bg-gray-50"
                : "text-gray-600 hover:text-[#334155]"
            }`}
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <Package size={18} strokeWidth={2} />
              <span>Products Management</span>
            </span>
            <ChevronDown
              size={16}
              className={`transition-all ${
                openMenus["products"] ? "rotate-180 text-[#334155]" : "text-gray-400 group-hover:text-[#334155]"
              }`}
            />
          </button>
          <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
            openMenus["products"] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}></div>

          {openMenus["products"] && (
            <div className="bg-gray-50 py-2">
              <Link
                to="/dashboard/products"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/products"
                    ? "text-[#334155] font-medium"
                    : "text-gray-600 hover:text-[#334155]"
                }`}
              >
                Products
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
                  location.pathname === "/dashboard/products"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/add-product"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/add-product"
                    ? "text-[#334155] font-medium"
                    : "text-gray-600 hover:text-[#334155]"
                }`}
              >
                Add Product
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
                  location.pathname === "/dashboard/add-product"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>
            </div>
          )}
        </div>

        {/* Inventory Management */}
        <div className="mb-1 relative group">
          <button
            onClick={() => toggleMenu("inventory")}
            className={`flex justify-between items-center w-full px-6 py-3 transition-colors ${
              openMenus["inventory"]
                ? "text-[#334155] bg-gray-50"
                : "text-gray-600 hover:text-[#334155]"
            }`}
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <Warehouse size={18} strokeWidth={2} />
              <span>Inventory Management</span>
            </span>
            <ChevronDown
              size={16}
              className={`transition-all ${
                openMenus["inventory"] ? "rotate-180 text-[#334155]" : "text-gray-400 group-hover:text-[#334155]"
              }`}
            />
          </button>
          <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
            openMenus["inventory"] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}></div>

          {openMenus["inventory"] && (
            <div className="bg-gray-50 py-2">
              <Link
                to="/dashboard/inventories"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/inventories"
                    ? "text-[#334155] font-medium"
                    : "text-gray-600 hover:text-[#334155]"
                }`}
              >
                Inventories
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
                  location.pathname === "/dashboard/inventories"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/add-inventory"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/add-inventory"
                    ? "text-[#334155] font-medium"
                    : "text-gray-600 hover:text-[#334155]"
                }`}
              >
                Add Inventory
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
                  location.pathname === "/dashboard/add-inventory"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/stock-search"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/stock-search"
                    ? "text-[#334155] font-medium"
                    : "text-gray-600 hover:text-[#334155]"
                }`}
              >
                Stock Search
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
                  location.pathname === "/dashboard/stock-search"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/transfermanagement"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/transfermanagement" ? "text-[#334155] font-medium" : "text-gray-600 hover:text-[#334155]"
                }`}
              >
                Transfer Management
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
                  location.pathname === "/dashboard/transfermanagement" ? "opacity-100" : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/transfer"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/transfer" ? "text-[#334155] font-medium" : "text-gray-600 hover:text-[#334155]"
                }`}
              >
                Transfer
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
                  location.pathname === "/dashboard/transfer" ? "opacity-100" : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>        
            </div>
          )}
        </div>

        {/* Purchases Management */}
        <div className="mb-1 relative group">
          <button
            onClick={() => toggleMenu("purchases")}
            className={`flex justify-between items-center w-full px-6 py-3 transition-colors ${
              openMenus["purchases"]
                ? "text-[#334155] bg-gray-50"
                : "text-gray-600 hover:text-[#334155]"
            }`}
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <CreditCard size={18} strokeWidth={2} />
              <span>Purchases</span>
            </span>
            <ChevronDown
              size={16}
              className={`transition-all ${
                openMenus["purchases"] ? "rotate-180 text-[#334155]" : "text-gray-400 group-hover:text-[#334155]"
              }`}
            />
          </button>
          <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
            openMenus["purchases"] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}></div>

          {openMenus["purchases"] && (
            <div className="bg-gray-50 py-2">
              <Link
                to="/dashboard/stock-in"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/stock-in"
                    ? "text-[#334155] font-medium"
                    : "text-gray-600 hover:text-[#334155]"
                }`}
              >
                Request Order
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
                  location.pathname === "/dashboard/stock-in"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/preciousmanagement"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/preciousmanagement"
                    ? "text-[#334155] font-medium"
                    : "text-gray-600 hover:text-[#334155]"
                }`}
              >
                Precious Orders
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
                  location.pathname === "/dashboard/preciousmanagement"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              {/* 🆕 Suppliers Submenu */}
              <div className="relative">
                <button
                  onClick={() => toggleMenu("suppliers")}
                  className={`flex justify-between items-center w-full px-6 py-2.5 pl-14 text-sm transition-colors ${
                    openMenus["suppliers"]
                      ? "text-[#334155] font-medium"
                      : "text-gray-600 hover:text-[#334155]"
                  }`}
                >
                  <span>Suppliers</span>
                  <ChevronDown
                    size={14}
                    className={`transition-all ${
                      openMenus["suppliers"] ? "rotate-180 text-[#334155]" : "text-gray-400"
                    }`}
                  />
                </button>

                {openMenus["suppliers"] && (
                  <div className="bg-gray-100 py-1">
                    <Link
                      to="/dashboard/precious/suppliers"
                      className={`block px-6 py-2 pl-20 text-sm transition-colors relative group/item ${
                        location.pathname === "/dashboard/precious/suppliers"
                          ? "text-[#334155] font-medium"
                          : "text-gray-600 hover:text-[#334155]"
                      }`}
                    >
                      Supplier List
                      <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
                        location.pathname === "/dashboard/precious/suppliers"
                          ? "opacity-100"
                          : "opacity-0 group-hover/item:opacity-100"
                      }`}></div>
                    </Link>

                    <Link
                      to="/dashboard/precious/supplier/new"
                      className={`block px-6 py-2 pl-20 text-sm transition-colors relative group/item ${
                        location.pathname === "/dashboard/precious/supplier/new"
                          ? "text-[#334155] font-medium"
                          : "text-gray-600 hover:text-[#334155]"
                      }`}
                    >
                      Add Supplier
                      <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
                        location.pathname === "/dashboard/precious/supplier/new"
                          ? "opacity-100"
                          : "opacity-0 group-hover/item:opacity-100"
                      }`}></div>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sales Management */}
        <div className="mb-1 relative group">
          <button
            onClick={() => toggleMenu("sales")}
            className={`flex justify-between items-center w-full px-6 py-3 transition-colors ${
              openMenus["sales"]
                ? "text-[#334155] bg-gray-50"
                : "text-gray-600 hover:text-[#334155]"
            }`}
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <ClipboardList size={18} strokeWidth={2} />
              <span>Sales</span>
            </span>
            <ChevronDown
              size={16}
              className={`transition-all ${
                openMenus["sales"] ? "rotate-180 text-[#334155]" : "text-gray-400 group-hover:text-[#334155]"
              }`}
            />
          </button>
          <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
            openMenus["sales"] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}></div>

          {openMenus["sales"] && (
            <div className="bg-gray-50 py-2">
              <Link
                to="/dashboard/stock-out"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/stock-out"
                    ? "text-[#334155] font-medium"
                    : "text-gray-600 hover:text-[#334155]"
                }`}
              >
                Create quotation
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
                  location.pathname === "/dashboard/stock-out"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/inventoryorders"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/inventoryorders"
                    ? "text-[#334155] font-medium"
                    : "text-gray-600 hover:text-[#334155]"
                }`}
              >
                Sales Orders
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
                  location.pathname === "/dashboard/inventoryorders"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              {/* 🆕 Customer Submenu */}
              <div className="relative">
                <button
                  onClick={() => toggleMenu("customer")}
                  className={`flex justify-between items-center w-full px-6 py-2.5 pl-14 text-sm transition-colors ${
                    openMenus["customer"]
                      ? "text-[#334155] font-medium"
                      : "text-gray-600 hover:text-[#334155]"
                  }`}
                >
                  <span>Customer</span>
                  <ChevronDown
                    size={14}
                    className={`transition-all ${
                      openMenus["customer"] ? "rotate-180 text-[#334155]" : "text-gray-400"
                    }`}
                  />
                </button>

                {openMenus["customer"] && (
                  <div className="bg-gray-100 py-1">
                    <Link
                      to="/dashboard/sales/customers"
                      className={`block px-6 py-2 pl-20 text-sm transition-colors relative group/item ${
                        location.pathname === "/dashboard/sales/customers"
                          ? "text-[#334155] font-medium"
                          : "text-gray-600 hover:text-[#334155]"
                      }`}
                    >
                      Customer List
                      <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
                        location.pathname === "/dashboard/sales/customers"
                          ? "opacity-100"
                          : "opacity-0 group-hover/item:opacity-100"
                      }`}></div>
                    </Link>

                    <Link
                      to="/dashboard/sales/customer/new"
                      className={`block px-6 py-2 pl-20 text-sm transition-colors relative group/item ${
                        location.pathname === "/dashboard/sales/customer/new"
                          ? "text-[#334155] font-medium"
                          : "text-gray-600 hover:text-[#334155]"
                      }`}
                    >
                      Add Customer
                      <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
                        location.pathname === "/dashboard/sales/customer/new"
                          ? "opacity-100"
                          : "opacity-0 group-hover/item:opacity-100"
                      }`}></div>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* HR Management */}
<div className="mb-1 relative group">
  <button
    onClick={() => toggleMenu("hr")}
    className={`flex justify-between items-center w-full px-6 py-3 transition-colors ${
      openMenus["hr"]
        ? "text-[#334155] bg-gray-50"
        : "text-gray-600 hover:text-[#334155]"
    }`}
  >
    <span className="flex items-center gap-3 text-sm font-medium">
      <Users size={18} strokeWidth={2} />
      <span>HR Management</span>
    </span>
    <ChevronDown
      size={16}
      className={`transition-all ${
        openMenus["hr"] ? "rotate-180 text-[#334155]" : "text-gray-400 group-hover:text-[#334155]"
      }`}
    />
  </button>
  <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
    openMenus["hr"] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
  }`}></div>

  {openMenus["hr"] && (
    <div className="bg-gray-50 py-2">
      <Link
        to="/dashboard/hr/employees"
        className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
          location.pathname === "/dashboard/hr/employees"
            ? "text-[#334155] font-medium"
            : "text-gray-600 hover:text-[#334155]"
        }`}
      >
        Employees
        <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
          location.pathname === "/dashboard/hr/employees"
            ? "opacity-100"
            : "opacity-0 group-hover/item:opacity-100"
        }`}></div>
      </Link>

      <Link
        to="/dashboard/hr/employee/new"
        className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
          location.pathname === "/dashboard/hr/employee/new"
            ? "text-[#334155] font-medium"
            : "text-gray-600 hover:text-[#334155]"
        }`}
      >
        Add Employee
        <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
          location.pathname === "/dashboard/hr/employee/new"
            ? "opacity-100"
            : "opacity-0 group-hover/item:opacity-100"
        }`}></div>
      </Link>

      <Link
        to="/dashboard/hr/payroll"
        className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
          location.pathname === "/dashboard/hr/payroll"
            ? "text-[#334155] font-medium"
            : "text-gray-600 hover:text-[#334155]"
        }`}
      >
        Payroll
        <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
          location.pathname === "/dashboard/hr/payroll"
            ? "opacity-100"
            : "opacity-0 group-hover/item:opacity-100"
        }`}></div>
      </Link>
       <Link
        to="/dashboard/hr/Attendance"
        className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
          location.pathname === "/dashboard/hr/Attendance"
            ? "text-[#334155] font-medium"
            : "text-gray-600 hover:text-[#334155]"
        }`}
      >
        Attendance
        <div className={`absolute right-0 top-0 h-full w-1 bg-[#334155] transition-opacity ${
          location.pathname === "/dashboard/hr/Attendance"
            ? "opacity-100"
            : "opacity-0 group-hover/item:opacity-100"
        }`}></div>
      </Link>
    </div>
  )}
</div>
        {/* More User Management Items */}
        {[...Array(7)].map((_, i) => (
          <div key={`user-extra-${i}`} className="mb-1 relative group">
            <button
              onClick={() => toggleMenu(`user-extra-${i}`)}
              className="flex justify-between items-center w-full px-6 py-3 hover:text-[#334155] transition-colors"
            >
              <span className="flex items-center gap-3 text-sm text-gray-600 group-hover:text-[#334155]">
                <Users size={18} strokeWidth={1.5} />
                <span>User management</span>
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 group-hover:text-[#334155] transition-all ${
                  openMenus[`user-extra-${i}`] ? "rotate-180" : ""
                }`}
              />
            </button>
            <div className="absolute right-0 top-0 h-full w-1 bg-[#334155] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;