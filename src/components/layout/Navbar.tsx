import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MapPin, PlusCircle, Car, ShieldAlert, BarChart3, User, Globe2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { CITY_CONFIG } from '@/config/city.config';

export const Navbar: React.FC = () => {
  const { language, setLanguage, currentUser, setRole, isMobileDeviceFrame, toggleMobileDeviceFrame, toggleDemoDrawer, t } =
    useAppStore();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="font-black text-lg tracking-tighter">UE</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">UrbanEase</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {language === 'ta' ? CITY_CONFIG.nameTamil : CITY_CONFIG.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5">{t('appTagline')}</p>
            </div>
          </NavLink>
        </div>

        {/* Desktop Quick Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-100'}`
            }
          >
            {t('navHome')}
          </NavLink>
          <NavLink
            to="/issues"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-100'}`
            }
          >
            {t('navMap')}
          </NavLink>
          <NavLink
            to="/report"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-blue-700 bg-blue-50/70 border border-blue-200/60 font-semibold hover:bg-blue-100/70 ${isActive ? 'ring-2 ring-blue-400' : ''}`
            }
          >
            <PlusCircle className="w-4 h-4" />
            {t('navReport')}
          </NavLink>
          <NavLink
            to="/park"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-100'}`
            }
          >
            {t('parkAndChargeTitle').split(' ')[0]} & EV
          </NavLink>
          <NavLink
            to="/transit"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-100'}`
            }
          >
            {t('navMobility')}
          </NavLink>

          {/* Role specific links */}
          {currentUser.role === 'officer' && (
            <NavLink
              to="/officer"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 font-semibold ${isActive ? 'ring-2 ring-amber-400' : ''}`
              }
            >
              <ShieldAlert className="w-4 h-4" />
              {t('navConsole')}
            </NavLink>
          )}

          {currentUser.role === 'planner' && (
            <NavLink
              to="/planner"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200 font-semibold ${isActive ? 'ring-2 ring-purple-400' : ''}`
              }
            >
              <BarChart3 className="w-4 h-4" />
              {t('navPlanner')}
            </NavLink>
          )}
        </nav>

        {/* Global Controls & Demo Switcher */}
        <div className="flex items-center gap-2">
          {/* Mobile frame toggle for desktop presentation */}
          <button
            onClick={toggleMobileDeviceFrame}
            title="Toggle Mobile Simulator Frame"
            className={`hidden lg:flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${
              isMobileDeviceFrame
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>📱 390px View</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
          >
            <Globe2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Role Selector pill */}
          <div className="relative inline-block">
            <select
              value={currentUser.role}
              onChange={(e) => setRole(e.target.value as any)}
              className="text-xs font-semibold pl-2 pr-6 py-1 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="citizen">👤 {t('citizen')}: Priya</option>
              <option value="officer">🛡️ {t('officer')}: Mr. Rajan</option>
              <option value="planner">📊 {t('planner')}: Dr. Anita</option>
            </select>
          </div>

          {/* Floating Demo Scenarios Launcher */}
          <button
            onClick={toggleDemoDrawer}
            className="px-3 py-1 text-xs rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-sm shadow-blue-500/30 flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            <span className="hidden sm:inline">⚡ Demo Hub</span>
            <span className="sm:hidden">⚡</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export const MobileBottomBar: React.FC = () => {
  const { t, currentUser } = useAppStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 sm:hidden shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-items-center text-[10px] font-medium text-slate-500">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 ${isActive ? 'text-blue-600 font-bold' : 'hover:text-slate-800'}`
          }
        >
          <Home className="w-5 h-5" />
          <span>{t('navHome')}</span>
        </NavLink>

        <NavLink
          to="/issues"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 ${isActive ? 'text-blue-600 font-bold' : 'hover:text-slate-800'}`
          }
        >
          <MapPin className="w-5 h-5" />
          <span>{t('navMap')}</span>
        </NavLink>

        {/* Central Prominent Report FAB */}
        <NavLink
          to="/report"
          className="relative -top-4 flex flex-col items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-500/40 active:scale-95 transition-transform"
        >
          <PlusCircle className="w-7 h-7" />
        </NavLink>

        <NavLink
          to="/park"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 ${isActive ? 'text-blue-600 font-bold' : 'hover:text-slate-800'}`
          }
        >
          <Car className="w-5 h-5" />
          <span>Park/EV</span>
        </NavLink>

        {currentUser.role === 'officer' ? (
          <NavLink
            to="/officer"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 ${isActive ? 'text-amber-600 font-bold' : 'hover:text-slate-800'}`
            }
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Desk</span>
          </NavLink>
        ) : currentUser.role === 'planner' ? (
          <NavLink
            to="/planner"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 ${isActive ? 'text-purple-600 font-bold' : 'hover:text-slate-800'}`
            }
          >
            <BarChart3 className="w-5 h-5" />
            <span>Matrix</span>
          </NavLink>
        ) : (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 ${isActive ? 'text-blue-600 font-bold' : 'hover:text-slate-800'}`
            }
          >
            <User className="w-5 h-5" />
            <span>{t('navProfile')}</span>
          </NavLink>
        )}
      </div>
    </div>
  );
};
