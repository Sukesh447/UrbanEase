import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  Car,
  Bus,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  ThumbsUp,
  Leaf,
  PlusCircle,
  CheckCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { repository } from '@/data/repository';
import { CITY_CONFIG } from '@/config/city.config';
import { computeSlaStatus } from '@/lib/algorithms';

export const HomePage: React.FC = () => {
  const { t, currentUser } = useAppStore();
  const issues = repository.getIssues().slice(0, 4);
  const parkingLots = repository.getParkingLots().slice(0, 3);
  const buses = repository.getLiveBuses().slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome & Rapid Action Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-blue-700/40">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart City Municipal Network • {CITY_CONFIG.name}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {t('welcomeGreeting')} {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">
            Report road hazards in 3 taps with duplicate detection, reserve EV parking with QR access, and view
            crowdsourced bus arrivals in real time.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <NavLink
              to="/report"
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('heroReportCta')}</span>
            </NavLink>

            <NavLink
              to="/park"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <Car className="w-4 h-4 text-emerald-300" />
              <span>{t('parkChargeNearYou')}</span>
            </NavLink>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-radial from-blue-400/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Citizen Green Impact Quick Metric Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('greenImpactRing')}</span>
            <div className="text-2xl font-black text-slate-900 leading-tight">
              {currentUser.greenScore} <span className="text-xs font-medium text-slate-400">Pts</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-slate-400 block">{t('co2SavedLabel')}</span>
            <span className="text-base font-extrabold text-emerald-600">{currentUser.co2SavedKg} kg</span>
          </div>
          <div>
            <span className="text-slate-400 block">Reports Filed</span>
            <span className="text-base font-extrabold text-blue-600">{currentUser.reportsCount}</span>
          </div>
          <NavLink to="/profile" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5">
            <span>Leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>

      {/* Nearby Civic Issues Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">{t('nearbyIssues')}</h3>
            <p className="text-xs text-slate-500">Live community complaints around Gandhipuram & RS Puram</p>
          </div>
          <NavLink to="/issues" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            <span>{t('viewAllIssues')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {issues.map((issue) => {
            const sla = computeSlaStatus(issue.createdAt, issue.slaHours);
            return (
              <NavLink
                to={`/issues/${issue.id}`}
                key={issue.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all flex gap-3.5 items-center group"
              >
                <img
                  src={issue.photoUrl}
                  alt={issue.title}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 uppercase">
                      {issue.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        issue.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sla.isBreached
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {issue.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate mt-1">
                    {issue.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{issue.location.address}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-700">👍 {issue.upvotes}</span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {sla.isBreached ? <span className="text-red-600 font-bold">Breached</span> : `${sla.hoursRemaining}h`}
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Park & Charge + Live Transit Quick Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smart Parking Glance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-4 h-4 text-blue-600" />
              {t('parkChargeNearYou')}
            </h3>
            <NavLink to="/park" className="text-xs font-bold text-blue-600 hover:underline">
              {t('seeAll')}
            </NavLink>
          </div>

          <div className="space-y-2">
            {parkingLots.map((lot) => (
              <NavLink
                to="/park"
                key={lot.id}
                className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/70 hover:bg-white flex items-center justify-between text-xs transition-all"
              >
                <div>
                  <h5 className="font-bold text-slate-900">{lot.name}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{lot.address}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-black text-emerald-600 text-sm">{lot.availableSlots} spots</span>
                  <div className="text-[10px] text-slate-400">₹{lot.pricePerHour}/hr</div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Live Bus Fleet Glance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Bus className="w-4 h-4 text-emerald-600" />
              {t('nextBusDepartures')}
            </h3>
            <NavLink to="/transit" className="text-xs font-bold text-blue-600 hover:underline">
              {t('seeAll')}
            </NavLink>
          </div>

          <div className="space-y-2">
            {buses.map((b) => (
              <NavLink
                to="/transit"
                key={b.id}
                className="p-3 rounded-xl border border-slate-100 hover:border-emerald-200 bg-slate-50/70 hover:bg-white flex items-center justify-between text-xs transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-black flex items-center justify-center text-xs">
                    {b.routeNumber}
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">{b.busRegNumber}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Next Stop in ~{b.etaNextStopMins} mins</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    b.delayMins > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {b.delayMins > 0 ? `+${b.delayMins}m Late` : t('onTime')}
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
