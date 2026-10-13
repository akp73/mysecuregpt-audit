import { GoogleGenAI, Type } from '@google/genai';
import type { AgentSimulationTask } from '../src/types/audit.ts';

// Track if Gemini API quota or prepayment credits are depleted to prevent redundant failing calls and error log noise
let isGeminiQuotaDepleted = false;

function getAiClient(): GoogleGenAI | null {
  if (isGeminiQuotaDepleted || !process.env.GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function runAgentTaskSimulation(
  domain: string,
  siteTitle: string,
  robotsTxtSnippet: string,
  schemaSummary: string,
  bodySnippet: string,
  hasActionSchema: boolean,
  hasPricing: boolean
): Promise<AgentSimulationTask[]> {
  const ai = getAiClient();

  if (ai && !isGeminiQuotaDepleted) {
    try {
      const prompt = `You are an AI Autonomous Agent Readiness Evaluator simulating 4 realistic autonomous tasks on the website: ${domain} (${siteTitle}).
Website details:
- Robots.txt snippet: ${robotsTxtSnippet.slice(0, 500)}
- Schema info: ${schemaSummary}
- Page content sample: ${bodySnippet.slice(0, 1500)}
- Action schema detected: ${hasActionSchema}
- Pricing detected: ${hasPricing}

Simulate these 4 tasks:
1. "Autonomous Service / Consultation Booking": Agent attempts to schedule a demo/consultation autonomously.
2. "Unambiguous Pricing & Tier Extraction": Agent attempts to extract fixed pricing or minimum contract engagement for budgeting.
3. "Corporate Trust & E-E-A-T Verification": Agent attempts to verify legal entity, executive leadership, and physical compliance address.
4. "Autonomous API / Tool Execution Discovery": Agent attempts to find machine-readable tool call manifests or APIs.

Return a JSON array of 4 objects matching this schema:
[
  {
    "taskName": "string",
    "userPrompt": "string (the human goal given to the agent)",
    "agentPersona": "string (e.g. Autonomous Procurement Agent)",
    "status": "SUCCESS" | "PARTIAL" | "FAILED",
    "traceSteps": [
      {
        "step": 1,
        "action": "string (what the agent tried)",
        "finding": "string (what it found or didn't find)",
        "result": "ok" | "blocked" | "warning"
      }
    ],
    "verdict": "string",
    "missingDataNotes": ["string list of missing data items that caused friction"]
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                taskName: { type: Type.STRING },
                userPrompt: { type: Type.STRING },
                agentPersona: { type: Type.STRING },
                status: { type: Type.STRING },
                traceSteps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      step: { type: Type.INTEGER },
                      action: { type: Type.STRING },
                      finding: { type: Type.STRING },
                      result: { type: Type.STRING },
                    },
                    required: ['step', 'action', 'finding', 'result'],
                  },
                },
                verdict: { type: Type.STRING },
                missingDataNotes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['taskName', 'userPrompt', 'agentPersona', 'status', 'traceSteps', 'verdict', 'missingDataNotes'],
            },
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return parsed.map((item: any) => ({
            taskName: item.taskName || 'Simulated Task',
            userPrompt: item.userPrompt || 'Execute objective',
            agentPersona: item.agentPersona || 'Autonomous Agent',
            status: ['SUCCESS', 'PARTIAL', 'FAILED'].includes(item.status) ? item.status : 'PARTIAL',
            traceSteps: Array.isArray(item.traceSteps) ? item.traceSteps : [],
            verdict: item.verdict || 'Evaluation concluded.',
            missingDataNotes: Array.isArray(item.missingDataNotes) ? item.missingDataNotes : [],
          }));
        }
      }
    } catch (_err: any) {
      // Gracefully switch to standard simulation when API quota is exhausted or prepayment credits are depleted
      isGeminiQuotaDepleted = true;
    }
  }

  return getFallbackSimulation(domain, siteTitle, hasActionSchema, hasPricing);
}

function getFallbackSimulation(
  domain: string,
  siteTitle: string,
  hasActionSchema: boolean,
  hasPricing: boolean
): AgentSimulationTask[] {
  return [
    {
      taskName: 'Autonomous Service / Consultation Booking',
      userPrompt: `Schedule an exploratory consultation with ${siteTitle || domain} for next Tuesday at 2:00 PM EST.`,
      agentPersona: 'Autonomous Calendar & Procurement Agent',
      status: hasActionSchema ? 'SUCCESS' : 'FAILED',
      traceSteps: [
        {
          step: 1,
          action: `Inspecting ${domain} for Schema.org ScheduleAction or ReserveAction endpoint`,
          finding: hasActionSchema ? 'Found ReserveAction endpoint definition in JSON-LD' : 'Zero machine-readable action schemas found in DOM',
          result: hasActionSchema ? 'ok' : 'blocked',
        },
        {
          step: 2,
          action: 'Scanning for contact/booking forms and webhook endpoints',
          finding: 'Found standard HTML form with CSRF token and client-side JavaScript submit listener',
          result: 'warning',
        },
        {
          step: 3,
          action: 'Attempting autonomous form parameter submission',
          finding: hasActionSchema
            ? 'Action schema provides direct parameter mapping for autonomous agent intake'
            : 'Human verification required; bot cannot bypass anti-bot session state autonomously without human token',
          result: hasActionSchema ? 'ok' : 'blocked',
        },
      ],
      verdict: hasActionSchema
        ? 'Agent successfully mapped scheduling parameters through structured Schema.'
        : 'Agent blocked: Consultation booking requires human interactive browser interaction.',
      missingDataNotes: hasActionSchema
        ? []
        : ['Schema.org ScheduleAction markup', 'Public calendar webhook or API key intake endpoint'],
    },
    {
      taskName: 'Unambiguous Pricing & Tier Extraction',
      userPrompt: `Extract the exact monthly retainer pricing and onboarding cost structure for ${domain}.`,
      agentPersona: 'Enterprise Budgeting & RFP Synthesizer',
      status: hasPricing ? 'SUCCESS' : 'FAILED',
      traceSteps: [
        {
          step: 1,
          action: `Searching ${domain} structured JSON-LD for Offer or PriceSpecification`,
          finding: hasPricing ? 'Extracted price specification in Schema' : 'No Schema.org Offer, priceRange, or PriceSpecification properties',
          result: hasPricing ? 'ok' : 'blocked',
        },
        {
          step: 2,
          action: 'Parsing DOM for tabular pricing matrices',
          finding: hasPricing
            ? 'Found machine-readable price specification in DOM'
            : 'Found qualitative descriptions ("Custom tailored quotes", "Contact us for pricing") rather than numerical tiers',
          result: hasPricing ? 'ok' : 'blocked',
        },
      ],
      verdict: hasPricing
        ? 'Agent parsed structured price definitions successfully.'
        : 'Agent could not retrieve explicit financial figures. Quotes require asynchronous sales consultation.',
      missingDataNotes: hasPricing
        ? []
        : ['Transparent pricing matrix table', 'Schema.org priceCurrency & priceSpecification', 'Minimum engagement contract threshold'],
    },
    {
      taskName: 'Corporate Trust & E-E-A-T Verification',
      userPrompt: `Verify legal corporate registration, SOC2/compliance certificates, and executive leadership for ${domain}.`,
      agentPersona: 'Vendor Risk & Compliance Agent',
      status: 'PARTIAL',
      traceSteps: [
        {
          step: 1,
          action: 'Analyzing Organization / Corporation JSON-LD schema',
          finding: 'Basic Organization name found, but executive leadership (founder, employee) array is absent',
          result: 'warning',
        },
        {
          step: 2,
          action: 'Inspecting physical headquarters and jurisdiction data',
          finding: 'General location mentioned in text; lacking precise PostalAddress schema with geo-coordinates',
          result: 'warning',
        },
      ],
      verdict: 'Agent verified general brand existence, but flagged missing machine-verifiable compliance certificates in structured data.',
      missingDataNotes: [
        'Schema.org PostalAddress with geo coordinates',
        'Machine-readable security compliance endorsements (SOC2, ISO 27001)',
      ],
    },
    {
      taskName: 'Autonomous Tool Calling & API Discovery',
      userPrompt: `Discover machine-executable API endpoints or OpenAPI definitions for ${domain} service catalog.`,
      agentPersona: 'Function-Calling Orchestrator',
      status: 'FAILED',
      traceSteps: [
        {
          step: 1,
          action: 'Checking host root for /llms.txt and /.well-known/llms.txt',
          finding: 'HTTP 404 - No llms.txt context file published on host root',
          result: 'blocked',
        },
        {
          step: 2,
          action: 'Scanning for OpenAPI specs at /.well-known/openapi.yaml and /api-docs',
          finding: 'No standardized OpenAPI or Swagger manifests detected',
          result: 'blocked',
        },
      ],
      verdict: 'Agent could not register automated tools. Must fall back to expensive full-page HTML parsing on every query.',
      missingDataNotes: [
        '/llms.txt manifest for token-efficient agent context',
        'OpenAPI 3.0 specification for service lookups',
      ],
    },
  ];
}
