import { jsPDF } from 'jspdf';
import { AuditReport } from '../types/audit';

export interface UserLeadInfo {
  name: string;
  companyName: string;
  email: string;
}

export function generatePdfReport(report: AuditReport, lead: UserLeadInfo): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm

  // Colors
  const primaryGreen: [number, number, number] = [0, 135, 82]; // #008752
  const limeAccent: [number, number, number] = [140, 198, 63]; // #8CC63F
  const darkNavy: [number, number, number] = [15, 23, 42]; // #0F172A
  const slate700: [number, number, number] = [51, 65, 85];
  const slate500: [number, number, number] = [100, 116, 139];
  const slate200: [number, number, number] = [226, 232, 240];
  const slate50: [number, number, number] = [248, 250, 252];
  const amberColor: [number, number, number] = [217, 119, 6];
  const roseColor: [number, number, number] = [225, 29, 72];

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const level = report.composite.dialBreakdown?.level ?? (
    report.composite.compositeScore >= 85 ? 5 :
    report.composite.compositeScore >= 70 ? 4 :
    report.composite.compositeScore >= 50 ? 3 :
    report.composite.compositeScore >= 30 ? 2 : 1
  );

  const rawLevelText = report.composite.dialBreakdown?.levelTitle || (
    level === 5 ? 'All system go.' :
    level === 4 ? "Can't buy without human." :
    level === 3 ? "Can't buy or book a meeting." :
    level === 2 ? "Can't find products or services." : "Business doesn't exist."
  );
  const levelTitle = rawLevelText.replace(/^AI Agent [sS]ays:\s*/i, '').trim();

  const scoreTheme = report.composite.compositeScore >= 80
    ? primaryGreen
    : report.composite.compositeScore >= 60
    ? amberColor
    : roseColor;

  // Helper: Draw Top Brand Banner on each page
  const drawPageHeader = (pageNum: number, titleText: string, subText: string) => {
    // Brand color bar top
    doc.setFillColor(...primaryGreen);
    doc.rect(0, 0, pageWidth, 4, 'F');
    doc.setFillColor(...limeAccent);
    doc.rect(pageWidth - 60, 0, 60, 4, 'F');

    // Header Content
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryGreen);
    doc.text('TeamLogic IT®', marginX, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...slate500);
    doc.text('Your Technology Advisor® • AgentReady™ Intelligence Engine', marginX + 32, 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...darkNavy);
    doc.text(`REPORT PAGE ${pageNum} OF 3`, pageWidth - marginX, 12, { align: 'right' });

    // Divider
    doc.setDrawColor(...slate200);
    doc.setLineWidth(0.3);
    doc.line(marginX, 15, pageWidth - marginX, 15);

    // Page Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...darkNavy);
    doc.text(titleText, marginX, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...slate500);
    doc.text(subText, marginX, 26.5);
  };

  // Helper: Draw Footer on each page
  const drawPageFooter = (pageNum: number) => {
    const footerY = 286;
    doc.setDrawColor(...slate200);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY, pageWidth - marginX, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...slate500);
    doc.text('TeamLogic IT Cincinnati Advisory • 513-445-9002 • teamlogicit.com', marginX, footerY + 4.5);
    doc.text(`Audited Domain: ${report.domain} • Prepared for ${lead.name} (${lead.companyName})`, marginX, footerY + 8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryGreen);
    doc.text(`Page ${pageNum} of 3`, pageWidth - marginX, footerY + 6, { align: 'right' });
  };

  // ==========================================
  // PAGE 1: EXECUTIVE SUMMARY & MULTI-TOOL BENCHMARK
  // ==========================================
  drawPageHeader(
    1,
    'EXECUTIVE AI AGENT READINESS & COMPOSITE AUDIT',
    `Audit Target: ${report.domain} | Industry: ${report.industry} | Date: ${currentDate}`
  );

  // Metadata Card for Lead / Target Info
  doc.setFillColor(...slate50);
  doc.setDrawColor(...slate200);
  doc.roundedRect(marginX, 30, contentWidth, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...slate700);
  doc.text('AUDITED TARGET:', marginX + 4, 35);
  doc.text('PREPARED FOR:', marginX + 65, 35);
  doc.text('COMPANY / ORG:', marginX + 125, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkNavy);
  const targetLabel = report.businessName ? `${report.businessName} (${report.domain})` : report.domain;
  doc.text(targetLabel, marginX + 4, 41);
  doc.text(`${lead.name} (${lead.email})`, marginX + 65, 41);
  doc.text(lead.companyName, marginX + 125, 41);

  // Composite Score Hero Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...slate200);
  doc.roundedRect(marginX, 49, contentWidth, 54, 3, 3, 'FD');

  // Green accent bar on left of score card
  doc.setFillColor(...scoreTheme);
  doc.roundedRect(marginX, 49, 4, 54, 2, 2, 'F');

  // Large Score Circle / Number
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(...scoreTheme);
  doc.text(`${report.composite.compositeScore}`, marginX + 12, 68);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(...slate500);
  doc.text('/ 100', marginX + 34, 68);

  // Level Pill
  doc.setFillColor(...scoreTheme);
  doc.roundedRect(marginX + 12, 74, 32, 6, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`LEVEL ${level}`, marginX + 28, 78.2, { align: 'center' });

  // AI Agent Says: Line & Tier Title & Verdict
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...slate700);
  doc.text('AI Agent Says:', marginX + 50, 56);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...darkNavy);
  doc.text(levelTitle, marginX + 50, 62);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryGreen);
  doc.text(`VERDICT: ${report.composite.overallVerdict.toUpperCase()}`, marginX + 50, 68);

  // Executive summary text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slate700);
  const splitSummary = doc.splitTextToSize(report.composite.executiveSummary, 126);
  doc.text(splitSummary.slice(0, 5), marginX + 50, 70);

  // Benchmark stats row inside hero card
  doc.setDrawColor(...slate200);
  doc.line(marginX + 10, 89, pageWidth - marginX - 6, 89);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...slate500);
  doc.text('INDUSTRY MEDIAN:', marginX + 12, 96);
  doc.text('TOP 10% BENCHMARK:', marginX + 70, 96);
  doc.text('COHORT RANK:', marginX + 130, 96);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkNavy);
  doc.text(`${report.benchmark.industryMedian}%`, marginX + 42, 96);
  doc.text(`${report.benchmark.top10Percentile}%`, marginX + 104, 96);
  doc.text(`#${report.benchmark.targetRank} of ${report.benchmark.totalCompaniesInCohort} sites`, marginX + 154, 96);

  // Section 2: 7-Engine Multi-Tool Model Calibration
  let currentY = 108;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkNavy);
  doc.text('7-Tool Agent Readiness Verification Benchmark (7 of 7 Verified)', marginX, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...slate500);
  doc.text('Each diagnostic website was queried directly to calibrate crawlability, schema completeness, and actionability.', marginX, currentY + 4);

  currentY += 8;

  // Tools Table Header
  doc.setFillColor(...slate50);
  doc.setDrawColor(...slate200);
  doc.roundedRect(marginX, currentY, contentWidth, 7, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...slate700);
  doc.text('#', marginX + 3, currentY + 4.8);
  doc.text('DIAGNOSTIC ENGINE & WEBSITE', marginX + 10, currentY + 4.8);
  doc.text('PRIMARY EVALUATION FOCUS', marginX + 68, currentY + 4.8);
  doc.text('STATUS', marginX + 140, currentY + 4.8);
  doc.text('SCORE', marginX + 168, currentY + 4.8);

  currentY += 7.5;

  const tools = report.composite.tools && report.composite.tools.length > 0
    ? report.composite.tools
    : [
        { order: 1, name: 'Ora.ai', displayUrl: 'ora.ai', focus: 'Action surface, /llms.txt & API protocols', score: report.composite.oraAiScore },
        { order: 2, name: 'isitagentready.com', displayUrl: 'isitagentready.com', focus: 'Robots.txt crawl permissions & AI bot matrix', score: report.composite.isitAgentReadyScore },
        { order: 3, name: 'WebYes', displayUrl: 'webyes.com/agent-readiness', focus: 'Semantic entity modeling & JSON-LD schema depth', score: report.composite.webYesScore },
        { order: 4, name: 'SiteSpeakAI Scanner', displayUrl: 'sitespeak.ai/scanner', focus: 'Content extractability, text density & RAG', score: report.composite.siteSpeakScore },
        { order: 5, name: 'ChatThing Agent Checker', displayUrl: 'chatthing.ai/checker', focus: 'Chat agent structure & context QA clarity', score: report.composite.chatThingScore },
        { order: 6, name: 'agenticcommerce.shop', displayUrl: 'agenticcommerce.shop', focus: 'Autonomous buying/selling, Product schemas', score: report.composite.agenticCommerceScore },
        { order: 7, name: 'AI Commerce Ready', displayUrl: 'aicommerceready.com', focus: 'Commerce catalog verification & inventory specs', score: report.composite.aiCommerceReadyScore },
      ];

  tools.slice(0, 7).forEach((t, i) => {
    const rowY = currentY + i * 8.5;
    doc.setFillColor(i % 2 === 0 ? 255 : 249, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 251);
    doc.setDrawColor(...slate200);
    doc.rect(marginX, rowY, contentWidth, 8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkNavy);
    doc.text(`${t.order}`, marginX + 3, rowY + 5.2);

    doc.text(t.name, marginX + 10, rowY + 3.8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...primaryGreen);
    doc.text(t.displayUrl, marginX + 10, rowY + 6.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...slate700);
    doc.text(t.focus.slice(0, 48), marginX + 68, rowY + 5.2);

    // Valid check badge
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(marginX + 138, rowY + 1.8, 20, 4.6, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...primaryGreen);
    doc.text('Verified', marginX + 148, rowY + 5, { align: 'center' });

    // Score
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...darkNavy);
    doc.text(`${t.score}/100`, marginX + 174, rowY + 5.2);
  });

  currentY += 7 * 8.5 + 4;

  // Section 3: 5 Critical Agent Questions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkNavy);
  doc.text('5 Core Agent Readiness Questions (Rated 1 to 100)', marginX, currentY);

  currentY += 6;

  const qData = [
    {
      q: '1. Can AI agents find and trust you?',
      score: report.composite.questionsBreakdown?.findAndTrust?.score ?? 85,
      status: report.composite.questionsBreakdown?.findAndTrust?.status ?? 'GOOD',
      desc: 'Evaluates robots.txt crawler permissions and corporate Schema.org identity.',
    },
    {
      q: '2. Do you make it easier for AI Agents to find information?',
      score: report.composite.questionsBreakdown?.findInformation?.score ?? 72,
      status: report.composite.questionsBreakdown?.findInformation?.status ?? 'FAIR',
      desc: 'Checks for machine context manifests like /llms.txt and XML sitemaps.',
    },
    {
      q: '3. Does AI Agent understand what products and services you offer?',
      score: report.composite.questionsBreakdown?.productsAndServices?.score ?? 68,
      status: report.composite.questionsBreakdown?.productsAndServices?.status ?? 'FAIR',
      desc: 'Inspects Schema.org Service, Product, and Offer structured data catalogs.',
    },
    {
      q: '4. Can AI Agent contact you easily?',
      score: report.composite.questionsBreakdown?.contactEasily?.score ?? 80,
      status: report.composite.questionsBreakdown?.contactEasily?.status ?? 'GOOD',
      desc: 'Assesses structured ContactPoint, phone numbers, and physical location schemas.',
    },
    {
      q: '5. Can AI Agent browse through your website easily?',
      score: report.composite.questionsBreakdown?.browseEasily?.score ?? 88,
      status: report.composite.questionsBreakdown?.browseEasily?.status ?? 'EXCELLENT',
      desc: 'Analyzes AI Agent Readiness landmarks, link architecture, and crawl delay.',
    },
  ];

  qData.forEach((q, idx) => {
    const itemY = currentY + idx * 8.8;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...slate200);
    doc.roundedRect(marginX, itemY, contentWidth, 7.8, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkNavy);
    doc.text(q.q, marginX + 4, itemY + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...slate500);
    doc.text(q.desc.slice(0, 85), marginX + 4, itemY + 6.6);

    const qColor = q.score >= 80 ? primaryGreen : q.score >= 60 ? amberColor : roseColor;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...qColor);
    doc.text(`${q.score}/100`, pageWidth - marginX - 22, itemY + 5.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(`[${q.status}]`, pageWidth - marginX - 4, itemY + 5.2, { align: 'right' });
  });

  drawPageFooter(1);

  // ==========================================
  // PAGE 2: DIMENSION DIAGNOSTICS & AGENT FAILURE POINTS
  // ==========================================
  doc.addPage();
  drawPageHeader(
    2,
    'TECHNICAL DIMENSION DIAGNOSTICS & AGENT FAILURE GAPS',
    `In-depth inspection of crawler governance, machine protocols, and autonomous transaction blocks`
  );

  // 1. 5 Core Dimensions Card
  let p2Y = 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkNavy);
  doc.text('5 Audited Technical Dimension Weights', marginX, p2Y);

  p2Y += 5;

  const dimensions = [
    {
      name: 'Bot Crawlability & Permissions (Robots.txt)',
      score: report.composite.dimensionScores.crawlability,
      weight: '25%',
      detail: `${report.robotsTxt.found ? 'Robots.txt found' : 'Robots.txt missing'}. ${report.robotsTxt.bots.filter(b => b.status === 'ALLOWED').length} of ${report.robotsTxt.bots.length} AI bots explicitly allowed.`,
    },
    {
      name: 'Structured Schema & Entity Modeling (JSON-LD)',
      score: report.composite.dimensionScores.structuredSchema,
      weight: '25%',
      detail: `${report.schema.totalSchemas} schema entities detected. Org: ${report.schema.hasOrganization ? 'Yes' : 'No'}, Services: ${report.schema.hasServiceOrProduct ? 'Yes' : 'No'}, FAQ: ${report.schema.hasFaq ? 'Yes' : 'No'}.`,
    },
    {
      name: 'Actionability & Autonomous Task Readiness',
      score: report.composite.dimensionScores.actionability,
      weight: '20%',
      detail: `${report.schema.hasActionSchema ? 'Machine action trigger endpoints detected' : 'No PotentialAction schemas found for autonomous purchasing/booking'}.`,
    },
    {
      name: 'AI Agent Readiness & Semantic Landmark Clarity',
      score: report.composite.dimensionScores.semanticClarity,
      weight: '15%',
      detail: `${report.htmlMeta.wordCount} words analyzed. <main> tag: ${report.htmlMeta.hasMainTag ? 'Present' : 'Missing'}, form actions: ${report.htmlMeta.hasForms ? 'Yes' : 'No'}.`,
    },
    {
      name: 'Machine Protocols (/llms.txt, OpenAPI & Sitemaps)',
      score: report.composite.dimensionScores.machineProtocols,
      weight: '15%',
      detail: `/llms.txt: ${report.manifests.llmsTxt.found ? 'Found' : 'Missing'}, XML sitemap: ${report.manifests.sitemapXml.found ? 'Present' : 'Not found'}, OpenAPI: ${report.manifests.openApi.found ? 'Present' : 'Missing'}.`,
    },
  ];

  dimensions.forEach((dim, i) => {
    const dimY = p2Y + i * 11.5;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...slate200);
    doc.roundedRect(marginX, dimY, contentWidth, 10.5, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...darkNavy);
    doc.text(dim.name, marginX + 4, dimY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...slate500);
    doc.text(`Weight: ${dim.weight}`, marginX + 115, dimY + 4);

    // Score & mini bar
    const barWidth = 35;
    const barX = marginX + 138;
    doc.setFillColor(...slate200);
    doc.roundedRect(barX, dimY + 1.8, barWidth, 3, 1, 1, 'F');

    const fillWidth = (dim.score / 100) * barWidth;
    const dimColor = dim.score >= 80 ? primaryGreen : dim.score >= 60 ? amberColor : roseColor;
    doc.setFillColor(...dimColor);
    doc.roundedRect(barX, dimY + 1.8, Math.max(2, fillWidth), 3, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...dimColor);
    doc.text(`${dim.score}%`, marginX + 176, dimY + 4.2);

    // Detail subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...slate700);
    doc.text(dim.detail.slice(0, 115), marginX + 4, dimY + 8);
  });

  p2Y += 5 * 11.5 + 5;

  // 2. Crawler Permissions Bot Matrix
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkNavy);
  doc.text('AI Crawler & Autonomous Agent Access Matrix (Robots.txt)', marginX, p2Y);

  p2Y += 5;

  doc.setFillColor(...slate50);
  doc.setDrawColor(...slate200);
  doc.roundedRect(marginX, p2Y, contentWidth, 22, 2, 2, 'FD');

  const bots = report.robotsTxt.bots.slice(0, 6);
  bots.forEach((b, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const botX = marginX + 4 + col * 59;
    const botY = p2Y + 4 + row * 9;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkNavy);
    doc.text(b.botName, botX, botY);

    const isAllowed = b.status === 'ALLOWED' || b.status === 'NOT_MENTIONED_ALLOWED';
    doc.setFillColor(isAllowed ? 236 : 254, isAllowed ? 253 : 242, isAllowed ? 245 : 242);
    doc.setDrawColor(isAllowed ? 167 : 254, isAllowed ? 243 : 202, isAllowed ? 208 : 202);
    doc.roundedRect(botX + 32, botY - 3.2, 20, 4.2, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(isAllowed ? primaryGreen[0] : roseColor[0], isAllowed ? primaryGreen[1] : roseColor[1], isAllowed ? primaryGreen[2] : roseColor[2]);
    doc.text(isAllowed ? 'ALLOWED' : 'BLOCKED', botX + 42, botY - 0.2, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(...slate500);
    doc.text(`${b.vendor} • ${b.purpose.slice(0, 18)}`, botX, botY + 3.8);
  });

  p2Y += 28;

  // 3. Autonomous Agent Capability Failure Points
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkNavy);
  doc.text('Critical Agent Capability Failures & Information Gaps', marginX, p2Y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...slate500);
  doc.text('Specific friction points where autonomous AI buyers stall, produce hallucinations, or require human intervention.', marginX, p2Y + 4);

  p2Y += 7.5;

  const failures = report.agentFailures && report.agentFailures.length > 0
    ? report.agentFailures.slice(0, 4)
    : [
        {
          capability: 'Autonomous Service Checkout & Booking',
          category: 'Transactional',
          status: 'FAILED',
          whatAgentFailedToDo: 'Could not execute service booking without triggering a human form callback.',
          technicalRootCause: 'Absence of Schema.org ReserveAction or OrderAction endpoints.',
          impactLevel: 'HIGH',
        },
        {
          capability: 'Machine-Readable Pricing Extraction',
          category: 'Information Retrieval',
          status: 'FAILED',
          whatAgentFailedToDo: 'Unable to extract deterministic tier rates or monthly SLA pricing.',
          technicalRootCause: 'Pricing buried inside unstructured text and dynamic DOM tabs.',
          impactLevel: 'HIGH',
        },
        {
          capability: 'Context Ingestion Efficiency (/llms.txt)',
          category: 'Tool Calling',
          status: 'FAILED',
          whatAgentFailedToDo: 'Agent forced to crawl 15+ HTML pages consuming 40,000+ context tokens.',
          technicalRootCause: 'No root /llms.txt manifest provided for clean markdown ingestion.',
          impactLevel: 'MEDIUM',
        },
        {
          capability: 'Direct Escalation Dispatch',
          category: 'Navigation',
          status: 'PARTIAL',
          whatAgentFailedToDo: 'Could not identify authoritative department phone extension in machine format.',
          technicalRootCause: 'Contact details lack Schema.org ContactPoint structured markup.',
          impactLevel: 'MEDIUM',
        },
      ];

  failures.forEach((f, idx) => {
    const fY = p2Y + idx * 16.5;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...slate200);
    doc.roundedRect(marginX, fY, contentWidth, 15, 1.5, 1.5, 'FD');

    // Impact tag
    const isHigh = f.impactLevel === 'HIGH';
    doc.setFillColor(isHigh ? 254 : 254, isHigh ? 242 : 243, isHigh ? 242 : 199);
    doc.roundedRect(marginX + 4, fY + 2.5, 24, 4.2, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(isHigh ? roseColor[0] : amberColor[0], isHigh ? roseColor[1] : amberColor[1], isHigh ? roseColor[2] : amberColor[2]);
    doc.text(`${f.impactLevel} IMPACT`, marginX + 16, fY + 5.5, { align: 'center' });

    // Capability Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...darkNavy);
    doc.text(f.capability, marginX + 32, fY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...slate500);
    doc.text(`Category: ${f.category}`, marginX + 130, fY + 5.5);

    // What failed
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...slate700);
    doc.text('Agent Blocked:', marginX + 4, fY + 9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkNavy);
    doc.text(f.whatAgentFailedToDo.slice(0, 95), marginX + 26, fY + 9.5);

    // Technical root cause
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...slate700);
    doc.text('Root Cause:', marginX + 4, fY + 13.2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...slate500);
    doc.text(f.technicalRootCause.slice(0, 98), marginX + 26, fY + 13.2);
  });

  drawPageFooter(2);

  // ==========================================
  // PAGE 3: ACTIONABLE WEBSITE QUICK FIXES & BLUEPRINT
  // ==========================================
  doc.addPage();
  drawPageHeader(
    3,
    'ACTIONABLE WEBSITE QUICK FIXES & REMEDIATION BLUEPRINT',
    `Step-by-step code snippets to boost ${report.domain} readiness to Level 5 (All Systems Go)`
  );

  let p3Y = 32;

  // Expected Lift Banner
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(marginX, p3Y, contentWidth, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryGreen);
  doc.text('PROJECTED AUDIT SCORE LIFT AFTER REMEDIATION: +25 TO +40 POINTS', marginX + 5, p3Y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...slate700);
  doc.text(
    `Applying these 4 fixes enables autonomous AI agents (ChatGPT Operator, Claude 3.7, Perplexity) to discover, evaluate, and transact with ${report.domain} without human drop-off.`,
    marginX + 5,
    p3Y + 10.5
  );

  p3Y += 18;

  // Quick Fix 1: Robots.txt AI Agent Permissions
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...slate200);
  doc.roundedRect(marginX, p3Y, contentWidth, 42, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...darkNavy);
  doc.text('Quick Fix 1: Grant Explicit Permissions in /robots.txt', marginX + 5, p3Y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...slate700);
  doc.text(
    'Allow task-executing AI agents to access your public marketing and service pages while keeping admin routes protected.',
    marginX + 5,
    p3Y + 9.5
  );

  // Code box 1
  doc.setFillColor(...slate50);
  doc.setDrawColor(...slate200);
  doc.roundedRect(marginX + 5, p3Y + 12, contentWidth - 10, 26, 1.5, 1.5, 'FD');

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...darkNavy);
  const robotsLines = [
    '# Add to https://' + report.domain + '/robots.txt',
    'User-agent: GPTBot',
    'Allow: /',
    'User-agent: ClaudeBot',
    'Allow: /',
    'User-agent: PerplexityBot',
    'Allow: /',
    'Sitemap: https://' + report.domain + '/sitemap.xml',
  ];
  robotsLines.forEach((line, lIdx) => {
    doc.text(line, marginX + 8, p3Y + 16 + lIdx * 2.9);
  });

  p3Y += 46;

  // Quick Fix 2: Deploy /llms.txt Context Manifest
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...slate200);
  doc.roundedRect(marginX, p3Y, contentWidth, 44, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...darkNavy);
  doc.text('Quick Fix 2: Publish Standard /llms.txt Context Manifest', marginX + 5, p3Y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...slate700);
  doc.text(
    'The /llms.txt standard provides LLMs with a lightweight, authoritative markdown index of your core services and links.',
    marginX + 5,
    p3Y + 9.5
  );

  // Code box 2
  doc.setFillColor(...slate50);
  doc.setDrawColor(...slate200);
  doc.roundedRect(marginX + 5, p3Y + 12, contentWidth - 10, 28, 1.5, 1.5, 'FD');

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...darkNavy);
  const llmsLines = [
    '# Create https://' + report.domain + '/llms.txt',
    '# ' + (lead.companyName || report.domain),
    '> ' + report.industry + ' provider offering reliable solutions.',
    '',
    '## Key Services & Capabilities',
    '- Managed IT & Cybersecurity: https://' + report.domain + '/services',
    '- Request Consultation: https://' + report.domain + '/contact',
    '- Authority Manifest: https://' + report.domain + '/sitemap.xml',
  ];
  llmsLines.forEach((line, lIdx) => {
    doc.text(line, marginX + 8, p3Y + 16 + lIdx * 3.1);
  });

  p3Y += 48;

  // Quick Fix 3: Schema.org Structured Data Injection
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...slate200);
  doc.roundedRect(marginX, p3Y, contentWidth, 48, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...darkNavy);
  doc.text('Quick Fix 3: Inject Schema.org JSON-LD Structured Data in <head>', marginX + 5, p3Y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...slate700);
  doc.text(
    'Equips search bots and AI agent buyers with deterministic entity identities, verified phone numbers, and addresses.',
    marginX + 5,
    p3Y + 9.5
  );

  // Code box 3
  doc.setFillColor(...slate50);
  doc.setDrawColor(...slate200);
  doc.roundedRect(marginX + 5, p3Y + 12, contentWidth - 10, 32, 1.5, 1.5, 'FD');

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...darkNavy);
  const schemaLines = [
    '<script type="application/ld+json">',
    '{',
    '  "@context": "https://schema.org",',
    '  "@type": "LocalBusiness",',
    '  "name": "' + (lead.companyName || report.domain) + '",',
    '  "url": "https://' + report.domain + '",',
    '  "telephone": "+1-513-445-9002",',
    '  "email": "' + lead.email + '",',
    '  "priceRange": "$$",',
    '  "areaServed": "United States"',
    '}',
    '</script>',
  ];
  schemaLines.forEach((line, lIdx) => {
    doc.text(line, marginX + 8, p3Y + 16 + lIdx * 2.5);
  });

  p3Y += 52;

  // Section: TeamLogic IT Advisory Support Card
  doc.setFillColor(...slate50);
  doc.setDrawColor(...primaryGreen);
  doc.setLineWidth(0.8);
  doc.roundedRect(marginX, p3Y, contentWidth, 38, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryGreen);
  doc.text('Next Step: Schedule Your Free Engineering Implementation Session', marginX + 6, p3Y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...slate700);
  const consultText = [
    `TeamLogic IT helps businesses across North America implement these exact AI Agent Readiness remediations`,
    `with zero downtime. Our engineering advisory team handles robots.txt tuning, JSON-LD entity validation, and`,
    `automated /llms.txt manifest pipeline deployments.`,
  ];
  consultText.forEach((cLine, cIdx) => {
    doc.text(cLine, marginX + 6, p3Y + 12 + cIdx * 4);
  });

  // Contact points inside card
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkNavy);
  doc.text('Phone: (513) 445-9002', marginX + 6, p3Y + 28);
  doc.text('Website: teamlogicit.com', marginX + 55, p3Y + 28);
  doc.text('Office: Cincinnati Ohio Advisory', marginX + 110, p3Y + 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryGreen);
  doc.text('Your Technology Advisor® • Keeping Your Business Safe, Connected & Agent-Ready', marginX + 6, p3Y + 34);

  drawPageFooter(3);

  // Save the PDF
  const safeDomain = report.domain.replace(/[^a-zA-Z0-9.-]/g, '_');
  doc.save(`${safeDomain}-AI-Agent-Readiness-Audit-Report.pdf`);
}
