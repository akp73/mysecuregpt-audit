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

export default function App() {
  const [urlInput, setUrlInput] = useState('https://us.pg.com/');
  const [industry, setIndustry] = useState('consumer_goods');
  const [industries, setIndustries] = useState<
    { id: string; name: string; defaultMedian: number; top10: number }[]
  >(INITIAL_INDUSTRY_OPTIONS);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'tools' | 'capabilities' | 'robots' | 'schema' | 'benchmark' | 'remediation'
  >('overview');

  const [report, setReport] = useState<AuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Initial audit of default url (https://us.pg.com/)
  useEffect(() => {
    runAudit('https://us.pg.com/', 'consumer_goods');
  }, []);

  const runAudit = async (targetUrl: string, targetIndustry: string) => {
    if (!targetUrl.trim()) return;
    setIsLoading(true);
    setError(null);

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

  const handleSwitchIndustry = (newIndustryId: string) => {
    setIndustry(newIndustryId);
    if (report) {
      runAudit(report.domain, newIndustryId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* TeamLogic IT Branded Header */}
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TeamLogic IT Hero Search Section */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-white via-emerald-50/20 to-slate-50">
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black tracking-tight leading-tight font-inter">
                Can Your Website Turn AI Searches Into Leads?
              </h1>
            </div>

            {/* Audit Input Form */}
            <form onSubmit={handleAuditSubmit} className="mt-6 flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4 text-[#008752]" />
                  </div>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://us.pg.com/ or yourcompany.com"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#008752] focus:ring-1 focus:ring-[#008752] transition-colors shadow-2xs"
                  />
                </div>
              </div>

              <div className="sm:w-64">
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Select Your Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-[#008752] focus:ring-1 focus:ring-[#008752] cursor-pointer shadow-2xs"
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
                className="bg-[#008752] hover:bg-[#007043] text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow disabled:opacity-50 cursor-pointer text-sm shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Site...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Audit Website</span>
                  </>
                )}
              </button>
            </form>



            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}
          </div>
          <TeamLogicBrandBar className="h-1" />
        </section>

        {/* Live Multi-Tool Data Gathering Progress (0 to 100) */}
        {isLoading && (
          <MultiToolProgressPanel
            targetUrl={urlInput}
            isAuditing={isLoading}
          />
        )}

        {/* Report Content */}
        {report && (
          <div className="space-y-8">
            {/* Scorecard Hero Banner */}
            <ScoreHero report={report} />

            {/* Navigation Tabs */}
            <div className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-[#008752] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                Comprehensive Overview
              </button>

              <button
                onClick={() => setActiveTab('tools')}
                className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'tools'
                    ? 'bg-[#008752] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                7-Tool Benchmark Matrix
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                  7 Tools
                </span>
              </button>

              <button
                onClick={() => setActiveTab('capabilities')}
                className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'capabilities'
                    ? 'bg-[#008752] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Bot className="w-4 h-4" />
                Agent Capability & Info Gaps
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold">
                  {report.agentFailures.filter((f) => f.status === 'FAILED').length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('robots')}
                className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'robots'
                    ? 'bg-[#008752] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Cpu className="w-4 h-4" />
                Robots.txt & Bot Matrix
              </button>

              <button
                onClick={() => setActiveTab('schema')}
                className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'schema'
                    ? 'bg-[#008752] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileJson className="w-4 h-4" />
                AI Agent Readiness
              </button>

              <button
                onClick={() => setActiveTab('benchmark')}
                className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'benchmark'
                    ? 'bg-[#008752] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Industry Benchmark & Competitors
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                  #{report.benchmark.targetRank}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('remediation')}
                className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'remediation'
                    ? 'bg-[#008752] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Code className="w-4 h-4" />
                1-Click Code Remediation
              </button>
            </div>

            {/* Active Tab Panel */}
            <div className="pt-2">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* 7-Tool Benchmark Matrix Suite */}
                  <BenchmarkMatrixView report={report} />

                  {/* Highlight Agent Capability Section */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <AgentCapabilitiesView
                      failures={report.agentFailures}
                      gaps={report.informationGaps}
                      simulatedTasks={report.simulatedTasks}
                    />
                  </div>

                  {/* Competitor Benchmark Snapshot */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <IndustryBenchmarkView
                      benchmark={report.benchmark}
                      availableIndustries={industries}
                      onSelectIndustry={handleSwitchIndustry}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'tools' && (
                <BenchmarkMatrixView report={report} />
              )}

              {activeTab === 'capabilities' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <AgentCapabilitiesView
                    failures={report.agentFailures}
                    gaps={report.informationGaps}
                    simulatedTasks={report.simulatedTasks}
                  />
                </div>
              )}

              {activeTab === 'robots' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <RobotsTxtView robots={report.robotsTxt} />
                </div>
              )}

              {activeTab === 'schema' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <SchemaView schema={report.schema} manifests={report.manifests} />
                </div>
              )}

              {activeTab === 'benchmark' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <IndustryBenchmarkView
                    benchmark={report.benchmark}
                    availableIndustries={industries}
                    onSelectIndustry={handleSwitchIndustry}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {activeTab === 'remediation' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <RemediationView remediation={report.remediation} report={report} />
                </div>
              )}
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
