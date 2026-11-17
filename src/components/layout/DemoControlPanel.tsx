import React, { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { repository } from '@/data/repository';
import {
  X,
  Play,
  RotateCcw,
  AlertTriangle,
  Car,
  Bus,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { runAllAlgorithmsVerification } from '@/lib/testVerification';

export const DemoControlPanel: React.FC = () => {
  const { isDemoDrawerOpen, toggleDemoDrawer, showToast, setRole } = useAppStore();
  const [testOutput, setTestOutput] = useState<{ total: number; passed: number; results: string[] } | null>(null);

  if (!isDemoDrawerOpen) return null;

  // Scenario 1: Spawn duplicate issue nearby
  const handleSpawnDuplicate = () => {
    // We populate session storage or fill out the report form with a duplicate near Gandhipuram
    window.location.href = '/report?demo=duplicate';
    toggleDemoDrawer();
    showToast('Demo Triggered', 'Navigated to Report with duplicate parameters pre-filled!', 'warning');
  };

  // Scenario 2: Simulate bus delay
  const handleBusDelay = () => {
    const updated = repository.updateBusDelay('bus-tn38-n-3140', 8, 'packed');
    if (updated) {
      showToast('Live Fleet Event', `Bus ${updated.busRegNumber} (Route 70) reported +8m delay!`, 'warning');
    }
  };

  // Scenario 3: Parking lot fills up
  const handleFillParking = () => {
    const lots = repository.getParkingLots();
    if (lots.length > 0) {
      lots[0].availableSlots = 2; // critically low
      showToast('Smart Parking Alert', `${lots[0].name} capacity reached 98%! Only 2 spots left.`, 'warning');
    }
  };

  // Scenario 4: Fast charger faults
  const handleFaultCharger = () => {
    const evStations = repository.getEVStations();
    if (evStations.length > 0 && evStations[0].connectors.length > 0) {
      evStations[0].connectors[0].status = 'offline';
      showToast('EV Network Event', `Gun #1 (${evStations[0].connectors[0].type}) at ${evStations[0].name} marked Offline`, 'warning');
    }
  };

  // Scenario 5: Resolve an issue with before/after proof
  const handleResolveIssue = () => {
    const issue = repository.updateIssueStatus(
      'issue-101',
      'resolved',
      'Mr. Rajan Natarajan',
      'Pothole cold-mix asphalt patch laid & compacted with vibrating roller.',
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80'
    );
    if (issue) {
      showToast('Resolution Recorded', `Issue #${issue.id} marked RESOLVED with photo evidence!`, 'success');
    }
  };

  // Scenario 6: Run algorithmic unit tests
  const handleRunAlgorithmTests = () => {
    const res = runAllAlgorithmsVerification();
    setTestOutput(res);
    showToast('Algorithms Tested', `${res.passed}/${res.total} algorithmic assertions PASSED!`, 'success');
  };

  // Reset to seed
  const handleResetData = () => {
    repository.resetAllToSeed();
    showToast('Repository Reset', 'Local data restored to pristine seed state.', 'info');
    setTimeout(() => window.location.reload(), 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 overflow-y-auto">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-extrabold text-base">Judges Demo Console</h2>
              <p className="text-xs text-slate-300">Instant 3-minute pitch scenario triggers</p>
            </div>
          </div>
          <button
            onClick={toggleDemoDrawer}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 flex-1 text-slate-800">
          {/* Quick Role Switcher */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Instant Persona Switcher
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setRole('citizen');
                  showToast('Role Switched', 'Acting as Citizen Priya (Commuter)', 'info');
                }}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-xs font-bold text-blue-900 text-center transition-all"
              >
                👤 Citizen<br /><span className="text-[10px] font-normal text-slate-600">Priya (Commuter)</span>
              </button>
              <button
                onClick={() => {
                  setRole('officer');
                  showToast('Role Switched', 'Acting as Ward Officer Rajan', 'info');
                }}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-xs font-bold text-amber-900 text-center transition-all"
              >
                🛡️ Officer<br /><span className="text-[10px] font-normal text-slate-600">Mr. Rajan (CCMC)</span>
              </button>
              <button
                onClick={() => {
                  setRole('planner');
                  showToast('Role Switched', 'Acting as City Planner Anita', 'info');
                }}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-xs font-bold text-purple-900 text-center transition-all"
              >
                📊 Planner<br /><span className="text-[10px] font-normal text-slate-600">Dr. Anita (Mobility)</span>
              </button>
            </div>
          </div>

          {/* Scenarios */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              One-Click Pitch Scenarios
            </label>
            <div className="space-y-2">
              <button
                onClick={handleSpawnDuplicate}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">1. Trigger Duplicate Pothole Report</h4>
                    <p className="text-[11px] text-slate-500">Auto-fills report at Gandhipuram signal (tests 50m Haversine + Jaccard)</p>
                  </div>
                </div>
                <Play className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
              </button>

              <button
                onClick={handleResolveIssue}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/60 hover:border-emerald-300 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">2. Officer Resolves Ticket #101</h4>
                    <p className="text-[11px] text-slate-500">Appends before/after asphalt photo and notifies citizen</p>
                  </div>
                </div>
                <Play className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
              </button>

              <button
                onClick={handleBusDelay}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50/60 hover:border-amber-300 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Bus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700">3. Bus Crowdsource Delay Surge</h4>
                    <p className="text-[11px] text-slate-500">Simulates commuters reporting +8m delay on Route 70</p>
                  </div>
                </div>
                <Play className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
              </button>

              <button
                onClick={handleFillParking}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">4. Parking Lot Saturation</h4>
                    <p className="text-[11px] text-slate-500">Drops Gandhipuram slots to 2 to trigger scarcity alerts</p>
                  </div>
                </div>
                <Play className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
              </button>
            </div>
          </div>

          {/* Unit Test & Algorithmic Proof */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                Algorithmic Integrity Suite
              </span>
              <button
                onClick={handleRunAlgorithmTests}
                className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Run Verification
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Directly executes in-memory unit tests for Haversine math, Jaccard tokenization, SLA breach counters, and QR hash checks.
            </p>

            {testOutput && (
              <div className="mt-2 p-2.5 bg-slate-900 text-emerald-400 rounded-lg text-[10px] font-mono space-y-1 max-h-40 overflow-y-auto">
                <div className="text-white font-bold pb-1 border-b border-slate-700">
                  Passed {testOutput.passed} / {testOutput.total} assertions
                </div>
                {testOutput.results.map((r, i) => (
                  <div key={i}>{r}</div>
                ))}
              </div>
            )}
          </div>

          {/* Reset button */}
          <div className="pt-2">
            <button
              onClick={handleResetData}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Seed & LocalStorage Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
