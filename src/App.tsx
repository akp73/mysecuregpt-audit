import React, { useState, useEffect } from 'react';
import {
  Search,
  Bot,
  AlertCircle,
  Loader2,
  Layers,
  Cpu,
  FileJson,
  Trophy,
  Code,
  ShieldCheck,
  Phone,
  MapPin,
  Sparkles,
  Globe,
} from 'lucide-react';
import { Header } from './components/Header';
import { ScoreHero } from './components/ScoreHero';
import { AgentCapabilitiesView } from './components/AgentCapabilitiesView';
import { RobotsTxtView } from './components/RobotsTxtView';
import { SchemaView } from './components/SchemaView';
import { IndustryBenchmarkView } from './components/IndustryBenchmarkView';
import { RemediationView } from './components/RemediationView';
import { MultiToolProgressPanel } from './components/MultiToolProgressPanel';
import { BenchmarkMatrixView } from './components/BenchmarkMatrixView';
import { TeamLogicLogo, TeamLogicBrandBar } from './components/TeamLogicLogo';
import { AuditReport } from './types/audit';
import { INITIAL_INDUSTRY_OPTIONS } from './constants/industries';
import { defaultPgReport } from './data/defaultReport';
import { buildIndustryBenchmark } from './utils/industryBenchmark';

// In-memory audit cache to avoid repeated audit executions
const auditMemoryCache = new Map<string, AuditReport>();
auditMemoryCache.set('https://us.pg.com/_consumer_goods', defaultPgReport);
auditMemoryCache.set('us.pg.com_consumer_goods', defaultPgReport);
auditMemoryCache.set('https://us.pg.com', defaultPgReport);
auditMemoryCache.set('us.pg.com', defaultPgReport);

export default function App() {
  const [urlInput, setUrlInput] = useState('');
  const [industry, setIndustry] = useState('consumer_goods');
  const [industries, setIndustries] = useState<
    { id: string; name: string; defaultMedian: number; top10: number }[]
  >(INITIAL_INDUSTRY_OPTIONS);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'tools' | 'capabilities' | 'robots' | 'schema' | 'benchmark' | 'remediation'
  >('overview');

  // Load results from memory when page loads for the first time
  const [report, setReport] = useState<AuditReport | null>(defaultPgReport);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active section for left navigation tracking
  const [activeSection, setActiveSection] = useState<'executive' | 'benchmark' | 'detailed'>('executive');

  const scrollToSection = (sectionId: 'executive-summary' | 'competitive-benchmark' | 'detailed-summary') => {
    if (sectionId === 'executive-summary') setActiveSection('executive');
    else if (sectionId === 'competitive-benchmark') setActiveSection('benchmark');
    else if (sectionId === 'detailed-summary') setActiveSection('detailed');

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (!report) return;

    const handleScroll = () => {
      const execEl = document.getElementById('executive-summary');
      const benchmarkEl = document.getElementById('competitive-benchmark');
      const detailedEl = document.getElementById('detailed-summary');

      const scrollPos = window.scrollY + 250;

      if (detailedEl && scrollPos >= detailedEl.offsetTop) {
        setActiveSection('detailed');
      } else if (benchmarkEl && scrollPos >= benchmarkEl.offsetTop) {
        setActiveSection('benchmark');
      } else if (execEl) {
        setActiveSection('executive');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [report]);

  // Fetch industries on mount
  useEffect(() => {
    fetch('/api/industries')
      .then((res) => res.json())
      .then((data) => {
        if (data?.industries && Array.isArray(data.industries) && data.industries.length > 0) {
          setIndustries(data.industries);
        }
      })
      .catch((err) => console.warn('Could not load industries from API:', err));
  }, []);

  // Do NOT run audit for https://us.pg.com/ every time page loads.
  // Initial results are loaded directly from memory (defaultPgReport).

  const runAudit = async (targetUrl: string, targetIndustry: string) => {
    if (!targetUrl.trim()) return;
    setError(null);

    // Check in-memory cache first to avoid re-running audits
    const normalizedTarget = targetUrl.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const cacheKey = `${normalizedTarget}_${targetIndustry}`;

    if (auditMemoryCache.has(cacheKey)) {
      setReport(auditMemoryCache.get(cacheKey)!);
      return;
    }
    if (auditMemoryCache.has(normalizedTarget)) {
      setReport(auditMemoryCache.get(normalizedTarget)!);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, industry: targetIndustry }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to analyze website.');
      }

      const data: AuditReport = await response.json();
      // Save results in memory
      auditMemoryCache.set(cacheKey, data);
      auditMemoryCache.set(normalizedTarget, data);
      if (data.benchmark?.industryId) {
        setIndustry(data.benchmark.industryId);
      }
      setReport(data);
    } catch (err: any) {
      console.error('Audit failed:', err);
      setError(err?.message || 'An error occurred while inspecting the domain. Please check the URL.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runAudit(urlInput, industry);
  };

  const handleSelectPreset = (presetUrl: string, presetIndustry: string) => {
    setUrlInput(presetUrl);
    setIndustry(presetIndustry);
    runAudit(presetUrl, presetIndustry);
  };

  // Synchronizes Industry selection between Headline box and Market Intelligence & Peer Benchmark
  const handleIndustryChange = (newIndustryId: string) => {
    setIndustry(newIndustryId);
    if (report) {
      const newBenchmark = buildIndustryBenchmark(
        newIndustryId,
        report.composite?.compositeScore ?? 0,
        report.composite?.dimensionScores?.crawlability ?? 0,
        report.composite?.dimensionScores?.structuredSchema ?? 0,
        report.composite?.dimensionScores?.actionability ?? 0,
        report.domain,
        report.businessName
      );
      setReport({
        ...report,
        industry: newBenchmark.industryName,
        benchmark: newBenchmark,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* TeamLogic IT Branded Header */}
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TeamLogic IT Hero Search Section */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 bg-white">
            <div className="w-full">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[2.15rem] xl:text-[2.35rem] font-extrabold text-black tracking-tight leading-tight font-inter sm:whitespace-nowrap">
                Want to Turn AI Searches Into Leads?
              </h1>
            </div>

            {/* Audit Input Form */}
            <form onSubmit={handleAuditSubmit} className="mt-6 flex flex-col sm:flex-row sm:items-end gap-3.5">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-[#008752]" />
                  </div>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Enter your Website Here"
                    required
                    className="w-full bg-slate-50/50 border-2 border-slate-300 rounded-xl sm:rounded-2xl pl-12 sm:pl-14 pr-5 py-3.5 sm:py-4 text-base sm:text-lg md:text-xl font-medium text-slate-900 placeholder:text-slate-400 placeholder:text-base sm:placeholder:text-lg md:placeholder:text-xl focus:outline-none focus:border-[#008752] focus:ring-2 focus:ring-[#008752]/20 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="sm:w-72">
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                  Select Your Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => handleIndustryChange(e.target.value)}
                  className="w-full bg-slate-50/50 border-2 border-slate-300 rounded-xl sm:rounded-2xl px-4 py-3.5 sm:py-4 text-sm sm:text-base text-slate-800 font-semibold focus:outline-none focus:border-[#008752] focus:ring-2 focus:ring-[#008752]/20 cursor-pointer shadow-xs"
                >
                  {industries.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#008752] hover:bg-[#007043] text-white font-extrabold px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer text-base sm:text-lg shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing Site...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Audit Website</span>
                  </>
                )}
              </button>
            </form>

            {/* Subtext below the form */}
            <div className="mt-6 text-base sm:text-lg md:text-xl text-slate-800 font-normal tracking-tight">
              See Below Why Buyer&apos;s AI Isn&apos;t Sending You Leads
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}
          </div>
          <TeamLogicBrandBar className="h-1.5" />
        </section>

        {/* Live Multi-Tool Data Gathering Progress (0 to 100) */}
        {isLoading && (
          <MultiToolProgressPanel
            targetUrl={urlInput || 'https://us.pg.com/'}
            isAuditing={isLoading}
          />
        )}

        {/* Report Content */}
        {report && (
          <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-6 lg:gap-6 xl:gap-8">
            {/* Left-Side Clean Clickable Text Navigation (Smaller text for maximum Executive Summary room) */}
            <nav
              className="w-full lg:w-44 xl:w-48 shrink-0 lg:sticky lg:top-36 space-y-10 lg:space-y-12 lg:pt-24 select-none"
              aria-label="Report section navigation"
            >
              <button
                type="button"
                onClick={() => scrollToSection('executive-summary')}
                className={`block text-left text-sm sm:text-[15px] leading-tight transition-colors cursor-pointer ${
                  activeSection === 'executive'
                    ? 'font-bold text-black'
                    : 'font-medium text-slate-700 hover:text-[#008752]'
                }`}
              >
                Executive Summary
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('competitive-benchmark')}
                className={`block text-left text-sm sm:text-[15px] leading-tight transition-colors cursor-pointer ${
                  activeSection === 'benchmark'
                    ? 'font-bold text-black'
                    : 'font-medium text-slate-700 hover:text-[#008752]'
                }`}
              >
                Competitive Benchmark
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('detailed-summary')}
                className={`block text-left text-sm sm:text-[15px] leading-tight transition-colors cursor-pointer ${
                  activeSection === 'detailed'
                    ? 'font-bold text-black'
                    : 'font-medium text-slate-700 hover:text-[#008752]'
                }`}
              >
                Detailed Summary
              </button>
            </nav>

            {/* Right-Side Report Main Content Flow */}
            <div className="flex-1 min-w-0 space-y-8 w-full">
              {/* 1. Executive Summary: Dial, Composite Score & 5 Questions Breakdown */}
              <div id="executive-summary" className="scroll-mt-32">
                <ScoreHero report={report} />
              </div>

              {/* 2. Competitive Benchmark: Industry Benchmark & Competitive Ranking */}
              <div
                id="competitive-benchmark"
                className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-32"
              >
                <IndustryBenchmarkView
                  benchmark={report.benchmark}
                  availableIndustries={industries}
                  onSelectIndustry={handleIndustryChange}
                  isLoading={isLoading}
                  selectedIndustry={industry}
                />
              </div>

              {/* 3. Detailed Summary: Agent Capability & Information Gap Analysis */}
              <div
                id="detailed-summary"
                className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-32"
              >
                <AgentCapabilitiesView
                  failures={report.agentFailures}
                  gaps={report.informationGaps}
                  simulatedTasks={report.simulatedTasks}
                />
              </div>

              {/* 7-Tool Benchmark Matrix Suite */}
              <BenchmarkMatrixView report={report} />

              {/* Robots.txt & Bot Matrix */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <RobotsTxtView robots={report.robotsTxt} />
              </div>

              {/* AI Agent Readiness & Schema Matrix */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <SchemaView schema={report.schema} manifests={report.manifests} />
              </div>

              {/* 1-Click Code Remediation */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <RemediationView remediation={report.remediation} report={report} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* TeamLogic IT Corporate Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-600 mt-12">
        <TeamLogicBrandBar className="h-1.5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
            {/* Col 1: Brand */}
            <div className="md:col-span-2 space-y-3">
              <TeamLogicLogo variant="horizontal" className="h-10 sm:h-12" />
              <p className="text-xs text-slate-500 leading-relaxed max-w-md pt-2">
                TeamLogic IT provides managed IT services, cybersecurity, cloud architecture, and AI readiness advisory to businesses across North America. As Your Technology Advisor, we keep your business connected, secure, and competitive in the agentic era.
              </p>
            </div>

            {/* Col 2: Services */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Advisory Services
              </div>
              <ul className="space-y-1.5 text-slate-600">
                <li><a href="https://teamlogicit.com/managed-it-services" target="_blank" rel="noreferrer" className="hover:text-[#008752]">Managed IT Services</a></li>
                <li><a href="https://teamlogicit.com/cybersecurity" target="_blank" rel="noreferrer" className="hover:text-[#008752]">Cybersecurity & Compliance</a></li>
                <li><a href="https://teamlogicit.com/cloud-services" target="_blank" rel="noreferrer" className="hover:text-[#008752]">Cloud Solutions</a></li>
                <li><span className="text-[#008752] font-semibold">AI Agent Readiness Advisory</span></li>
              </ul>
            </div>

            {/* Col 3: Contact */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Connect With Us
              </div>
              <p className="text-slate-600">Cincinnati Ohio Office</p>
              <div className="pt-1 space-y-1">
                <a href="tel:5134459002" className="flex items-center gap-1.5 text-slate-900 font-bold hover:text-[#008752]">
                  <Phone className="w-3.5 h-3.5 text-[#008752]" />
                  <span>513-445-9002</span>
                </a>
                <a href="https://teamlogicit.com/contact-us" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#008752] font-medium hover:underline">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Cincinnati Ohio Advisory</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © {new Date().getFullYear()} TeamLogic, Inc. All rights reserved. TeamLogic IT® and Your Technology Advisor® are registered trademarks.
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <a href="https://teamlogicit.com/privacy-policy" target="_blank" rel="noreferrer" className="hover:underline">Privacy Policy</a>
              <span>·</span>
              <a href="https://teamlogicit.com/terms-of-use" target="_blank" rel="noreferrer" className="hover:underline">Terms of Use</a>
              <span>·</span>
              <span>Proprietary AgentReady™ Engine</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
