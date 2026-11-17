import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  ThumbsUp,
  MapPin,
  CheckCircle2,
  Calendar,
  HelpCircle,
  Shield,
  Send,
  Sparkles,
  User,
  Building,
} from 'lucide-react';
import { repository } from '@/data/repository';
import { useAppStore } from '@/store/appStore';
import { computeSlaStatus, calculateCivicPriority } from '@/lib/algorithms';
import confetti from 'canvas-confetti';

export const IssueDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, currentUser, showToast } = useAppStore();

  const issue = repository.getIssueById(id || '');
  const [upvotes, setUpvotes] = useState(issue?.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(
    issue ? issue.upvotedByUserIds.includes(currentUser.id) : false
  );
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(!!issue?.citizenFeedback);

  if (!issue) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Issue Ticket Not Found</h2>
        <button onClick={() => navigate('/issues')} className="mt-4 text-blue-600 text-sm font-bold hover:underline">
          Return to Public Ledger
        </button>
      </div>
    );
  }

  const sla = computeSlaStatus(issue.createdAt, issue.slaHours);
  const priorityBreakdown = calculateCivicPriority({
    upvotes: issue.upvotes,
    severity: issue.severity,
    category: issue.category,
    ageHours: (Date.now() - new Date(issue.createdAt).getTime()) / (3600 * 1000),
    nearSchoolOrHospital: issue.location.wardId === 24 || issue.location.wardId === 37,
  });

  const handleUpvote = () => {
    const res = repository.upvoteIssue(issue.id, currentUser.id);
    if (res.success) {
      setUpvotes(res.newCount);
      setHasUpvoted(!hasUpvoted);
      if (!hasUpvoted) {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
        showToast('Upvote Registered', 'Your support increased this ticket priority score!', 'success');
      }
    }
  };

  const handleCitizenFeedback = (confirmed: boolean) => {
    repository.confirmCitizenResolution(issue.id, confirmed, confirmed ? 5 : 1);
    setFeedbackSubmitted(true);
    if (confirmed) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      showToast('Citizen Confirmed', 'Thank you! Municipal audit log updated as verified fixed.', 'success');
    } else {
      showToast('Ticket Re-opened', 'Report escalated back to Ward Officer queue for ground review.', 'warning');
    }
  };

  return (
    <div className="w-full pb-16 space-y-6">
      {/* Top back navigation */}
      <button
        onClick={() => navigate('/issues')}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Public Issues Ledger</span>
      </button>

      {/* Two Column Website Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Main Header, Description, Before/After Evidence & Feedback */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Issue Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  Ticket #{issue.id}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase text-[11px] ${
                    issue.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : issue.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : issue.status === 'assigned'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {issue.status.replace('_', ' ')}
                </span>
              </div>

              {/* SLA Badge */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                  sla.isBreached
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  {sla.isBreached
                    ? `${t('slaBreached')}: +${sla.hoursBreached}h`
                    : `${t('slaCountdown')}: ${sla.hoursRemaining}h left`}
                </span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">{issue.title}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>{issue.location.address}</span>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {issue.description}
            </p>

            {/* Upvote & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <button
                onClick={handleUpvote}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  hasUpvoted
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-white' : ''}`} />
                <span>{hasUpvoted ? t('upvotedButton') : t('upvoteButton')}</span>
                <span className="ml-1 px-2 py-0.5 rounded-md bg-black/10 text-xs">{upvotes}</span>
              </button>

              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-3.5 py-2 rounded-xl text-xs">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-slate-500 font-semibold">{t('priorityRank')}: </span>
                  <span className="font-black text-blue-700 text-sm">
                    {priorityBreakdown.score} / 100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Evidence Photos: Citizen Photo vs Resolution Proof Photo */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Physical Evidence & Verification Proof
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Citizen Reported Evidence</span>
                  <span className="text-[10px] text-slate-400">Time of Report</span>
                </div>
                <div className="h-60 rounded-2xl overflow-hidden border border-slate-200">
                  <img src={issue.photoUrl} alt="Reported defect" className="w-full h-full object-cover" />
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>{t('resolutionProof')}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Officer Work Verification</span>
                </div>
                {issue.afterPhotoUrl ? (
                  <div className="h-60 rounded-2xl overflow-hidden border-2 border-emerald-500 relative group shadow-sm">
                    <img src={issue.afterPhotoUrl} alt="Resolved proof" className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow">
                      VERIFIED FIXED
                    </div>
                  </div>
                ) : (
                  <div className="h-60 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6">
                    <Clock className="w-8 h-8 mb-2 text-slate-300" />
                    <span className="font-medium text-slate-600">Pending Crew Repair & Photo Upload</span>
                    <span className="text-[11px] text-slate-400 mt-1">Field engineers will upload completion proof photo to close ticket.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Citizen Feedback Loop Card */}
          {issue.status === 'resolved' && !feedbackSubmitted && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-200" />
                <h4 className="font-extrabold text-lg">{t('feedbackPrompt')}</h4>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Municipal Closed-Loop Governance: Issue tickets require citizen confirmation on ground before archiving. If the repair is inadequate, you can re-open it instantly.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleCitizenFeedback(true)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white text-emerald-800 font-extrabold text-xs hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer"
                >
                  {t('feedbackYes')}
                </button>
                <button
                  onClick={() => handleCitizenFeedback(false)}
                  className="py-2.5 px-5 rounded-xl bg-black/20 hover:bg-black/30 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {t('feedbackNo')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Priority Breakdown & Audit Timeline */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          {/* Priority Breakdown Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>{t('whyThisRank')}</span>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              {priorityBreakdown.explanation.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  <span className="font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit & Resolution Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{t('timelineTitle')}</span>
            </h3>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {issue.timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-slate-900 tracking-wide">
                        {event.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                    {event.officerName && (
                      <p className="text-[11px] text-blue-700 font-semibold flex items-center gap-1 pt-0.5">
                        <Shield className="w-3 h-3" /> By: {event.officerName}
                      </p>
                    )}
                    {event.notes && <p className="text-xs text-slate-600 pt-0.5">{event.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
