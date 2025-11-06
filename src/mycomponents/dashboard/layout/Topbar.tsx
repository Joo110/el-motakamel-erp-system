import { Search, Bell, Mail, Globe, LogOut } from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("authToken");
    toast.success("Logged out successfully!");
    navigate("/user-login");
  };

  return (
    <header className="flex items-center justify-between bg-[#334155] h-16 px-6 shadow-md">
      {/* Left Section - Logo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img
            src="/images/logo2.png"
            alt="El Motakamel Logo"
            className="w-20 h-20 object-contain"
          />
        </div>
      </div>

      {/* Center Section - User Info */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-white text-sm">
          <span>El Motakamel</span>
        </div>
        <img
          src="/images/logo2.png"
          alt="Logo"
          className="h-5 w-auto"
        />
      </div>

      {/* Right Section - Search + Icons + Logout */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex items-center bg-white rounded-full px-4 py-2 w-80">
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
          <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <Mail className="text-gray-600" size={18} />
          </button>
          <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <Globe className="text-gray-600" size={18} />
          </button>

          {/* ✅ Logout Button */}
          <button
            onClick={handleLogout}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="text-gray-600" size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;