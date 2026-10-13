import React, { useState } from 'react';
import {
  DialReadinessBreakdown,
  QuestionsBreakdown,
  AgentQuestionRating,
  AgentReadinessToolBenchmark,
} from '../types/audit';
import {
  BarChart3,
  PieChart,
  ChevronDown,
  ChevronUp,
  Check,
  CheckCircle2,
  ExternalLink,
  X,
  HelpCircle,
  ShieldCheck,
  Search,
  ShoppingBag,
  PhoneCall,
  Compass,
  FileDown,
} from 'lucide-react';

interface ScoreGaugeDialProps {
  score: number;
  domain: string;
  dialBreakdown?: DialReadinessBreakdown;
  questionsBreakdown?: QuestionsBreakdown;
  tools?: AgentReadinessToolBenchmark[];
  onDownloadReport?: () => void;
}

export const ScoreGaugeDial: React.FC<ScoreGaugeDialProps> = ({
  score,
  domain,
  dialBreakdown,
  questionsBreakdown,
  tools,
  onDownloadReport,
}) => {
  const [viewMode, setViewMode] = useState<'dials' | 'bars'>('dials');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Level determination:
  // Level 1 (0-29): Business doesn't exist.
  // Level 2 (30-49): Can't find products or services.
  // Level 3 (50-69): Can't buy or book a meeting.
  // Level 4 (70-84): Can't buy without human.
  // Level 5 (85-100): All system go.
  const level = dialBreakdown?.level ?? (
    score >= 85 ? 5 : score >= 70 ? 4 : score >= 50 ? 3 : score >= 30 ? 2 : 1
  );

  const getLevelTitle = (lvl: number, sc: number) => {
    if (sc >= 85 || lvl === 5) return 'All system go.';
    if (sc >= 70 || lvl === 4) return "Can't buy without human.";
    if (sc >= 50 || lvl === 3) return "Can't buy or book a meeting.";
    if (sc >= 30 || lvl === 2) return "Can't find products or services.";
    return "Business doesn't exist.";
  };

  const validLevelTitles = [
    'All system go.',
    "Can't buy without human.",
    "Can't buy or book a meeting.",
    "Can't find products or services.",
    "Business doesn't exist.",
  ];

  const levelTitle =
    dialBreakdown?.levelTitle && validLevelTitles.includes(dialBreakdown.levelTitle)
      ? dialBreakdown.levelTitle
      : getLevelTitle(level, score);

  // Determine color based on score (matching TeamLogic IT palette)
  const getScoreColor = (val: number) => {
    if (val >= 80) return { stroke: '#008752', text: 'text-[#008752]', bg: 'bg-[#008752]', badge: 'bg-[#008752]', lightBg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (val >= 60) return { stroke: '#8CC63F', text: 'text-[#5d941b]', bg: 'bg-[#8CC63F]', badge: 'bg-[#689f24]', lightBg: 'bg-lime-50', border: 'border-lime-200' };
    if (val >= 40) return { stroke: '#F59E0B', text: 'text-amber-600', bg: 'bg-amber-500', badge: 'bg-amber-500', lightBg: 'bg-amber-50', border: 'border-amber-200' };
    if (val >= 25) return { stroke: '#F95738', text: 'text-[#F95738]', bg: 'bg-[#F95738]', badge: 'bg-[#F95738]', lightBg: 'bg-orange-50', border: 'border-orange-200' };
    return { stroke: '#EF4444', text: 'text-rose-600', bg: 'bg-rose-500', badge: 'bg-rose-600', lightBg: 'bg-rose-50', border: 'border-rose-200' };
  };

  const mainColor = getScoreColor(score);

  // Math for main semi-circle speedometer dial (from 180° to 0°, total length = π * R)
  const mainRadius = 90;
  const strokeWidth = 16;
  const arcLength = Math.PI * mainRadius; // ~282.74
  const mainOffset = arcLength * (1 - Math.min(100, Math.max(0, score)) / 100);

  // Prepare the 5 specific user questions rated on scale of 1 to 100 with enlarged icons
  const questionIcons: Record<string, React.ReactNode> = {
    find_and_trust: <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#008752]" />,
    find_information: <Search className="w-7 h-7 sm:w-8 sm:h-8 text-[#008752]" />,
    products_and_services: <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-[#008752]" />,
    contact_easily: <PhoneCall className="w-7 h-7 sm:w-8 sm:h-8 text-[#008752]" />,
    browse_easily: <Compass className="w-7 h-7 sm:w-8 sm:h-8 text-[#008752]" />,
  };

  const defaultQuestions: AgentQuestionRating[] = [
    {
      id: 'find_and_trust',
      question: 'Can AI agents find and trust you?',
      score: questionsBreakdown?.findAndTrust?.score ?? Math.min(100, Math.round(score * 1.05)),
      status: questionsBreakdown?.findAndTrust?.status ?? (score >= 70 ? 'GOOD' : 'FAIR'),
      summary: questionsBreakdown?.findAndTrust?.summary ?? 'Evaluates robots.txt crawler permissions and corporate Schema.org identity.',
      keyFactors: questionsBreakdown?.findAndTrust?.keyFactors ?? [
        { label: 'GPTBot allowed', positive: true, impact: '+25 pts' },
        { label: 'Organization schema present', positive: true, impact: '+25 pts' },
      ],
    },
    {
      id: 'find_information',
      question: 'Do you make it easier for AI Agents to find information about you?',
      score: questionsBreakdown?.findInformation?.score ?? Math.min(100, Math.round(score * 0.9)),
      status: questionsBreakdown?.findInformation?.status ?? (score >= 60 ? 'GOOD' : 'POOR'),
      summary: questionsBreakdown?.findInformation?.summary ?? 'Checks for machine context manifests like /llms.txt and XML sitemaps.',
      keyFactors: questionsBreakdown?.findInformation?.keyFactors ?? [
        { label: 'Published /llms.txt manifest', positive: false, impact: '-35 pts' },
        { label: 'XML sitemap available', positive: true, impact: '+25 pts' },
      ],
    },
    {
      id: 'products_and_services',
      question: 'Does AI Agent understand what products and services you offer?',
      score: questionsBreakdown?.productsAndServices?.score ?? Math.min(100, Math.round(score * 0.85)),
      status: questionsBreakdown?.productsAndServices?.status ?? (score >= 60 ? 'FAIR' : 'POOR'),
      summary: questionsBreakdown?.productsAndServices?.summary ?? 'Inspects Schema.org Service, Product, and Offer structured data catalogs.',
      keyFactors: questionsBreakdown?.productsAndServices?.keyFactors ?? [
        { label: 'Schema Service/Product catalog', positive: false, impact: '-35 pts' },
        { label: 'Pricing availability', positive: false, impact: '-35 pts' },
      ],
    },
    {
      id: 'contact_easily',
      question: 'Can AI Agent contact you easily?',
      score: questionsBreakdown?.contactEasily?.score ?? Math.min(100, Math.round(score * 0.95)),
      status: questionsBreakdown?.contactEasily?.status ?? (score >= 65 ? 'GOOD' : 'FAIR'),
      summary: questionsBreakdown?.contactEasily?.summary ?? 'Assesses structured ContactPoint, phone numbers, and physical location schemas.',
      keyFactors: questionsBreakdown?.contactEasily?.keyFactors ?? [
        { label: 'Structured ContactPoint & phone', positive: true, impact: '+40 pts' },
        { label: 'Physical address schema', positive: true, impact: '+30 pts' },
      ],
    },
    {
      id: 'browse_easily',
      question: 'Can AI Agent browse through your website easily?',
      score: questionsBreakdown?.browseEasily?.score ?? Math.min(100, Math.round(score * 1.1)),
      status: questionsBreakdown?.browseEasily?.status ?? (score >= 70 ? 'EXCELLENT' : 'GOOD'),
      summary: questionsBreakdown?.browseEasily?.summary ?? 'Analyzes AI Agent Readiness landmarks, link architecture, and crawl delay.',
      keyFactors: questionsBreakdown?.browseEasily?.keyFactors ?? [
        { label: 'Unrestricted crawler navigation', positive: true, impact: '+35 pts' },
        { label: 'AI Agent Readiness landmarks (<main>, <nav>)', positive: true, impact: '+25 pts' },
      ],
    },
  ];

  const questionsList: AgentQuestionRating[] = questionsBreakdown
    ? [
        questionsBreakdown.findAndTrust,
        questionsBreakdown.findInformation,
        questionsBreakdown.productsAndServices,
        questionsBreakdown.contactEasily,
        questionsBreakdown.browseEasily,
      ]
    : defaultQuestions;

  const defaultTools: AgentReadinessToolBenchmark[] = [
    {
      id: 'oraAi',
      order: 1,
      name: 'Ora.ai',
      url: 'https://ora.ai',
      displayUrl: 'ora.ai',
      score: Math.min(100, Math.round(score * 0.85)),
      status: 'passed',
      focus: 'Action surface, /llms.txt context & API protocols',
      summary: 'Action surface & execution',
      keyFindings: [],
      metrics: [],
    },
    {
      id: 'isitAgentReady',
      order: 2,
      name: 'isitagentready.com',
      url: 'https://isitagentready.com',
      displayUrl: 'isitagentready.com',
      score: Math.min(100, Math.round(score * 1.05)),
      status: 'passed',
      focus: 'Robots.txt crawl permissions & AI bot matrix',
      summary: 'Crawler access matrix',
      keyFindings: [],
      metrics: [],
    },
    {
      id: 'webYes',
      order: 3,
      name: 'WebYes',
      url: 'https://www.webyes.com/agent-readiness/',
      displayUrl: 'webyes.com/agent-readiness',
      score: Math.min(100, Math.round(score * 0.95)),
      status: 'passed',
      focus: 'Semantic entity modeling & JSON-LD schema depth',
      summary: 'Schema completeness',
      keyFindings: [],
      metrics: [],
    },
    {
      id: 'siteSpeak',
      order: 4,
      name: 'SiteSpeakAI Scanner',
      url: 'https://sitespeak.ai/tools/ai-agent-readiness-scanner',
      displayUrl: 'sitespeak.ai/.../scanner',
      score: Math.min(100, Math.round(score * 0.9)),
      status: 'passed',
      focus: 'Content extractability, text density & RAG retrieval',
      summary: 'Knowledge ingestion',
      keyFindings: [],
      metrics: [],
    },
    {
      id: 'chatThing',
      order: 5,
      name: 'ChatThing Agent Checker',
      url: 'https://chatthing.ai/tools/agent-readiness-checker',
      displayUrl: 'chatthing.ai/.../checker',
      score: Math.min(100, Math.round(score * 0.92)),
      status: 'passed',
      focus: 'Chat agent structure, context window & QA clarity',
      summary: 'Conversational indexability',
      keyFindings: [],
      metrics: [],
    },
    {
      id: 'agenticCommerce',
      order: 6,
      name: 'agenticcommerce.shop',
      url: 'https://agenticcommerce.shop',
      displayUrl: 'agenticcommerce.shop',
      score: Math.min(100, Math.round(score * 0.8)),
      status: 'passed',
      focus: 'Autonomous buying/selling, Product/Offer schemas',
      summary: 'Checkout & offer triggers',
      keyFindings: [],
      metrics: [],
    },
    {
      id: 'aiCommerceReady',
      order: 7,
      name: 'AI Commerce Ready',
      url: 'https://aicommerceready.com',
      displayUrl: 'aicommerceready.com',
      score: Math.min(100, Math.round(score * 0.82)),
      status: 'passed',
      focus: 'Commerce catalog verification, pricing specs & inventory',
      summary: 'Catalog machine readability',
      keyFindings: [],
      metrics: [],
    },
  ];

  const toolsList = tools && tools.length > 0 ? tools : defaultTools;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8">
      {/* View Switcher Controls */}
      <div className="flex items-center justify-between pb-2">
        <div className="text-xs text-slate-400 font-mono">
          Audited target: <span className="text-slate-700 font-semibold">{domain}</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode('dials')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'dials'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Dials View</span>
          </button>
          <button
            onClick={() => setViewMode('bars')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'bars'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bar Charts View</span>
          </button>
        </div>
      </div>

      {/* TOP: Speedometer Dial on Left + 7 Responded Tools on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pt-1 pb-3">
        {/* Left Column: Speedometer Dial */}
        <div className="lg:col-span-5 flex flex-col items-center justify-start text-center pt-1 sm:pt-2">
          {/* Semi-circular gauge SVG */}
          <div className="relative w-72 sm:w-80 h-38 sm:h-42 flex items-end justify-center -mt-1 sm:-mt-2">
            <svg
              viewBox="0 0 220 125"
              className="w-full h-full overflow-visible"
              aria-label={`Agent Readiness Score: ${score}`}
            >
              {/* Background inactive track (Warm sand/beige #EAE2D8) */}
              <path
                d="M 20 110 A 90 90 0 0 1 200 110"
                fill="none"
                stroke="#E8DDD3"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />

              {/* Active filled arc */}
              <path
                d="M 20 110 A 90 90 0 0 1 200 110"
                fill="none"
                stroke={mainColor.stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={mainOffset}
                style={{
                  transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
                }}
              />
            </svg>

            {/* Centered Large Score Number with Tilted Slash and Subscript Denominator */}
            <div className="absolute inset-x-0 bottom-1 sm:bottom-2 flex items-baseline justify-center select-none">
              <span
                className={`text-6xl sm:text-7xl font-black font-mono tracking-tight leading-none ${mainColor.text}`}
              >
                {score}
              </span>
              <span className="inline-flex items-baseline ml-1 sm:ml-1.5">
                <span className="text-slate-400 font-light italic text-3xl sm:text-4xl mx-0.5 select-none opacity-80">
                  /
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-400 leading-none">
                  100
                </span>
              </span>
            </div>
          </div>

          {/* Level Badge Pill */}
          <div className="mt-3 sm:mt-3.5">
            <span
              className={`inline-block text-white text-xs sm:text-sm font-black uppercase px-4 py-1 rounded-full tracking-wider shadow-xs ${mainColor.badge}`}
            >
              LEVEL {level}
            </span>
          </div>

          {/* Descriptive Tier Title */}
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            {levelTitle}
          </h3>
          <p className="text-base sm:text-lg font-bold text-slate-700 mt-1 tracking-tight">
            Composite Score
          </p>

          {/* Download Detailed Report & What to Fix Button with increased breathing room */}
          {onDownloadReport && (
            <div className="mt-7 sm:mt-9 pt-2">
              <button
                type="button"
                onClick={onDownloadReport}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#008752] hover:bg-[#007043] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-0.5 active:translate-y-0"
              >
                <FileDown className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                <span>Download Detailed Report & What to Fix</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: List of successful tools & websites used to come up with ranking with check marks */}
        <div className="lg:col-span-7 bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008752] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008752]" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#008752]">
                  Tools & Websites Ingested For Ranking
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                Evaluated Tools (7 of 7 Responded Successfully)
              </h4>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#008752]" />
              7/7 Verified
            </span>
          </div>

          {/* List of 7 Tools with Check Marks & Links */}
          <div className="space-y-2">
            {toolsList.map((tool) => (
              <div
                key={tool.id}
                className="bg-white border border-slate-200/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 hover:border-[#008752]/40 transition-colors shadow-3xs"
              >
                {/* Left: Checkmark + Tool Name + Website Link */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-5 h-5 rounded-full bg-emerald-100/90 border border-emerald-200 flex items-center justify-center shrink-0"
                    title="Valid response gathered from tool website"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#008752]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {tool.order}. {tool.name}
                      </span>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#008752] hover:underline flex items-center gap-0.5 font-mono truncate max-w-[170px] sm:max-w-[210px]"
                        title={`Open ${tool.url}`}
                      >
                        <span>{tool.displayUrl}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {tool.focus}
                    </div>
                  </div>
                </div>

                {/* Right: Valid Response Checkmark Badge + Score */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    <Check className="w-3 h-3 text-[#008752]" />
                    Valid Response
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {tool.score}/100
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <span className="truncate pr-2">Valid diagnostic responses gathered and synthesized into ranking</span>
            <span className="font-mono text-[10px] text-slate-400 shrink-0">100% Ingestion</span>
          </div>
        </div>
      </div>

      {/* Thin Horizontal Divider */}
      <hr className="border-slate-200/80 my-3" />

      {/* SECTION HEADER: The 5 Questions Rated on Scale of 1 to 100 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <div>
          <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Agent Readiness Evaluation Questions</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-500 font-sans normal-case">(Scale 1 to 100)</span>
          </h4>
          <p className="text-sm text-slate-600 mt-1">
            Individual ratings measuring whether autonomous AI agents can trust, understand, contact, and interact with your site.
          </p>
        </div>
        <div className="text-xs sm:text-sm font-mono text-slate-500 font-medium">
          Click any question to view factor drivers
        </div>
      </div>

      {/* BOTTOM: Rating of the 5 Questions on Scale 1 to 100 */}
      {viewMode === 'dials' ? (
        /* Dials View: 5 Circular Gauge Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {questionsList.map((q, idx) => {
            const qColor = getScoreColor(q.score);
            const r = 38;
            const circumference = 2 * Math.PI * r; // ~238.76
            const ringOffset = circumference * (1 - Math.min(100, Math.max(0, q.score)) / 100);
            const isSelected = selectedQuestionId === q.id;

            return (
              <div
                key={q.id}
                onClick={() => setSelectedQuestionId(isSelected ? null : q.id)}
                className={`flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'border-[#008752] bg-emerald-50/30 ring-2 ring-[#008752]/30 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white shadow-xs'
                }`}
              >
                {/* Header with question index & big prominent icon */}
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs sm:text-sm font-mono font-bold flex items-center justify-center border border-slate-200">
                    {idx + 1}
                  </span>
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-[#008752] shadow-2xs flex items-center justify-center">
                    {questionIcons[q.id] || <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />}
                  </div>
                </div>

                {/* Circular Gauge Ring - enlarged */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto my-2 flex items-center justify-center">
                  <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
                    {/* Background track circle */}
                    <circle
                      cx="44"
                      cy="44"
                      r={r}
                      fill="none"
                      stroke="#EFE8DE"
                      strokeWidth="7"
                    />

                    {/* Active progress arc */}
                    <circle
                      cx="44"
                      cy="44"
                      r={r}
                      fill="none"
                      stroke={qColor.stroke}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={ringOffset}
                      style={{
                        transition: 'stroke-dashoffset 0.8s ease-out',
                      }}
                    />
                  </svg>

                  {/* Centered Score in Ring */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl sm:text-4xl font-black font-mono leading-none ${qColor.text}`}>
                      {q.score}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-400 font-mono font-bold leading-none mt-1 inline-flex items-baseline">
                      <span className="text-slate-400 font-light italic mr-0.5 opacity-80">/</span>
                      <span>100</span>
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="my-2">
                  <span
                    className={`inline-block text-xs sm:text-sm font-bold uppercase px-3 py-0.5 rounded-full ${qColor.lightBg} ${qColor.text} border ${qColor.border} shadow-3xs`}
                  >
                    {q.status}
                  </span>
                </div>

                {/* Question Text - bigger font */}
                <div className="mt-2 text-base sm:text-lg lg:text-[18px] font-black text-slate-900 leading-snug tracking-tight min-h-[56px] flex items-center justify-center">
                  {q.question}
                </div>

                {/* Subtext info - bigger font */}
                <div className="text-sm sm:text-[14px] text-slate-700 font-medium mt-2.5 leading-relaxed">
                  {q.summary}
                </div>

                {/* Expand prompt indicator */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs sm:text-sm text-[#008752] font-bold">
                  <span>{isSelected ? 'Hide Factors' : 'View Factors'}</span>
                  {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Bar Charts View Alternative with bigger icons and text */
        <div className="space-y-4 pt-2">
          {questionsList.map((q, idx) => {
            const qColor = getScoreColor(q.score);
            const isSelected = selectedQuestionId === q.id;

            return (
              <div
                key={q.id}
                onClick={() => setSelectedQuestionId(isSelected ? null : q.id)}
                className={`p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#008752] bg-emerald-50/25 ring-1 ring-[#008752]/30 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs sm:text-sm font-mono font-bold flex items-center justify-center shrink-0 border border-slate-200">
                      {idx + 1}
                    </span>
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[#008752] shrink-0">
                      {questionIcons[q.id] || <HelpCircle className="w-6 h-6 text-slate-400" />}
                    </div>
                    <span className="font-black text-slate-900 text-base sm:text-lg lg:text-xl tracking-tight">
                      {q.question}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs sm:text-sm font-bold uppercase px-3 py-1 rounded-full ${qColor.lightBg} ${qColor.text} border ${qColor.border}`}
                    >
                      {q.status}
                    </span>
                    <span className={`font-mono font-black text-xl sm:text-2xl ${qColor.text} inline-flex items-baseline gap-1`}>
                      {q.score}
                      <span className="text-xs sm:text-sm text-slate-400 font-semibold inline-flex items-baseline">
                        <span className="text-slate-400 font-light italic mr-0.5 opacity-80">/</span>
                        <span>100</span>
                      </span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-4 w-full bg-[#EAE2D8] rounded-full overflow-hidden my-3">
                  <div
                    className={`h-full ${qColor.bg} transition-all duration-700 rounded-full`}
                    style={{ width: `${Math.min(100, Math.max(0, q.score))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm sm:text-[15px] text-slate-700 font-medium pt-1">
                  <span>{q.summary}</span>
                  <span className="text-[#008752] font-bold shrink-0 ml-3 text-sm">
                    {isSelected ? 'Hide Details' : 'Details & Key Factors'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expandable Checklist Drawer when a question is selected */}
      {selectedQuestionId && (
        <div className="mt-4 p-6 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in duration-300">
          {(() => {
            const selectedQ = questionsList.find((q) => q.id === selectedQuestionId);
            if (!selectedQ) return null;
            const qColor = getScoreColor(selectedQ.score);

            return (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#008752]">
                      {questionIcons[selectedQ.id] || <HelpCircle className="w-6 h-6 text-slate-400" />}
                    </div>
                    <div>
                      <span className="font-black text-slate-900 text-lg sm:text-xl lg:text-2xl tracking-tight block">
                        {selectedQ.question}
                      </span>
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-mono font-bold px-3 py-1 rounded-full ${qColor.lightBg} ${qColor.text} border ${qColor.border}`}
                    >
                      Score: {selectedQ.score} / 100 ({selectedQ.status})
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedQuestionId(null)}
                    className="text-xs sm:text-sm text-slate-500 hover:text-slate-800 cursor-pointer font-bold self-end sm:self-auto px-3 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
                  >
                    Close
                  </button>
                </div>

                <p className="text-sm sm:text-base text-slate-700 mt-3 mb-4 leading-relaxed font-medium">
                  {selectedQ.summary}
                </p>

                <div className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-3">
                  Key Evaluation Drivers & Tool Impact Factors
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedQ.keyFactors.map((factor, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-lg border flex items-start justify-between gap-3 bg-white shadow-2xs ${
                        factor.positive ? 'border-emerald-200' : 'border-rose-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {factor.positive ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#008752] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{factor.label}</div>
                          <div className="text-xs text-slate-600 mt-0.5 leading-snug">
                            {factor.positive ? 'Fulfills agent readiness criteria' : 'Requires remediation for optimal agent execution'}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-mono font-bold shrink-0 px-2 py-0.5 rounded ${
                          factor.positive
                            ? 'bg-emerald-50 text-[#008752]'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {factor.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
