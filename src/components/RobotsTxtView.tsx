import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  FileText,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { RobotsTxtAnalysis } from '../types/audit';

interface RobotsTxtViewProps {
  robots: RobotsTxtAnalysis;
}

export const RobotsTxtView: React.FC<RobotsTxtViewProps> = ({ robots }) => {
  const [copied, setCopied] = useState(false);
  const [filterPurpose, setFilterPurpose] = useState<string>('ALL');

  const handleCopy = () => {
    navigator.clipboard.writeText(robots.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredBots = robots.bots.filter(b => {
    if (filterPurpose === 'ALL') return true;
    if (filterPurpose === 'TASK') return b.purpose === 'Agent Task / Search' || b.purpose === 'AI Browsing';
    if (filterPurpose === 'TRAINING') return b.purpose === 'Model Training';
    return true;
  });

  const blockedCount = robots.bots.filter(b => b.status === 'BLOCKED').length;
  const allowedCount = robots.bots.filter(b => b.status === 'ALLOWED' || b.status === 'NOT_MENTIONED_ALLOWED').length;

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008752]" />
            <span className="text-xs font-bold text-[#008752] uppercase tracking-wider">
              Crawler Governance Audit
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            Robots.txt & AI Bot Permission Matrix
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Audit of crawler directives governing autonomous search agents, browsing bots, and model scrapers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-600 border border-slate-200 bg-white px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-2xs">
            <span>Allowed: <strong className="text-[#008752] font-mono font-bold">{allowedCount}</strong></span>
            <span>·</span>
            <span>Blocked: <strong className="text-rose-600 font-mono font-bold">{blockedCount}</strong></span>
          </div>

          <a
            href={robots.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#008752] hover:text-[#00502C] flex items-center gap-1 font-mono font-semibold hover:underline"
          >
            Live File <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Summary Alert */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        blockedCount === 0
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : blockedCount < 4
          ? 'bg-amber-50 border-amber-200 text-amber-950'
          : 'bg-rose-50 border-rose-200 text-rose-950'
      }`}>
        {blockedCount === 0 ? (
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-[#008752]" />
        ) : (
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
        )}
        <div className="text-xs leading-relaxed">
          <strong className="font-bold block mb-0.5">TeamLogic IT Assessment:</strong>
          {robots.summary}
          {robots.sitemaps.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-200 font-mono text-[11px] text-slate-700">
              Declared Sitemap: {robots.sitemaps[0]}
            </div>
          )}
        </div>
      </div>

      {/* Bot Purpose Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setFilterPurpose('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterPurpose === 'ALL' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Bots ({robots.bots.length})
          </button>
          <button
            onClick={() => setFilterPurpose('TASK')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterPurpose === 'TASK' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Action & Search Bots
          </button>
          <button
            onClick={() => setFilterPurpose('TRAINING')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterPurpose === 'TRAINING' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Model Training Bots
          </button>
        </div>

        <span className="text-xs text-slate-500 font-mono font-medium hidden sm:inline">
          Robots.txt Score: <strong className="text-slate-900">{robots.score}</strong>/100
        </span>
      </div>

      {/* Bot Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredBots.map((bot, idx) => {
          const isBlocked = bot.status === 'BLOCKED';
          const isPartial = bot.status === 'PARTIALLY_RESTRICTED';

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border bg-white shadow-2xs transition-all ${
                isBlocked
                  ? 'border-rose-200 hover:border-rose-300'
                  : isPartial
                  ? 'border-amber-200 hover:border-amber-300'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {isBlocked ? (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  ) : isPartial ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#008752]" />
                  )}
                  <span className="font-mono font-bold text-slate-900 text-sm">{bot.botName}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{bot.vendor}</span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Purpose:</span>
                  <span className="text-slate-800 font-medium">{bot.purpose}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Access Directive:</span>
                  <span
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                      isBlocked
                        ? 'text-rose-700 bg-rose-50 border-rose-200'
                        : isPartial
                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                        : 'text-[#008752] bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    {bot.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 pt-1 leading-relaxed">{bot.details}</p>

                {bot.disallowedPaths.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-600">
                    <span className="text-rose-600 font-semibold">Disallow:</span> {bot.disallowedPaths.slice(0, 3).join(', ')}
                    {bot.disallowedPaths.length > 3 && ` (+${bot.disallowedPaths.length - 3} more)`}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Raw Robots.txt Viewer */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-200 font-mono">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Raw File: {robots.url}</span>
            <span className="text-slate-400">({robots.totalRules} lines)</span>
          </div>

          <button
            onClick={handleCopy}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Robots.txt'}</span>
          </button>
        </div>

        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-64 leading-relaxed">
          {robots.rawText || '# No robots.txt content detected on server'}
        </pre>
      </div>
    </div>
  );
};
