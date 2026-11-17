import React, { useState } from 'react';
import {
  Bus,
  Clock,
  Users,
  AlertTriangle,
  MapPin,
  Bell,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Send,
  Navigation,
} from 'lucide-react';
import { repository } from '@/data/repository';
import { useAppStore } from '@/store/appStore';
import { BusRoute, LiveBus } from '@/types/models';

export const BusTransitPage: React.FC = () => {
  const { t, showToast } = useAppStore();
  const routes = repository.getBusRoutes();
  const [buses, setBuses] = useState<LiveBus[]>(repository.getLiveBuses());
  const [selectedRoute, setSelectedRoute] = useState<BusRoute>(routes[0]);
  const [isContributingLocation, setIsContributingLocation] = useState(false);
  const [delayReportBus, setDelayReportBus] = useState<LiveBus | null>(null);

  const activeBusesOnRoute = buses.filter((b) => b.routeId === selectedRoute.id);

  const handleToggleShareLocation = () => {
    setIsContributingLocation(!isContributingLocation);
    if (!isContributingLocation) {
      showToast('Crowdsourcing Active', 'Your anonymized telemetry is updating bus ETA for fellow citizens!', 'success');
    } else {
      showToast('Sharing Paused', 'Opt-in location broadcast stopped.', 'info');
    }
  };

  const handleReportDelay = (busId: string, additionalMins: number) => {
    const updated = repository.updateBusDelay(busId, additionalMins, 'packed');
    if (updated) {
      setBuses(repository.getLiveBuses());
      setDelayReportBus(null);
      showToast('Crowdsource Logged', `Delay report applied to bus ${updated.busRegNumber}. Thank you!`, 'success');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('busTrackerTitle')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time Coimbatore public transit telemetry powered by commuter crowdsourcing & schedule comparison.
          </p>
        </div>

        {/* Crowdsourcing Telemetry Opt-in button */}
        <button
          onClick={handleToggleShareLocation}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            isContributingLocation
              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Navigation className={`w-4 h-4 ${isContributingLocation ? 'animate-pulse' : ''}`} />
          <span>{isContributingLocation ? 'Broadcasting Trip GPS' : t('imOnThisBus')}</span>
        </button>
      </div>

      {/* Route Selector Badges */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {routes.map((r) => {
          const isSelected = selectedRoute.id === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedRoute(r)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold shrink-0 transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              Route {r.routeNumber}
            </button>
          );
        })}
      </div>

      {/* Main Route Details & Live Bus Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Live Vehicles & Stops (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Active Corridor</span>
                <h3 className="font-extrabold text-base text-slate-900">{selectedRoute.routeName}</h3>
              </div>
              <span className="text-xs font-bold text-slate-500">Every {selectedRoute.frequencyMins} mins</span>
            </div>

            {/* Live Buses On Corridor */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase text-slate-400 block">
                Tracked Vehicles ({activeBusesOnRoute.length})
              </span>

              {activeBusesOnRoute.map((bus) => (
                <div
                  key={bus.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                        <Bus className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">{bus.busRegNumber}</h4>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                              bus.delayMins > 4
                                ? 'bg-red-100 text-red-800'
                                : bus.delayMins > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {bus.delayMins > 0 ? `+${bus.delayMins}m Late` : t('onTime')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Speed: {bus.speedKmH} {t('speed')} • Next Stop in ~{bus.etaNextStopMins} mins
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setDelayReportBus(bus)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 shrink-0"
                    >
                      Report Delay
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Crowd:{' '}
                        <strong className="text-slate-800">
                          {bus.crowdLevel === 'low'
                            ? t('crowdLow')
                            : bus.crowdLevel === 'moderate'
                            ? t('crowdModerate')
                            : t('crowdPacked')}
                        </strong>
                      </span>
                    </div>

                    <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{bus.crowdConfidenceContributors} Commuters Contributing GPS</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Route Stops Stepper (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
            Route Stops & Timetable Sequence
          </h3>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {selectedRoute.stops.map((stop, idx) => (
              <div key={stop.id} className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-600 ring-2 ring-blue-100" />
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{stop.name}</h5>
                    <p className="text-[10px] text-slate-400 font-medium">{stop.nameTamil}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Stop #{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DELAY REPORT MODAL */}
      {delayReportBus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Crowdsourced Transit Report
              </span>
              <h3 className="font-black text-base text-slate-900 mt-2">
                Report Delay: Bus {delayReportBus.busRegNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Help fellow commuters know actual traffic congestion delays along Route {selectedRoute.routeNumber}.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleReportDelay(delayReportBus.id, 5)}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 text-xs font-bold text-slate-800 text-center"
              >
                +5 Mins Late
              </button>
              <button
                onClick={() => handleReportDelay(delayReportBus.id, 10)}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 text-xs font-bold text-slate-800 text-center"
              >
                +10 Mins Late
              </button>
              <button
                onClick={() => handleReportDelay(delayReportBus.id, 20)}
                className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 text-center"
              >
                Heavy Jam (+20m)
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDelayReportBus(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
