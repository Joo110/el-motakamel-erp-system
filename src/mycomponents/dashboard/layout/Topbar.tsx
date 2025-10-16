import { Search, Bell, Mail, Globe } from "lucide-react";

const Topbar = () => {
  return (
    <header className="flex items-center justify-between bg-[#334155] h-16 px-6 shadow-md">
      {/* Left Section - Logo and Brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-[#334155]"></div>
          </div>
          <span className="text-white text-lg font-semibold">Showcase</span>
        </div>
      </div>

      {/* Center Section - User Info */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-white text-sm">
          <span>El Motakamel</span>
          <div className="flex gap-1">
            <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs">
              ↑
            </div>
            <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs">
              ♦
            </div>
          </div>
        </div>
        {/* حط الصورة في public folder واستخدمها كده */}
        <img 
          //src="/public/images/Logo.png" 
          //alt="Logo" 
          //className="h-8 w-auto"
        />
      </div>

      {/* Right Section - Search */}
      <div className="flex items-center gap-4">
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
        </div>
      </div>
    </header>
  );
};

export default Topbar;