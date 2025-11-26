import { Search, Bell, LogOut, Globe } from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import useSidebarStore from "../../store/sidebarStore";
import { useTranslation } from "react-i18next";

const Topbar = () => {
  const navigate = useNavigate();
  const toggle = useSidebarStore(state => state.toggle);
  const { t, i18n } = useTranslation();

  const [language, setLanguage] = useState(Cookies.get("language") || "ar");
  const [showLangMenu, setShowLangMenu] = useState(false);

  // تطبيق اللغة المحفوظة عند تحميل الصفحة
  useEffect(() => {
    const savedLang = Cookies.get("language") || "ar";
    i18n.changeLanguage(savedLang);
    document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = savedLang;
  }, [i18n]);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-toggle')) {
        setShowLangMenu(false);
      }
    };

    if (showLangMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showLangMenu]);

  const handleLogout = () => {
    Cookies.remove("authToken");
    toast.success(t("logoutSuccess"));
    navigate("/user-login");
  };

  const handleLanguageChange = (lang: "ar" | "en") => {
    setLanguage(lang);
    Cookies.set("language", lang, { expires: 365 });
    i18n.changeLanguage(lang);
    setShowLangMenu(false);
    
    // تغيير الاتجاه
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    
    toast.success(lang === "ar" ? "تم التبديل للعربية ✓" : "Switched to English ✓");
  };

  return (
    <header className="flex items-center justify-between bg-[#243047] h-16 px-6 shadow-md">
      <div className="flex items-center gap-4">
        <img 
          src="/images/logo2.png" 
          alt="El Motakamel Logo" 
          className="w-20 h-20 object-contain" 
        />
        <span className="hidden lg:inline text-white font-semibold text-lg">
          EL Motakamel
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center bg-white rounded-full px-4 py-2 w-80">
          <Search className="text-gray-400 mr-2" size={18} />
          <input
            type="text"
            placeholder={t("search")}
            className="outline-none w-full text-sm text-gray-700 bg-transparent"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <div className="relative language-toggle">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors relative"
              title={t("changeLanguage")}
            >
              <Globe className="text-gray-600" size={18} />
              <span className="absolute -bottom-1 -right-1 bg-[#243047] text-white text-[10px] font-bold px-1 rounded-full min-w-[18px] text-center">
                {language.toUpperCase()}
              </span>
            </button>

            {/* Language Dropdown Menu */}
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                <button
                  onClick={() => handleLanguageChange("ar")}
                  className={`w-full px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center justify-between ${
                    language === "ar" 
                      ? "bg-blue-50 text-blue-600 font-semibold" 
                      : "text-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">🇸🇦</span>
                    العربية
                  </span>
                  {language === "ar" && (
                    <span className="text-blue-600 font-bold">✓</span>
                  )}
                </button>
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={`w-full px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center justify-between ${
                    language === "en" 
                      ? "bg-blue-50 text-blue-600 font-semibold" 
                      : "text-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">🇺🇸</span>
                    English
                  </span>
                  {language === "en" && (
                    <span className="text-blue-600 font-bold">✓</span>
                  )}
                </button>
              </div>
            )}
          </div>

          <button 
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            title={t("notifications")}
          >
            <Bell className="text-gray-600" size={18} />
          </button>

          <button
            onClick={handleLogout}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors group"
            title={t("logout")}
          >
            <LogOut className="text-gray-600 group-hover:text-white transition-colors" size={18} />
          </button>

          <button
            className="lg:hidden w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            onClick={toggle}
            title={t("menu")}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;