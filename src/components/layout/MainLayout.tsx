import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, MobileBottomBar } from '@/components/layout/Navbar';
import { DemoControlPanel } from '@/components/layout/DemoControlPanel';
import { useAppStore } from '@/store/appStore';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { isMobileDeviceFrame, toastMessage, clearToast } = useAppStore();

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Bar (Full Desktop Website Width) */}
      <Navbar />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-14 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
          <div
            className={`p-3.5 rounded-xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-white border-emerald-600'
                : toastMessage.type === 'warning'
                ? 'bg-amber-950/90 text-white border-amber-600'
                : 'bg-slate-900/90 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toastMessage.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toastMessage.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              <h5 className="font-bold text-sm leading-tight">{toastMessage.title}</h5>
              <p className="mt-0.5 text-slate-200">{toastMessage.desc}</p>
            </div>

            <button onClick={clearToast} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area - Full Website Canvas */}
      <main className="flex-1 pb-16 sm:pb-8 flex justify-center">
        {isMobileDeviceFrame ? (
          <div className="py-6 w-full flex justify-center items-start">
            <div className="w-[390px] min-h-[780px] bg-white rounded-[40px] shadow-2xl border-[10px] border-slate-900 overflow-hidden relative flex flex-col">
              {/* iPhone style speaker notch indicator */}
              <div className="w-full h-6 bg-slate-900 flex items-center justify-center">
                <div className="w-20 h-3.5 bg-black rounded-b-xl" />
              </div>
              <div className="flex-1 overflow-y-auto pb-14">
                <Outlet />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        )}
      </main>

      {/* Mobile Bottom Bar for touch phones only */}
      <MobileBottomBar />

      {/* Interactive Demo Controller Drawer */}
      <DemoControlPanel />
    </div>
  );
};
