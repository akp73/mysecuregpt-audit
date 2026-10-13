export interface BotPermission {
  botName: string;
  vendor: string;
  purpose: 'Agent Task / Search' | 'Model Training' | 'Web Indexing' | 'AI Browsing';
  status: 'ALLOWED' | 'BLOCKED' | 'PARTIALLY_RESTRICTED' | 'NOT_MENTIONED_ALLOWED';
  details: string;
  disallowedPaths: string[];
  allowedPaths: string[];
}

export interface RobotsTxtAnalysis {
  found: boolean;
  url: string;
  rawText: string;
  totalRules: number;
  sitemaps: string[];
  crawlDelay?: number;
  bots: BotPermission[];
  score: number; // 0-100
  summary: string;
}

export interface SchemaItem {
  type: string;
  context: string;
  name?: string;
  description?: string;
  propertiesFound: string[];
  missingCrucialProperties: string[];
  valid: boolean;
  rawJson?: any;
}

export interface SchemaAnalysis {
  found: boolean;
  totalSchemas: number;
  schemaTypes: string[];
  items: SchemaItem[];
  hasOrganization: boolean;
  hasLocalBusiness: boolean;
  hasServiceOrProduct: boolean;
  hasFaq: boolean;
  hasBreadcrumbs: boolean;
  hasActionSchema: boolean;
  hasMicrodata: boolean;
  hasOpenGraph: boolean;
  score: number; // 0-100
  summary: string;
}

export interface MachineManifests {
  llmsTxt: {
    found: boolean;
    url?: string;
    content?: string;
  };
  aiPluginJson: {
    found: boolean;
    url?: string;
  };
  sitemapXml: {
    found: boolean;
    url?: string;
  };
  openApi: {
    found: boolean;
    url?: string;
  };
}

export interface AgentCapabilityFailure {
  capability: string;
  category: 'Transactional' | 'Navigation' | 'Information Retrieval' | 'Authentication / Anti-Bot' | 'Tool Calling';
  status: 'FAILED' | 'PARTIAL' | 'PASSED';
  whatAgentFailedToDo: string;
  technicalRootCause: string;
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedFix: string;
}

export interface InformationGap {
  informationField: string;
  category: 'Pricing & Packaging' | 'Contact & Escalation' | 'Service Level & SLA' | 'Corporate Authority' | 'Location & Availability';
  status: 'MISSING' | 'AMBIGUOUS' | 'FOUND';
  whatCouldNotBeGathered: string;
  whyAgentNeedsIt: string;
  recommendedSchemaOrTag: string;
}

export interface AgentSimulationTask {
  taskName: string;
  userPrompt: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  agentPersona: string;
  traceSteps: {
    step: number;
    action: string;
    finding: string;
    result: 'ok' | 'blocked' | 'warning';
  }[];
  verdict: string;
  missingDataNotes: string[];
}

export interface BenchmarkCompany {
  name: string;
  domain: string;
  isTarget?: boolean;
  compositeScore: number;
  robotsTxtScore: number;
  schemaScore: number;
  actionabilityScore: number;
  rank: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  keyAdvantageOrFlaw: string;
}

export interface IndustryBenchmark {
  industryId: string;
  industryName: string;
  industryMedian: number;
  top10Percentile: number;
  targetRank: number;
  totalCompaniesInCohort: number;
  percentileRank: number;
  peerCohort: BenchmarkCompany[];
}

export interface CheckItem {
  name: string;
  passed: boolean;
  weight: number;
  description: string;
}

export interface DialCategory {
  id: string;
  name: string;
  score: number; // 0-100
  passedCount: number;
  totalCount: number;
  fractionDisplay: string; // e.g. "2/4"
  status: 'passed' | 'partial' | 'failed' | 'not_checked';
  checks: CheckItem[];
  description: string;
}

export interface DialReadinessBreakdown {
  level: 1 | 2 | 3 | 4 | 5;
  levelTitle: string; // e.g. "Business doesn't exist." | "Can't find products or services." | "Can't buy or book a meeting." | "Can't buy without human." | "All system go."
  categories: {
    discoverability: DialCategory;
    content: DialCategory;
    botAccess: DialCategory;
    apiMcp: DialCategory;
    commerce: DialCategory;
  };
}

export interface AgentQuestionRating {
  id: string;
  question: string;
  score: number; // 1 to 100
  status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  summary: string;
  keyFactors: {
    label: string;
    positive: boolean;
    impact: string;
  }[];
}

export interface QuestionsBreakdown {
  findAndTrust: AgentQuestionRating;
  findInformation: AgentQuestionRating;
  productsAndServices: AgentQuestionRating;
  contactEasily: AgentQuestionRating;
  browseEasily: AgentQuestionRating;
}

export interface AgentReadinessToolBenchmark {
  id: 'oraAi' | 'isitAgentReady' | 'webYes' | 'siteSpeak' | 'chatThing' | 'agenticCommerce' | 'aiCommerceReady';
  order: number;
  name: string;
  url: string;
  displayUrl: string;
  score: number; // 0-100
  status: 'passed' | 'warning' | 'failed';
  focus: string;
  summary: string;
  keyFindings: string[];
  metrics: { label: string; value: string; passed: boolean }[];
}

export interface CompositeScoreBreakdown {
  compositeScore: number; // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  // 7 Source-aligned methodology scores:
  oraAiScore: number; // 1. Ora.ai
  isitAgentReadyScore: number; // 2. isitagentready.com
  webYesScore: number; // 3. https://www.webyes.com/agent-readiness/
  siteSpeakScore: number; // 4. sitespeak.ai/tools/ai-agent-readiness-scanner
  chatThingScore: number; // 5. chatthing.ai/tools/agent-readiness-checker
  agenticCommerceScore: number; // 6. agenticcommerce.shop
  aiCommerceReadyScore: number; // 7. AI Commerce Ready
  tools: AgentReadinessToolBenchmark[];
  dimensionScores: {
    crawlability: number;
    structuredSchema: number;
    actionability: number;
    semanticClarity: number;
    machineProtocols: number;
  };
  dialBreakdown: DialReadinessBreakdown;
  questionsBreakdown: QuestionsBreakdown;
  overallVerdict: string;
  executiveSummary: string;
}

export interface RemediationSnippets {
  llmsTxtSnippet: string;
  robotsTxtSnippet: string;
  jsonLdSnippet: string;
}

export interface AuditReport {
  targetUrl: string;
  domain: string;
  businessName?: string;
  industry: string;
  timestamp: string;
  composite: CompositeScoreBreakdown;
  robotsTxt: RobotsTxtAnalysis;
  schema: SchemaAnalysis;
  manifests: MachineManifests;
  agentFailures: AgentCapabilityFailure[];
  informationGaps: InformationGap[];
  simulatedTasks: AgentSimulationTask[];
  benchmark: IndustryBenchmark;
  remediation: RemediationSnippets;
  wafOrBotShieldDetected: boolean;
  htmlMeta: {
    title: string;
    description: string;
    wordCount: number;
    hasMainTag: boolean;
    hasForms: boolean;
    totalLinks: number;
  };
}
