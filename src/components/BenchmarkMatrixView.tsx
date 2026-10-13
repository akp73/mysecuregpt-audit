import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Shield,
  Bot,
  Layers,
  Search,
  FileCode,
  ShoppingCart,
  Cpu,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import type { AuditReport, AgentReadinessToolBenchmark } from '../types/audit.ts';

interface BenchmarkMatrixViewProps {
  report: AuditReport;
}

export const BenchmarkMatrixView: React.FC<BenchmarkMatrixViewProps> = ({ report }) => {
  const { composite } = report;
  const tools = composite.tools || [];
  const [selectedToolId, setSelectedToolId] = useState<string>(tools[0]?.id || 'oraAi');

  const selectedTool = tools.find((t) => t.id === selectedToolId) || tools[0];

  const getToolIcon = (id: string) => {
    switch (id) {
      case 'oraAi':
        return Bot;
      case 'isitAgentReady':
        return Shield;
      case 'webYes':
        return Layers;
      case 'siteSpeak':
        return Search;
      case 'chatThing':
        return FileCode;
      case 'agenticCommerce':
        return ShoppingCart;
      case 'aiCommerceReady':
        return Cpu;
      default:
        return Sparkles;
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        text: 'AI Agent Ready',
        icon: CheckCircle2,
      };
    }
    if (score >= 60) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        text: 'Moderate Friction',
        icon: AlertTriangle,
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      text: 'High Barrier',
      icon: XCircle,
    };
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#008752] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Full Suite Comparison
              </span>
              <span className="text-xs text-slate-500 font-medium">
                7 Official Autonomous Agent Checking Tools
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              7-Tool AI Agent Readiness Matrix
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              We cross-examine <span className="font-semibold text-slate-900">{report.domain}</span> against the methodologies of all 7 leading AI Agent readiness evaluators to provide an un-siloed, authoritative verdict.
            </p>
          </div>

          {/* Average across all 7 tools */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-4 shrink-0">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Composite 7-Tool Index
              </div>
              <div className="text-3xl font-extrabold font-mono text-[#008752] mt-0.5">
                {composite.compositeScore}
                <span className="text-sm text-slate-400 font-normal">/100</span>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Overall Grade
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5">
                {composite.grade}
              </div>
            </div>
          </div>
        </div>

        {/* 7 Tools Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6">
          {tools.map((tool) => {
            const isSelected = tool.id === selectedToolId;
            const IconComp = getToolIcon(tool.id);
            const badge = getScoreBadge(tool.score);

            return (
              <button
                key={tool.id}
                onClick={() => setSelectedToolId(tool.id)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/70 border-[#008752] ring-2 ring-[#008752]/20 shadow-xs'
                    : 'bg-slate-50/50 hover:bg-slate-100/60 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      #{tool.order}
                    </span>
                    <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-[#008752]' : 'text-slate-500'}`} />
                  </div>
                  <div className="text-xs font-bold text-slate-900 line-clamp-1" title={tool.name}>
                    {tool.name}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-baseline justify-between">
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {tool.score}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${badge.bg}`}>
                    {tool.score >= 75 ? 'Pass' : 'Fix'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Tool Deep Dive Card */}
      {selectedTool && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-[#008752] shrink-0">
                {React.createElement(getToolIcon(selectedTool.id), { className: 'w-6 h-6' })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-[#008752]">
                    Tool #{selectedTool.order} of 7
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{selectedTool.focus}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <span>{selectedTool.name}</span>
                  <a
                    href={selectedTool.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-normal text-[#008752] hover:underline"
                  >
                    <span>Visit tool</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </h3>
              </div>
            </div>

            {/* Score pill */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Tool Score</div>
                <div className="text-2xl font-extrabold font-mono text-slate-900">
                  {selectedTool.score}
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </div>
              </div>
              <div
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                  getScoreBadge(selectedTool.score).bg
                }`}
              >
                {React.createElement(getScoreBadge(selectedTool.score).icon, { className: 'w-4 h-4' })}
                <span>{getScoreBadge(selectedTool.score).text}</span>
              </div>
            </div>
          </div>

          {/* Tool Summary */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Methodology Verdict
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {selectedTool.summary}
            </p>
          </div>

          {/* Metrics & Key Findings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inspected Metrics */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#008752]" />
                Audited Parameters ({selectedTool.metrics.length})
              </h4>
              <div className="space-y-2">
                {selectedTool.metrics.map((metric, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs"
                  >
                    <span className="text-slate-700 font-medium">{metric.label}</span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        metric.passed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Findings */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#008752]" />
                Key Diagnostic Findings
              </h4>
              <div className="space-y-2">
                {selectedTool.keyFindings.map((finding, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#008752] mt-1.5 shrink-0" />
                    <span>{finding}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full 7-Tool Reference Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Complete 7-Tool Benchmark Reference Table
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pl-2"># Tool</th>
                <th className="pb-3">Primary Evaluation Focus</th>
                <th className="pb-3 text-center">Score</th>
                <th className="pb-3 text-center">Readiness Status</th>
                <th className="pb-3 pr-2 text-right">Direct Tool Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tools.map((tool) => {
                const badge = getScoreBadge(tool.score);
                const IconComp = getToolIcon(tool.id);

                return (
                  <tr
                    key={tool.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      tool.id === selectedToolId ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <td className="py-3 pl-2 font-bold text-slate-900 flex items-center gap-2">
                      <IconComp className="w-3.5 h-3.5 text-[#008752]" />
                      <span>{tool.order}. {tool.name}</span>
                    </td>
                    <td className="py-3 text-slate-600 max-w-xs">{tool.focus}</td>
                    <td className="py-3 text-center font-mono font-bold text-sm text-slate-900">
                      {tool.score}/100
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${badge.bg}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#008752] hover:underline font-semibold"
                      >
                        <span>Check at {tool.displayUrl.split('/')[0]}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
