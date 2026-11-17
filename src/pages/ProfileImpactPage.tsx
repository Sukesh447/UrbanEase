import React from 'react';
import {
  Leaf,
  Award,
  TrendingUp,
  ShieldCheck,
  Zap,
  Bus,
  ThumbsUp,
  Sparkles,
  User,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { repository } from '@/data/repository';
import { useAppStore } from '@/store/appStore';

export const ProfileImpactPage: React.FC = () => {
  const { t, currentUser } = useAppStore();
  const allUsers = repository.getUsers().sort((a, b) => b.greenScore - a.greenScore);

  return (
    <div className="w-full pb-16 space-y-6">
      {/* Website Full Width Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-blue-500/20 shrink-0">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{currentUser.name}</h1>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 uppercase">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              {currentUser.department || 'Verified Resident • Coimbatore Smart City Citizen Ledger'}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Active Citizen Account #CCMC-CBE-2026</span>
            </div>
          </div>
        </div>

        {/* Green Score Showcase */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-6 rounded-3xl shadow-md text-center min-w-[220px]">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block">Total Green Score</span>
          <div className="text-4xl font-black mt-1">{currentUser.greenScore}</div>
          <span className="text-[11px] text-emerald-200 mt-1 block">Top 5% in Coimbatore</span>
        </div>
      </div>

      {/* Website Grid: 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-1.5">
          <Leaf className="w-6 h-6 text-emerald-600 mx-auto" />
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{currentUser.co2SavedKg} kg</div>
          <span className="text-xs text-slate-500 font-medium">CO₂ Avoided by Transit/EV</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-1.5">
          <ShieldCheck className="w-6 h-6 text-blue-600 mx-auto" />
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{currentUser.reportsCount}</div>
          <span className="text-xs text-slate-500 font-medium">Verified Reports Filed</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-1.5">
          <ThumbsUp className="w-6 h-6 text-purple-600 mx-auto" />
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{currentUser.upvotesGiven}</div>
          <span className="text-xs text-slate-500 font-medium">Community Upvotes Given</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-1.5">
          <Award className="w-6 h-6 text-amber-500 mx-auto" />
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{currentUser.badges.length}</div>
          <span className="text-xs text-slate-500 font-medium">Earned Civic Badges</span>
        </div>
      </div>

      {/* Two Column Website Grid: Badges on Left, Leaderboard on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Badges (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Civic Badges & Streaks</span>
          </h3>

          <div className="space-y-3">
            {currentUser.badges.map((b, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-amber-950 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-200/80 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-900">{b}</h5>
                  <p className="text-[10px] text-slate-500">Earned for municipal engagement and rapid reporting</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Community Accountability Leaderboard (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              City Accountability Leaderboard
            </h3>
            <span className="text-xs text-slate-400 font-medium">Updated live per verified action</span>
          </div>

          <div className="divide-y divide-slate-100">
            {allUsers.map((user, idx) => {
              const isMe = user.id === currentUser.id;
              return (
                <div
                  key={user.id}
                  className={`py-3.5 px-3 flex items-center justify-between text-xs transition-colors rounded-2xl ${
                    isMe ? 'bg-blue-50/70 border border-blue-200/60 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-800'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <div>
                      <h5 className="font-extrabold text-sm text-slate-900">
                        {user.name} {isMe && <span className="text-xs text-blue-600 font-bold">(You)</span>}
                      </h5>
                      <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-sm text-emerald-600">{user.greenScore} Pts</span>
                    <div className="text-[11px] text-slate-400 font-normal">{user.co2SavedKg} kg CO₂</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
