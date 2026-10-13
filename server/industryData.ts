import type { IndustryBenchmark, BenchmarkCompany } from '../src/types/audit.ts';

export const RAW_INDUSTRY_LIST: string[] = [
  "Accounting",
  "Airlines/Aviation",
  "Alternative Dispute Resolution",
  "Alternative Medicine",
  "Animation",
  "Apparel & Fashion",
  "Architecture & Planning",
  "Arts and Crafts",
  "Automotive",
  "Aviation & Aerospace",
  "Banking",
  "Biotechnology",
  "Broadcast Media",
  "Building Materials",
  "Business Supplies and Equipment",
  "Capital Markets",
  "Chemicals",
  "Civic & Social Organization",
  "Civil Engineering",
  "Commercial Real Estate",
  "Computer & Network Security",
  "Computer Games",
  "Computer Hardware",
  "Computer Networking",
  "Computer Software",
  "Construction",
  "Consumer Electronics",
  "Consumer Goods",
  "Consumer Services",
  "Cosmetics",
  "Dairy",
  "Defense & Space",
  "Design",
  "Education Management",
  "E-Learning",
  "Electrical/Electronic Manufacturing",
  "Entertainment",
  "Environmental Services",
  "Events Services",
  "Executive Office",
  "Facilities Services",
  "Farming",
  "Financial Services",
  "Fine Art",
  "Fishery",
  "Food & Beverages",
  "Food Production",
  "Fund-Raising",
  "Furniture",
  "Gambling & Casinos",
  "Glass",
  "Government Administration",
  "Government Relations",
  "Graphic Design",
  "Health",
  "Higher Education",
  "Hospital & Health Care",
  "Hospitality",
  "Human Resources",
  "Import and Export",
  "Individual & Family Services",
  "Industrial Automation",
  "Information Services",
  "Information Technology and Services",
  "Insurance",
  "International Affairs",
  "International Trade and Development",
  "Internet",
  "Investment Banking",
  "Investment Management",
  "Judiciary",
  "Law Enforcement",
  "Law Practice",
  "Legal Services",
  "Legislative Office",
  "Leisure",
  "Libraries",
  "Logistics and Supply Chain",
  "Luxury Goods & Jewelry",
  "Machinery",
  "Management Consulting",
  "Maritime",
  "Market Research",
  "Marketing and Advertising",
  "Mechanical or Industrial Engineering",
  "Media Production",
  "Medical Devices",
  "Medical Practice",
  "Mental Health Care",
  "Military",
  "Mining & Metals",
  "Mobile Games",
  "Motion Pictures and Film",
  "Museums and Institutions",
  "Music",
  "Nanotechnology",
  "Newspapers",
  "Non-Profit Organization Management",
  "Oil & Energy",
  "Online Media",
  "Outsourcing/Offshoring",
  "Package/Freight Delivery",
  "Packaging and Containers",
  "Paper & Forest Products",
  "Performing Arts",
  "Pharmaceuticals",
  "Philanthropy",
  "Photography",
  "Plastics",
  "Political Organization",
  "Primary/Secondary Education",
  "Printing",
  "Professional Training & Coaching",
  "Program Development",
  "Public Policy",
  "Public Relations and Communications",
  "Public Safety",
  "Publishing",
  "Railroad Manufacture",
  "Ranching",
  "Real Estate",
  "Recreational Facilities and Services",
  "Religious Institutions",
  "Renewables & Environment",
  "Research",
  "Restaurants",
  "Retail",
  "Security and Investigations",
  "Semiconductors",
  "Shipbuilding",
  "Sporting Goods",
  "Sports",
  "Staffing and Recruiting",
  "Supermarkets",
  "Telecommunications",
  "Textiles",
  "Think Tanks",
  "Tobacco",
  "Translation and Localization",
  "Transportation/Trucking/Railroad",
  "Utilities",
  "Venture Capital & Private Equity",
  "Veterinary",
  "Warehousing",
  "Wholesale",
  "Wine and Spirits",
  "Wireless",
  "Writing and Editing"
];

export function industryToId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// Sector archetypes to provide realistic peer companies & calibrated medians
interface SectorTemplate {
  defaultMedian: number;
  top10: number;
  peers: {
    name: string;
    domain: string;
    compositeScore: number;
    robotsTxtScore: number;
    schemaScore: number;
    actionabilityScore: number;
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    keyAdvantageOrFlaw: string;
  }[];
}

const MSP_IT_TEMPLATE: SectorTemplate = {
  defaultMedian: 58,
  top10: 84,
  peers: [
    {
      name: 'Dataprise',
      domain: 'dataprise.com',
      compositeScore: 82,
      robotsTxtScore: 90,
      schemaScore: 85,
      actionabilityScore: 71,
      grade: 'A',
      keyAdvantageOrFlaw: 'Allows AI bots; complete LocalBusiness & Service schemas with office locations',
    },
    {
      name: 'Thrive Networks',
      domain: 'thrivenextgen.com',
      compositeScore: 74,
      robotsTxtScore: 85,
      schemaScore: 72,
      actionabilityScore: 65,
      grade: 'B',
      keyAdvantageOrFlaw: 'Good schema coverage; lacks llms.txt and transparent pricing for autonomous procurement',
    },
    {
      name: 'TeamLogic IT',
      domain: 'teamlogicit.com',
      compositeScore: 62,
      robotsTxtScore: 75,
      schemaScore: 64,
      actionabilityScore: 48,
      grade: 'C',
      keyAdvantageOrFlaw: 'Permissive robots.txt, but lacks transactional booking endpoints and pricing schema',
    },
    {
      name: 'Fully Managed',
      domain: 'fullymanaged.com',
      compositeScore: 56,
      robotsTxtScore: 60,
      schemaScore: 58,
      actionabilityScore: 50,
      grade: 'C',
      keyAdvantageOrFlaw: 'Basic Organization schema; blocks CCBot and has dynamic JavaScript quotation forms',
    },
    {
      name: 'All Covered (Konica)',
      domain: 'allcovered.com',
      compositeScore: 51,
      robotsTxtScore: 50,
      schemaScore: 52,
      actionabilityScore: 51,
      grade: 'D',
      keyAdvantageOrFlaw: 'Disallows several AI user-agents; enterprise portal hides direct service details behind lead walls',
    },
    {
      name: 'Geek Squad Commercial',
      domain: 'bestbuy.com/geeksquad',
      compositeScore: 44,
      robotsTxtScore: 35,
      schemaScore: 55,
      actionabilityScore: 42,
      grade: 'D',
      keyAdvantageOrFlaw: 'Aggressive bot-blocking headers (Akamai/WAF) restrict autonomous agent indexing',
    },
  ],
};

const SAAS_TECH_TEMPLATE: SectorTemplate = {
  defaultMedian: 71,
  top10: 92,
  peers: [
    {
      name: 'Stripe',
      domain: 'stripe.com',
      compositeScore: 94,
      robotsTxtScore: 95,
      schemaScore: 92,
      actionabilityScore: 95,
      grade: 'A+',
      keyAdvantageOrFlaw: 'Exemplary developer OpenAPI specs, allows search bots, deep structured documentation',
    },
    {
      name: 'Linear',
      domain: 'linear.app',
      compositeScore: 89,
      robotsTxtScore: 92,
      schemaScore: 88,
      actionabilityScore: 87,
      grade: 'A',
      keyAdvantageOrFlaw: 'Semantic HTML5, public API docs, transparent pricing tables, permissive robots.txt',
    },
    {
      name: 'Notion',
      domain: 'notion.so',
      compositeScore: 79,
      robotsTxtScore: 80,
      schemaScore: 78,
      actionabilityScore: 79,
      grade: 'B',
      keyAdvantageOrFlaw: 'Great public API, but rich client-side SPA rendering causes friction for simple scrapers',
    },
    {
      name: 'Datadog',
      domain: 'datadoghq.com',
      compositeScore: 73,
      robotsTxtScore: 70,
      schemaScore: 76,
      actionabilityScore: 73,
      grade: 'B',
      keyAdvantageOrFlaw: 'Restricts training bots in robots.txt; comprehensive product schema',
    },
    {
      name: 'Asana',
      domain: 'asana.com',
      compositeScore: 68,
      robotsTxtScore: 65,
      schemaScore: 72,
      actionabilityScore: 67,
      grade: 'C',
      keyAdvantageOrFlaw: 'Complex enterprise gatekeeping on pricing; disallows GPTBot from selected documentation paths',
    },
  ],
};

const HEALTH_TEMPLATE: SectorTemplate = {
  defaultMedian: 52,
  top10: 79,
  peers: [
    {
      name: 'Zocdoc',
      domain: 'zocdoc.com',
      compositeScore: 81,
      robotsTxtScore: 85,
      schemaScore: 84,
      actionabilityScore: 74,
      grade: 'A',
      keyAdvantageOrFlaw: 'Rich MedicalBusiness & Physician schemas with insurance compatibility listings',
    },
    {
      name: 'One Medical',
      domain: 'onemedical.com',
      compositeScore: 73,
      robotsTxtScore: 80,
      schemaScore: 75,
      actionabilityScore: 64,
      grade: 'B',
      keyAdvantageOrFlaw: 'Clear location and service schemas; appointment booking locked behind Amazon sign-in',
    },
    {
      name: 'Teladoc Health',
      domain: 'teladoc.com',
      compositeScore: 63,
      robotsTxtScore: 70,
      schemaScore: 65,
      actionabilityScore: 54,
      grade: 'C',
      keyAdvantageOrFlaw: 'Permissive robots.txt, but lacks transparent pricing table for autonomous agents',
    },
    {
      name: 'Mayo Clinic',
      domain: 'mayoclinic.org',
      compositeScore: 58,
      robotsTxtScore: 60,
      schemaScore: 68,
      actionabilityScore: 46,
      grade: 'C',
      keyAdvantageOrFlaw: 'Rich medical content schemas; blocks several AI training bots from clinical knowledge',
    },
  ],
};

const FINANCE_TEMPLATE: SectorTemplate = {
  defaultMedian: 62,
  top10: 86,
  peers: [
    {
      name: 'Plaid',
      domain: 'plaid.com',
      compositeScore: 88,
      robotsTxtScore: 90,
      schemaScore: 88,
      actionabilityScore: 86,
      grade: 'A',
      keyAdvantageOrFlaw: 'Robust API documentation, clear developer portals, and permissive bot rules',
    },
    {
      name: 'Ramp Financial',
      domain: 'ramp.com',
      compositeScore: 81,
      robotsTxtScore: 85,
      schemaScore: 82,
      actionabilityScore: 76,
      grade: 'A',
      keyAdvantageOrFlaw: 'Clean product schema, transparent feature listings, and fast SSR loading',
    },
    {
      name: 'Fidelity Investments',
      domain: 'fidelity.com',
      compositeScore: 64,
      robotsTxtScore: 68,
      schemaScore: 66,
      actionabilityScore: 58,
      grade: 'C',
      keyAdvantageOrFlaw: 'High security barriers and bot challenges protect account data but block autonomous browsing',
    },
    {
      name: 'JPMorgan Chase',
      domain: 'jpmorganchase.com',
      compositeScore: 54,
      robotsTxtScore: 45,
      schemaScore: 62,
      actionabilityScore: 55,
      grade: 'D',
      keyAdvantageOrFlaw: 'Restricts AI crawlers via robots.txt and employs strict bot challenges',
    },
  ],
};

const RETAIL_COMMERCE_TEMPLATE: SectorTemplate = {
  defaultMedian: 64,
  top10: 88,
  peers: [
    {
      name: 'Shopify Storefronts',
      domain: 'shopify.com',
      compositeScore: 88,
      robotsTxtScore: 90,
      schemaScore: 92,
      actionabilityScore: 82,
      grade: 'A',
      keyAdvantageOrFlaw: 'Native Product, Offer, AggregateRating, and Breadcrumb schemas on all SKUs',
    },
    {
      name: 'Warby Parker',
      domain: 'warbyparker.com',
      compositeScore: 76,
      robotsTxtScore: 80,
      schemaScore: 82,
      actionabilityScore: 66,
      grade: 'B',
      keyAdvantageOrFlaw: 'Clean product catalog schemas; virtual try-on requires client JS, unnavigable by agents',
    },
    {
      name: 'Target',
      domain: 'target.com',
      compositeScore: 52,
      robotsTxtScore: 40,
      schemaScore: 65,
      actionabilityScore: 51,
      grade: 'D',
      keyAdvantageOrFlaw: 'Explicitly blocks GPTBot and ClaudeBot in robots.txt; bot rate limits active',
    },
  ],
};

const PROFESSIONAL_LEGAL_TEMPLATE: SectorTemplate = {
  defaultMedian: 55,
  top10: 81,
  peers: [
    {
      name: 'Pilot (Accounting)',
      domain: 'pilot.com',
      compositeScore: 83,
      robotsTxtScore: 88,
      schemaScore: 84,
      actionabilityScore: 77,
      grade: 'A',
      keyAdvantageOrFlaw: 'Transparent pricing tiers, Organization schema with executive credentials, permissive bots',
    },
    {
      name: 'Cooley LLP',
      domain: 'cooley.com',
      compositeScore: 66,
      robotsTxtScore: 72,
      schemaScore: 68,
      actionabilityScore: 58,
      grade: 'C',
      keyAdvantageOrFlaw: 'Attorney profile schemas; consultation requests must go through human intake forms',
    },
    {
      name: 'Baker Tilly',
      domain: 'bakertilly.com',
      compositeScore: 59,
      robotsTxtScore: 65,
      schemaScore: 60,
      actionabilityScore: 52,
      grade: 'C',
      keyAdvantageOrFlaw: 'Basic Organization schema; lacks service level agreements and machine-readable pricing',
    },
  ],
};

export function getSectorTemplate(industryName: string): SectorTemplate {
  const lower = industryName.toLowerCase();

  if (
    lower.includes('information technology') ||
    lower.includes('computer & network security') ||
    lower.includes('computer networking') ||
    lower.includes('computer hardware') ||
    lower.includes('outsourcing') ||
    lower.includes('telecommunications')
  ) {
    return MSP_IT_TEMPLATE;
  }

  if (
    lower.includes('software') ||
    lower.includes('internet') ||
    lower.includes('online media') ||
    lower.includes('computer games') ||
    lower.includes('mobile games')
  ) {
    return SAAS_TECH_TEMPLATE;
  }

  if (
    lower.includes('health') ||
    lower.includes('medical') ||
    lower.includes('hospital') ||
    lower.includes('biotechnology') ||
    lower.includes('pharmaceuticals') ||
    lower.includes('veterinary')
  ) {
    return HEALTH_TEMPLATE;
  }

  if (
    lower.includes('bank') ||
    lower.includes('financial') ||
    lower.includes('capital markets') ||
    lower.includes('investment') ||
    lower.includes('insurance') ||
    lower.includes('venture capital')
  ) {
    return FINANCE_TEMPLATE;
  }

  if (
    lower.includes('retail') ||
    lower.includes('supermarkets') ||
    lower.includes('consumer goods') ||
    lower.includes('apparel') ||
    lower.includes('luxury goods') ||
    lower.includes('food & beverages')
  ) {
    return RETAIL_COMMERCE_TEMPLATE;
  }

  if (
    lower.includes('legal') ||
    lower.includes('law') ||
    lower.includes('accounting') ||
    lower.includes('management consulting') ||
    lower.includes('real estate') ||
    lower.includes('architecture')
  ) {
    return PROFESSIONAL_LEGAL_TEMPLATE;
  }

  // Default baseline sector template calibrated for general enterprise/industry
  return {
    defaultMedian: 54,
    top10: 78,
    peers: [
      {
        name: `${industryName} Sector Leader (Benchmark)`,
        domain: `top-${industryToId(industryName)}.com`,
        compositeScore: 82,
        robotsTxtScore: 88,
        schemaScore: 82,
        actionabilityScore: 74,
        grade: 'A',
        keyAdvantageOrFlaw: `Exemplary ${industryName} entity modeling, allowed AI crawlers, and clear service schemas`,
      },
      {
        name: `National ${industryName} Group`,
        domain: `national-${industryToId(industryName)}.org`,
        compositeScore: 68,
        robotsTxtScore: 75,
        schemaScore: 70,
        actionabilityScore: 59,
        grade: 'C',
        keyAdvantageOrFlaw: `Standard Organization schemas, but missing machine-readable inquiry endpoints and pricing`,
      },
      {
        name: `Regional ${industryName} Provider`,
        domain: `regional-${industryToId(industryName)}.com`,
        compositeScore: 51,
        robotsTxtScore: 60,
        schemaScore: 50,
        actionabilityScore: 43,
        grade: 'D',
        keyAdvantageOrFlaw: `Lacks structured JSON-LD schemas; intake requires unassisted human verification`,
      },
      {
        name: `Legacy ${industryName} Firm`,
        domain: `legacy-${industryToId(industryName)}.net`,
        compositeScore: 42,
        robotsTxtScore: 45,
        schemaScore: 40,
        actionabilityScore: 41,
        grade: 'D',
        keyAdvantageOrFlaw: `Restricts bots at root; phone numbers embedded in graphics rather than semantic schema`,
      },
    ],
  };
}

export function getAllIndustriesList(): { id: string; name: string; defaultMedian: number; top10: number }[] {
  return RAW_INDUSTRY_LIST.map((name) => {
    const template = getSectorTemplate(name);
    return {
      id: industryToId(name),
      name,
      defaultMedian: template.defaultMedian,
      top10: template.top10,
    };
  });
}

export function buildIndustryBenchmark(
  industryInput: string,
  targetScore: number,
  targetRobotsScore: number,
  targetSchemaScore: number,
  targetActionabilityScore: number,
  targetDomain: string,
  targetName: string
): IndustryBenchmark {
  // Find matching industry by id or exact name
  const match = RAW_INDUSTRY_LIST.find(
    (name) => name.toLowerCase() === industryInput.toLowerCase() || industryToId(name) === industryInput.toLowerCase()
  );

  const matchedName = match || "Information Technology and Services";
  const matchedId = industryToId(matchedName);
  const template = getSectorTemplate(matchedName);

  const targetGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' =
    targetScore >= 90 ? 'A+' :
    targetScore >= 80 ? 'A' :
    targetScore >= 70 ? 'B' :
    targetScore >= 55 ? 'C' :
    targetScore >= 40 ? 'D' : 'F';

  const peers: BenchmarkCompany[] = template.peers
    .filter(c => c.domain.toLowerCase() !== targetDomain.toLowerCase())
    .map(c => ({ ...c, rank: 0 }));

  const targetEntry: BenchmarkCompany = {
    name: targetName || targetDomain,
    domain: targetDomain,
    isTarget: true,
    compositeScore: targetScore,
    robotsTxtScore: targetRobotsScore,
    schemaScore: targetSchemaScore,
    actionabilityScore: targetActionabilityScore,
    rank: 0,
    grade: targetGrade,
    keyAdvantageOrFlaw: 'Current Audited Domain',
  };

  const allCohort = [...peers, targetEntry].sort((a, b) => b.compositeScore - a.compositeScore);

  let targetRank = 1;
  allCohort.forEach((c, index) => {
    c.rank = index + 1;
    if (c.isTarget) {
      targetRank = index + 1;
    }
  });

  const total = allCohort.length;
  const belowCount = allCohort.filter(c => c.compositeScore < targetScore).length;
  const percentileRank = Math.min(99, Math.max(5, Math.round((belowCount / total) * 100)));

  return {
    industryId: matchedId,
    industryName: matchedName,
    industryMedian: template.defaultMedian,
    top10Percentile: template.top10,
    targetRank,
    totalCompaniesInCohort: total,
    percentileRank,
    peerCohort: allCohort,
  };
}
