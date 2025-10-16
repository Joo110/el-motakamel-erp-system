import { useState } from "react";
import { ChevronDown, Users, Package } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    products: true
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
            {/* الخط العمودي على اليمين عند الـ hover */}
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
          {/* الخط العمودي على اليمين */}
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
            {/* الخط العمودي على اليمين عند الـ hover */}
            <div className="absolute right-0 top-0 h-full w-1 bg-[#334155] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;