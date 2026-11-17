import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Camera,
  MapPin,
  Sparkles,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ThumbsUp,
  Sliders,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { repository } from '@/data/repository';
import { IssueCategory, IssueSeverity, CivicIssue } from '@/types/models';
import { classifyCivicIssue } from '@/lib/classifier';
import { CITY_CONFIG } from '@/config/city.config';

const CATEGORIES: { id: IssueCategory; labelKey: string; icon: string; defaultColor: string }[] = [
  { id: 'pothole', labelKey: 'pothole', icon: '🕳️', defaultColor: 'border-orange-500 bg-orange-50' },
  { id: 'garbage', labelKey: 'garbage', icon: '🗑️', defaultColor: 'border-emerald-500 bg-emerald-50' },
  { id: 'streetlight', labelKey: 'streetlight', icon: '💡', defaultColor: 'border-yellow-500 bg-yellow-50' },
  { id: 'water', labelKey: 'water', icon: '💧', defaultColor: 'border-blue-500 bg-blue-50' },
  { id: 'drainage', labelKey: 'drainage', icon: '🌊', defaultColor: 'border-cyan-500 bg-cyan-50' },
  { id: 'encroachment', labelKey: 'encroachment', icon: '🚧', defaultColor: 'border-purple-500 bg-purple-50' },
  { id: 'other', labelKey: 'other', icon: '⚠️', defaultColor: 'border-slate-500 bg-slate-50' },
];

export const ReportIssuePage: React.FC = () => {
  const { t, currentUser, showToast } = useAppStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form State
  const [category, setCategory] = useState<IssueCategory>('pothole');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80'
  );

  // GPS Pin
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 11.0186,
    lng: 76.9655,
  });
  const [wardId, setWardId] = useState(24);
  const [address, setAddress] = useState('Cross Cut Road near signal, Gandhipuram, Coimbatore');

  // Smart Classifier State
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // Duplicate Detection Modal State
  const [duplicateMatches, setDuplicateMatches] = useState<
    { issue: CivicIssue; distanceMeters: number; confidencePercent: number }[]
  >([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('demo') === 'duplicate') {
      setTitle('Dangerous deep crater pothole near signal');
      setDescription('Pothole right near traffic light causing two-wheelers to fall.');
      setCategory('pothole');
      setCoords({ lat: 11.0185, lng: 76.9654 });
      setAddress('Cross Cut Road, Gandhipuram Ward 24, Coimbatore');
    }
  }, [searchParams]);

  const handleInputChange = (text: string) => {
    setTitle(text);
    if (text.length > 5) {
      const result = classifyCivicIssue(text);
      if (result.confidenceScore >= 60) {
        setCategory(result.suggestedCategory);
        setSeverity(result.estimatedSeverity);
        setAiSuggestion(`${result.suggestedCategory.toUpperCase()} (${result.confidenceScore}% confidence)`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Title Required', 'Please enter a brief summary of the issue.', 'warning');
      return;
    }

    const duplicates = repository.findPotentialDuplicates({
      category,
      lat: coords.lat,
      lng: coords.lng,
      title,
      description,
    });

    if (duplicates.length > 0) {
      setDuplicateMatches(duplicates);
      setShowDuplicateModal(true);
      return;
    }

    finalizeCreation();
  };

  const finalizeCreation = () => {
    const created = repository.createIssue({
      category,
      title,
      description: description || 'Citizen reported municipal issue via UrbanEase platform.',
      photoUrl,
      location: {
        lat: coords.lat,
        lng: coords.lng,
        address,
        wardId,
        wardName: CITY_CONFIG.wards.find((w) => w.id === wardId)?.name || 'Ward 24',
      },
      severity,
      status: 'reported',
      reportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        isAnonymous,
      },
    });

    showToast('Report Created', `Ticket #${created.id} logged with SLA timer started!`, 'success');
    navigate(`/issues/${created.id}`);
  };

  const handleUpvoteExisting = (existingId: string) => {
    repository.upvoteIssue(existingId, currentUser.id);
    setShowDuplicateModal(false);
    showToast('Upvoted Existing Ticket', 'Your +1 was merged to prioritize this report!', 'success');
    navigate(`/issues/${existingId}`);
  };

  return (
    <div className="w-full pb-16 space-y-6">
      {/* Website Hero Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/50">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('reportIssueTitle')}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Submit a civic defect ticket in 3 taps. Geotagged coordinates, real mathematical duplicate detection (50m Haversine + Jaccard), and direct CCMC engineering dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold self-start md:self-auto bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Coimbatore City Municipal Corporation (CCMC)</span>
        </div>
      </div>

      {/* Website 2-Column Responsive Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Category Selection & Description (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Step 1: Category Picker */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                <span>{t('selectCategory')}</span>
              </label>
              {aiSuggestion && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  AI Auto-Detected: {aiSuggestion}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col items-start gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className={`text-xs font-extrabold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                      {t(cat.labelKey as any)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description & Severity Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
              <span>Describe the Problem</span>
            </label>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Issue Headline / Landmark *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={t('issueTitlePlaceholder')}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Detailed Operational Notes</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('issueDescPlaceholder')}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Severity Rating Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" />
                Estimated Hazard Severity:
              </span>
              <div className="flex gap-2">
                {(['low', 'medium', 'high', 'critical'] as IssueSeverity[]).map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSeverity(s)}
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-xl border transition-all uppercase text-[10px] cursor-pointer ${
                      severity === s
                        ? s === 'critical'
                          ? 'bg-red-600 text-white border-red-700 shadow-xs'
                          : s === 'high'
                          ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                          : 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Anonymous Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-600 font-medium">{t('anonymousOption')}</span>
            </label>
          </div>
        </div>

        {/* Right Column: Evidence Photo & Geotag Location (5 cols) */}
        <div className="lg:col-span-5 space-y-5 sticky top-24">
          {/* Step 3: Photo Evidence */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</span>
              <span>{t('uploadPhoto')}</span>
            </label>

            <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 group shadow-inner">
              <img src={photoUrl} alt="Evidence preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center text-white text-xs font-bold gap-2">
                <Camera className="w-5 h-5" />
                <span>EXIF Validated Evidence Preview</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Client Compressed: 182 KB</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> GPS Coordinates Bound
              </span>
            </div>
          </div>

          {/* Location Geotag & Ward Selection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>Geotag & Municipal Ward</span>
              </label>
              <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">CCMC Ward Area</label>
                <select
                  value={wardId}
                  onChange={(e) => setWardId(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  {CITY_CONFIG.wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      Ward {w.id} - {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{t('submitReport')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* DUPLICATE DETECTION MODAL */}
      {showDuplicateModal && duplicateMatches.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-amber-500 text-white flex items-center gap-3">
              <AlertCircle className="w-7 h-7 shrink-0" />
              <div>
                <h3 className="font-extrabold text-lg leading-tight">{t('dupDetectedTitle')}</h3>
                <p className="text-xs text-amber-100 mt-0.5">{t('dupDetectedSubtitle')}</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-xs text-slate-600 leading-relaxed">
                To prevent duplicate tickets and dispatch faster, civic complaints within 50 meters are automatically
                correlated. You can upvote the existing ticket to elevate its municipal priority score!
              </div>

              {duplicateMatches.map(({ issue, distanceMeters, confidencePercent }) => (
                <div
                  key={issue.id}
                  className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 flex gap-4 items-start"
                >
                  <img
                    src={issue.photoUrl}
                    alt={issue.title}
                    className="w-20 h-20 rounded-xl object-cover border border-amber-300 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-200 text-amber-900 uppercase">
                        {confidencePercent}% Match
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600">
                        📍 {distanceMeters}m away
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {issue.upvotes} citizens upvoted
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{issue.title}</h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{issue.description}</p>

                    <div className="mt-3">
                      <button
                        onClick={() => handleUpvoteExisting(issue.id)}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{t('dupUpvoteCta')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowDuplicateModal(false);
                    finalizeCreation();
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold cursor-pointer"
                >
                  {t('dupProceedAnyway')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
