import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  ThumbsUp,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { repository } from '@/data/repository';
import { useAppStore } from '@/store/appStore';
import { IssueCategory, IssueStatus, CivicIssue } from '@/types/models';
import { CITY_CONFIG } from '@/config/city.config';
import { computeSlaStatus } from '@/lib/algorithms';

export const IssuesDirectoryPage: React.FC = () => {
  const { t } = useAppStore();
  const [issues, setIssues] = useState<CivicIssue[]>(repository.getIssues());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | 'all'>('all');
  const [selectedWard, setSelectedWard] = useState<number | 'all'>('all');

  const filteredIssues = issues.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesWard = selectedWard === 'all' || item.location.wardId === selectedWard;
    return matchesSearch && matchesCategory && matchesStatus && matchesWard;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Public Civic Ledger</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time municipal ticket stream across {CITY_CONFIG.name} with SLA tracking & duplicate detection.
          </p>
        </div>

        <NavLink
          to="/report"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          + {t('heroReportCta')}
        </NavLink>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keywords, street name, ward landmark..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="pothole">Potholes</option>
            <option value="garbage">Garbage</option>
            <option value="streetlight">Streetlights</option>
            <option value="water">Water Supply</option>
            <option value="drainage">Drainage</option>
            <option value="encroachment">Encroachments</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="verified">Verified</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Ward Filter */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Wards ({CITY_CONFIG.wards.length})</option>
            {CITY_CONFIG.wards.map((w) => (
              <option key={w.id} value={w.id}>
                Ward {w.id}: {w.name.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Issues Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIssues.map((issue) => {
          const sla = computeSlaStatus(issue.createdAt, issue.slaHours);
          return (
            <NavLink
              to={`/issues/${issue.id}`}
              key={issue.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-4 transition-all hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border">
                    #{issue.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      issue.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : issue.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : sla.isBreached
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {issue.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex gap-3">
                  <img
                    src={issue.photoUrl}
                    alt={issue.title}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 line-clamp-2 leading-tight">
                      {issue.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      <span>{issue.location.address}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                    {issue.upvotes}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                    <Sparkles className="w-3 h-3" />
                    P:{issue.priorityScore}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-slate-500 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>
                    {sla.isBreached ? (
                      <span className="text-red-600 font-bold">Breached</span>
                    ) : (
                      `${sla.hoursRemaining}h left`
                    )}
                  </span>
                </div>
              </div>
            </NavLink>
          );
        })}
      </div>

      {filteredIssues.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm font-bold text-slate-700">No civic hazards match your current filter criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedStatus('all');
              setSelectedWard('all');
            }}
            className="mt-2 text-xs text-blue-600 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
