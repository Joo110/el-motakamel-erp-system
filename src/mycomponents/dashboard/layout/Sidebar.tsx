import { useState } from "react";
import { ChevronDown, Users, Package, Warehouse, CreditCard, ClipboardList } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useSidebarStore from "../../store/sidebarStore";
import { useTranslation } from "react-i18next";

type MenuKeys =
  | "products"
  | "inventory"
  | "purchases"
  | "sales"
  | "customer"
  | "suppliers"
  | "hr"
  | "Trips"
  | "accounts"
  | `user-${number}`
  | `user-extra-${number}`;

type OpenMenusState = {
  [key in MenuKeys]?: boolean;
};

const Sidebar = () => {
  const { t } = useTranslation();
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
                <span>{t("products_management")}</span>
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
                  {t("products")}
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
                  {t("add_product")}
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
                <span>{t("inventory_management")}</span>
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
                  {t("inventories")}
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
                  {t("add_inventory")}
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
                  {t("stock_search")}
                  <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                    location.pathname === "/dashboard/stock-search"
                      ? "opacity-100"
                      : "opacity-0 group-hover/item:opacity-100"
                  }`}></div>
                </Link>

                <Link
                  to="/dashboard/transfer"
                  className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                    location.pathname === "/dashboard/transfer"
                      ? "text-white font-medium"
                      : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                  }`}
                >
                  {t("transfer")}
                  <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                    location.pathname === "/dashboard/transfer"
                      ? "opacity-100"
                      : "opacity-0 group-hover/item:opacity-100"
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
              <span>{t("purchases_management")}</span>
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
                {t("request_order")}
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
                {t("precious_orders")}
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/preciousmanagement"
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}></div>
              </Link>
              <Link
                to="/dashboard/precious/supplier/purchaseinvoice"
                className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                  location.pathname === "/dashboard/precious/supplier/purchaseinvoice"
                    ? "text-white font-medium"
                    : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                }`}
              >
                {t("purchase_invoice")}
                <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                  location.pathname === "/dashboard/precious/supplier/purchaseinvoice"
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
                  <span>{t("suppliers")}</span>
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
                      {t("supplier_list")}
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
                      {t("add_supplier")}
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
              <span>{t("sales_management")}</span>
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
                {t("create_quotation")}
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
                {t("sales_orders")}
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
                  <span>{t("customer")}</span>
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
                      {t("customer_list")}
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
                      {t("add_customer")}
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
                <span>{t("hr_management")}</span>
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
                  {t("employees")}
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
                  {t("add_employee")}
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
                  {t("payroll")}
                  <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                    location.pathname === "/dashboard/hr/payroll"
                      ? "opacity-100"
                      : "opacity-0 group-hover/item:opacity-100"
                  }`}></div>
                </Link>
                
                <Link
                  to="/dashboard/hr/attendance"
                  className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                    location.pathname === "/dashboard/hr/attendance"
                      ? "text-white font-medium"
                      : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                  }`}
                >
                  {t("attendance")}
                  <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                    location.pathname === "/dashboard/hr/attendance"
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
                <span>{t("accounts_management")}</span>
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
                  {t("accounts")}
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
                  {t("accounting_tree")}
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
                  {t("journals")}
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
                  {t("new_journal")}
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
                  {t("new_journal_entry")}
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
                  {t("journal_entries_viewer")}
                  <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                    location.pathname === "/dashboard/journal/JournalEntriesViewer"
                      ? "opacity-100"
                      : "opacity-0 group-hover/item:opacity-100"
                  }`}></div>
                </Link>
              </div>
            )}
          </div>

          {/* Trips Management */}
          <div className="mb-1 relative group">
            <button
              onClick={() => toggleMenu("Trips")}
              className={`flex justify-between items-center w-full px-6 py-3 transition-colors ${
                openMenus["Trips"]
                  ? "text-white bg-[#34495e]"
                  : "text-gray-300 hover:bg-[#34495e] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <Users size={18} strokeWidth={2} />
                <span>{t("delegates_management")}</span>
              </span>
              <ChevronDown
                size={16}
                className={`transition-all ${
                  openMenus["Trips"] ? "rotate-180 text-white" : "text-gray-400 group-hover:text-white"
                }`}
              />
            </button>
            <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
              openMenus["Trips"] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}></div>

            {openMenus["Trips"] && (
              <div className="bg-[#34495e] py-2">
               
                 <Link
                  to="/dashboard/Trips/TripsManagement"
                  className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                    location.pathname === "/dashboard/Trips/TripsManagement"
                      ? "text-white font-medium"
                      : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                  }`}
                >
                  {t("delegates")}
                  <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                    location.pathname === "/dashboard/Trips/TripsManagement"
                      ? "opacity-100"
                      : "opacity-0 group-hover/item:opacity-100"
                  }`}></div>
                </Link>
                <Link
                  to="/dashboard/Trips/NewTrip"
                  className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                    location.pathname === "/dashboard/Trips/NewTrip"
                      ? "text-white font-medium"
                      : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                  }`}
                >
                  {t("create_trip")}
                  <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                    location.pathname === "/dashboard/Trips/NewTrip"
                      ? "opacity-100"
                      : "opacity-0 group-hover/item:opacity-100"
                  }`}></div>
                </Link>

                <Link
                  to="/dashboard/Trips/CarsListView"
                  className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                    location.pathname === "/dashboard/Trips/CarsListView"
                      ? "text-white font-medium"
                      : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                  }`}
                >
                  {t("cars_list_view")}
                  <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                    location.pathname === "/dashboard/Trips/CarsListView"
                      ? "opacity-100"
                      : "opacity-0 group-hover/item:opacity-100"
                  }`}></div>
                </Link>

                <Link
                  to="/dashboard/Trips/AddCarForm"
                  className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                    location.pathname === "/dashboard/Trips/AddCarForm"
                      ? "text-white font-medium"
                      : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                  }`}
                >
                  {t("add_car")}
                  <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                    location.pathname === "/dashboard/Trips/AddCarForm"
                      ? "opacity-100"
                      : "opacity-0 group-hover/item:opacity-100"
                  }`}></div>
                </Link>

                <Link
                  to="/dashboard/Trips/Transfercar"
                  className={`block px-6 py-2.5 pl-14 text-sm transition-colors relative group/item ${
                    location.pathname === "/dashboard/Trips/Transfercar"
                      ? "text-white font-medium"
                      : "text-gray-300 hover:text-white hover:bg-[#3d5466]"
                  }`}
                >
                  {t("transfer")}
                  <div className={`absolute right-0 top-0 h-full w-1 bg-[#3498db] transition-opacity ${
                    location.pathname === "/dashboard/Trips/Transfercar"
                      ? "opacity-100"
                      : "opacity-0 group-hover/item:opacity-100"
                  }`}></div>
                </Link>
              </div>
            )}
          </div>

          {/* Footer Section */}
          <div className="mt-80 bg-[#243047] text-gray-300 text-center py-4 border-t border-[#1a252f]">
            <div className="space-y-1">
              <p className="flex items-center justify-center gap-2 text-sm font-medium">
                <span className="text-gray-200">{t("settings")}</span>
              </p>
              <div className="flex flex-col text-xs space-y-0.5">
                <button className="hover:text-white">{t("privacy_policy")}</button>
                <button className="hover:text-white">{t("terms_conditions")}</button>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-gray-400">
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
