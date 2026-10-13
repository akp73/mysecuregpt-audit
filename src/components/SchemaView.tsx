import React, { useState } from 'react';
import {
  FileJson,
  CheckCircle2,
  XCircle,
  Code2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react';
import { SchemaAnalysis, MachineManifests } from '../types/audit';

interface SchemaViewProps {
  schema: SchemaAnalysis;
  manifests: MachineManifests;
}

export const SchemaView: React.FC<SchemaViewProps> = ({ schema, manifests }) => {
  const [selectedSchemaIdx, setSelectedSchemaIdx] = useState<number | null>(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopyJson = (idx: number, json: any) => {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008752]" />
            <span className="text-xs font-bold text-[#008752] uppercase tracking-wider">
              AI Agent Readiness
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            Structured Schema & Machine Protocols
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Schema.org JSON-LD entity graph, OpenGraph tags, and modern AI context manifests.
          </p>
        </div>

        <div className="text-xs text-slate-700 border border-slate-200 bg-white px-3 py-1.5 rounded-lg shadow-2xs">
          Schemas Found: <strong className="text-[#008752] font-mono font-bold">{schema.totalSchemas}</strong>
          {' '}·{' '}
          Score: <strong className="text-[#008752] font-mono font-bold">{schema.score}/100</strong>
        </div>
      </div>

      {/* Machine Protocols & Manifests Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* llms.txt */}
        <div className={`p-4 rounded-xl border bg-white shadow-2xs flex flex-col justify-between ${
          manifests.llmsTxt.found
            ? 'border-emerald-300 ring-1 ring-emerald-200'
            : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-900">/llms.txt</span>
            {manifests.llmsTxt.found ? (
              <CheckCircle2 className="w-4 h-4 text-[#008752]" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 font-medium">
            {manifests.llmsTxt.found ? 'Active & parsed' : 'Missing context file'}
          </span>
        </div>

        {/* sitemap.xml */}
        <div className={`p-4 rounded-xl border bg-white shadow-2xs flex flex-col justify-between ${
          manifests.sitemapXml.found
            ? 'border-emerald-300 ring-1 ring-emerald-200'
            : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-900">/sitemap.xml</span>
            {manifests.sitemapXml.found ? (
              <CheckCircle2 className="w-4 h-4 text-[#008752]" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 font-medium">
            {manifests.sitemapXml.found ? 'Sitemap declared' : 'No sitemap found'}
          </span>
        </div>

        {/* OpenAPI */}
        <div className={`p-4 rounded-xl border bg-white shadow-2xs flex flex-col justify-between ${
          manifests.openApi.found
            ? 'border-emerald-300 ring-1 ring-emerald-200'
            : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-900">OpenAPI Spec</span>
            {manifests.openApi.found ? (
              <CheckCircle2 className="w-4 h-4 text-[#008752]" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 font-medium">
            {manifests.openApi.found ? 'Public endpoint' : 'No public tool spec'}
          </span>
        </div>

        {/* AI Plugin */}
        <div className={`p-4 rounded-xl border bg-white shadow-2xs flex flex-col justify-between ${
          manifests.aiPluginJson.found
            ? 'border-emerald-300 ring-1 ring-emerald-200'
            : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-900">ai-plugin.json</span>
            {manifests.aiPluginJson.found ? (
              <CheckCircle2 className="w-4 h-4 text-[#008752]" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 font-medium">
            {manifests.aiPluginJson.found ? 'Plugin registered' : 'No manifest'}
          </span>
        </div>
      </div>

      {/* Detected Schemas Checklist */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Essential Schema.org Entity Verification
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className={`p-3 rounded-lg border flex items-center gap-2 ${schema.hasOrganization ? 'border-emerald-200 bg-emerald-50 text-emerald-900 font-semibold' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
            {schema.hasOrganization ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[#008752]" /> : <XCircle className="w-4 h-4 shrink-0" />}
            <span>Organization</span>
          </div>

          <div className={`p-3 rounded-lg border flex items-center gap-2 ${schema.hasLocalBusiness ? 'border-emerald-200 bg-emerald-50 text-emerald-900 font-semibold' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
            {schema.hasLocalBusiness ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[#008752]" /> : <XCircle className="w-4 h-4 shrink-0" />}
            <span>LocalBusiness</span>
          </div>

          <div className={`p-3 rounded-lg border flex items-center gap-2 ${schema.hasServiceOrProduct ? 'border-emerald-200 bg-emerald-50 text-emerald-900 font-semibold' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
            {schema.hasServiceOrProduct ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[#008752]" /> : <XCircle className="w-4 h-4 shrink-0" />}
            <span>Service / Product</span>
          </div>

          <div className={`p-3 rounded-lg border flex items-center gap-2 ${schema.hasFaq ? 'border-emerald-200 bg-emerald-50 text-emerald-900 font-semibold' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
            {schema.hasFaq ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[#008752]" /> : <XCircle className="w-4 h-4 shrink-0" />}
            <span>FAQPage</span>
          </div>

          <div className={`p-3 rounded-lg border flex items-center gap-2 ${schema.hasBreadcrumbs ? 'border-emerald-200 bg-emerald-50 text-emerald-900 font-semibold' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
            {schema.hasBreadcrumbs ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[#008752]" /> : <XCircle className="w-4 h-4 shrink-0" />}
            <span>BreadcrumbList</span>
          </div>

          <div className={`p-3 rounded-lg border flex items-center gap-2 ${schema.hasActionSchema ? 'border-emerald-200 bg-emerald-50 text-emerald-900 font-semibold' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
            {schema.hasActionSchema ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[#008752]" /> : <XCircle className="w-4 h-4 shrink-0" />}
            <span>Action Schema</span>
          </div>
        </div>
      </div>

      {/* Discovered JSON-LD Entities List */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-900">Discovered JSON-LD Schema Blocks ({schema.items.length})</h4>

        {schema.items.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-sm shadow-sm">
            Zero structured JSON-LD entities detected on this page. AI agents cannot extract structured business facts without guessing.
          </div>
        ) : (
          schema.items.map((item, idx) => {
            const isSelected = selectedSchemaIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs transition-all"
              >
                <div
                  onClick={() => setSelectedSchemaIdx(isSelected ? null : idx)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Code2 className="w-4 h-4 text-[#008752]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">@{item.type}</span>
                        {item.name && <span className="text-xs text-slate-500 font-medium">({item.name})</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Properties: <span className="text-slate-800">{item.propertiesFound.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.missingCrucialProperties.length > 0 && (
                      <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-mono hidden sm:inline">
                        Missing: {item.missingCrucialProperties.slice(0, 2).join(', ')}
                      </span>
                    )}
                    {isSelected ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isSelected && item.rawJson && (
                  <div className="p-4 pt-0 border-t border-slate-100 bg-slate-950">
                    <div className="flex items-center justify-between my-2 text-xs text-slate-300">
                      <span>Raw Structured JSON Payload</span>
                      <button
                        onClick={() => handleCopyJson(idx, item.rawJson)}
                        className="flex items-center gap-1 text-slate-200 hover:text-white bg-slate-800 px-2.5 py-1 rounded border border-slate-700 cursor-pointer text-[11px]"
                      >
                        {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIdx === idx ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto max-h-56 leading-relaxed">
                      {JSON.stringify(item.rawJson, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
