import { useState } from "react";
import { ChevronDown, Users, Package, Warehouse, CreditCard, ClipboardList } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useSidebarStore from "../../store/sidebarStore";

type MenuKeys =
  | "products"
  | "inventory"
  | "purchases"
  | "sales"
  | "customer"
  | "suppliers"
  | "hr"
  | "accounts"
  | `user-${number}`
  | `user-extra-${number}`;

type OpenMenusState = {
  [key in MenuKeys]?: boolean;
};

const Sidebar = () => {
  // استخدام selector صريح لتجنب unknown
  const isOpen = useSidebarStore(state => state.isOpen);
  const close = useSidebarStore(state => state.close);

  const [openMenus, setOpenMenus] = useState<OpenMenusState>({
    products: true,
    inventory: false,
    purchases: false,
    sales: false,
    customer: false,
    suppliers: false,
    hr: false,
    accounts: false,
  });

  const location = useLocation();

  const toggleMenu = (key: MenuKeys) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={close}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#243047] flex flex-col border-r border-[#1a252f] transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:h-auto z-50`}
      >
        <nav className="flex-1 overflow-y-auto pt-4">
        {/* User Management Items - Multiple */}
        {[...Array(2)].map((_, i) => (
          <div key={`user-${i}`} className="mb-1 relative">
            <button
              onClick={() => toggleMenu(`user-${i}`)}
              className="flex justify-between items-center w-full px-6 py-3 hover:bg-[#34495e] transition-colors group"
            >
              <span className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-white">
                <Users size={18} strokeWidth={1.5} />
                <span>User management</span>
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 group-hover:text-white transition-all ${
                  openMenus[`user-${i}`] ? "rotate-180" : ""
                }`}
              />
            </button>
            <div className="absolute right-0 top-0 h-full w-1 bg-[#3498db] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}

        {/* Products Management */}
        <div className="mb-1 relative group">
          <button
            onClick={() => toggleMenu("products")}
            className={`flex justify-between items-center w-full px-6 py-3 transition-colors ${
              openMenus["products"]
                ? "text-white bg-[#34495e]"
                : "text-gray-300 hover:bg-[#34495e] hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <Package size={18} strokeWidth={2} />
              <span>Products Management</span>
            </span>
            <ChevronDown
              size={16}
              className={`transition-all ${
                openMenus["products"] ? "rotate-180 text-white" : "text-gray-400 group-hover:text-white"
              }`}
            />
          </button>
          <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
            openMenus["products"] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}></div>

          {openMenus["products"] && (
            <div className="bg-[#34495e] py-2">
              <Link
                to="/dashboard/products"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/products"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Products
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/products"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/add-product"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/add-product"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Add Product
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
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
                ? "text-white bg-[#34495e]"
                : "text-gray-300 hover:bg-[#34495e] hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <Warehouse size={18} strokeWidth={2} />
              <span>Inventory Management</span>
            </span>
            <ChevronDown
              size={16}
              className={`transition-all ${
                openMenus["inventory"] ? "rotate-180 text-white" : "text-gray-400 group-hover:text-white"
              }`}
            />
          </button>
          <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
            openMenus["inventory"] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}></div>

          {openMenus["inventory"] && (
            <div className="bg-[#34495e] py-2">
              <Link
                to="/dashboard/inventories"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/inventories"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Inventories
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/inventories"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/add-inventory"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/add-inventory"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Add Inventory
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/add-inventory"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/stock-search"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/stock-search"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Stock Search
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/stock-search"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/transfermanagement"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/transfermanagement" ? "text-white font-medium" : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Transfer Management
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/transfermanagement" ? "opacity-100" : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/transfer"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/transfer" ? "text-white font-medium" : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Transfer
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
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
                ? "text-white bg-[#34495e]"
                : "text-gray-300 hover:bg-[#34495e] hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <CreditCard size={18} strokeWidth={2} />
              <span>Purchases</span>
            </span>
            <ChevronDown
              size={16}
              className={`transition-all ${
                openMenus["purchases"] ? "rotate-180 text-white" : "text-gray-400 group-hover:text-white"
              }`}
            />
          </button>
          <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
            openMenus["purchases"] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}></div>

          {openMenus["purchases"] && (
            <div className="bg-[#34495e] py-2">
              <Link
                to="/dashboard/stock-in"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/stock-in"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Request Order
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/stock-in"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/preciousmanagement"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/preciousmanagement"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Precious Orders
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/preciousmanagement"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              {/* Suppliers Submenu */}
              <div className="relative">
                <button
                  onClick={() => toggleMenu("suppliers")}
                  className={`flex justify-between items-center w-full px-6 py-2.5 pl-14 text-sm transition-colors ${
                    openMenus["suppliers"]
                      ? "text-white font-medium"
                      : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                  }`}
                >
                  <span>Suppliers</span>
                  <ChevronDown
                    size={14}
                    className={`transition-all ${
                      openMenus["suppliers"] ? "rotate-180 text-white" : "text-gray-400"
                    }`}
                  />
                </button>

                {openMenus["suppliers"] && (
                  <div className="bg-[#3d5466] py-1">
                    <Link
                      to="/dashboard/precious/suppliers"
                      className={`block px-6 py-2 pl-20 text-sm transition-colors relative group/item ${
                        location.pathname === "/dashboard/precious/suppliers"
                          ? "text-white font-medium"
                          : "text-gray-300 hover:text-white hover:bg-[#475d72]"
                      }`}
                    >
                      Supplier List
                      <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                        location.pathname === "/dashboard/precious/suppliers"
                          ? "opacity-100"
                          : "opacity-0 group-hover/item:opacity-100"
                      }`}></div>
                    </Link>

                    <Link
                      to="/dashboard/precious/supplier/new"
                      className={`block px-6 py-2 pl-20 text-sm transition-colors relative group/item ${
                        location.pathname === "/dashboard/precious/supplier/new"
                          ? "text-white font-medium"
                          : "text-gray-300 hover:text-white hover:bg-[#475d72]"
                      }`}
                    >
                      Add Supplier
                      <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
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
                ? "text-white bg-[#34495e]"
                : "text-gray-300 hover:bg-[#34495e] hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <ClipboardList size={18} strokeWidth={2} />
              <span>Sales</span>
            </span>
            <ChevronDown
              size={16}
              className={`transition-all ${
                openMenus["sales"] ? "rotate-180 text-white" : "text-gray-400 group-hover:text-white"
              }`}
            />
          </button>
          <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
            openMenus["sales"] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}></div>

          {openMenus["sales"] && (
            <div className="bg-[#34495e] py-2">
              <Link
                to="/dashboard/stock-out"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/stock-out"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Create quotation
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/stock-out"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/inventoryorders"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/inventoryorders"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Sales Orders
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/inventoryorders"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              {/* Customer Submenu */}
              <div className="relative">
                <button
                  onClick={() => toggleMenu("customer")}
                  className={`flex justify-between items-center w-full px-6 py-2.5 pl-14 text-sm transition-colors ${
                    openMenus["customer"]
                      ? "text-white font-medium"
                      : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                  }`}
                >
                  <span>Customer</span>
                  <ChevronDown
                    size={14}
                    className={`transition-all ${
                      openMenus["customer"] ? "rotate-180 text-white" : "text-gray-400"
                    }`}
                  />
                </button>

                {openMenus["customer"] && (
                  <div className="bg-[#3d5466] py-1">
                    <Link
                      to="/dashboard/sales/customers"
                      className={`block px-6 py-2 pl-20 text-sm transition-colors relative group/item ${
                        location.pathname === "/dashboard/sales/customers"
                          ? "text-white font-medium"
                          : "text-gray-300 hover:text-white hover:bg-[#475d72]"
                      }`}
                    >
                      Customer List
                      <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                        location.pathname === "/dashboard/sales/customers"
                          ? "opacity-100"
                          : "opacity-0 group-hover/item:opacity-100"
                      }`}></div>
                    </Link>

                    <Link
                      to="/dashboard/sales/customer/new"
                      className={`block px-6 py-2 pl-20 text-sm transition-colors relative group/item ${
                        location.pathname === "/dashboard/sales/customer/new"
                          ? "text-white font-medium"
                          : "text-gray-300 hover:text-white hover:bg-[#475d72]"
                      }`}
                    >
                      Add Customer
                      <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
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
                ? "text-white bg-[#34495e]"
                : "text-gray-300 hover:bg-[#34495e] hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <Users size={18} strokeWidth={2} />
              <span>HR Management</span>
            </span>
            <ChevronDown
              size={16}
              className={`transition-all ${
                openMenus["hr"] ? "rotate-180 text-white" : "text-gray-400 group-hover:text-white"
              }`}
            />
          </button>
          <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
            openMenus["hr"] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}></div>

          {openMenus["hr"] && (
            <div className="bg-[#34495e] py-2">
              <Link
                to="/dashboard/hr/employees"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/hr/employees"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Employees
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/hr/employees"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/hr/employee/new"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/hr/employee/new"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Add Employee
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/hr/employee/new"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/hr/payroll"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/hr/payroll"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Payroll
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/hr/payroll"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>

              <Link
                to="/dashboard/hr/Attendance"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/hr/Attendance"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Attendance
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/hr/Attendance"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>
            </div>
          )}
        </div>

        {/* Accounts Management */}
        <div className="mb-1 relative group">
          <button
            onClick={() => toggleMenu("accounts")}
            className={`flex justify-between items-center w-full px-6 py-3 transition-colors ${
              openMenus["accounts"]
                ? "text-white bg-[#34495e]"
                : "text-gray-300 hover:bg-[#34495e] hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <CreditCard size={18} strokeWidth={2} />
              <span>Accounts Management</span>
            </span>
            <ChevronDown
              size={16}
              className={`transition-all ${
                openMenus["accounts"] ? "rotate-180 text-white" : "text-gray-400 group-hover:text-white"
              }`}
            />
          </button>
          <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
            openMenus["accounts"] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}></div>

          {openMenus["accounts"] && (
            <div className="bg-[#34495e] py-2">
              <Link
                to="/dashboard/accounts/AccountingDashboard"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/accounts/AccountingDashboard"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Accounts
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/accounts/AccountingDashboard"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>
               <Link
                to="/dashboard/accounts/AccountingTree"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/accounts/AccountingTree"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Accounting Tree
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/accounts/AccountingTree"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>
               <Link
                to="/dashboard/journal/Journals"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/journal/Journals"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                Journals
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/journal/Journals"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>
              <Link
                to="/dashboard/journal/NewJournal"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/journal/NewJournal"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                NewJournal
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/journal/NewJournal"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>
              <Link
                to="/dashboard/journal/NewJournalEntry"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/journal/NewJournalEntry"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                NewJournalEntry
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/journal/NewJournalEntry"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>
                 <Link
                to="/dashboard/journal/JournalEntriesViewer"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/journal/JournalEntriesViewer"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                JournalEntriesViewer
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/journal/JournalEntriesViewer"
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
              className="flex justify-between items-center w-full px-6 py-3 hover:bg-[#34495e] transition-colors"
            >
              <span className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-white">
                <Users size={18} strokeWidth={1.5} />
                <span>User management</span>
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 group-hover:text-white transition-all ${
                  openMenus[`user-extra-${i}`] ? "rotate-180" : ""
                }`}
              />
            </button>
            <div className="absolute right-0 top-0 h-full w-1 bg-[#3498db] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}

        {/* Footer Section */}
<div className="mt-auto bg-[#243047] text-gray-300 text-center py-4 border-t border-[#1a252f]">
  <div className="space-y-1">
    <p className="flex items-center justify-center gap-2 text-sm font-medium">
      <span className="text-gray-200">⚙️ Settings</span>
    </p>
    <div className="flex flex-col text-xs space-y-0.5">
      <button className="hover:text-white">Privacy Policy</button>
      <button className="hover:text-white">Terms & Conditions</button>
    </div>
  </div>

  <div className="mt-3 text-[11px] text-gray-400">
    {/* replaced text logo with image placeholder — replace /assets/logo-light.png with your logo */}
    <div className="flex items-center justify-center gap-2">
      <img src="/images/logo2.png" alt="Logo" className="h-5 object-contain" />
      <span className="text-white font-semibold">Akhdar Platform</span>
    </div>
    <div className="mt-1">2025</div>
  </div>
</div>

        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
