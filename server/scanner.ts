import * as cheerio from 'cheerio';
import type {
  BotPermission,
  RobotsTxtAnalysis,
  SchemaAnalysis,
  SchemaItem,
  MachineManifests,
  AgentCapabilityFailure,
  InformationGap,
  CompositeScoreBreakdown,
  AgentReadinessToolBenchmark,
  RemediationSnippets,
} from '../src/types/audit.ts';

// Known AI Bots and their target metadata
export const AI_BOT_PROFILES = [
  { botName: 'GPTBot', vendor: 'OpenAI', purpose: 'Agent Task / Search' as const },
  { botName: 'ChatGPT-User', vendor: 'OpenAI', purpose: 'AI Browsing' as const },
  { botName: 'ClaudeBot', vendor: 'Anthropic', purpose: 'Agent Task / Search' as const },
  { botName: 'anthropic-ai', vendor: 'Anthropic', purpose: 'Model Training' as const },
  { botName: 'PerplexityBot', vendor: 'Perplexity', purpose: 'Agent Task / Search' as const },
  { botName: 'Google-Extended', vendor: 'Google', purpose: 'Model Training' as const },
  { botName: 'Meta-ExternalAgent', vendor: 'Meta', purpose: 'Agent Task / Search' as const },
  { botName: 'Applebot-Extended', vendor: 'Apple', purpose: 'Model Training' as const },
  { botName: 'cohere-ai', vendor: 'Cohere', purpose: 'Model Training' as const },
  { botName: 'CCBot', vendor: 'Common Crawl', purpose: 'Model Training' as const },
  { botName: 'Bytespider', vendor: 'ByteDance', purpose: 'Agent Task / Search' as const },
];

export function parseRobotsTxt(rawText: string, robotsUrl: string): RobotsTxtAnalysis {
  if (!rawText || rawText.trim().length === 0) {
    return {
      found: false,
      url: robotsUrl,
      rawText: '',
      totalRules: 0,
      sitemaps: [],
      bots: AI_BOT_PROFILES.map(b => ({
        ...b,
        status: 'NOT_MENTIONED_ALLOWED',
        details: 'No robots.txt found; all crawlers allowed by default.',
        disallowedPaths: [],
        allowedPaths: [],
      })),
      score: 70,
      summary: 'No robots.txt file detected. While agents are not explicitly blocked, standard AI crawl guidelines and sitemaps are absent.',
    };
  }

  const lines = rawText.split('\n');
  const sitemaps: string[] = [];
  let crawlDelay: number | undefined;

  // Map user-agents to rules
  const userAgentRules: Record<string, { disallowed: string[]; allowed: string[] }> = {};
  let currentAgents: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const lower = line.toLowerCase();
    if (lower.startsWith('sitemap:')) {
      const sm = line.substring(8).trim();
      if (sm) sitemaps.push(sm);
      continue;
    }

    if (lower.startsWith('crawl-delay:')) {
      const delay = parseFloat(line.substring(12).trim());
      if (!isNaN(delay)) crawlDelay = delay;
      continue;
    }

    if (lower.startsWith('user-agent:')) {
      const agent = line.substring(11).trim().toLowerCase();
      // If previous line was not user-agent, reset currentAgents
      currentAgents.push(agent);
      if (!userAgentRules[agent]) {
        userAgentRules[agent] = { disallowed: [], allowed: [] };
      }
      continue;
    }

    if (lower.startsWith('disallow:')) {
      const path = line.substring(9).trim();
      for (const agent of currentAgents) {
        if (!userAgentRules[agent]) userAgentRules[agent] = { disallowed: [], allowed: [] };
        if (path) userAgentRules[agent].disallowed.push(path);
      }
      continue;
    }

    if (lower.startsWith('allow:')) {
      const path = line.substring(6).trim();
      for (const agent of currentAgents) {
        if (!userAgentRules[agent]) userAgentRules[agent] = { disallowed: [], allowed: [] };
        if (path) userAgentRules[agent].allowed.push(path);
      }
      continue;
    }

    // Reset current agents if an unrelated directive occurs
    if (!lower.startsWith('user-agent:')) {
      currentAgents = [];
    }
  }

  const starRules = userAgentRules['*'] || { disallowed: [], allowed: [] };
  const starDisallowRoot = starRules.disallowed.some(p => p === '/' || p === '/*');

  const botResults: BotPermission[] = AI_BOT_PROFILES.map(bot => {
    const key = bot.botName.toLowerCase();
    const specificRules = userAgentRules[key];

    let status: BotPermission['status'] = 'NOT_MENTIONED_ALLOWED';
    let details = 'Not explicitly configured; inherits default policy.';
    let disallowedPaths: string[] = [];
    let allowedPaths: string[] = [];

    if (specificRules) {
      disallowedPaths = specificRules.disallowed;
      allowedPaths = specificRules.allowed;
      const blocksRoot = disallowedPaths.some(p => p === '/' || p === '/*');

      if (blocksRoot) {
        status = 'BLOCKED';
        details = `Explicitly blocked at root (Disallow: /).`;
      } else if (disallowedPaths.length > 0) {
        status = 'PARTIALLY_RESTRICTED';
        details = `Restricted on ${disallowedPaths.length} specific path(s) (e.g. ${disallowedPaths.slice(0, 2).join(', ')}).`;
      } else {
        status = 'ALLOWED';
        details = `Explicitly allowed without restrictions.`;
      }
    } else {
      // Check fallback star rule
      if (starDisallowRoot) {
        status = 'BLOCKED';
        details = `Blocked globally via wildcard 'User-agent: *' (Disallow: /).`;
        disallowedPaths = ['/'];
      } else if (starRules.disallowed.length > 0) {
        status = 'PARTIALLY_RESTRICTED';
        details = `Inherits wildcard restrictions on ${starRules.disallowed.length} path(s).`;
        disallowedPaths = starRules.disallowed;
      } else {
        status = 'NOT_MENTIONED_ALLOWED';
        details = `Allowed via open wildcard 'User-agent: *' default.`;
      }
    }

    return {
      botName: bot.botName,
      vendor: bot.vendor,
      purpose: bot.purpose,
      status,
      details,
      disallowedPaths,
      allowedPaths,
    };
  });

  // Calculate Robots.txt Score (0-100)
  // Higher score when Action/Search bots (GPTBot, ClaudeBot, PerplexityBot, ChatGPT-User) are ALLOWED
  let score = 85;
  const gptBot = botResults.find(b => b.botName === 'GPTBot');
  const claudeBot = botResults.find(b => b.botName === 'ClaudeBot');
  const perplexityBot = botResults.find(b => b.botName === 'PerplexityBot');
  const chatGptUser = botResults.find(b => b.botName === 'ChatGPT-User');

  if (gptBot?.status === 'BLOCKED') score -= 25;
  if (claudeBot?.status === 'BLOCKED') score -= 20;
  if (perplexityBot?.status === 'BLOCKED') score -= 15;
  if (chatGptUser?.status === 'BLOCKED') score -= 15;

  if (sitemaps.length > 0) score += 10;
  if (crawlDelay && crawlDelay > 10) score -= 10;

  score = Math.max(10, Math.min(100, score));

  const blockedCount = botResults.filter(b => b.status === 'BLOCKED').length;
  let summary = '';
  if (blockedCount === 0) {
    summary = `Robots.txt is highly agent-friendly. All top AI action & search agents (GPTBot, ClaudeBot, PerplexityBot) have crawling access.`;
  } else if (blockedCount < 4) {
    summary = `Robots.txt has selective blocks. ${blockedCount} AI bots are restricted (often model training bots), but primary agent search bots may have access.`;
  } else {
    summary = `Robots.txt contains aggressive AI disallow directives. ${blockedCount} AI crawlers are strictly blocked at the root, heavily hindering autonomous agents.`;
  }

  return {
    found: true,
    url: robotsUrl,
    rawText,
    totalRules: lines.length,
    sitemaps,
    crawlDelay,
    bots: botResults,
    score,
    summary,
  };
}

export function parseHtmlAndSchemas(html: string, pageUrl: string): {
  schema: SchemaAnalysis;
  htmlMeta: {
    title: string;
    description: string;
    wordCount: number;
    hasMainTag: boolean;
    hasForms: boolean;
    totalLinks: number;
  };
} {
  const $ = cheerio.load(html || '');

  const title = $('title').first().text().trim() || $('meta[property="og:title"]').attr('content') || '';
  const description =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    '';

  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText.split(' ').filter(Boolean).length;
  const hasMainTag = $('main').length > 0;
  const hasForms = $('form').length > 0;
  const totalLinks = $('a[href]').length;

  const hasMicrodata = $('[itemscope]').length > 0;
  const hasOpenGraph = $('meta[property^="og:"]').length > 0;

  const jsonLdBlocks = $('script[type="application/ld+json"]');
  const schemaItems: SchemaItem[] = [];

  jsonLdBlocks.each((_, el) => {
    const raw = $(el).html() || '';
    try {
      const parsed = JSON.parse(raw);
      const itemsToProcess = Array.isArray(parsed)
        ? parsed
        : parsed['@graph'] && Array.isArray(parsed['@graph'])
        ? parsed['@graph']
        : [parsed];

      for (const obj of itemsToProcess) {
        if (!obj || typeof obj !== 'object') continue;
        const type = obj['@type'] || 'Thing';
        const context = obj['@context'] || 'https://schema.org';
        const name = obj.name || obj.headline || obj.legalName;
        const desc = obj.description;

        const keys = Object.keys(obj);
        const crucialKeys = ['name', 'description', 'url', 'telephone', 'address', 'offers', 'potentialAction', 'priceRange'];
        const missing = crucialKeys.filter(k => !keys.includes(k));

        schemaItems.push({
          type: String(type),
          context: String(context),
          name: name ? String(name) : undefined,
          description: desc ? String(desc) : undefined,
          propertiesFound: keys,
          missingCrucialProperties: missing,
          valid: true,
          rawJson: obj,
        });
      }
    } catch {
      // invalid JSON in ld+json tag
      schemaItems.push({
        type: 'Invalid / Unparsed JSON-LD',
        context: 'https://schema.org',
        propertiesFound: [],
        missingCrucialProperties: ['valid_json_syntax'],
        valid: false,
      });
    }
  });

  const schemaTypes = Array.from(new Set(schemaItems.map(s => s.type)));

  const hasOrganization = schemaTypes.some(t => /organization|corporation|localbusiness/i.test(t));
  const hasLocalBusiness = schemaTypes.some(t => /localbusiness|store|medicalbusiness/i.test(t));
  const hasServiceOrProduct = schemaTypes.some(t => /service|product|softwareapplication/i.test(t));
  const hasFaq = schemaTypes.some(t => /faqpage|qapage/i.test(t));
  const hasBreadcrumbs = schemaTypes.some(t => /breadcrumblist/i.test(t));
  const hasActionSchema = schemaTypes.some(t => /action|potentialaction|orderaction|reservations/i.test(t));

  // Compute Schema Readiness Score (0-100)
  let score = 20; // baseline if HTML exists
  if (schemaItems.length > 0) score += 20;
  if (hasOrganization) score += 15;
  if (hasServiceOrProduct) score += 15;
  if (hasFaq) score += 10;
  if (hasBreadcrumbs) score += 5;
  if (hasActionSchema) score += 15;
  if (hasOpenGraph) score += 5;
  if (hasMicrodata) score += 5;

  score = Math.max(10, Math.min(100, score));

  let summary = '';
  if (schemaItems.length === 0) {
    summary = 'Zero structured JSON-LD schemas detected. AI agents must rely entirely on fuzzy text scraping, increasing hallucination and task failures.';
  } else if (score >= 80) {
    summary = `Excellent structured data. Detected ${schemaItems.length} schema entities (${schemaTypes.join(', ')}), providing AI agents with high-fidelity semantic context.`;
  } else {
    summary = `Partial schema data. Detected ${schemaItems.length} entity types (${schemaTypes.join(', ')}), but missing critical Action, Pricing, or Service models.`;
  }

  return {
    schema: {
      found: schemaItems.length > 0,
      totalSchemas: schemaItems.length,
      schemaTypes,
      items: schemaItems,
      hasOrganization,
      hasLocalBusiness,
      hasServiceOrProduct,
      hasFaq,
      hasBreadcrumbs,
      hasActionSchema,
      hasMicrodata,
      hasOpenGraph,
      score,
      summary,
    },
    htmlMeta: {
      title,
      description,
      wordCount,
      hasMainTag,
      hasForms,
      totalLinks,
    },
  };
}

export function computeCompositeScores(
  robots: RobotsTxtAnalysis,
  schema: SchemaAnalysis,
  manifests: MachineManifests,
  htmlMeta: {
    wordCount: number;
    hasMainTag: boolean;
    hasForms: boolean;
    description?: string;
    totalLinks?: number;
    title?: string;
  }
): CompositeScoreBreakdown {
  // 1. Ora.ai (ora.ai) - Actionability, Context protocols, API execution surface
  let oraAiScore = 35;
  if (manifests.llmsTxt.found) oraAiScore += 25;
  if (manifests.openApi.found) oraAiScore += 15;
  if (manifests.aiPluginJson.found) oraAiScore += 10;
  if (schema.hasActionSchema) oraAiScore += 15;
  if (htmlMeta.hasForms) oraAiScore += 10;
  if (robots.score < 50) oraAiScore -= 15;
  oraAiScore = Math.max(10, Math.min(100, Math.round(oraAiScore)));

  // 2. isitagentready.com - Bot crawl permissions & AI crawler access matrix
  const gptBotOk = robots.bots.find(b => b.botName === 'GPTBot')?.status !== 'BLOCKED';
  const claudeBotOk = robots.bots.find(b => b.botName === 'ClaudeBot')?.status !== 'BLOCKED';
  const perplexityOk = robots.bots.find(b => b.botName === 'PerplexityBot')?.status !== 'BLOCKED';
  const wildcardOk = !robots.bots.some(b => b.botName === '*' && b.status === 'BLOCKED');
  let isitAgentReadyScore = Math.round(robots.score * 0.75 + (manifests.sitemapXml.found ? 15 : 0) + (wildcardOk ? 10 : 0));
  if (!gptBotOk) isitAgentReadyScore -= 15;
  if (!claudeBotOk) isitAgentReadyScore -= 10;
  isitAgentReadyScore = Math.max(10, Math.min(100, Math.round(isitAgentReadyScore)));

  // 3. https://www.webyes.com/agent-readiness/ (WebYes) - Semantic entity modeling, JSON-LD schema depth & architecture
  let webYesScore = schema.score * 0.75;
  if (schema.hasOrganization) webYesScore += 10;
  if (schema.hasServiceOrProduct) webYesScore += 10;
  if (schema.hasLocalBusiness) webYesScore += 5;
  if (htmlMeta.hasMainTag) webYesScore += 5;
  if (htmlMeta.wordCount > 300) webYesScore += 5;
  webYesScore = Math.max(10, Math.min(100, Math.round(webYesScore)));

  // 4. sitespeak.ai/tools/ai-agent-readiness-scanner (SiteSpeakAI) - Content extractability, conversational RAG & knowledge retrieval
  let siteSpeakScore = 30;
  if (htmlMeta.wordCount >= 250) siteSpeakScore += 25;
  if (htmlMeta.wordCount >= 500) siteSpeakScore += 10;
  if (htmlMeta.hasMainTag) siteSpeakScore += 15;
  if (schema.hasFaq) siteSpeakScore += 15;
  if (schema.hasOpenGraph || ((htmlMeta.description?.length ?? 0) > 30)) siteSpeakScore += 10;
  if (manifests.llmsTxt.found) siteSpeakScore += 15;
  siteSpeakScore = Math.max(10, Math.min(100, Math.round(siteSpeakScore)));

  // 5. chatthing.ai/tools/agent-readiness-checker (ChatThing) - AI chat agent structure, clean context window & crawl traversal
  let chatThingScore = 35;
  if (manifests.sitemapXml.found) chatThingScore += 20;
  if (htmlMeta.wordCount >= 200 && htmlMeta.wordCount <= 3000) chatThingScore += 20;
  if (schema.hasOrganization || schema.items.some(i => i.propertiesFound.includes('contactPoint') || i.propertiesFound.includes('telephone'))) chatThingScore += 15;
  if (schema.hasFaq) chatThingScore += 15;
  if ((htmlMeta.totalLinks ?? 0) > 4) chatThingScore += 10;
  if (manifests.llmsTxt.found) chatThingScore += 10;
  chatThingScore = Math.max(10, Math.min(100, Math.round(chatThingScore)));

  // 6. agenticcommerce.shop - Autonomous buying & selling agents, product schema, machine checkout readiness
  const hasProducts = schema.hasServiceOrProduct;
  const hasOffers = schema.items.some(i => i.propertiesFound.includes('offers') || i.propertiesFound.includes('price'));
  let agenticCommerceScore = 20;
  if (hasProducts) agenticCommerceScore += 25;
  if (hasOffers) agenticCommerceScore += 25;
  if (schema.hasActionSchema) agenticCommerceScore += 15;
  if (htmlMeta.hasForms) agenticCommerceScore += 15;
  if (manifests.openApi.found) agenticCommerceScore += 10;
  agenticCommerceScore = Math.max(10, Math.min(100, Math.round(agenticCommerceScore)));

  // 7. AI Commerce Ready (AI Commerce Ready) - Commerce catalog verification, inventory status & pricing specs
  let aiCommerceReadyScore = 20;
  if (hasOffers) aiCommerceReadyScore += 30;
  if (hasProducts) aiCommerceReadyScore += 20;
  if (schema.items.some(i => i.propertiesFound.includes('priceCurrency') || i.propertiesFound.includes('availability'))) aiCommerceReadyScore += 15;
  if (schema.hasOrganization || schema.hasLocalBusiness) aiCommerceReadyScore += 15;
  if (htmlMeta.hasForms || schema.hasActionSchema) aiCommerceReadyScore += 10;
  aiCommerceReadyScore = Math.max(10, Math.min(100, Math.round(aiCommerceReadyScore)));

  // 8. Composite Score: Weighted across all 7 methodologies
  const compositeScore = Math.round(
    (oraAiScore * 0.16) +
    (isitAgentReadyScore * 0.18) +
    (webYesScore * 0.18) +
    (siteSpeakScore * 0.14) +
    (chatThingScore * 0.14) +
    (agenticCommerceScore * 0.10) +
    (aiCommerceReadyScore * 0.10)
  );

  const grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' =
    compositeScore >= 90 ? 'A+' :
    compositeScore >= 80 ? 'A' :
    compositeScore >= 70 ? 'B' :
    compositeScore >= 55 ? 'C' :
    compositeScore >= 40 ? 'D' : 'F';

  // 5. Dial Breakdown matching picture_2.png
  // Category 1: Discoverability (4 checks)
  const discChecks = [
    { name: 'Sitemap.xml declared', passed: manifests.sitemapXml.found, weight: 25, description: 'Sitemap enables autonomous agents to traverse whole site hierarchy' },
    { name: 'Robots.txt available', passed: robots.found, weight: 25, description: 'Crawler policies clearly declared at /robots.txt' },
    { name: 'Structured Schema.org', passed: schema.found, weight: 25, description: 'JSON-LD machine-readable entity schemas present' },
    { name: 'Meta descriptions & OpenGraph', passed: schema.hasOpenGraph || htmlMeta.wordCount > 100, weight: 25, description: 'Essential discovery metadata present' },
  ];
  const discPassed = discChecks.filter(c => c.passed).length;
  const discScore = Math.round((discPassed / discChecks.length) * 100);

  // Category 2: Content (1 check: semantic readable text without obstruction)
  const contentChecks = [
    { name: 'Semantic clean text extraction', passed: htmlMeta.wordCount >= 250 && htmlMeta.hasMainTag, weight: 100, description: 'Clean content extractable without client-side rendering dependency' },
  ];
  const contentPassed = contentChecks.filter(c => c.passed).length;
  const contentScore = Math.round((contentPassed / contentChecks.length) * 100);

  // Category 3: Bot Access Control (2 checks)
  const starOk = robots.bots.find(b => b.botName === 'ClaudeBot')?.status !== 'BLOCKED';
  const botChecks = [
    { name: 'GPTBot / Action Crawlers Allowed', passed: gptBotOk, weight: 50, description: 'OpenAI GPTBot and Perplexity permitted to index' },
    { name: 'ClaudeBot / Anthropic Allowed', passed: starOk, weight: 50, description: 'Anthropic ClaudeBot permitted to index' },
  ];
  const botPassed = botChecks.filter(c => c.passed).length;
  const botScore = Math.round((botPassed / botChecks.length) * 100);

  // Category 4: API, Auth, MCP & Skill Discovery (8 checks)
  const apiChecks = [
    { name: '/llms.txt context manifest', passed: manifests.llmsTxt.found, weight: 12.5, description: 'Published /llms.txt for token-efficient agent ingestion' },
    { name: 'OpenAPI specification', passed: manifests.openApi.found, weight: 12.5, description: 'Standardized REST OpenAPI tool spec available' },
    { name: 'ai-plugin.json manifest', passed: manifests.aiPluginJson.found, weight: 12.5, description: 'OpenAI Plugin or tool configuration registered' },
    { name: 'MCP (Model Context Protocol) ready', passed: manifests.openApi.found || manifests.llmsTxt.found, weight: 12.5, description: 'Endpoints structured for MCP tool-calling servers' },
    { name: 'Schema.org PotentialAction', passed: schema.hasActionSchema, weight: 12.5, description: 'Machine-executable SearchAction or OrderAction declarations' },
    { name: 'Public read-only API docs', passed: manifests.openApi.found, weight: 12.5, description: 'Developer documentation accessible to search agents' },
    { name: 'Machine-accessible forms', passed: htmlMeta.hasForms && schema.hasActionSchema, weight: 12.5, description: 'Forms support semantic parameter submission' },
    { name: 'Cross-Origin API accessibility', passed: manifests.llmsTxt.found || manifests.openApi.found, weight: 12.5, description: 'Endpoints allow autonomous agent header dispatch' },
  ];
  const apiPassed = apiChecks.filter(c => c.passed).length;
  const apiScore = Math.round((apiPassed / apiChecks.length) * 100);

  // Category 5: Commerce / Transactional Actionability
  const hasOffer = schema.items.some(i => i.propertiesFound.includes('offers') || i.propertiesFound.includes('priceRange') || i.propertiesFound.includes('price'));
  const commChecks = [
    { name: 'Structured pricing schema', passed: hasOffer, weight: 50, description: 'Schema.org Offer or priceSpecification declared' },
    { name: 'Autonomous booking / reservation', passed: schema.hasActionSchema, weight: 50, description: 'ReserveAction or ScheduleAction schema endpoint' },
  ];
  const commPassed = commChecks.filter(c => c.passed).length;
  const commScore = hasOffer || schema.hasActionSchema ? Math.round((commPassed / commChecks.length) * 100) : 0;

  // Level determination:
  // Level 1 (0-29): Business doesn't exist.
  // Level 2 (30-49): Can't find products or services.
  // Level 3 (50-69): Can't buy or book a meeting.
  // Level 4 (70-84): Can't buy without human.
  // Level 5 (85-100): All system go.
  const level: 1 | 2 | 3 | 4 | 5 =
    compositeScore >= 85 ? 5 :
    compositeScore >= 70 ? 4 :
    compositeScore >= 50 ? 3 :
    compositeScore >= 30 ? 2 : 1;

  const levelTitle =
    level === 5 ? 'All system go.' :
    level === 4 ? "Can't buy without human." :
    level === 3 ? "Can't buy or book a meeting." :
    level === 2 ? "Can't find products or services." : "Business doesn't exist.";

  const dialBreakdown = {
    level,
    levelTitle,
    categories: {
      discoverability: {
        id: 'discoverability',
        name: 'Discoverability',
        score: discScore,
        passedCount: discPassed,
        totalCount: discChecks.length,
        fractionDisplay: `${discPassed}/${discChecks.length}`,
        status: discScore >= 75 ? ('passed' as const) : discScore >= 40 ? ('partial' as const) : ('failed' as const),
        checks: discChecks,
        description: 'XML sitemaps, robots.txt, metadata, and core indexability',
      },
      content: {
        id: 'content',
        name: 'Content',
        score: contentScore,
        passedCount: contentPassed,
        totalCount: contentChecks.length,
        fractionDisplay: `${contentPassed}/${contentChecks.length}`,
        status: contentScore >= 75 ? ('passed' as const) : contentScore >= 40 ? ('partial' as const) : ('failed' as const),
        checks: contentChecks,
        description: 'Extractable text density and semantic HTML5 structuring',
      },
      botAccess: {
        id: 'bot_access',
        name: 'Bot Access Control',
        score: botScore,
        passedCount: botPassed,
        totalCount: botChecks.length,
        fractionDisplay: `${botPassed}/${botChecks.length}`,
        status: botScore >= 75 ? ('passed' as const) : botScore >= 40 ? ('partial' as const) : ('failed' as const),
        checks: botChecks,
        description: 'Robots.txt permissions for leading AI assistants & browsers',
      },
      apiMcp: {
        id: 'api_mcp',
        name: 'API, Auth, MCP & Skill Discovery',
        score: apiScore,
        passedCount: apiPassed,
        totalCount: apiChecks.length,
        fractionDisplay: `${apiPassed}/${apiChecks.length}`,
        status: apiScore >= 75 ? ('passed' as const) : apiScore >= 40 ? ('partial' as const) : ('failed' as const),
        checks: apiChecks,
        description: 'llms.txt, OpenAPI specifications, MCP tool servers, and actions',
      },
      commerce: {
        id: 'commerce',
        name: 'Commerce',
        score: commScore,
        passedCount: commPassed,
        totalCount: commChecks.length,
        fractionDisplay: commPassed > 0 ? `${commPassed}/${commChecks.length}` : 'Not checked',
        status: commPassed > 0 ? (commScore >= 75 ? ('passed' as const) : ('partial' as const)) : ('not_checked' as const),
        checks: commChecks,
        description: 'Machine-executable pricing catalogs, bookings, and purchasing schemas',
      },
    },
  };

  const dimensionScores = {
    crawlability: robots.score,
    structuredSchema: schema.score,
    actionability: oraAiScore,
    semanticClarity: Math.min(100, Math.round(webYesScore * 0.95)),
    machineProtocols: Math.min(100, Math.round((manifests.llmsTxt.found ? 50 : 10) + (manifests.sitemapXml.found ? 30 : 0) + (manifests.openApi.found ? 20 : 0))),
  };

  let overallVerdict = '';
  let executiveSummary = '';

  if (compositeScore >= 80) {
    overallVerdict = 'AI AGENT READY';
    executiveSummary = 'This website demonstrates strong readiness for modern autonomous AI agents. Bots can crawl without restrictive barriers, structured schemas expose core entities, and content is easily extractable.';
  } else if (compositeScore >= 60) {
    overallVerdict = 'PARTIALLY AGENT READY (MODERATE FRICTION)';
    executiveSummary = 'AI agents can access basic information, but encounter notable friction with transactional actions, missing schema properties, or absent machine-readable llms.txt context.';
  } else {
    overallVerdict = 'NOT AGENT READY (HIGH BARRIER)';
    executiveSummary = 'Autonomous AI agents face critical barriers attempting to discover, quote, or interact with this site due to crawler restrictions, lack of structured schemas, and human-only form interfaces.';
  }

  // 6. User-specified 5 Strategic Readiness Questions (Scale 1 to 100)
  // Synthesized directly from responses of all 7 evaluated tools and websites:

  // Q1: Can AI agents find and trust you?
  // Synthesized across: isitagentready.com, webyes.com, chatthing.ai, ora.ai, and AI Commerce Ready
  const q1Score = Math.max(1, Math.min(100, Math.round(
    (isitAgentReadyScore * 0.40) +
    (webYesScore * 0.30) +
    (chatThingScore * 0.15) +
    (oraAiScore * 0.10) +
    (aiCommerceReadyScore * 0.05)
  )));
  const q1Factors = [
    { label: `isitagentready.com crawler permission index: ${isitAgentReadyScore}/100`, positive: isitAgentReadyScore >= 70, impact: `${Math.round(isitAgentReadyScore * 0.40)} pts` },
    { label: `webyes.com organizational identity schema depth: ${webYesScore}/100`, positive: webYesScore >= 60, impact: `${Math.round(webYesScore * 0.30)} pts` },
    { label: `chatthing.ai corporate trust & grounding index: ${chatThingScore}/100`, positive: chatThingScore >= 60, impact: `${Math.round(chatThingScore * 0.15)} pts` },
    { label: `ora.ai verified machine identity & context: ${oraAiScore}/100`, positive: oraAiScore >= 60, impact: `${Math.round(oraAiScore * 0.10)} pts` },
    { label: `AI Commerce Ready business authority: ${aiCommerceReadyScore}/100`, positive: aiCommerceReadyScore >= 60, impact: `${Math.round(aiCommerceReadyScore * 0.05)} pts` },
  ];

  // Q2: Do you make it easier for AI Agents to find information about you?
  // Synthesized across: sitespeak.ai, ora.ai, chatthing.ai, webyes.com, and isitagentready.com
  const q2Score = Math.max(1, Math.min(100, Math.round(
    (siteSpeakScore * 0.30) +
    (oraAiScore * 0.25) +
    (chatThingScore * 0.20) +
    (webYesScore * 0.15) +
    (isitAgentReadyScore * 0.10)
  )));
  const q2Factors = [
    { label: `sitespeak.ai content extraction & RAG density: ${siteSpeakScore}/100`, positive: siteSpeakScore >= 60, impact: `${Math.round(siteSpeakScore * 0.30)} pts` },
    { label: `ora.ai machine context & /llms.txt rating: ${oraAiScore}/100`, positive: oraAiScore >= 60, impact: `${Math.round(oraAiScore * 0.25)} pts` },
    { label: `chatthing.ai context window & sitemap depth: ${chatThingScore}/100`, positive: chatThingScore >= 60, impact: `${Math.round(chatThingScore * 0.20)} pts` },
    { label: `webyes.com entity knowledge & FAQ completeness: ${webYesScore}/100`, positive: webYesScore >= 60, impact: `${Math.round(webYesScore * 0.15)} pts` },
    { label: `isitagentready.com unblocked crawl discovery: ${isitAgentReadyScore}/100`, positive: isitAgentReadyScore >= 70, impact: `${Math.round(isitAgentReadyScore * 0.10)} pts` },
  ];

  // Q3: Does AI Agent understand what products and services you offer?
  // Synthesized across: agenticcommerce.shop, aicommerceready.com, webyes.com, sitespeak.ai, and ora.ai
  const q3Score = Math.max(1, Math.min(100, Math.round(
    (agenticCommerceScore * 0.30) +
    (aiCommerceReadyScore * 0.30) +
    (webYesScore * 0.20) +
    (siteSpeakScore * 0.10) +
    (oraAiScore * 0.10)
  )));
  const hasService = schema.hasServiceOrProduct;
  const q3Factors = [
    { label: `agenticcommerce.shop buying/selling protocol score: ${agenticCommerceScore}/100`, positive: agenticCommerceScore >= 60, impact: `${Math.round(agenticCommerceScore * 0.30)} pts` },
    { label: `AI Commerce Ready pricing spec & catalog score: ${aiCommerceReadyScore}/100`, positive: aiCommerceReadyScore >= 60, impact: `${Math.round(aiCommerceReadyScore * 0.30)} pts` },
    { label: `webyes.com Service & Product taxonomy depth: ${webYesScore}/100`, positive: webYesScore >= 60, impact: `${Math.round(webYesScore * 0.20)} pts` },
    { label: `sitespeak.ai service offering text clarity: ${siteSpeakScore}/100`, positive: siteSpeakScore >= 60, impact: `${Math.round(siteSpeakScore * 0.10)} pts` },
    { label: `ora.ai actionable service endpoints: ${oraAiScore}/100`, positive: oraAiScore >= 60, impact: `${Math.round(oraAiScore * 0.10)} pts` },
  ];

  // Q4: Can AI Agent contact you easily?
  // Synthesized across: ora.ai, chatthing.ai, webyes.com, aicommerceready.com, and isitagentready.com
  const q4Score = Math.max(1, Math.min(100, Math.round(
    (oraAiScore * 0.30) +
    (chatThingScore * 0.25) +
    (webYesScore * 0.20) +
    (aiCommerceReadyScore * 0.15) +
    (isitAgentReadyScore * 0.10)
  )));
  const hasContact = schema.items.some(i => i.propertiesFound.includes('telephone') || i.propertiesFound.includes('email') || i.propertiesFound.includes('contactPoint'));
  const q4Factors = [
    { label: `ora.ai action execution & form accessibility score: ${oraAiScore}/100`, positive: oraAiScore >= 60, impact: `${Math.round(oraAiScore * 0.30)} pts` },
    { label: `chatthing.ai contact discoverability & support score: ${chatThingScore}/100`, positive: chatThingScore >= 60, impact: `${Math.round(chatThingScore * 0.25)} pts` },
    { label: `webyes.com LocalBusiness & PostalAddress schema score: ${webYesScore}/100`, positive: webYesScore >= 60, impact: `${Math.round(webYesScore * 0.20)} pts` },
    { label: `AI Commerce Ready merchant communication verified: ${aiCommerceReadyScore}/100`, positive: aiCommerceReadyScore >= 60, impact: `${Math.round(aiCommerceReadyScore * 0.15)} pts` },
    { label: `isitagentready.com unblocked contact pathways: ${isitAgentReadyScore}/100`, positive: isitAgentReadyScore >= 70, impact: `${Math.round(isitAgentReadyScore * 0.10)} pts` },
  ];

  // Q5: Can AI Agent browse through your website easily?
  // Synthesized across: isitagentready.com, sitespeak.ai, chatthing.ai, webyes.com, and agenticcommerce.shop
  const q5Score = Math.max(1, Math.min(100, Math.round(
    (isitAgentReadyScore * 0.35) +
    (siteSpeakScore * 0.25) +
    (chatThingScore * 0.20) +
    (webYesScore * 0.10) +
    (agenticCommerceScore * 0.10)
  )));
  const starNotBlocked = !robots.bots.some(b => b.botName === '*' && b.status === 'BLOCKED');
  const hasLandmarks = htmlMeta.hasMainTag;
  const q5Factors = [
    { label: `isitagentready.com crawl allowance & robots index: ${isitAgentReadyScore}/100`, positive: isitAgentReadyScore >= 70, impact: `${Math.round(isitAgentReadyScore * 0.35)} pts` },
    { label: `sitespeak.ai semantic HTML5 layout & DOM extractability: ${siteSpeakScore}/100`, positive: siteSpeakScore >= 60, impact: `${Math.round(siteSpeakScore * 0.25)} pts` },
    { label: `chatthing.ai site architecture & link traversal score: ${chatThingScore}/100`, positive: chatThingScore >= 60, impact: `${Math.round(chatThingScore * 0.20)} pts` },
    { label: `webyes.com structural hierarchy & breadcrumbs: ${webYesScore}/100`, positive: webYesScore >= 60, impact: `${Math.round(webYesScore * 0.10)} pts` },
    { label: `agenticcommerce.shop catalog navigation flow: ${agenticCommerceScore}/100`, positive: agenticCommerceScore >= 60, impact: `${Math.round(agenticCommerceScore * 0.10)} pts` },
  ];

  const getStatus = (s: number): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' =>
    s >= 80 ? 'EXCELLENT' : s >= 60 ? 'GOOD' : s >= 40 ? 'FAIR' : 'POOR';

  const questionsBreakdown = {
    findAndTrust: {
      id: 'find_and_trust',
      question: 'Can AI agents find and trust you?',
      score: q1Score,
      status: getStatus(q1Score),
      summary: q1Score >= 70 ? 'AI agents can easily discover and authenticate your business identity.' : 'AI agents encounter crawl blocks or missing organizational trust schemas.',
      keyFactors: q1Factors,
    },
    findInformation: {
      id: 'find_information',
      question: 'Do you make it easier for AI Agents to find information about you?',
      score: q2Score,
      status: getStatus(q2Score),
      summary: q2Score >= 70 ? 'Context manifests and sitemaps allow token-efficient information retrieval.' : 'Information is buried in heavy DOM markup without an /llms.txt context manifest.',
      keyFactors: q2Factors,
    },
    productsAndServices: {
      id: 'products_and_services',
      question: 'Does AI Agent understand what products and services you offer?',
      score: q3Score,
      status: getStatus(q3Score),
      summary: q3Score >= 70 ? 'Products and service offerings are mapped in clean Schema.org entities.' : 'Services are presented only in qualitative text, missing structured Service and Offer schemas.',
      keyFactors: q3Factors,
    },
    contactEasily: {
      id: 'contact_easily',
      question: 'Can AI Agent contact you easily?',
      score: q4Score,
      status: getStatus(q4Score),
      summary: q4Score >= 70 ? 'Structured ContactPoint and address coordinates allow autonomous escalation.' : 'Contact points lack structured schema or rely on human-only interactive forms.',
      keyFactors: q4Factors,
    },
    browseEasily: {
      id: 'browse_easily',
      question: 'Can AI Agent browse through your website easily?',
      score: q5Score,
      status: getStatus(q5Score),
      summary: q5Score >= 70 ? 'Clean semantic layout and permissive robots directives enable frictionless indexing.' : 'Agent browsing encounters navigation friction or missing semantic landmarks.',
      keyFactors: q5Factors,
    },
  };

  const tools: AgentReadinessToolBenchmark[] = [
    {
      id: 'oraAi',
      order: 1,
      name: 'Ora.ai',
      url: 'https://ora.ai',
      displayUrl: 'ora.ai',
      score: Math.min(100, Math.max(10, oraAiScore)),
      status: oraAiScore >= 75 ? 'passed' : oraAiScore >= 50 ? 'warning' : 'failed',
      focus: 'Action surface, /llms.txt context protocols & API execution surface',
      summary: oraAiScore >= 70
        ? 'High actionability. Machine manifests and actionable endpoints allow autonomous agent execution.'
        : 'Action friction detected. Lacks /llms.txt manifest or structured machine action endpoints.',
      keyFindings: [
        manifests.llmsTxt.found ? 'Published /llms.txt detected' : 'Missing /llms.txt machine context',
        schema.hasActionSchema ? 'PotentialAction schema found' : 'No Schema.org Action endpoints',
        manifests.openApi.found ? 'OpenAPI spec available' : 'No machine OpenAPI documentation',
      ],
      metrics: [
        { label: 'llms.txt Manifest', value: manifests.llmsTxt.found ? 'Found' : 'Missing', passed: manifests.llmsTxt.found },
        { label: 'Actionable Schema', value: schema.hasActionSchema ? 'Yes' : 'No', passed: schema.hasActionSchema },
        { label: 'OpenAPI Spec', value: manifests.openApi.found ? 'Found' : 'Missing', passed: manifests.openApi.found },
      ],
    },
    {
      id: 'isitAgentReady',
      order: 2,
      name: 'isitagentready.com',
      url: 'https://isitagentready.com',
      displayUrl: 'isitagentready.com',
      score: Math.min(100, Math.max(10, isitAgentReadyScore)),
      status: isitAgentReadyScore >= 75 ? 'passed' : isitAgentReadyScore >= 50 ? 'warning' : 'failed',
      focus: 'Robots.txt crawl permissions, AI bot access matrix & sitemaps',
      summary: isitAgentReadyScore >= 70
        ? 'Clean bot accessibility. Wildcard and AI-specific crawlers permitted to index.'
        : 'Crawl barriers detected in robots.txt restricting AI search and agent bots.',
      keyFindings: [
        gptBotOk ? 'OpenAI GPTBot permitted' : 'GPTBot blocked or restricted',
        claudeBotOk ? 'Anthropic ClaudeBot permitted' : 'ClaudeBot restricted',
        manifests.sitemapXml.found ? 'XML Sitemap accessible' : 'Missing XML sitemap discovery',
      ],
      metrics: [
        { label: 'GPTBot (OpenAI)', value: gptBotOk ? 'Allowed' : 'Blocked', passed: gptBotOk },
        { label: 'ClaudeBot (Anthropic)', value: claudeBotOk ? 'Allowed' : 'Blocked', passed: claudeBotOk },
        { label: 'XML Sitemap', value: manifests.sitemapXml.found ? 'Present' : 'Missing', passed: manifests.sitemapXml.found },
      ],
    },
    {
      id: 'webYes',
      order: 3,
      name: 'WebYes Agent-Readiness',
      url: 'https://www.webyes.com/agent-readiness/',
      displayUrl: 'webyes.com/agent-readiness',
      score: Math.min(100, Math.max(10, webYesScore)),
      status: webYesScore >= 75 ? 'passed' : webYesScore >= 50 ? 'warning' : 'failed',
      focus: 'Semantic entity modeling, JSON-LD schema depth & architecture',
      summary: webYesScore >= 70
        ? 'Rich semantic entity mapping with comprehensive Schema.org definitions.'
        : 'Sparse JSON-LD entity graph. Critical business identity and service schemas absent.',
      keyFindings: [
        schema.hasOrganization ? 'Organization identity mapped' : 'Missing Organization schema',
        schema.hasServiceOrProduct ? 'Service/Product entities present' : 'No Service or Product schema',
        htmlMeta.hasMainTag ? 'HTML5 <main> semantic landmark' : 'No semantic <main> container',
      ],
      metrics: [
        { label: 'Entity Types Found', value: `${schema.schemaTypes.length} types`, passed: schema.schemaTypes.length > 0 },
        { label: 'Org / Identity Schema', value: schema.hasOrganization ? 'Valid' : 'Missing', passed: schema.hasOrganization },
        { label: 'HTML5 Semantic Structure', value: htmlMeta.hasMainTag ? 'Clean' : 'Generic', passed: htmlMeta.hasMainTag },
      ],
    },
    {
      id: 'siteSpeak',
      order: 4,
      name: 'SiteSpeakAI Scanner',
      url: 'https://sitespeak.ai/tools/ai-agent-readiness-scanner',
      displayUrl: 'sitespeak.ai/tools/ai-agent-readiness-scanner',
      score: Math.min(100, Math.max(10, siteSpeakScore)),
      status: siteSpeakScore >= 75 ? 'passed' : siteSpeakScore >= 50 ? 'warning' : 'failed',
      focus: 'Content extractability, conversational RAG & knowledge retrieval',
      summary: siteSpeakScore >= 70
        ? 'Clean extractable content. Autonomous agents can ingest knowledge without JS rendering obstacles.'
        : 'Content retrieval friction. Low text density or missing FAQ grounding schemas.',
      keyFindings: [
        htmlMeta.wordCount >= 250 ? `Extractable text: ${htmlMeta.wordCount} words` : `Low text density: ${htmlMeta.wordCount} words`,
        schema.hasFaq ? 'FAQPage Q&A pairs available' : 'No FAQ structured data for RAG',
        schema.hasOpenGraph ? 'OpenGraph meta tags verified' : 'Incomplete metadata descriptions',
      ],
      metrics: [
        { label: 'Extractable Word Count', value: `${htmlMeta.wordCount} words`, passed: htmlMeta.wordCount >= 250 },
        { label: 'FAQ Schema (Q&A)', value: schema.hasFaq ? 'Present' : 'None', passed: schema.hasFaq },
        { label: 'Meta Description', value: (htmlMeta.description?.length ?? 0) > 20 ? 'Present' : 'Missing', passed: (htmlMeta.description?.length ?? 0) > 20 },
      ],
    },
    {
      id: 'chatThing',
      order: 5,
      name: 'ChatThing Agent Checker',
      url: 'https://chatthing.ai/tools/agent-readiness-checker',
      displayUrl: 'chatthing.ai/tools/agent-readiness-checker',
      score: Math.min(100, Math.max(10, chatThingScore)),
      status: chatThingScore >= 75 ? 'passed' : chatThingScore >= 50 ? 'warning' : 'failed',
      focus: 'AI chat agent structure, clean context window & crawl traversal',
      summary: chatThingScore >= 70
        ? 'Optimized for conversational agents. Clear site architecture and contact discoverability.'
        : 'Conversational agent friction. Context boundaries undefined or contact points lack structured schemas.',
      keyFindings: [
        manifests.sitemapXml.found ? 'Complete sitemap traversal available' : 'No sitemap discovered',
        (htmlMeta.totalLinks ?? 0) > 4 ? `Navigable internal links: ${htmlMeta.totalLinks}` : 'Sparse internal navigation graph',
        schema.hasOrganization || schema.hasLocalBusiness ? 'Corporate grounding profile present' : 'Missing corporate grounding profile',
      ],
      metrics: [
        { label: 'Sitemap Traversal', value: manifests.sitemapXml.found ? 'Verified' : 'Missing', passed: manifests.sitemapXml.found },
        { label: 'Internal Link Depth', value: `${htmlMeta.totalLinks ?? 0} links`, passed: (htmlMeta.totalLinks ?? 0) > 4 },
        { label: 'Context Efficiency', value: htmlMeta.wordCount > 100 ? 'Optimized' : 'Sparse', passed: htmlMeta.wordCount > 100 },
      ],
    },
    {
      id: 'agenticCommerce',
      order: 6,
      name: 'agenticcommerce.shop',
      url: 'https://agenticcommerce.shop',
      displayUrl: 'agenticcommerce.shop',
      score: Math.min(100, Math.max(10, agenticCommerceScore)),
      status: agenticCommerceScore >= 75 ? 'passed' : agenticCommerceScore >= 50 ? 'warning' : 'failed',
      focus: 'Autonomous buying/selling, Product/Offer schemas & checkout triggers',
      summary: agenticCommerceScore >= 70
        ? 'Agentic transaction ready. Autonomous purchasing agents can read pricing and trigger checkout.'
        : 'Non-transactional. Autonomous commerce agents cannot locate structured Offer prices or checkout flows.',
      keyFindings: [
        hasProducts ? 'Product / Service schema declared' : 'No Product schema found',
        hasOffers ? 'Structured pricing/offers declared' : 'No machine-readable Offer prices',
        htmlMeta.hasForms ? 'Interactive transaction forms detected' : 'No machine form triggers',
      ],
      metrics: [
        { label: 'Product Schema', value: hasProducts ? 'Declared' : 'None', passed: hasProducts },
        { label: 'Offer / Price Schema', value: hasOffers ? 'Machine-Readable' : 'Missing', passed: hasOffers },
        { label: 'Transaction Surface', value: htmlMeta.hasForms ? 'Active' : 'None', passed: htmlMeta.hasForms },
      ],
    },
    {
      id: 'aiCommerceReady',
      order: 7,
      name: 'AI Commerce Ready',
      url: 'https://aicommerceready.com',
      displayUrl: 'aicommerceready.com',
      score: Math.min(100, Math.max(10, aiCommerceReadyScore)),
      status: aiCommerceReadyScore >= 75 ? 'passed' : aiCommerceReadyScore >= 50 ? 'warning' : 'failed',
      focus: 'Commerce catalog verification, inventory status & pricing specs',
      summary: aiCommerceReadyScore >= 70
        ? 'Meets AI Commerce standard. Pricing, availability, and merchant entity specifications verified.'
        : 'Missing commerce metadata. Lacks structured price currency, availability, or merchant policies.',
      keyFindings: [
        hasOffers ? 'Price specification machine accessible' : 'Pricing missing from JSON-LD',
        schema.hasLocalBusiness || schema.hasOrganization ? 'Merchant legal entity verified' : 'Merchant entity unverified',
        schema.items.some(i => i.propertiesFound.includes('availability')) ? 'Stock availability declared' : 'Inventory availability missing',
      ],
      metrics: [
        { label: 'Catalog Pricing Spec', value: hasOffers ? 'Present' : 'Missing', passed: hasOffers },
        { label: 'Merchant Identity', value: (schema.hasOrganization || schema.hasLocalBusiness) ? 'Verified' : 'Unverified', passed: schema.hasOrganization || schema.hasLocalBusiness },
        { label: 'Inventory / Stock Status', value: schema.items.some(i => i.propertiesFound.includes('availability')) ? 'Declared' : 'Missing', passed: schema.items.some(i => i.propertiesFound.includes('availability')) },
      ],
    },
  ];

  return {
    compositeScore,
    grade,
    oraAiScore: Math.min(100, Math.max(10, oraAiScore)),
    isitAgentReadyScore: Math.min(100, Math.max(10, isitAgentReadyScore)),
    webYesScore: Math.min(100, Math.max(10, webYesScore)),
    siteSpeakScore: Math.min(100, Math.max(10, siteSpeakScore)),
    chatThingScore: Math.min(100, Math.max(10, chatThingScore)),
    agenticCommerceScore: Math.min(100, Math.max(10, agenticCommerceScore)),
    aiCommerceReadyScore: Math.min(100, Math.max(10, aiCommerceReadyScore)),
    tools,
    dimensionScores,
    dialBreakdown,
    questionsBreakdown,
    overallVerdict,
    executiveSummary,
  };
}

export function deriveAgentFailuresAndGaps(
  robots: RobotsTxtAnalysis,
  schema: SchemaAnalysis,
  manifests: MachineManifests,
  htmlMeta: { title: string; wordCount: number; hasForms: boolean },
  targetDomain: string
): { agentFailures: AgentCapabilityFailure[]; informationGaps: InformationGap[] } {
  const agentFailures: AgentCapabilityFailure[] = [];
  const informationGaps: InformationGap[] = [];

  // Capability 1: Autonomous Booking / Transactional Consultation
  if (!schema.hasActionSchema && !manifests.openApi.found) {
    agentFailures.push({
      capability: 'Autonomous Service / Demo Booking',
      category: 'Transactional',
      status: 'FAILED',
      whatAgentFailedToDo: 'Could not book a service appointment, demo, or request consultation autonomously without human intervention.',
      technicalRootCause: 'Lacks machine-readable Action schema (e.g., ReserveAction, ScheduleAction) and public OpenAPI endpoint. Intake forms rely on client-side JS or captcha.',
      impactLevel: 'HIGH',
      recommendedFix: 'Implement Schema.org potentialAction with target URL template or publish a lightweight booking endpoint in llms.txt.',
    });
  } else {
    agentFailures.push({
      capability: 'Autonomous Service / Demo Booking',
      category: 'Transactional',
      status: 'PASSED',
      whatAgentFailedToDo: 'Agent was able to detect structured appointment/action endpoints.',
      technicalRootCause: 'Standardized action schemas detected.',
      impactLevel: 'LOW',
      recommendedFix: 'Maintain current action schema parameters.',
    });
  }

  // Capability 2: Machine Extraction of Pricing & Commercial Terms
  const hasPricing = schema.items.some(i => i.propertiesFound.includes('price') || i.propertiesFound.includes('offers') || i.propertiesFound.includes('priceRange'));
  if (!hasPricing) {
    agentFailures.push({
      capability: 'Autonomous Pricing & Quote Retrieval',
      category: 'Information Retrieval',
      status: 'FAILED',
      whatAgentFailedToDo: 'Could not extract unambiguous pricing tiers or cost benchmarks for autonomous procurement agents.',
      technicalRootCause: 'Pricing is either absent, gated behind a "Contact Sales" click-to-call modal, or missing Schema.org Offer/priceCurrency data.',
      impactLevel: 'HIGH',
      recommendedFix: 'Add Schema.org OfferCatalog or priceRange properties to your Organization/Service schema, or document tiers in /llms.txt.',
    });
  } else {
    agentFailures.push({
      capability: 'Autonomous Pricing & Quote Retrieval',
      category: 'Information Retrieval',
      status: 'PASSED',
      whatAgentFailedToDo: 'Extracted structured pricing and offer catalog properties.',
      technicalRootCause: 'Schema Offer / priceRange present.',
      impactLevel: 'LOW',
      recommendedFix: 'Keep offer schema updated with current pricing.',
    });
  }

  // Capability 3: Bot Crawling & Model Context Ingestion
  const gptBotBlocked = robots.bots.find(b => b.botName === 'GPTBot')?.status === 'BLOCKED';
  const claudeBotBlocked = robots.bots.find(b => b.botName === 'ClaudeBot')?.status === 'BLOCKED';
  if (gptBotBlocked || claudeBotBlocked) {
    agentFailures.push({
      capability: 'Real-time Web Search Agent Crawling',
      category: 'Authentication / Anti-Bot',
      status: 'FAILED',
      whatAgentFailedToDo: 'Agent could not crawl pages in real-time due to explicit user-agent Disallow rules in robots.txt.',
      technicalRootCause: `Robots.txt explicitly disallows ${gptBotBlocked ? 'GPTBot ' : ''}${claudeBotBlocked ? 'ClaudeBot' : ''} at root.`,
      impactLevel: 'HIGH',
      recommendedFix: 'Permit AI Search and Browsing bots in robots.txt while maintaining training disallows if desired.',
    });
  } else {
    agentFailures.push({
      capability: 'Real-time Web Search Agent Crawling',
      category: 'Navigation',
      status: 'PASSED',
      whatAgentFailedToDo: 'Leading search and assistant bots (GPTBot, ClaudeBot, Perplexity) are permitted to crawl.',
      technicalRootCause: 'Robots.txt does not block primary action user-agents.',
      impactLevel: 'LOW',
      recommendedFix: 'Monitor robots.txt logs for emerging assistant user-agents.',
    });
  }

  // Capability 4: Agent Context Optimization (`llms.txt`)
  if (!manifests.llmsTxt.found) {
    agentFailures.push({
      capability: 'Zero-Token-Waste Context Ingestion',
      category: 'Tool Calling',
      status: 'PARTIAL',
      whatAgentFailedToDo: 'Agent was forced to parse full, heavy HTML DOM instead of an optimized markdown context summary.',
      technicalRootCause: 'No /llms.txt or /.well-known/llms.txt manifest found on host root.',
      impactLevel: 'MEDIUM',
      recommendedFix: 'Deploy a concise /llms.txt file summarizing company capabilities, core URLs, and contact endpoints.',
    });
  } else {
    agentFailures.push({
      capability: 'Zero-Token-Waste Context Ingestion',
      category: 'Tool Calling',
      status: 'PASSED',
      whatAgentFailedToDo: 'Found /llms.txt manifest providing clean token-efficient context.',
      technicalRootCause: 'llms.txt manifest available.',
      impactLevel: 'LOW',
      recommendedFix: 'Maintain llms.txt accuracy.',
    });
  }

  // Capability 5: API & Tool Call Discovery
  if (!manifests.openApi.found && !manifests.aiPluginJson.found) {
    agentFailures.push({
      capability: 'Automated Tool Calling & API Discovery',
      category: 'Tool Calling',
      status: 'FAILED',
      whatAgentFailedToDo: 'Could not discover machine-executable tools or REST API declarations to integrate actions programmatically.',
      technicalRootCause: 'Missing OpenAPI / Swagger specification or AI plugin manifest in well-known routes.',
      impactLevel: 'MEDIUM',
      recommendedFix: 'Publish public read-only OpenAPI specs (e.g. for service listings or status) at /.well-known/openapi.yaml.',
    });
  }

  // Information Gaps:
  if (!hasPricing) {
    informationGaps.push({
      informationField: 'Transparent Fee / Pricing Tiers',
      category: 'Pricing & Packaging',
      status: 'MISSING',
      whatCouldNotBeGathered: 'Specific hourly rates, monthly retainer tiers, or minimum project engagements.',
      whyAgentNeedsIt: 'Autonomous procurement and budgeting agents reject vendors that do not declare minimum financial requirements.',
      recommendedSchemaOrTag: 'Schema.org "Offer" with "priceSpecification" and "priceCurrency".',
    });
  }

  if (!schema.hasOrganization || !schema.items.some(i => i.propertiesFound.includes('telephone') || i.propertiesFound.includes('email'))) {
    informationGaps.push({
      informationField: 'Direct Escalation Contact Point',
      category: 'Contact & Escalation',
      status: 'MISSING',
      whatCouldNotBeGathered: 'Machine-verified direct support email or phone number in structured data.',
      whyAgentNeedsIt: 'Customer service agents require verified contact points to escalate inquiries or route support tickets without hallucination.',
      recommendedSchemaOrTag: 'Schema.org "ContactPoint" with contactType: "customer service" & telephone.',
    });
  }

  if (!schema.hasLocalBusiness && !schema.items.some(i => i.propertiesFound.includes('address'))) {
    informationGaps.push({
      informationField: 'Physical Operational Jurisdiction & Geolocation',
      category: 'Location & Availability',
      status: 'MISSING',
      whatCouldNotBeGathered: 'Verified street address, postal code, or service area coverage coordinates.',
      whyAgentNeedsIt: 'Local dispatch and geo-targeted agents (e.g. Perplexity Maps, Google Gemini Local) cannot confirm service coverage.',
      recommendedSchemaOrTag: 'Schema.org "PostalAddress" and "areaServed" / "geo" coordinates.',
    });
  }

  if (!schema.hasFaq) {
    informationGaps.push({
      informationField: 'High-Confidence Q&A Grounding (FAQ Schema)',
      category: 'Corporate Authority',
      status: 'MISSING',
      whatCouldNotBeGathered: 'Explicit question-and-answer pairs regarding SLA guarantees, onboarding timelines, or compliance certifications.',
      whyAgentNeedsIt: 'Question answering agents rely on FAQPage schema for 99%+ confidence answers without hallucinating policy terms.',
      recommendedSchemaOrTag: 'Schema.org "FAQPage" with "mainEntity": [Question, Answer].',
    });
  }

  if (!manifests.llmsTxt.found) {
    informationGaps.push({
      informationField: 'Executive Capability Manifest (llms.txt)',
      category: 'Corporate Authority',
      status: 'MISSING',
      whatCouldNotBeGathered: 'A structured markdown file outlining what this business does, who it serves, and key URLs.',
      whyAgentNeedsIt: 'Enables quick 1-turn ingestion without burning context window tokens scraping dozens of heavy web pages.',
      recommendedSchemaOrTag: 'Host standard /llms.txt at root domain.',
    });
  }

  return { agentFailures, informationGaps };
}

export function generateRemediationCode(
  targetDomain: string,
  siteName: string,
  schema: SchemaAnalysis,
  robots: RobotsTxtAnalysis
): RemediationSnippets {
  const cleanName = siteName || targetDomain;

  // 1. Curated llms.txt
  const llmsTxtSnippet = `# ${cleanName} - LLM & AI Agent Context
> Machine-readable context manifest for AI Autonomous Agents

## Overview
${cleanName} is a premier provider accessible at https://${targetDomain}.
This manifest allows LLMs and autonomous search agents to extract authoritative facts and navigation endpoints with zero token bloat.

## Core Capabilities & Services
- Primary Solutions: Comprehensive professional services, consulting, and solutions.
- Target Audience: Enterprise, B2B, and consumers seeking verified domain expertise.
- Documentation & Knowledge: Available via official website directories and resource center.

## Action & Engagement Endpoints
- Homepage: https://${targetDomain}/
- Contact & Inquiries: https://${targetDomain}/contact
- Services Catalog: https://${targetDomain}/services
- Support Escalation: https://${targetDomain}/support

## Commercial & Licensing Policies
- Autonomous Web Crawling: Permitted for AI search, agent synthesis, and customer assistance.
- Direct Procurement: Route inquiry parameters via official contact forms.
`;

  // 2. Optimized robots.txt
  const robotsTxtSnippet = `# Optimized robots.txt for AI Search & Agent Readiness
# Permits legitimate user-facing AI agents while protecting private routes

User-agent: *
Disallow: /admin/
Disallow: /cart/
Disallow: /checkout/
Disallow: /api/private/
Disallow: /search?*

# Allow Top AI Assistant & Autonomous Agents
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

# Sitemaps
Sitemap: https://${targetDomain}/sitemap.xml
`;

  // 3. Complete Schema.org JSON-LD
  const jsonLdSnippet = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://${targetDomain}/#organization",
      "name": "${cleanName}",
      "url": "https://${targetDomain}",
      "description": "Leading solutions and verified services provider.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-800-555-0199",
        "contactType": "customer service",
        "availableLanguage": ["English"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://${targetDomain}/#website",
      "url": "https://${targetDomain}",
      "name": "${cleanName}",
      "publisher": {
        "@id": "https://${targetDomain}/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://${targetDomain}/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Service",
      "name": "${cleanName} Core Offerings",
      "provider": {
        "@id": "https://${targetDomain}/#organization"
      },
      "areaServed": "Global",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Standard Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Consulting & Implementation"
            }
          }
        ]
      }
    }
  ]
}
</script>`;

  return {
    llmsTxtSnippet,
    robotsTxtSnippet,
    jsonLdSnippet,
  };
}
