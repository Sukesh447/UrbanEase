import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { repository } from '@/data/repository';
import { useAppStore } from '@/store/appStore';
import { CITY_CONFIG } from '@/config/city.config';

const CATEGORY_COLORS: Record<string, string> = {
  pothole: '#f97316',
  garbage: '#10b981',
  streetlight: '#eab308',
  water: '#3b82f6',
  drainage: '#06b6d4',
  encroachment: '#8b5cf6',
};

export const PlannerAnalyticsPage: React.FC = () => {
  const { t } = useAppStore();
  const issues = repository.getIssues();
  const parkingLots = repository.getParkingLots();
  const evStations = repository.getEVStations();
  const buses = repository.getLiveBuses();

  // 1. Category Distribution
  const categoryCountMap: Record<string, number> = {};
  issues.forEach((i) => {
    categoryCountMap[i.category] = (categoryCountMap[i.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCountMap).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count,
    color: CATEGORY_COLORS[name] || '#94a3b8',
  }));

  // 2. Ward Stress Index
  const wardCountMap: Record<number, { count: number; breached: number; name: string }> = {};
  CITY_CONFIG.wards.forEach((w) => {
    wardCountMap[w.id] = { count: 0, breached: 0, name: w.name.split(' ')[0] };
  });
  issues.forEach((i) => {
    if (wardCountMap[i.location.wardId]) {
      wardCountMap[i.location.wardId].count += 1;
    }
  });
  const wardStressData = Object.entries(wardCountMap).map(([id, d]) => ({
    ward: `W-${id} ${d.name}`,
    reports: d.count,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
            <BarChart3 className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            City Planner Intelligence Matrix
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Data-driven resource allocation, infrastructure stress zones & recurring problem clusters.
        </p>
      </div>

      {/* Resource Allocation Recommendation Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-3 border border-indigo-700/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            AI Resource Optimization Insight
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 rounded">COIMBATORE CORP</span>
        </div>

        <h3 className="text-base sm:text-lg font-black leading-tight text-white">
          Hotspot Recommendation: Consolidated asphalt dispatch at Cross Cut / Gandhipuram Ward 24
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {t('clusterSuggestion')} 7 reported road surface defects detected within a 350-meter radius. Combining these
          into one bulk asphalt contractor work-order will save an estimated ₹42,000 in heavy machinery mobilization.
        </p>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ward Stress Comparison */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Ward Infrastructure Stress Ledger
            </h3>
            <span className="text-xs text-slate-400">Total {issues.length} Tickets</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardStressData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="ward" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="reports" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Issue Category Proportions
            </h3>
            <span className="text-xs text-slate-400">Roads & Water Predominant</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2 text-xs">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span>
                  {c.name}: {c.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sustainable Mobility Aggregates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Parking Deck Utilization</span>
          <div className="text-2xl font-black text-slate-900">
            {Math.round(
              ((parkingLots.reduce((a, b) => a + (b.totalSlots - b.availableSlots), 0) /
                parkingLots.reduce((a, b) => a + b.totalSlots, 0)) *
                100)
            )}
            %
          </div>
          <p className="text-[11px] text-slate-500">Live aggregate across all 12 monitored facilities</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">EV Network Availability</span>
          <div className="text-2xl font-black text-emerald-600">
            {evStations.reduce((a, b) => a + b.connectors.filter((c) => c.status === 'available').length, 0)} /{' '}
            {evStations.reduce((a, b) => a + b.connectors.length, 0)} Guns
          </div>
          <p className="text-[11px] text-emerald-700">Online & charging ready in Coimbatore</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Bus Fleet Average Delay</span>
          <div className="text-2xl font-black text-amber-600">
            +{(buses.reduce((a, b) => a + b.delayMins, 0) / buses.length).toFixed(1)} mins
          </div>
          <p className="text-[11px] text-slate-500">Crowdsourced commuter telemetry</p>
        </div>
      </div>
    </div>
  );
};
