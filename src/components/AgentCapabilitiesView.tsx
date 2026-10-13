import React, { useState } from 'react';
import {
  AlertOctagon,
  HelpCircle,
  Terminal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldAlert,
} from 'lucide-react';
import { AgentCapabilityFailure, InformationGap, AgentSimulationTask } from '../types/audit';

interface AgentCapabilitiesViewProps {
  failures: AgentCapabilityFailure[];
  gaps: InformationGap[];
  simulatedTasks: AgentSimulationTask[];
}

export const AgentCapabilitiesView: React.FC<AgentCapabilitiesViewProps> = ({
  failures,
  gaps,
  simulatedTasks,
}) => {
  const [activeTab, setActiveTab] = useState<'capabilities' | 'information' | 'simulation'>('capabilities');
  const [expandedTaskIdx, setExpandedTaskIdx] = useState<number | null>(0);

  const failedCapabilitiesCount = failures.filter(f => f.status === 'FAILED').length;
  const missingInfoCount = gaps.filter(g => g.status === 'MISSING').length;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008752]" />
            <span className="text-xs font-bold text-[#008752] uppercase tracking-wider">
              TeamLogic IT Technical Assessment
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            Agent Capability & Information Gap Analysis
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Exact points where autonomous AI agents encounter operational barriers or missing structured context.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('capabilities')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'capabilities'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
            Capability Blocks ({failedCapabilitiesCount})
          </button>
          <button
            onClick={() => setActiveTab('information')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'information'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            Missing Data ({missingInfoCount})
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'simulation'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#008752]" />
            Simulated Agent Runs ({simulatedTasks.length})
          </button>
        </div>
      </div>

      {/* Tab 1: What Specifically Agent Could NOT Do */}
      {activeTab === 'capabilities' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#008752] shrink-0" />
            <span>
              Autonomous agents execute goal-directed tasks (requesting quotes, scheduling service calls, querying APIs). Below is the exact breakdown of what an agent failed to execute on this site.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {failures.map((item, idx) => {
              const isFailed = item.status === 'FAILED';
              const isPartial = item.status === 'PARTIAL';
              return (
                <div
                  key={idx}
                  className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${
                    isFailed
                      ? 'border-rose-200 hover:border-rose-300'
                      : isPartial
                      ? 'border-amber-200 hover:border-amber-300'
                      : 'border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      {isFailed ? (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      ) : isPartial ? (
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-[#008752] shrink-0" />
                      )}
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{item.capability}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>Category: <strong className="text-slate-700">{item.category}</strong></span>
                          <span>·</span>
                          <span>Impact: <strong className={item.impactLevel === 'HIGH' ? 'text-rose-600' : 'text-amber-600'}>{item.impactLevel}</strong></span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                        isFailed
                          ? 'text-rose-700 border-rose-200 bg-rose-50'
                          : isPartial
                          ? 'text-amber-700 border-amber-200 bg-amber-50'
                          : 'text-[#008752] border-emerald-200 bg-emerald-50'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">What Agent Was Unable To Do:</span>
                      <p className="text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {item.whatAgentFailedToDo}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Technical Root Cause:</span>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px]">
                        {item.technicalRootCause}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-[#008752] font-bold shrink-0">TeamLogic IT Recommendation:</span>
                    <span>{item.recommendedFix}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: What Specific Information Could NOT Be Gathered */}
      {activeTab === 'information' && (
        <div className="space-y-4">
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span>
              Autonomous assistants (Perplexity, ChatGPT, Claude) filter out marketing fluff and look for deterministic structured facts. Here is what could not be gathered.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gaps.map((gap, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <span className="font-bold text-slate-900 text-sm">{gap.informationField}</span>
                    <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      {gap.status}
                    </span>
                  </div>

                  <div className="space-y-3 mt-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold block mb-0.5">Information Not Gathered:</span>
                      <p className="text-slate-800">{gap.whatCouldNotBeGathered}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block mb-0.5">Why Autonomous Agents Require It:</span>
                      <p className="text-slate-600 leading-relaxed">{gap.whyAgentNeedsIt}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-semibold">Recommended Schema / Property:</span>
                  <div className="font-mono text-[#00502C] bg-emerald-50/60 p-2 rounded mt-1 border border-emerald-200 break-all text-[11px] font-medium">
                    {gap.recommendedSchemaOrTag}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Autonomous Agent Simulation Traces */}
      {activeTab === 'simulation' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#008752]" />
              <span>Simulated Persona Agent Execution: Gemini simulated 4 real-world autonomous tasks against this site.</span>
            </div>
            <span className="text-xs font-mono text-slate-500">Model: gemini-2.5-flash</span>
          </div>

          <div className="space-y-3">
            {simulatedTasks.map((task, idx) => {
              const isExpanded = expandedTaskIdx === idx;
              const isSuccess = task.status === 'SUCCESS';
              const isFailed = task.status === 'FAILED';

              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setExpandedTaskIdx(isExpanded ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {isSuccess ? (
                        <CheckCircle2 className="w-5 h-5 text-[#008752] shrink-0" />
                      ) : isFailed ? (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{task.taskName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Persona: <span className="text-slate-800 font-mono font-medium">{task.agentPersona}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                          isSuccess
                            ? 'text-[#008752] border-emerald-200 bg-emerald-50'
                            : isFailed
                            ? 'text-rose-700 border-rose-200 bg-rose-50'
                            : 'text-amber-700 border-amber-200 bg-amber-50'
                        }`}
                      >
                        {task.status}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-4">
                      {/* User Goal Prompt */}
                      <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                        <span className="text-slate-500 font-bold block mb-1">Human Directive Given to Agent:</span>
                        <p className="text-slate-800 font-mono">"{task.userPrompt}"</p>
                      </div>

                      {/* Execution Steps Trace */}
                      <div>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                          Step-by-Step Agent Trace:
                        </span>
                        <div className="space-y-2">
                          {task.traceSteps.map((step, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex items-start gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200 shadow-2xs"
                            >
                              <span className="font-mono text-[#008752] font-bold shrink-0">Step {step.step}</span>
                              <div className="flex-1 space-y-1">
                                <div className="text-slate-900 font-medium">{step.action}</div>
                                <div className="text-slate-600 font-mono text-[11px]">{step.finding}</div>
                              </div>
                              <span
                                className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                                  step.result === 'ok'
                                    ? 'text-[#008752] bg-emerald-50 border border-emerald-200'
                                    : step.result === 'blocked'
                                    ? 'text-rose-700 bg-rose-50 border border-rose-200'
                                    : 'text-amber-700 bg-amber-50 border border-amber-200'
                                }`}
                              >
                                {step.result}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Verdict & Missing Data Notes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <span className="text-slate-500 font-bold block mb-1">Simulated Outcome:</span>
                          <p className="text-slate-800">{task.verdict}</p>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <span className="text-slate-500 font-bold block mb-1">Blocking Factors:</span>
                          {task.missingDataNotes.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-rose-600 font-medium">
                              {task.missingDataNotes.map((note, nIdx) => (
                                <li key={nIdx}>{note}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-[#008752] font-medium">Zero blocking factors encountered.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
