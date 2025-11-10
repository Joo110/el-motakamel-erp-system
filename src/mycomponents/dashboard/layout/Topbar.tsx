import { Search, Bell, LogOut } from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useSidebarStore from "../../store/sidebarStore";

const Topbar = () => {
  const navigate = useNavigate();
  const { toggle } = useSidebarStore(); // Zustand toggle

  const handleLogout = () => {
    Cookies.remove("authToken");
    toast.success("Logged out successfully!");
    navigate("/user-login");
  };

  return (
    <header className="flex items-center justify-between bg-[#243047] h-16 px-6 shadow-md">
      {/* Left Section - Logo */}
      <div className="flex items-center gap-4">
        <img src="/images/logo2.png" alt="El Motakamel Logo" className="w-20 h-20 object-contain" />
        {/* Optional: اسم الشركة يظهر على الديسكتوب فقط */}
        <span className="hidden lg:inline text-white font-semibold text-lg">EL Motakamel</span>
      </div>

      {/* Right Section - Toggle + Search + Icons */}
      <div className="flex items-center gap-4">
        {/* Search box - يظهر فقط على الديسكتوب */}
        <div className="hidden lg:flex items-center bg-white rounded-full px-4 py-2 w-80">
          <Search className="text-gray-400 mr-2" size={18} />
          <input
            type="text"
            placeholder="Search"
            className="outline-none w-full text-sm text-gray-700 bg-transparent"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <Bell className="text-gray-600" size={18} />
          </button>

          <button
            onClick={handleLogout}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="text-gray-600" size={18} />
          </button>

          {/* Toggle Sidebar button - يظهر فقط على الموبايل */}
          <button
            className="lg:hidden w-10 h-10 bg-white rounded-full flex items-center justify-center"
            onClick={toggle}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
