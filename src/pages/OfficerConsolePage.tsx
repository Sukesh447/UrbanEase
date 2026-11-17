import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertOctagon,
  Users,
  Search,
  Filter,
  Download,
  Camera,
  ArrowUpRight,
  Send,
  Eye,
} from 'lucide-react';
import { repository } from '@/data/repository';
import { useAppStore } from '@/store/appStore';
import { CivicIssue, IssueStatus } from '@/types/models';
import { computeSlaStatus } from '@/lib/algorithms';
import { CITY_CONFIG } from '@/config/city.config';

export const OfficerConsolePage: React.FC = () => {
  const { t, showToast } = useAppStore();
  const [issues, setIssues] = useState<CivicIssue[]>(repository.getIssues());
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(issues[0] || null);

  // Resolution modal
  const [resolveProofUrl, setResolveProofUrl] = useState(
    'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80'
  );
  const [resolveNotes, setResolveNotes] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);

  // Filters
  const [filterWard, setFilterWard] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('actionable');

  // Computed KPIs
  const totalOpen = issues.filter((i) => i.status !== 'resolved').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;
  const slaBreachedCount = issues.filter((i) => {
    const sla = computeSlaStatus(i.createdAt, i.slaHours);
    return sla.isBreached && i.status !== 'resolved';
  }).length;

  const handleUpdateStatus = (issueId: string, nextStatus: IssueStatus) => {
    const updated = repository.updateIssueStatus(
      issueId,
      nextStatus,
      'Mr. Rajan Natarajan',
      `Status updated by Officer to ${nextStatus}`
    );
    if (updated) {
      setIssues(repository.getIssues());
      setSelectedIssue(updated);
      showToast('Status Updated', `Ticket #${updated.id} moved to ${nextStatus}`, 'success');
    }
  };

  const handleConfirmResolution = () => {
    if (!selectedIssue) return;
    const updated = repository.updateIssueStatus(
      selectedIssue.id,
      'resolved',
      'Mr. Rajan Natarajan',
      resolveNotes || 'Physical maintenance verified and repaired on site.',
      resolveProofUrl
    );
    if (updated) {
      setIssues(repository.getIssues());
      setSelectedIssue(updated);
      setShowResolveModal(false);
      showToast('Resolved with Proof', `Ticket #${updated.id} marked as Resolved!`, 'success');
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Category,Title,Ward,Priority,Status,Created,SLA_Hours']
        .concat(
          issues.map(
            (i) =>
              `"${i.id}","${i.category}","${i.title.replace(/"/g, '""')}","${i.location.wardName}","${
                i.priorityScore
              }","${i.status}","${i.createdAt}","${i.slaHours}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UrbanEase_CCMC_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Downloaded', 'Audit ledger exported successfully.', 'info');
  };

  const displayedIssues = issues
    .filter((i) => {
      if (filterWard !== 'all' && i.location.wardId !== filterWard) return false;
      if (filterStatus === 'actionable') return i.status !== 'resolved';
      if (filterStatus === 'breached') {
        const sla = computeSlaStatus(i.createdAt, i.slaHours);
        return sla.isBreached && i.status !== 'resolved';
      }
      return true;
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="space-y-6 pb-12">
      {/* Officer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ward Officer Operations Desk</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            CCMC Central Division • Logged in as Mr. Rajan Natarajan (Executive Warden)
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>{t('exportCsv')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>{t('kpiOpenTickets')}</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalOpen}</div>
          <p className="text-[11px] text-slate-500 mt-1">Pending physical dispatch</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>{t('kpiResolvedWeek')}</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">{resolvedCount}</div>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">94.2% citizen verified</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>{t('kpiAvgResolution')}</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">18.4 hrs</div>
          <p className="text-[11px] text-slate-500 mt-1">Well within 36h norm</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-red-600 text-xs font-bold uppercase">
            <span>{t('kpiSlaBreaches')}</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600 mt-2">{slaBreachedCount}</div>
          <p className="text-[11px] text-red-500 mt-1 font-medium">Auto-escalated to Zonal Chief</p>
        </div>
      </div>

      {/* Split Triage View: Table on Left, Details & Dispatch on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Triage Queue Table (8 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Prioritized Triage Queue ({displayedIssues.length})
            </h3>

            {/* Quick Filters */}
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
              >
                <option value="actionable">Actionable Only</option>
                <option value="breached">SLA Breached Only</option>
                <option value="all">All Statuses</option>
              </select>

              <select
                value={filterWard}
                onChange={(e) => setFilterWard(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
              >
                <option value="all">All Wards</option>
                {CITY_CONFIG.wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    Ward {w.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {displayedIssues.map((item) => {
              const sla = computeSlaStatus(item.createdAt, item.slaHours);
              const isSelected = selectedIssue?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedIssue(item)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        P:{item.priorityScore}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600">Ward {item.location.wardId}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          item.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sla.isBreached
                            ? 'bg-red-100 text-red-800 font-black'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{item.location.address}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-bold text-slate-700">
                      👍 {item.upvotes}
                    </div>
                    <div
                      className={`text-[10px] font-semibold ${
                        sla.isBreached ? 'text-red-600 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {sla.isBreached ? `+${sla.hoursBreached}h` : `${sla.hoursRemaining}h`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Issue Action Console (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 sticky top-20">
          {selectedIssue ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-500">#{selectedIssue.id}</span>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{selectedIssue.title}</h3>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Rank P:{selectedIssue.priorityScore}
                </span>
              </div>

              {/* Photos */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Citizen Photo</span>
                  <div className="h-28 rounded-lg overflow-hidden border">
                    <img src={selectedIssue.photoUrl} alt="Report" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Resolution Proof</span>
                  {selectedIssue.afterPhotoUrl ? (
                    <div className="h-28 rounded-lg overflow-hidden border border-emerald-400">
                      <img src={selectedIssue.afterPhotoUrl} alt="After" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-28 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 text-center p-2">
                      No after photo uploaded yet
                    </div>
                  )}
                </div>
              </div>

              {/* Status Stepper Actions */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Workflow Dispatch Transitions
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedIssue.id, 'verified')}
                    className="py-2 px-3 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    1. Mark Verified
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedIssue.id, 'assigned')}
                    className="py-2 px-3 text-xs font-bold rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 transition-colors"
                  >
                    2. Dispatch Crew
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedIssue.id, 'in_progress')}
                    className="py-2 px-3 text-xs font-bold rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 transition-colors"
                  >
                    3. In Progress
                  </button>
                  <button
                    onClick={() => setShowResolveModal(true)}
                    className="py-2 px-3 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                  >
                    4. Resolve with Proof
                  </button>
                </div>
              </div>

              {/* Ward Officer Notes */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-700">Designated Department:</div>
                <div className="text-slate-600">
                  {selectedIssue.assignedOfficer?.department || 'CCMC Roads & Public Works Wing'}
                </div>
                <div className="text-slate-500 text-[11px] pt-1">
                  Responsible Officer: {selectedIssue.assignedOfficer?.name || 'Mr. Rajan Natarajan'}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">Select an issue from queue to inspect</div>
          )}
        </div>
      </div>

      {/* RESOLUTION PROOF MODAL */}
      {showResolveModal && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-black text-base text-slate-900">Upload Resolution Proof & Close SLA</h3>
            <p className="text-xs text-slate-600">
              Government guidelines mandate physical before/after photo verification before closing citizen tickets.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">After Resolution Photo URL</label>
                <input
                  type="text"
                  value={resolveProofUrl}
                  onChange={(e) => setResolveProofUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="h-32 rounded-xl overflow-hidden border">
                <img src={resolveProofUrl} alt="Proof preview" className="w-full h-full object-cover" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Field Engineer Work Notes</label>
                <textarea
                  rows={2}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="E.g., Bitumen laid and leveled; lamp luminaire replaced."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolution}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
              >
                Confirm & Notify Citizen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
