import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import {
  parseRobotsTxt,
  parseHtmlAndSchemas,
  computeCompositeScores,
  deriveAgentFailuresAndGaps,
  generateRemediationCode,
} from './server/scanner.ts';
import { buildIndustryBenchmark, getAllIndustriesList } from './server/industryData.ts';
import { runAgentTaskSimulation } from './server/geminiAgent.ts';
import { sendLeadNotification, sendAuditNotification, getCapturedLeads } from './server/mailer.ts';
import type { AuditReport, MachineManifests } from './src/types/audit.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Helper for fetching external URLs safely with timeout and User-Agent
async function fetchSafe(url: string, timeoutMs = 7000): Promise<{ ok: boolean; status: number; text: string; contentType: string }> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 AgentReadinessAuditor/2.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });
    clearTimeout(id);
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    return { ok: res.ok, status: res.status, text, contentType };
  } catch (err: any) {
    clearTimeout(id);
    return { ok: false, status: 0, text: '', contentType: '' };
  }
}

// Normalize incoming URL to protocol + domain
function normalizeTarget(inputUrl: string): { fullUrl: string; domain: string; baseOrigin: string } {
  let cleaned = inputUrl.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'https://' + cleaned;
  }
  try {
    const parsed = new URL(cleaned);
    const domain = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const baseOrigin = `${parsed.protocol}//${parsed.hostname}`;
    return {
      fullUrl: `${parsed.protocol}//${parsed.hostname}${parsed.pathname === '/' ? '' : parsed.pathname}`,
      domain,
      baseOrigin,
    };
  } catch {
    // Fallback if URL constructor fails
    const sanitized = cleaned.replace(/^https?:\/\//i, '').split('/')[0];
    return {
      fullUrl: `https://${sanitized}`,
      domain: sanitized.replace(/^www\./, ''),
      baseOrigin: `https://${sanitized}`,
    };
  }
}

// Presets endpoint
app.get('/api/presets', (_req: Request, res: Response) => {
  res.json({
    presets: [
      {
        name: 'Procter & Gamble (P&G)',
        url: 'https://us.pg.com/',
        industry: 'consumer_goods',
        description: 'Global consumer goods leader with structured schema & enterprise agent readiness.',
      },
      {
        name: 'TeamLogic IT',
        url: 'teamlogicit.com',
        industry: 'information_technology_and_services',
        description: 'Managed IT Services provider featured in IsItAgentReady benchmark.',
      },
      {
        name: 'Ora.ai',
        url: 'ora.ai',
        industry: 'computer_software',
        description: 'Autonomous AI creation platform and benchmark source.',
      },
      {
        name: 'WebYes',
        url: 'webyes.com',
        industry: 'internet',
        description: 'Agent readiness pioneer and AI agent readiness reference.',
      },
      {
        name: 'Stripe',
        url: 'stripe.com',
        industry: 'financial_services',
        description: 'Gold standard for machine-readable developer documentation & OpenAPI.',
      },
      {
        name: 'Zocdoc',
        url: 'zocdoc.com',
        industry: 'hospital_health_care',
        description: 'Healthcare booking platform with structured doctor & insurance schemas.',
      },
      {
        name: 'Warby Parker',
        url: 'warbyparker.com',
        industry: 'retail',
        description: 'DTC E-commerce retailer with product catalog schemas.',
      },
    ],
  });
});

// Industries endpoint
app.get('/api/industries', (_req: Request, res: Response) => {
  const industries = getAllIndustriesList();
  res.json({ industries });
});

// Main Audit Route
app.post('/api/audit', async (req: Request, res: Response) => {
  const { url: rawUrl, industry = 'msp_it' } = req.body;

  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim().length === 0) {
    res.status(400).json({ error: 'A valid website domain or URL is required.' });
    return;
  }

  const { fullUrl, domain, baseOrigin } = normalizeTarget(rawUrl);

  try {
    // 1. Fetch robots.txt
    const robotsUrl = `${baseOrigin}/robots.txt`;
    const robotsRes = await fetchSafe(robotsUrl, 6000);
    const robotsAnalysis = parseRobotsTxt(robotsRes.ok ? robotsRes.text : '', robotsUrl);

    // 2. Fetch HTML page
    const htmlRes = await fetchSafe(fullUrl, 8000);
    let htmlContent = htmlRes.text;
    let wafOrBotShieldDetected = false;

    // Check if WAF or Cloudflare challenge occurred (403 or specific title)
    if (htmlRes.status === 403 || htmlRes.text.includes('Cloudflare') && htmlRes.text.includes('challenge')) {
      wafOrBotShieldDetected = true;
    }

    // 3. Check Machine Manifests in parallel
    const [llmsTxtRes, llmsTxtWellKnownRes, sitemapRes, openApiRes, aiPluginRes] = await Promise.all([
      fetchSafe(`${baseOrigin}/llms.txt`, 4000),
      fetchSafe(`${baseOrigin}/.well-known/llms.txt`, 4000),
      fetchSafe(`${baseOrigin}/sitemap.xml`, 4000),
      fetchSafe(`${baseOrigin}/.well-known/openapi.yaml`, 4000),
      fetchSafe(`${baseOrigin}/.well-known/ai-plugin.json`, 4000),
    ]);

    const llmsTxtContent = llmsTxtRes.ok ? llmsTxtRes.text : llmsTxtWellKnownRes.ok ? llmsTxtWellKnownRes.text : undefined;
    const manifests: MachineManifests = {
      llmsTxt: {
        found: !!llmsTxtContent && llmsTxtContent.length > 20,
        url: llmsTxtRes.ok ? `${baseOrigin}/llms.txt` : llmsTxtWellKnownRes.ok ? `${baseOrigin}/.well-known/llms.txt` : undefined,
        content: llmsTxtContent ? llmsTxtContent.slice(0, 1500) : undefined,
      },
      aiPluginJson: {
        found: aiPluginRes.ok && aiPluginRes.text.includes('"schema_version"'),
        url: aiPluginRes.ok ? `${baseOrigin}/.well-known/ai-plugin.json` : undefined,
      },
      sitemapXml: {
        found: sitemapRes.ok || robotsAnalysis.sitemaps.length > 0,
        url: sitemapRes.ok ? `${baseOrigin}/sitemap.xml` : robotsAnalysis.sitemaps[0] || undefined,
      },
      openApi: {
        found: openApiRes.ok && (openApiRes.text.includes('openapi:') || openApiRes.text.includes('"openapi"')),
        url: openApiRes.ok ? `${baseOrigin}/.well-known/openapi.yaml` : undefined,
      },
    };

    // 4. Parse HTML and Schema
    const { schema, htmlMeta } = parseHtmlAndSchemas(htmlContent, fullUrl);

    // 5. Compute Composite Scores across IsItAgentReady, WebYes, and Ora.ai models
    const composite = computeCompositeScores(robotsAnalysis, schema, manifests, htmlMeta);

    // 6. Derive Agent Capability Failures & Information Gaps
    const { agentFailures, informationGaps } = deriveAgentFailuresAndGaps(
      robotsAnalysis,
      schema,
      manifests,
      htmlMeta,
      domain
    );

    // 7. Run Gemini Autonomous Agent Task Simulation
    const hasPricingInSchema = schema.items.some(i => i.propertiesFound.includes('price') || i.propertiesFound.includes('offers'));
    const simulatedTasks = await runAgentTaskSimulation(
      domain,
      htmlMeta.title || domain,
      robotsAnalysis.rawText.slice(0, 800),
      schema.summary,
      htmlContent.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').slice(0, 2000),
      schema.hasActionSchema,
      hasPricingInSchema
    );

    // 8. Extract actual name of the business
    const orgSchema = schema.items.find(
      (i) =>
        ['Organization', 'Corporation', 'LocalBusiness', 'MedicalBusiness', 'Brand', 'WebSite'].includes(i.type) &&
        i.name
    );
    let businessName = orgSchema?.name ? String(orgSchema.name).trim() : '';

    if (!businessName && htmlMeta.title) {
      businessName = htmlMeta.title.split(/[|•–—]/)[0].trim();
      businessName = businessName.replace(/\s*-\s*(Home|Official Site|Official Website|Welcome|Overview).*$/i, '').trim();
    }

    if (!businessName || businessName.length < 2) {
      if (domain.includes('pg.com')) businessName = 'Procter & Gamble';
      else if (domain.includes('teamlogicit.com')) businessName = 'TeamLogic IT';
      else if (domain.includes('ora.ai')) businessName = 'Ora.ai';
      else if (domain.includes('webyes.com')) businessName = 'WebYes';
      else if (domain.includes('stripe.com')) businessName = 'Stripe';
      else if (domain.includes('warbyparker.com')) businessName = 'Warby Parker';
      else if (domain.includes('zocdoc.com')) businessName = 'Zocdoc';
      else {
        businessName = domain.replace(/^www\./, '').split('.')[0]
          .split(/[-_]/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }
    }

    // 9. Build Industry Benchmarks & Rank
    const benchmark = buildIndustryBenchmark(
      industry,
      composite.compositeScore,
      composite.dimensionScores.crawlability,
      composite.dimensionScores.structuredSchema,
      composite.dimensionScores.actionability,
      domain,
      businessName
    );

    // 10. Generate 1-Click Remediation Snippets (llms.txt, robots.txt, schema.org)
    const remediation = generateRemediationCode(
      domain,
      businessName,
      schema,
      robotsAnalysis
    );

    const report: AuditReport = {
      targetUrl: fullUrl,
      domain,
      businessName,
      industry: benchmark.industryName,
      timestamp: new Date().toISOString(),
      composite,
      robotsTxt: robotsAnalysis,
      schema,
      manifests,
      agentFailures,
      informationGaps,
      simulatedTasks,
      benchmark,
      remediation,
      wafOrBotShieldDetected,
      htmlMeta,
    };

    // Dispatch audit notification email to apatel@mysecuregpt.com
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
    const userAgent = (req.headers['user-agent'] as string) || '';

    sendAuditNotification({
      domain,
      targetUrl: fullUrl,
      businessName,
      compositeScore: composite.compositeScore,
      grade: composite.grade,
      levelTitle: composite.dialBreakdown?.levelTitle || composite.levelTitle,
      industry: benchmark.industryName,
      crawlability: composite.dimensionScores.crawlability,
      structuredSchema: composite.dimensionScores.structuredSchema,
      actionability: composite.dimensionScores.actionability,
      timestamp: report.timestamp,
      clientIp,
      userAgent,
    }).catch((notifErr: any) => {
      console.warn('[Audit Notification] Error dispatching email notification:', notifErr?.message);
    });

    res.json(report);
  } catch (err: any) {
    console.error('Audit execution error:', err);
    res.status(500).json({
      error: 'Failed to complete agent readiness audit.',
      details: err?.message || 'Network or parsing error.',
    });
  }
});

// Lead capture endpoint (dispatches email notification to apatel@teamlogicit.com)
const handleLeadSubmission = async (req: Request, res: Response) => {
  const {
    name,
    companyName,
    email,
    domain,
    targetUrl,
    compositeScore,
    grade,
    levelTitle,
    crawlability,
    structuredSchema,
    actionability,
    industry,
  } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Name is required.' });
    return;
  }
  if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
    res.status(400).json({ error: 'Company name is required.' });
    return;
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'A valid email address is required.' });
    return;
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  try {
    const result = await sendLeadNotification({
      name: name.trim(),
      companyName: companyName.trim(),
      email: email.trim(),
      domain: domain ? String(domain).trim() : undefined,
      targetUrl: targetUrl ? String(targetUrl).trim() : undefined,
      compositeScore: typeof compositeScore === 'number' ? compositeScore : undefined,
      grade: grade ? String(grade) : undefined,
      levelTitle: levelTitle ? String(levelTitle) : undefined,
      crawlability: typeof crawlability === 'number' ? crawlability : undefined,
      structuredSchema: typeof structuredSchema === 'number' ? structuredSchema : undefined,
      actionability: typeof actionability === 'number' ? actionability : undefined,
      industry: industry ? String(industry) : undefined,
      submittedAt: new Date().toISOString(),
      ip: clientIp,
    });

    res.json({
      success: true,
      message: 'Lead received and email notification dispatched to apatel@teamlogicit.com.',
      channels: result.channels,
    });
  } catch (err: any) {
    console.error('Lead submission dispatch error:', err);
    res.status(500).json({
      error: 'Failed to process lead notification.',
      details: err?.message || 'Unknown error',
    });
  }
};

app.post('/api/report-lead', handleLeadSubmission);
app.post('/api/submit-lead', handleLeadSubmission);

// Admin inspection endpoint for captured leads
app.get('/api/leads', (_req: Request, res: Response) => {
  const leads = getCapturedLeads();
  res.json({
    total: leads.length,
    recipient: process.env.NOTIFICATION_EMAIL || 'apatel@teamlogicit.com',
    leads,
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgentReady server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
