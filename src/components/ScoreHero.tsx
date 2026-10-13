import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Globe,
  Cpu,
  FileJson,
  Zap,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { AuditReport } from '../types/audit';
import { TeamLogicBrandBar } from './TeamLogicLogo';
import { ScoreGaugeDial } from './ScoreGaugeDial';

interface ScoreHeroProps {
  report: AuditReport;
}

export const ScoreHero: React.FC<ScoreHeroProps> = ({ report }) => {
  const { composite, domain, industry, wafOrBotShieldDetected } = report;

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-[#008752]', bg: 'bg-emerald-50', border: 'border-[#008752]/40' };
    if (score >= 60) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-500/40' };
    return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-500/40' };
  };

  const scoreTheme = getScoreColor(composite.compositeScore);

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-[#008752]';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* 1. Primary Speedometer Dial & Category Breakdown Dials (Matches picture_2.png) */}
      <div className="relative">
        <ScoreGaugeDial
          score={composite.compositeScore}
          domain={domain}
          dialBreakdown={composite.dialBreakdown}
          questionsBreakdown={composite.questionsBreakdown}
          tools={composite.tools}
        />
      </div>

      {/* 2. Detailed Technical Governance & Multi-Engine Metrics Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <TeamLogicBrandBar className="h-1.5" />

        <div className="p-6 sm:p-8">
          {/* Domain & Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#008752]" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">{domain}</h2>
                {wafOrBotShieldDetected && (
                  <span className="text-xs font-mono text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Bot Shield / WAF Detected
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span>Industry: <strong className="text-slate-800 font-medium">{industry}</strong></span>
                <span>·</span>
                <span>Audited: {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>·</span>
                <span>{report.htmlMeta.wordCount} words analyzed</span>
              </div>
            </div>

            {/* Verdict Badge */}
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${scoreTheme.bg} ${scoreTheme.border}`}>
              {composite.compositeScore >= 75 ? (
                <ShieldCheck className="w-5 h-5 text-[#008752]" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
              <span className={`font-bold text-xs sm:text-sm tracking-wide ${scoreTheme.text}`}>
                {composite.overallVerdict}
              </span>
            </div>
          </div>

          {/* Tri-Source Framework & Dimension Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            {/* Tri-Source Framework & Advisory Synthesis Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-emerald-50/20 border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-[#008752] tracking-wider block">
                  TeamLogic IT Advisory Synthesis
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Multi-Tool Agent Readiness Calibration</h3>
                <p className="text-sm text-slate-700 leading-relaxed mt-2.5 font-medium">
                  {composite.executiveSummary}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Audit Methodology:</span>
                <span className="font-mono text-[#008752] font-bold">7-Engine Multi-Tool Model</span>
              </div>
            </div>

            {/* 5 Core Dimensions Breakdown */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Audited Dimension Weights
                </span>
                <span className="text-xs text-slate-500 font-mono">TeamLogic IT Standard</span>
              </div>

              <div className="space-y-4 my-auto py-3">
                {/* 1. Crawlability */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#008752]" />
                      Bot Crawlability & Permissions (Robots.txt)
                    </span>
                    <span className="font-mono text-slate-900 font-semibold">{composite.dimensionScores.crawlability}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(composite.dimensionScores.crawlability)} transition-all duration-700`}
                      style={{ width: `${composite.dimensionScores.crawlability}%` }}
                    />
                  </div>
                </div>

                {/* 2. Structured Schema */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <FileJson className="w-3.5 h-3.5 text-emerald-600" />
                      Structured Schema & Entity Modeling (JSON-LD)
                    </span>
                    <span className="font-mono text-slate-900 font-semibold">{composite.dimensionScores.structuredSchema}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(composite.dimensionScores.structuredSchema)} transition-all duration-700`}
                      style={{ width: `${composite.dimensionScores.structuredSchema}%` }}
                    />
                  </div>
                </div>

                {/* 3. Actionability */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#8CC63F]" />
                      Actionability & Task Execution Readiness
                    </span>
                    <span className="font-mono text-slate-900 font-semibold">{composite.dimensionScores.actionability}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(composite.dimensionScores.actionability)} transition-all duration-700`}
                      style={{ width: `${composite.dimensionScores.actionability}%` }}
                    />
                  </div>
                </div>

                {/* 4. AI Agent Readiness */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      AI Agent Readiness & Content Clarity
                    </span>
                    <span className="font-mono text-slate-900 font-semibold">{composite.dimensionScores.semanticClarity}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(composite.dimensionScores.semanticClarity)} transition-all duration-700`}
                      style={{ width: `${composite.dimensionScores.semanticClarity}%` }}
                    />
                  </div>
                </div>

                {/* 5. Machine Protocols */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#00502C]" />
                      Machine Protocols (llms.txt, OpenAPI & Sitemaps)
                    </span>
                    <span className="font-mono text-slate-900 font-semibold">{composite.dimensionScores.machineProtocols}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(composite.dimensionScores.machineProtocols)} transition-all duration-700`}
                      style={{ width: `${composite.dimensionScores.machineProtocols}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
