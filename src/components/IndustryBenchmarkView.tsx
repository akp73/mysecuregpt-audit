import React from 'react';
import {
  Trophy,
  BarChart3,
  Filter,
} from 'lucide-react';
import { IndustryBenchmark, BenchmarkCompany } from '../types/audit';

interface IndustryBenchmarkViewProps {
  benchmark: IndustryBenchmark;
  availableIndustries: { id: string; name: string; defaultMedian: number; top10: number }[];
  onSelectIndustry: (industryId: string) => void;
  isLoading: boolean;
  selectedIndustry?: string;
}

export const IndustryBenchmarkView: React.FC<IndustryBenchmarkViewProps> = ({
  benchmark,
  availableIndustries,
  onSelectIndustry,
  isLoading,
  selectedIndustry,
}) => {
  const {
    industryName,
    industryMedian,
    top10Percentile,
    targetRank,
    totalCompaniesInCohort,
    percentileRank,
    peerCohort,
  } = benchmark;

  const targetCompany = peerCohort.find(c => c.isTarget);
  const targetScore = targetCompany?.compositeScore || 0;
  const deltaFromMedian = targetScore - industryMedian;

  return (
    <div className="space-y-6">
      {/* Header & Industry Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008752]" />
            <span className="text-xs font-bold text-[#008752] uppercase tracking-wider">
              Market Intelligence & Peer Benchmark
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            Industry Benchmark & Competitive Ranking
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            How this domain compares to peer companies and industry standards in agent readiness.
          </p>
        </div>

        {/* Industry Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={selectedIndustry || benchmark.industryId}
            onChange={(e) => onSelectIndustry(e.target.value)}
            disabled={isLoading}
            className="bg-white border border-slate-300 text-xs text-slate-800 font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-[#008752] cursor-pointer shadow-2xs"
          >
            {availableIndustries.map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rank & Percentile Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cohort Rank */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-[#008752]/40 transition-colors">
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Cohort Standing</div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-[#008752]">#{targetRank}</span>
              <span className="text-sm text-slate-500 font-mono">of {totalCompaniesInCohort}</span>
            </div>
            <div className="text-xs text-slate-700 mt-1">
              In <strong className="text-slate-900">{industryName}</strong>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Ranked by composite agent score
          </div>
        </div>

        {/* Card 2: Percentile Rank */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-[#008752]/40 transition-colors">
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Percentile Tier</div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-[#00502C]">{percentileRank}th</span>
              <span className="text-xs text-[#008752] font-semibold">Percentile</span>
            </div>
            <div className="text-xs text-slate-700 mt-1">
              Outperforming {percentileRank}% of industry peers
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Relative to audited sample cohort
          </div>
        </div>

        {/* Card 3: Delta vs Industry Median */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-[#008752]/40 transition-colors">
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Vs. Industry Median</div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-mono ${deltaFromMedian >= 0 ? 'text-[#008752]' : 'text-rose-600'}`}>
                {deltaFromMedian >= 0 ? `+${deltaFromMedian}` : deltaFromMedian}
              </span>
              <span className="text-xs text-slate-500 font-medium">points</span>
            </div>
            <div className="text-xs text-slate-700 mt-1">
              Sector median is <strong className="text-slate-900">{industryMedian}/100</strong>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            {deltaFromMedian >= 0 ? 'Above peer average' : 'Below peer average'}
          </div>
        </div>

        {/* Card 4: Top 10% Benchmark */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-[#008752]/40 transition-colors">
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Top 10% Benchmark</div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-[#8CC63F] font-black">{top10Percentile}</span>
              <span className="text-xs text-slate-500 font-medium">pts</span>
            </div>
            <div className="text-xs text-slate-700 mt-1">
              Threshold for elite agent discoverability
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            {targetScore >= top10Percentile ? '✓ Meets top-tier standards' : `${top10Percentile - targetScore} pts to top tier`}
          </div>
        </div>
      </div>

      {/* Competitor Comparison Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#008752]" />
            <span className="font-bold text-sm text-slate-900">{industryName} Competitor Leaderboard</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {peerCohort.length} Audited Companies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 border-b border-slate-200 font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Company / Domain</th>
                <th className="py-3 px-4">Composite Score</th>
                <th className="py-3 px-4">Robots.txt</th>
                <th className="py-3 px-4">Schema.org</th>
                <th className="py-3 px-4">Actionability</th>
                <th className="py-3 px-4">Key Agent Advantage / Limitation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {peerCohort.map((company, idx) => {
                const isTarget = !!company.isTarget;
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isTarget
                        ? 'bg-emerald-50/70 text-slate-900 font-semibold border-l-4 border-l-[#008752]'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${
                        company.rank === 1
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 font-black'
                          : company.rank === 2
                          ? 'bg-slate-200 text-slate-700 border border-slate-300'
                          : company.rank === 3
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'text-slate-500'
                      }`}>
                        #{company.rank}
                      </span>
                    </td>

                    {/* Company Name & Domain */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{company.name}</span>
                        {isTarget && (
                          <span className="text-[10px] font-mono text-white bg-[#008752] px-1.5 py-0.5 rounded font-bold">
                            AUDITED DOMAIN
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 mt-0.5">{company.domain}</div>
                    </td>

                    {/* Composite Score & Grade */}
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${
                          company.compositeScore >= 80 ? 'text-[#008752]' :
                          company.compositeScore >= 60 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {company.compositeScore}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                          {company.grade}
                        </span>
                      </div>
                    </td>

                    {/* Robots.txt Score */}
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {company.robotsTxtScore}%
                    </td>

                    {/* Schema Score */}
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {company.schemaScore}%
                    </td>

                    {/* Actionability Score */}
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {company.actionabilityScore}%
                    </td>

                    {/* Key Advantage / Flaw */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs leading-relaxed text-[11px]">
                      {company.keyAdvantageOrFlaw}
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
