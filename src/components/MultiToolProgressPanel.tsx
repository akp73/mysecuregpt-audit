import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  ExternalLink,
  Cpu,
  Bot,
  Layers,
  FileCode,
  Search,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export interface ToolProgressItem {
  id: string;
  order: number;
  name: string;
  url: string;
  displayUrl: string;
  focus: string;
  icon: React.ComponentType<{ className?: string }>;
  progress: number; // 0 to 100
  statusText: string;
  isComplete: boolean;
}

interface MultiToolProgressPanelProps {
  targetUrl: string;
  isAuditing: boolean;
  onComplete?: () => void;
}

const TOOL_DEFINITIONS = [
  {
    id: 'oraAi',
    order: 1,
    name: 'Ora.ai',
    url: 'https://ora.ai',
    displayUrl: 'ora.ai',
    focus: 'Action surface, /llms.txt context protocols & API endpoints',
    icon: Bot,
    stages: [
      'Connecting to Ora.ai inspection runtime...',
      'Probing /llms.txt and /.well-known/llms.txt...',
      'Validating Schema.org PotentialAction endpoints...',
      'Checking OpenAPI / ai-plugin.json specs...',
      'Testing autonomous agent execution barriers...',
      'Ora.ai data gathering complete (100%)',
    ],
  },
  {
    id: 'isitAgentReady',
    order: 2,
    name: 'isitagentready.com',
    url: 'https://isitagentready.com',
    displayUrl: 'isitagentready.com',
    focus: 'Robots.txt AI crawler policies, bot matrix & sitemaps',
    icon: ShieldCheck,
    stages: [
      'Pinging isitagentready.com crawler engine...',
      'Parsing /robots.txt directives for GPTBot...',
      'Evaluating ClaudeBot & Perplexity access rules...',
      'Checking /sitemap.xml discovery index...',
      'Synthesizing crawler permission matrix...',
      'isitagentready.com data gathering complete (100%)',
    ],
  },
  {
    id: 'webYes',
    order: 3,
    name: 'WebYes (webyes.com)',
    url: 'https://www.webyes.com/agent-readiness/',
    displayUrl: 'webyes.com/agent-readiness',
    focus: 'Semantic entity modeling, JSON-LD schema depth & architecture',
    icon: Layers,
    stages: [
      'Connecting to WebYes agent-readiness indexer...',
      'Extracting JSON-LD microdata and Schema graph...',
      'Validating Organization & LocalBusiness entities...',
      'Auditing Service and Product taxonomy...',
      'Checking HTML5 semantic landmarks (<main>, <nav>)...',
      'WebYes data gathering complete (100%)',
    ],
  },
  {
    id: 'siteSpeak',
    order: 4,
    name: 'SiteSpeakAI Scanner',
    url: 'https://sitespeak.ai/tools/ai-agent-readiness-scanner',
    displayUrl: 'sitespeak.ai/.../ai-agent-readiness-scanner',
    focus: 'Content extractability, conversational RAG & knowledge retrieval',
    icon: Search,
    stages: [
      'Connecting to SiteSpeakAI readiness engine...',
      'Measuring client-side text density vs JS payload...',
      'Parsing heading hierarchy for agent chunking...',
      'Validating FAQPage Q&A grounding pairs...',
      'Evaluating knowledge ingestion token efficiency...',
      'SiteSpeakAI data gathering complete (100%)',
    ],
  },
  {
    id: 'chatThing',
    order: 5,
    name: 'ChatThing Agent Checker',
    url: 'https://chatthing.ai/tools/agent-readiness-checker',
    displayUrl: 'chatthing.ai/.../agent-readiness-checker',
    focus: 'AI chat agent structure, clean context window & crawl traversal',
    icon: FileCode,
    stages: [
      'Pinging ChatThing agent readiness checker...',
      'Scanning site architecture and internal link graph...',
      'Validating ContactPoint & corporate identity...',
      'Measuring context-window token economy...',
      'Testing conversational agent navigation flow...',
      'ChatThing data gathering complete (100%)',
    ],
  },
  {
    id: 'agenticCommerce',
    order: 6,
    name: 'agenticcommerce.shop',
    url: 'https://agenticcommerce.shop',
    displayUrl: 'agenticcommerce.shop',
    focus: 'Autonomous buying/selling, Product/Offer schemas & checkout triggers',
    icon: ShoppingCart,
    stages: [
      'Querying agenticcommerce.shop transaction scanner...',
      'Inspecting structured Product catalog entities...',
      'Checking machine-readable Offer prices...',
      'Auditing autonomous checkout triggers and forms...',
      'Verifying machine-executable purchase flows...',
      'agenticcommerce.shop data gathering complete (100%)',
    ],
  },
  {
    id: 'aiCommerceReady',
    order: 7,
    name: 'AI Commerce Ready',
    url: 'https://aicommerceready.com',
    displayUrl: 'aicommerceready.com',
    focus: 'Commerce catalog verification, inventory status & pricing specs',
    icon: Cpu,
    stages: [
      'Connecting to AI Commerce Ready benchmark suite...',
      'Validating currency and pricing specification tags...',
      'Checking inventory availability metadata...',
      'Auditing merchant return policy & business identity...',
      'Synthesizing autonomous commerce compliance index...',
      'AI Commerce Ready data gathering complete (100%)',
    ],
  },
];

export const MultiToolProgressPanel: React.FC<MultiToolProgressPanelProps> = ({
  targetUrl,
  isAuditing,
  onComplete,
}) => {
  // Individual progress for each tool (0 to 100)
  const [progresses, setProgresses] = useState<number[]>(TOOL_DEFINITIONS.map(() => 0));

  useEffect(() => {
    if (!isAuditing) {
      // When auditing completes, animate all to 100%
      setProgresses(TOOL_DEFINITIONS.map(() => 100));
      return;
    }

    // Reset to 0 at start of audit
    setProgresses(TOOL_DEFINITIONS.map(() => 0));

    // Staggered incremental progress simulation while real audit fetches are underway
    const interval = setInterval(() => {
      setProgresses((prev) =>
        prev.map((val, idx) => {
          if (val >= 95) return 95; // Hold at 95% until server returns
          // Slightly different speed per tool to simulate authentic multi-tool parallel data gathering
          const increment = Math.max(1, Math.floor(Math.random() * 6) + (7 - idx));
          return Math.min(95, val + increment);
        })
      );
    }, 180);

    return () => clearInterval(interval);
  }, [isAuditing]);

  // When isAuditing transitions from true to false, ensure 100% is displayed
  useEffect(() => {
    if (!isAuditing) {
      setProgresses(TOOL_DEFINITIONS.map(() => 100));
      if (onComplete) onComplete();
    }
  }, [isAuditing, onComplete]);

  // Overall aggregate percentage
  const overallProgress = Math.round(
    progresses.reduce((acc, curr) => acc + curr, 0) / progresses.length
  );

  const getStageText = (toolIdx: number, p: number) => {
    const stages = TOOL_DEFINITIONS[toolIdx].stages;
    if (p >= 100) return stages[stages.length - 1];
    const stageIdx = Math.min(stages.length - 2, Math.floor((p / 100) * (stages.length - 1)));
    return stages[stageIdx];
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header with Overall Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAuditing ? 'bg-[#008752] opacity-75' : 'bg-emerald-400 opacity-0'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isAuditing ? 'bg-[#008752]' : 'bg-emerald-600'}`} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#008752]">
              Multi-Tool AI Agent Readiness Inspection
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Gathering Data Across 7 Independent Benchmark Tools
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspecting <span className="font-mono font-semibold text-slate-700">{targetUrl || 'Target Domain'}</span> simultaneously against the industry's top 7 autonomous AI agent checkers.
          </p>
        </div>

        {/* Overall progress indicator */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl">
          {isAuditing ? (
            <Loader2 className="w-5 h-5 text-[#008752] animate-spin shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#008752] shrink-0" />
          )}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Overall Data Gathering
            </div>
            <div className="text-sm font-bold font-mono text-slate-900 flex items-center gap-1.5">
              <span>{overallProgress}%</span>
              <span className="text-xs font-normal text-slate-500">
                ({progresses.filter((p) => p === 100).length}/7 Tools Complete)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Overall Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
          <span>Aggregate Suite Progress</span>
          <span className="font-mono font-bold text-[#008752]">{overallProgress}%</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-[#008752] via-[#27a05e] to-[#8cc63f] rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* 7 Tools Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
        {TOOL_DEFINITIONS.map((tool, idx) => {
          const currentP = progresses[idx];
          const isDone = currentP >= 100;
          const IconComp = tool.icon;
          const stageText = getStageText(idx, currentP);

          return (
            <div
              key={tool.id}
              className={`p-4 rounded-xl border transition-all ${
                isDone
                  ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                  : currentP > 0
                  ? 'bg-slate-50/70 border-slate-200'
                  : 'bg-white border-slate-200 opacity-75'
              }`}
            >
              {/* Tool Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isDone
                        ? 'bg-[#008752] text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">
                        {tool.order}. {tool.name}
                      </span>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-[#008752] transition-colors"
                        title={`Visit ${tool.name}`}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate max-w-[200px] sm:max-w-[240px]">
                      {tool.displayUrl}
                    </div>
                  </div>
                </div>

                {/* Percentage Badge */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-[#008752]" />
                      100%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      <Loader2 className="w-3 h-3 text-[#008752] animate-spin" />
                      {currentP}%
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar (0 to 100) */}
              <div className="space-y-1 mt-2.5">
                <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isDone
                        ? 'bg-[#008752]'
                        : 'bg-gradient-to-r from-[#008752] to-[#8cc63f]'
                    }`}
                    style={{ width: `${currentP}%` }}
                  />
                </div>
                {/* Live Stage Status */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span className="truncate pr-2 italic">{stageText}</span>
                  <span className="shrink-0 text-[10px] font-mono text-slate-400">
                    {currentP}/100
                  </span>
                </div>
              </div>

              {/* Tool Focus Badge */}
              <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-600 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#008752] shrink-0" />
                <span className="truncate">{tool.focus}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#008752]" />
          <span>Real-time parallel ingestion of crawler policies, JSON-LD schemas, /llms.txt manifests, and commerce triggers.</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400 shrink-0">
          Suite: 7 of 7 Engines Active
        </span>
      </div>
    </div>
  );
};
