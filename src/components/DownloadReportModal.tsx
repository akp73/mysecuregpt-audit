import React, { useState } from 'react';
import {
  X,
  FileDown,
  User,
  Building2,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Loader2,
  FileText,
} from 'lucide-react';
import { AuditReport } from '../types/audit';
import { generatePdfReport, UserLeadInfo } from '../utils/generatePdfReport';
import { TeamLogicBrandBar } from './TeamLogicLogo';

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AuditReport;
}

export const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedCompany = companyName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!trimmedCompany) {
      setFormError('Please enter your company name.');
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError('Please enter a valid company email address.');
      return;
    }

    setIsGenerating(true);

    const leadInfo: UserLeadInfo = {
      name: trimmedName,
      companyName: trimmedCompany,
      email: trimmedEmail,
    };

    // 1. Dispatch lead notification to server (which emails apatel@teamlogicit.com and logs lead)
    const payload = {
      name: trimmedName,
      companyName: trimmedCompany,
      email: trimmedEmail,
      domain: report.domain,
      targetUrl: report.targetUrl,
      compositeScore: report.composite?.compositeScore,
      grade: report.composite?.grade,
      levelTitle: report.composite?.dialBreakdown?.levelTitle,
      crawlability: report.composite?.dimensionScores?.crawlability,
      structuredSchema: report.composite?.dimensionScores?.structuredSchema,
      actionability: report.composite?.dimensionScores?.actionability,
      industry: report.industry,
    };

    fetch('/api/report-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.warn('Could not post lead to /api/report-lead:', err);
    });

    // 2. Client-side parallel fallback to FormSubmit directed to apatel@teamlogicit.com
    try {
      fetch('https://formsubmit.co/ajax/apatel@teamlogicit.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _subject: `New Lead: Agent Readiness Audit - ${trimmedName} (${trimmedCompany})`,
          "Lead Name": trimmedName,
          "Company": trimmedCompany,
          "Email Address": trimmedEmail,
          "Audited Domain": report.domain,
          "Composite Score": `${report.composite?.compositeScore ?? 'N/A'}/100`,
          "Tier": report.composite?.dialBreakdown?.levelTitle ?? 'Agent Ready Benchmark',
          "Date": new Date().toLocaleString(),
          _template: 'box',
        }),
      }).catch(() => {
        // Ignored; server API already handles primary email dispatch
      });
    } catch {
      // Ignore client fetch errors
    }

    // 3. Generate and trigger download of 3-page PDF report
    setTimeout(() => {
      try {
        generatePdfReport(report, leadInfo);
        setIsGenerating(false);
        setDownloadSuccess(true);
      } catch (err: any) {
        console.error('PDF generation error:', err);
        setIsGenerating(false);
        setFormError('Failed to generate PDF. Please try again.');
      }
    }, 500);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Brand bar on top */}
        <TeamLogicBrandBar className="h-1.5" />

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-[#008752] border border-emerald-200/80 shrink-0">
              <FileDown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#008752]">
                  Instant PDF Download
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                  3-Page Report
                </span>
              </div>
              <h3 id="modal-headline" className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Download Detailed Report & What to Fix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customized technical audit and remediation guide for <strong className="text-slate-800 font-mono">{report.domain}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {downloadSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-[#008752] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Your 3-Page Report Has Downloaded!</h4>
                <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                  Check your downloads folder for <strong className="text-slate-900 font-mono">{report.domain}-AI-Agent-Readiness-Audit-Report.pdf</strong>.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#008752] text-xs font-medium mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lead details received & notified to TeamLogic IT (apatel@teamlogicit.com)</span>
                </div>
              </div>

              {/* Summary of what was downloaded */}
              <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#008752]" />
                  What's included in your download:
                </div>
                <div className="text-slate-600 pl-5 space-y-1">
                  <div>• <strong>Page 1:</strong> Composite Score, Level {report.composite.dialBreakdown?.level ?? 4} Verdict & 7-Tool Calibration</div>
                  <div>• <strong>Page 2:</strong> 5 Audited Dimensions & Autonomous Agent Failure Analysis</div>
                  <div>• <strong>Page 3:</strong> Actionable Quick Fixes (Robots.txt, /llms.txt & Schema.org JSON-LD)</div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setDownloadSuccess(false);
                    // trigger re-download
                    generatePdfReport(report, { name, companyName, email });
                  }}
                  className="px-4 py-2 text-xs font-bold text-[#008752] hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                >
                  Download Again
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#008752] hover:bg-[#007043] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form inputs */}
              <div className="space-y-3.5">
                {/* 1. Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      placeholder="e.g. Bruce Wayne"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#008752] focus:ring-1 focus:ring-[#008752] transition-colors"
                    />
                  </div>
                </div>

                {/* 2. Company Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      placeholder="e.g. Wayne Enterprises"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#008752] focus:ring-1 focus:ring-[#008752] transition-colors"
                    />
                  </div>
                </div>

                {/* 3. Company Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Company Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      placeholder="e.g. batsignal@wayne.com"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#008752] focus:ring-1 focus:ring-[#008752] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* What will be generated info box */}
              <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <FileText className="w-4 h-4 text-[#008752]" />
                  <span>3-Page Executive PDF Report Contents:</span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-600 pl-5">
                  <div>• <strong>Page 1:</strong> Composite Score, Overall Verdict & 7-Tool Benchmark Verification</div>
                  <div>• <strong>Page 2:</strong> 5 Dimension Diagnostics, Crawler Matrix & Critical Failure Gaps</div>
                  <div>• <strong>Page 3:</strong> Actionable Quick Fixes (Robots.txt, /llms.txt manifest & Schema JSON-LD)</div>
                </div>
              </div>

              {/* Error indicator */}
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-[#008752] hover:bg-[#007043] text-white font-bold py-3 px-5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm group"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating 3-Page PDF Report...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                      <span>Download 3-Page Detailed Report & Fixes</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                Your report is generated instantly in your browser. No spam, ever.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
