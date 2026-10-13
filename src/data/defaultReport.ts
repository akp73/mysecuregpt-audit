import type { AuditReport } from "../types/audit";

export const defaultPgReport: AuditReport = {
  "targetUrl": "https://us.pg.com",
  "domain": "us.pg.com",
  "businessName": "Procter & Gamble",
  "industry": "Consumer Goods",
  "timestamp": "2026-10-13T18:21:42.989Z",
  "composite": {
    "compositeScore": 71,
    "grade": "B",
    "oraAiScore": 45,
    "isitAgentReadyScore": 96,
    "webYesScore": 65,
    "siteSpeakScore": 90,
    "chatThingScore": 100,
    "agenticCommerceScore": 35,
    "aiCommerceReadyScore": 45,
    "tools": [
      {
        "id": "oraAi",
        "order": 1,
        "name": "Ora.ai",
        "url": "https://ora.ai",
        "displayUrl": "ora.ai",
        "score": 45,
        "status": "failed",
        "focus": "Action surface, /llms.txt context protocols & API execution surface",
        "summary": "Action friction detected. Lacks /llms.txt manifest or structured machine action endpoints.",
        "keyFindings": [
          "Missing /llms.txt machine context",
          "No Schema.org Action endpoints",
          "No machine OpenAPI documentation"
        ],
        "metrics": [
          {
            "label": "llms.txt Manifest",
            "value": "Missing",
            "passed": false
          },
          {
            "label": "Actionable Schema",
            "value": "No",
            "passed": false
          },
          {
            "label": "OpenAPI Spec",
            "value": "Missing",
            "passed": false
          }
        ]
      },
      {
        "id": "isitAgentReady",
        "order": 2,
        "name": "isitagentready.com",
        "url": "https://isitagentready.com",
        "displayUrl": "isitagentready.com",
        "score": 96,
        "status": "passed",
        "focus": "Robots.txt crawl permissions, AI bot access matrix & sitemaps",
        "summary": "Clean bot accessibility. Wildcard and AI-specific crawlers permitted to index.",
        "keyFindings": [
          "OpenAI GPTBot permitted",
          "Anthropic ClaudeBot permitted",
          "XML Sitemap accessible"
        ],
        "metrics": [
          {
            "label": "GPTBot (OpenAI)",
            "value": "Allowed",
            "passed": true
          },
          {
            "label": "ClaudeBot (Anthropic)",
            "value": "Allowed",
            "passed": true
          },
          {
            "label": "XML Sitemap",
            "value": "Present",
            "passed": true
          }
        ]
      },
      {
        "id": "webYes",
        "order": 3,
        "name": "WebYes Agent-Readiness",
        "url": "https://www.webyes.com/agent-readiness/",
        "displayUrl": "webyes.com/agent-readiness",
        "score": 65,
        "status": "warning",
        "focus": "Semantic entity modeling, JSON-LD schema depth & architecture",
        "summary": "Sparse JSON-LD entity graph. Critical business identity and service schemas absent.",
        "keyFindings": [
          "Organization identity mapped",
          "No Service or Product schema",
          "HTML5 <main> semantic landmark"
        ],
        "metrics": [
          {
            "label": "Entity Types Found",
            "value": "1 types",
            "passed": true
          },
          {
            "label": "Org / Identity Schema",
            "value": "Valid",
            "passed": true
          },
          {
            "label": "HTML5 Semantic Structure",
            "value": "Clean",
            "passed": true
          }
        ]
      },
      {
        "id": "siteSpeak",
        "order": 4,
        "name": "SiteSpeakAI Scanner",
        "url": "https://sitespeak.ai/tools/ai-agent-readiness-scanner",
        "displayUrl": "sitespeak.ai/tools/ai-agent-readiness-scanner",
        "score": 90,
        "status": "passed",
        "focus": "Content extractability, conversational RAG & knowledge retrieval",
        "summary": "Clean extractable content. Autonomous agents can ingest knowledge without JS rendering obstacles.",
        "keyFindings": [
          "Extractable text: 2706 words",
          "No FAQ structured data for RAG",
          "OpenGraph meta tags verified"
        ],
        "metrics": [
          {
            "label": "Extractable Word Count",
            "value": "2706 words",
            "passed": true
          },
          {
            "label": "FAQ Schema (Q&A)",
            "value": "None",
            "passed": false
          },
          {
            "label": "Meta Description",
            "value": "Present",
            "passed": true
          }
        ]
      },
      {
        "id": "chatThing",
        "order": 5,
        "name": "ChatThing Agent Checker",
        "url": "https://chatthing.ai/tools/agent-readiness-checker",
        "displayUrl": "chatthing.ai/tools/agent-readiness-checker",
        "score": 100,
        "status": "passed",
        "focus": "AI chat agent structure, clean context window & crawl traversal",
        "summary": "Optimized for conversational agents. Clear site architecture and contact discoverability.",
        "keyFindings": [
          "Complete sitemap traversal available",
          "Navigable internal links: 79",
          "Corporate grounding profile present"
        ],
        "metrics": [
          {
            "label": "Sitemap Traversal",
            "value": "Verified",
            "passed": true
          },
          {
            "label": "Internal Link Depth",
            "value": "79 links",
            "passed": true
          },
          {
            "label": "Context Efficiency",
            "value": "Optimized",
            "passed": true
          }
        ]
      },
      {
        "id": "agenticCommerce",
        "order": 6,
        "name": "agenticcommerce.shop",
        "url": "https://agenticcommerce.shop",
        "displayUrl": "agenticcommerce.shop",
        "score": 35,
        "status": "failed",
        "focus": "Autonomous buying/selling, Product/Offer schemas & checkout triggers",
        "summary": "Non-transactional. Autonomous commerce agents cannot locate structured Offer prices or checkout flows.",
        "keyFindings": [
          "No Product schema found",
          "No machine-readable Offer prices",
          "Interactive transaction forms detected"
        ],
        "metrics": [
          {
            "label": "Product Schema",
            "value": "None",
            "passed": false
          },
          {
            "label": "Offer / Price Schema",
            "value": "Missing",
            "passed": false
          },
          {
            "label": "Transaction Surface",
            "value": "Active",
            "passed": true
          }
        ]
      },
      {
        "id": "aiCommerceReady",
        "order": 7,
        "name": "AI Commerce Ready",
        "url": "https://aicommerceready.com",
        "displayUrl": "aicommerceready.com",
        "score": 45,
        "status": "failed",
        "focus": "Commerce catalog verification, inventory status & pricing specs",
        "summary": "Missing commerce metadata. Lacks structured price currency, availability, or merchant policies.",
        "keyFindings": [
          "Pricing missing from JSON-LD",
          "Merchant legal entity verified",
          "Inventory availability missing"
        ],
        "metrics": [
          {
            "label": "Catalog Pricing Spec",
            "value": "Missing",
            "passed": false
          },
          {
            "label": "Merchant Identity",
            "value": "Verified",
            "passed": true
          },
          {
            "label": "Inventory / Stock Status",
            "value": "Missing",
            "passed": false
          }
        ]
      }
    ],
    "dimensionScores": {
      "crawlability": 95,
      "structuredSchema": 60,
      "actionability": 45,
      "semanticClarity": 62,
      "machineProtocols": 40
    },
    "dialBreakdown": {
      "level": 4,
      "levelTitle": "Can't buy without human.",
      "categories": {
        "discoverability": {
          "id": "discoverability",
          "name": "Discoverability",
          "score": 100,
          "passedCount": 4,
          "totalCount": 4,
          "fractionDisplay": "4/4",
          "status": "passed",
          "checks": [
            {
              "name": "Sitemap.xml declared",
              "passed": true,
              "weight": 25,
              "description": "Sitemap enables autonomous agents to traverse whole site hierarchy"
            },
            {
              "name": "Robots.txt available",
              "passed": true,
              "weight": 25,
              "description": "Crawler policies clearly declared at /robots.txt"
            },
            {
              "name": "Structured Schema.org",
              "passed": true,
              "weight": 25,
              "description": "JSON-LD machine-readable entity schemas present"
            },
            {
              "name": "Meta descriptions & OpenGraph",
              "passed": true,
              "weight": 25,
              "description": "Essential discovery metadata present"
            }
          ],
          "description": "XML sitemaps, robots.txt, metadata, and core indexability"
        },
        "content": {
          "id": "content",
          "name": "Content",
          "score": 100,
          "passedCount": 1,
          "totalCount": 1,
          "fractionDisplay": "1/1",
          "status": "passed",
          "checks": [
            {
              "name": "Semantic clean text extraction",
              "passed": true,
              "weight": 100,
              "description": "Clean content extractable without client-side rendering dependency"
            }
          ],
          "description": "Extractable text density and semantic HTML5 structuring"
        },
        "botAccess": {
          "id": "bot_access",
          "name": "Bot Access Control",
          "score": 100,
          "passedCount": 2,
          "totalCount": 2,
          "fractionDisplay": "2/2",
          "status": "passed",
          "checks": [
            {
              "name": "GPTBot / Action Crawlers Allowed",
              "passed": true,
              "weight": 50,
              "description": "OpenAI GPTBot and Perplexity permitted to index"
            },
            {
              "name": "ClaudeBot / Anthropic Allowed",
              "passed": true,
              "weight": 50,
              "description": "Anthropic ClaudeBot permitted to index"
            }
          ],
          "description": "Robots.txt permissions for leading AI assistants & browsers"
        },
        "apiMcp": {
          "id": "api_mcp",
          "name": "API, Auth, MCP & Skill Discovery",
          "score": 0,
          "passedCount": 0,
          "totalCount": 8,
          "fractionDisplay": "0/8",
          "status": "failed",
          "checks": [
            {
              "name": "/llms.txt context manifest",
              "passed": false,
              "weight": 12.5,
              "description": "Published /llms.txt for token-efficient agent ingestion"
            },
            {
              "name": "OpenAPI specification",
              "passed": false,
              "weight": 12.5,
              "description": "Standardized REST OpenAPI tool spec available"
            },
            {
              "name": "ai-plugin.json manifest",
              "passed": false,
              "weight": 12.5,
              "description": "OpenAI Plugin or tool configuration registered"
            },
            {
              "name": "MCP (Model Context Protocol) ready",
              "passed": false,
              "weight": 12.5,
              "description": "Endpoints structured for MCP tool-calling servers"
            },
            {
              "name": "Schema.org PotentialAction",
              "passed": false,
              "weight": 12.5,
              "description": "Machine-executable SearchAction or OrderAction declarations"
            },
            {
              "name": "Public read-only API docs",
              "passed": false,
              "weight": 12.5,
              "description": "Developer documentation accessible to search agents"
            },
            {
              "name": "Machine-accessible forms",
              "passed": false,
              "weight": 12.5,
              "description": "Forms support semantic parameter submission"
            },
            {
              "name": "Cross-Origin API accessibility",
              "passed": false,
              "weight": 12.5,
              "description": "Endpoints allow autonomous agent header dispatch"
            }
          ],
          "description": "llms.txt, OpenAPI specifications, MCP tool servers, and actions"
        },
        "commerce": {
          "id": "commerce",
          "name": "Commerce",
          "score": 0,
          "passedCount": 0,
          "totalCount": 2,
          "fractionDisplay": "Not checked",
          "status": "not_checked",
          "checks": [
            {
              "name": "Structured pricing schema",
              "passed": false,
              "weight": 50,
              "description": "Schema.org Offer or priceSpecification declared"
            },
            {
              "name": "Autonomous booking / reservation",
              "passed": false,
              "weight": 50,
              "description": "ReserveAction or ScheduleAction schema endpoint"
            }
          ],
          "description": "Machine-executable pricing catalogs, bookings, and purchasing schemas"
        }
      }
    },
    "questionsBreakdown": {
      "findAndTrust": {
        "id": "find_and_trust",
        "question": "Can AI agents find and trust you?",
        "score": 80,
        "status": "EXCELLENT",
        "summary": "AI agents can easily discover and authenticate your business identity.",
        "keyFactors": [
          {
            "label": "isitagentready.com crawler permission index: 96/100",
            "positive": true,
            "impact": "38 pts"
          },
          {
            "label": "webyes.com organizational identity schema depth: 65/100",
            "positive": true,
            "impact": "20 pts"
          },
          {
            "label": "chatthing.ai corporate trust & grounding index: 100/100",
            "positive": true,
            "impact": "15 pts"
          },
          {
            "label": "ora.ai verified machine identity & context: 45/100",
            "positive": false,
            "impact": "5 pts"
          },
          {
            "label": "AI Commerce Ready business authority: 45/100",
            "positive": false,
            "impact": "2 pts"
          }
        ]
      },
      "findInformation": {
        "id": "find_information",
        "question": "Do you make it easier for AI Agents to find information about you?",
        "score": 78,
        "status": "GOOD",
        "summary": "Context manifests and sitemaps allow token-efficient information retrieval.",
        "keyFactors": [
          {
            "label": "sitespeak.ai content extraction & RAG density: 90/100",
            "positive": true,
            "impact": "27 pts"
          },
          {
            "label": "ora.ai machine context & /llms.txt rating: 45/100",
            "positive": false,
            "impact": "11 pts"
          },
          {
            "label": "chatthing.ai context window & sitemap depth: 100/100",
            "positive": true,
            "impact": "20 pts"
          },
          {
            "label": "webyes.com entity knowledge & FAQ completeness: 65/100",
            "positive": true,
            "impact": "10 pts"
          },
          {
            "label": "isitagentready.com unblocked crawl discovery: 96/100",
            "positive": true,
            "impact": "10 pts"
          }
        ]
      },
      "productsAndServices": {
        "id": "products_and_services",
        "question": "Does AI Agent understand what products and services you offer?",
        "score": 51,
        "status": "FAIR",
        "summary": "Services are presented only in qualitative text, missing structured Service and Offer schemas.",
        "keyFactors": [
          {
            "label": "agenticcommerce.shop buying/selling protocol score: 35/100",
            "positive": false,
            "impact": "11 pts"
          },
          {
            "label": "AI Commerce Ready pricing spec & catalog score: 45/100",
            "positive": false,
            "impact": "14 pts"
          },
          {
            "label": "webyes.com Service & Product taxonomy depth: 65/100",
            "positive": true,
            "impact": "13 pts"
          },
          {
            "label": "sitespeak.ai service offering text clarity: 90/100",
            "positive": true,
            "impact": "9 pts"
          },
          {
            "label": "ora.ai actionable service endpoints: 45/100",
            "positive": false,
            "impact": "5 pts"
          }
        ]
      },
      "contactEasily": {
        "id": "contact_easily",
        "question": "Can AI Agent contact you easily?",
        "score": 68,
        "status": "GOOD",
        "summary": "Contact points lack structured schema or rely on human-only interactive forms.",
        "keyFactors": [
          {
            "label": "ora.ai action execution & form accessibility score: 45/100",
            "positive": false,
            "impact": "14 pts"
          },
          {
            "label": "chatthing.ai contact discoverability & support score: 100/100",
            "positive": true,
            "impact": "25 pts"
          },
          {
            "label": "webyes.com LocalBusiness & PostalAddress schema score: 65/100",
            "positive": true,
            "impact": "13 pts"
          },
          {
            "label": "AI Commerce Ready merchant communication verified: 45/100",
            "positive": false,
            "impact": "7 pts"
          },
          {
            "label": "isitagentready.com unblocked contact pathways: 96/100",
            "positive": true,
            "impact": "10 pts"
          }
        ]
      },
      "browseEasily": {
        "id": "browse_easily",
        "question": "Can AI Agent browse through your website easily?",
        "score": 86,
        "status": "EXCELLENT",
        "summary": "Clean semantic layout and permissive robots directives enable frictionless indexing.",
        "keyFactors": [
          {
            "label": "isitagentready.com crawl allowance & robots index: 96/100",
            "positive": true,
            "impact": "34 pts"
          },
          {
            "label": "sitespeak.ai semantic HTML5 layout & DOM extractability: 90/100",
            "positive": true,
            "impact": "23 pts"
          },
          {
            "label": "chatthing.ai site architecture & link traversal score: 100/100",
            "positive": true,
            "impact": "20 pts"
          },
          {
            "label": "webyes.com structural hierarchy & breadcrumbs: 65/100",
            "positive": true,
            "impact": "7 pts"
          },
          {
            "label": "agenticcommerce.shop catalog navigation flow: 35/100",
            "positive": false,
            "impact": "4 pts"
          }
        ]
      }
    },
    "overallVerdict": "PARTIALLY AGENT READY (MODERATE FRICTION)",
    "executiveSummary": "AI agents can access basic information, but encounter notable friction with transactional actions, missing schema properties, or absent machine-readable llms.txt context."
  },
  "robotsTxt": {
    "found": true,
    "url": "https://us.pg.com/robots.txt",
    "rawText": "User-agent: *\nAllow: /\nsitemap: https://us.pg.com/sitemap.xml\nDisallow: https://origprod-cus-us.pg.com/health-probe/\nDisallow: https://origprod-eus2-us.pg.com/health-probe/\nDisallow: https://us.pg.com/health-probe/",
    "totalRules": 6,
    "sitemaps": [
      "https://us.pg.com/sitemap.xml"
    ],
    "bots": [
      {
        "botName": "GPTBot",
        "vendor": "OpenAI",
        "purpose": "Agent Task / Search",
        "status": "PARTIALLY_RESTRICTED",
        "details": "Inherits wildcard restrictions on 3 path(s).",
        "disallowedPaths": [
          "https://origprod-cus-us.pg.com/health-probe/",
          "https://origprod-eus2-us.pg.com/health-probe/",
          "https://us.pg.com/health-probe/"
        ],
        "allowedPaths": []
      },
      {
        "botName": "ChatGPT-User",
        "vendor": "OpenAI",
        "purpose": "AI Browsing",
        "status": "PARTIALLY_RESTRICTED",
        "details": "Inherits wildcard restrictions on 3 path(s).",
        "disallowedPaths": [
          "https://origprod-cus-us.pg.com/health-probe/",
          "https://origprod-eus2-us.pg.com/health-probe/",
          "https://us.pg.com/health-probe/"
        ],
        "allowedPaths": []
      },
      {
        "botName": "ClaudeBot",
        "vendor": "Anthropic",
        "purpose": "Agent Task / Search",
        "status": "PARTIALLY_RESTRICTED",
        "details": "Inherits wildcard restrictions on 3 path(s).",
        "disallowedPaths": [
          "https://origprod-cus-us.pg.com/health-probe/",
          "https://origprod-eus2-us.pg.com/health-probe/",
          "https://us.pg.com/health-probe/"
        ],
        "allowedPaths": []
      },
      {
        "botName": "anthropic-ai",
        "vendor": "Anthropic",
        "purpose": "Model Training",
        "status": "PARTIALLY_RESTRICTED",
        "details": "Inherits wildcard restrictions on 3 path(s).",
        "disallowedPaths": [
          "https://origprod-cus-us.pg.com/health-probe/",
          "https://origprod-eus2-us.pg.com/health-probe/",
          "https://us.pg.com/health-probe/"
        ],
        "allowedPaths": []
      },
      {
        "botName": "PerplexityBot",
        "vendor": "Perplexity",
        "purpose": "Agent Task / Search",
        "status": "PARTIALLY_RESTRICTED",
        "details": "Inherits wildcard restrictions on 3 path(s).",
        "disallowedPaths": [
          "https://origprod-cus-us.pg.com/health-probe/",
          "https://origprod-eus2-us.pg.com/health-probe/",
          "https://us.pg.com/health-probe/"
        ],
        "allowedPaths": []
      },
      {
        "botName": "Google-Extended",
        "vendor": "Google",
        "purpose": "Model Training",
        "status": "PARTIALLY_RESTRICTED",
        "details": "Inherits wildcard restrictions on 3 path(s).",
        "disallowedPaths": [
          "https://origprod-cus-us.pg.com/health-probe/",
          "https://origprod-eus2-us.pg.com/health-probe/",
          "https://us.pg.com/health-probe/"
        ],
        "allowedPaths": []
      },
      {
        "botName": "Meta-ExternalAgent",
        "vendor": "Meta",
        "purpose": "Agent Task / Search",
        "status": "PARTIALLY_RESTRICTED",
        "details": "Inherits wildcard restrictions on 3 path(s).",
        "disallowedPaths": [
          "https://origprod-cus-us.pg.com/health-probe/",
          "https://origprod-eus2-us.pg.com/health-probe/",
          "https://us.pg.com/health-probe/"
        ],
        "allowedPaths": []
      },
      {
        "botName": "Applebot-Extended",
        "vendor": "Apple",
        "purpose": "Model Training",
        "status": "PARTIALLY_RESTRICTED",
        "details": "Inherits wildcard restrictions on 3 path(s).",
        "disallowedPaths": [
          "https://origprod-cus-us.pg.com/health-probe/",
          "https://origprod-eus2-us.pg.com/health-probe/",
          "https://us.pg.com/health-probe/"
        ],
        "allowedPaths": []
      },
      {
        "botName": "cohere-ai",
        "vendor": "Cohere",
        "purpose": "Model Training",
        "status": "PARTIALLY_RESTRICTED",
        "details": "Inherits wildcard restrictions on 3 path(s).",
        "disallowedPaths": [
          "https://origprod-cus-us.pg.com/health-probe/",
          "https://origprod-eus2-us.pg.com/health-probe/",
          "https://us.pg.com/health-probe/"
        ],
        "allowedPaths": []
      },
      {
        "botName": "CCBot",
        "vendor": "Common Crawl",
        "purpose": "Model Training",
        "status": "PARTIALLY_RESTRICTED",
        "details": "Inherits wildcard restrictions on 3 path(s).",
        "disallowedPaths": [
          "https://origprod-cus-us.pg.com/health-probe/",
          "https://origprod-eus2-us.pg.com/health-probe/",
          "https://us.pg.com/health-probe/"
        ],
        "allowedPaths": []
      },
      {
        "botName": "Bytespider",
        "vendor": "ByteDance",
        "purpose": "Agent Task / Search",
        "status": "PARTIALLY_RESTRICTED",
        "details": "Inherits wildcard restrictions on 3 path(s).",
        "disallowedPaths": [
          "https://origprod-cus-us.pg.com/health-probe/",
          "https://origprod-eus2-us.pg.com/health-probe/",
          "https://us.pg.com/health-probe/"
        ],
        "allowedPaths": []
      }
    ],
    "score": 95,
    "summary": "Robots.txt is highly agent-friendly. All top AI action & search agents (GPTBot, ClaudeBot, PerplexityBot) have crawling access."
  },
  "schema": {
    "found": true,
    "totalSchemas": 1,
    "schemaTypes": [
      "Organization"
    ],
    "items": [
      {
        "type": "Organization",
        "context": "http://schema.org",
        "name": "Procter & Gamble",
        "propertiesFound": [
          "@context",
          "@type",
          "name",
          "legalName",
          "url",
          "sameAs",
          "logo",
          "contactPoint"
        ],
        "missingCrucialProperties": [
          "description",
          "telephone",
          "address",
          "offers",
          "potentialAction",
          "priceRange"
        ],
        "valid": true,
        "rawJson": {
          "@context": "http://schema.org",
          "@type": "Organization",
          "name": "Procter & Gamble",
          "legalName": "The Procter & Gamble Company",
          "url": "https://us.pg.com/",
          "sameAs": [
            "https://www.facebook.com/proctergamble/",
            "https://twitter.com/proctergamble/",
            "https://www.youtube.com/channel/UCDzq6J0KoGCbps96JQuXWRg/",
            "https://www.instagram.com/proctergamble/",
            "https://www.linkedin.com/company/procter-and-gamble/"
          ],
          "logo": {
            "@type": "ImageObject",
            "url": "https://images.ctfassets.net/oggad6svuzkv/4JSezOuLv9CCXfHEBpfGxp/528d1ca0496e3401cd60467235b6441f/P_G_Logo_RGB.png"
          },
          "contactPoint": {
            "@type": "contactPoint",
            "telephone": "+1 513-983-1100",
            "contactType": "customer service",
            "areaServed": "US",
            "sameAs": [
              "https://www.facebook.com/proctergamble/",
              "https://twitter.com/proctergamble/",
              "https://www.youtube.com/channel/UCDzq6J0KoGCbps96JQuXWRg/",
              "https://instagram.com/proctergamble/",
              "https://www.linkedin.com/company/procter-and-gamble/"
            ]
          }
        }
      }
    ],
    "hasOrganization": true,
    "hasLocalBusiness": false,
    "hasServiceOrProduct": false,
    "hasFaq": false,
    "hasBreadcrumbs": false,
    "hasActionSchema": false,
    "hasMicrodata": false,
    "hasOpenGraph": true,
    "score": 60,
    "summary": "Partial schema data. Detected 1 entity types (Organization), but missing critical Action, Pricing, or Service models."
  },
  "manifests": {
    "llmsTxt": {
      "found": false
    },
    "aiPluginJson": {
      "found": false
    },
    "sitemapXml": {
      "found": true,
      "url": "https://us.pg.com/sitemap.xml"
    },
    "openApi": {
      "found": false
    }
  },
  "agentFailures": [
    {
      "capability": "Autonomous Service / Demo Booking",
      "category": "Transactional",
      "status": "FAILED",
      "whatAgentFailedToDo": "Could not book a service appointment, demo, or request consultation autonomously without human intervention.",
      "technicalRootCause": "Lacks machine-readable Action schema (e.g., ReserveAction, ScheduleAction) and public OpenAPI endpoint. Intake forms rely on client-side JS or captcha.",
      "impactLevel": "HIGH",
      "recommendedFix": "Implement Schema.org potentialAction with target URL template or publish a lightweight booking endpoint in llms.txt."
    },
    {
      "capability": "Autonomous Pricing & Quote Retrieval",
      "category": "Information Retrieval",
      "status": "FAILED",
      "whatAgentFailedToDo": "Could not extract unambiguous pricing tiers or cost benchmarks for autonomous procurement agents.",
      "technicalRootCause": "Pricing is either absent, gated behind a \"Contact Sales\" click-to-call modal, or missing Schema.org Offer/priceCurrency data.",
      "impactLevel": "HIGH",
      "recommendedFix": "Add Schema.org OfferCatalog or priceRange properties to your Organization/Service schema, or document tiers in /llms.txt."
    },
    {
      "capability": "Real-time Web Search Agent Crawling",
      "category": "Navigation",
      "status": "PASSED",
      "whatAgentFailedToDo": "Leading search and assistant bots (GPTBot, ClaudeBot, Perplexity) are permitted to crawl.",
      "technicalRootCause": "Robots.txt does not block primary action user-agents.",
      "impactLevel": "LOW",
      "recommendedFix": "Monitor robots.txt logs for emerging assistant user-agents."
    },
    {
      "capability": "Zero-Token-Waste Context Ingestion",
      "category": "Tool Calling",
      "status": "PARTIAL",
      "whatAgentFailedToDo": "Agent was forced to parse full, heavy HTML DOM instead of an optimized markdown context summary.",
      "technicalRootCause": "No /llms.txt or /.well-known/llms.txt manifest found on host root.",
      "impactLevel": "MEDIUM",
      "recommendedFix": "Deploy a concise /llms.txt file summarizing company capabilities, core URLs, and contact endpoints."
    },
    {
      "capability": "Automated Tool Calling & API Discovery",
      "category": "Tool Calling",
      "status": "FAILED",
      "whatAgentFailedToDo": "Could not discover machine-executable tools or REST API declarations to integrate actions programmatically.",
      "technicalRootCause": "Missing OpenAPI / Swagger specification or AI plugin manifest in well-known routes.",
      "impactLevel": "MEDIUM",
      "recommendedFix": "Publish public read-only OpenAPI specs (e.g. for service listings or status) at /.well-known/openapi.yaml."
    }
  ],
  "informationGaps": [
    {
      "informationField": "Transparent Fee / Pricing Tiers",
      "category": "Pricing & Packaging",
      "status": "MISSING",
      "whatCouldNotBeGathered": "Specific hourly rates, monthly retainer tiers, or minimum project engagements.",
      "whyAgentNeedsIt": "Autonomous procurement and budgeting agents reject vendors that do not declare minimum financial requirements.",
      "recommendedSchemaOrTag": "Schema.org \"Offer\" with \"priceSpecification\" and \"priceCurrency\"."
    },
    {
      "informationField": "Direct Escalation Contact Point",
      "category": "Contact & Escalation",
      "status": "MISSING",
      "whatCouldNotBeGathered": "Machine-verified direct support email or phone number in structured data.",
      "whyAgentNeedsIt": "Customer service agents require verified contact points to escalate inquiries or route support tickets without hallucination.",
      "recommendedSchemaOrTag": "Schema.org \"ContactPoint\" with contactType: \"customer service\" & telephone."
    },
    {
      "informationField": "Physical Operational Jurisdiction & Geolocation",
      "category": "Location & Availability",
      "status": "MISSING",
      "whatCouldNotBeGathered": "Verified street address, postal code, or service area coverage coordinates.",
      "whyAgentNeedsIt": "Local dispatch and geo-targeted agents (e.g. Perplexity Maps, Google Gemini Local) cannot confirm service coverage.",
      "recommendedSchemaOrTag": "Schema.org \"PostalAddress\" and \"areaServed\" / \"geo\" coordinates."
    },
    {
      "informationField": "High-Confidence Q&A Grounding (FAQ Schema)",
      "category": "Corporate Authority",
      "status": "MISSING",
      "whatCouldNotBeGathered": "Explicit question-and-answer pairs regarding SLA guarantees, onboarding timelines, or compliance certifications.",
      "whyAgentNeedsIt": "Question answering agents rely on FAQPage schema for 99%+ confidence answers without hallucinating policy terms.",
      "recommendedSchemaOrTag": "Schema.org \"FAQPage\" with \"mainEntity\": [Question, Answer]."
    },
    {
      "informationField": "Executive Capability Manifest (llms.txt)",
      "category": "Corporate Authority",
      "status": "MISSING",
      "whatCouldNotBeGathered": "A structured markdown file outlining what this business does, who it serves, and key URLs.",
      "whyAgentNeedsIt": "Enables quick 1-turn ingestion without burning context window tokens scraping dozens of heavy web pages.",
      "recommendedSchemaOrTag": "Host standard /llms.txt at root domain."
    }
  ],
  "simulatedTasks": [
    {
      "taskName": "Autonomous Service / Consultation Booking",
      "userPrompt": "Schedule an exploratory consultation with Procter & Gamble for next Tuesday at 2:00 PM EST.",
      "agentPersona": "Autonomous Calendar & Procurement Agent",
      "status": "FAILED",
      "traceSteps": [
        {
          "step": 1,
          "action": "Inspecting us.pg.com for Schema.org ScheduleAction or ReserveAction endpoint",
          "finding": "Zero machine-readable action schemas found in DOM",
          "result": "blocked"
        },
        {
          "step": 2,
          "action": "Scanning for contact/booking forms and webhook endpoints",
          "finding": "Found standard HTML form with CSRF token and client-side JavaScript submit listener",
          "result": "warning"
        },
        {
          "step": 3,
          "action": "Attempting autonomous form parameter submission",
          "finding": "Human verification required; bot cannot bypass anti-bot session state autonomously without human token",
          "result": "blocked"
        }
      ],
      "verdict": "Agent blocked: Consultation booking requires human interactive browser interaction.",
      "missingDataNotes": [
        "Schema.org ScheduleAction markup",
        "Public calendar webhook or API key intake endpoint"
      ]
    },
    {
      "taskName": "Unambiguous Pricing & Tier Extraction",
      "userPrompt": "Extract the exact monthly retainer pricing and onboarding cost structure for us.pg.com.",
      "agentPersona": "Enterprise Budgeting & RFP Synthesizer",
      "status": "FAILED",
      "traceSteps": [
        {
          "step": 1,
          "action": "Searching us.pg.com structured JSON-LD for Offer or PriceSpecification",
          "finding": "No Schema.org Offer, priceRange, or PriceSpecification properties",
          "result": "blocked"
        },
        {
          "step": 2,
          "action": "Parsing DOM for tabular pricing matrices",
          "finding": "Found qualitative descriptions (\"Custom tailored quotes\", \"Contact us for pricing\") rather than numerical tiers",
          "result": "blocked"
        }
      ],
      "verdict": "Agent could not retrieve explicit financial figures. Quotes require asynchronous sales consultation.",
      "missingDataNotes": [
        "Transparent pricing matrix table",
        "Schema.org priceCurrency & priceSpecification",
        "Minimum engagement contract threshold"
      ]
    },
    {
      "taskName": "Corporate Trust & E-E-A-T Verification",
      "userPrompt": "Verify legal corporate registration, SOC2/compliance certificates, and executive leadership for us.pg.com.",
      "agentPersona": "Vendor Risk & Compliance Agent",
      "status": "PARTIAL",
      "traceSteps": [
        {
          "step": 1,
          "action": "Analyzing Organization / Corporation JSON-LD schema",
          "finding": "Basic Organization name found, but executive leadership (founder, employee) array is absent",
          "result": "warning"
        },
        {
          "step": 2,
          "action": "Inspecting physical headquarters and jurisdiction data",
          "finding": "General location mentioned in text; lacking precise PostalAddress schema with geo-coordinates",
          "result": "warning"
        }
      ],
      "verdict": "Agent verified general brand existence, but flagged missing machine-verifiable compliance certificates in structured data.",
      "missingDataNotes": [
        "Schema.org PostalAddress with geo coordinates",
        "Machine-readable security compliance endorsements (SOC2, ISO 27001)"
      ]
    },
    {
      "taskName": "Autonomous Tool Calling & API Discovery",
      "userPrompt": "Discover machine-executable API endpoints or OpenAPI definitions for us.pg.com service catalog.",
      "agentPersona": "Function-Calling Orchestrator",
      "status": "FAILED",
      "traceSteps": [
        {
          "step": 1,
          "action": "Checking host root for /llms.txt and /.well-known/llms.txt",
          "finding": "HTTP 404 - No llms.txt context file published on host root",
          "result": "blocked"
        },
        {
          "step": 2,
          "action": "Scanning for OpenAPI specs at /.well-known/openapi.yaml and /api-docs",
          "finding": "No standardized OpenAPI or Swagger manifests detected",
          "result": "blocked"
        }
      ],
      "verdict": "Agent could not register automated tools. Must fall back to expensive full-page HTML parsing on every query.",
      "missingDataNotes": [
        "/llms.txt manifest for token-efficient agent context",
        "OpenAPI 3.0 specification for service lookups"
      ]
    }
  ],
  "benchmark": {
    "industryId": "consumer_goods",
    "industryName": "Consumer Goods",
    "industryMedian": 64,
    "top10Percentile": 88,
    "targetRank": 3,
    "totalCompaniesInCohort": 4,
    "percentileRank": 25,
    "peerCohort": [
      {
        "name": "Shopify Storefronts",
        "domain": "shopify.com",
        "compositeScore": 88,
        "robotsTxtScore": 90,
        "schemaScore": 92,
        "actionabilityScore": 82,
        "grade": "A",
        "keyAdvantageOrFlaw": "Native Product, Offer, AggregateRating, and Breadcrumb schemas on all SKUs",
        "rank": 1
      },
      {
        "name": "Warby Parker",
        "domain": "warbyparker.com",
        "compositeScore": 76,
        "robotsTxtScore": 80,
        "schemaScore": 82,
        "actionabilityScore": 66,
        "grade": "B",
        "keyAdvantageOrFlaw": "Clean product catalog schemas; virtual try-on requires client JS, unnavigable by agents",
        "rank": 2
      },
      {
        "name": "Procter & Gamble",
        "domain": "us.pg.com",
        "isTarget": true,
        "compositeScore": 71,
        "robotsTxtScore": 95,
        "schemaScore": 60,
        "actionabilityScore": 45,
        "rank": 3,
        "grade": "B",
        "keyAdvantageOrFlaw": "Current Audited Domain"
      },
      {
        "name": "Target",
        "domain": "target.com",
        "compositeScore": 52,
        "robotsTxtScore": 40,
        "schemaScore": 65,
        "actionabilityScore": 51,
        "grade": "D",
        "keyAdvantageOrFlaw": "Explicitly blocks GPTBot and ClaudeBot in robots.txt; bot rate limits active",
        "rank": 4
      }
    ]
  },
  "remediation": {
    "llmsTxtSnippet": "# Procter & Gamble - LLM & AI Agent Context\n> Machine-readable context manifest for AI Autonomous Agents\n\n## Overview\nProcter & Gamble is a premier provider accessible at https://us.pg.com.\nThis manifest allows LLMs and autonomous search agents to extract authoritative facts and navigation endpoints with zero token bloat.\n\n## Core Capabilities & Services\n- Primary Solutions: Comprehensive professional services, consulting, and solutions.\n- Target Audience: Enterprise, B2B, and consumers seeking verified domain expertise.\n- Documentation & Knowledge: Available via official website directories and resource center.\n\n## Action & Engagement Endpoints\n- Homepage: https://us.pg.com/\n- Contact & Inquiries: https://us.pg.com/contact\n- Services Catalog: https://us.pg.com/services\n- Support Escalation: https://us.pg.com/support\n\n## Commercial & Licensing Policies\n- Autonomous Web Crawling: Permitted for AI search, agent synthesis, and customer assistance.\n- Direct Procurement: Route inquiry parameters via official contact forms.\n",
    "robotsTxtSnippet": "# Optimized robots.txt for AI Search & Agent Readiness\n# Permits legitimate user-facing AI agents while protecting private routes\n\nUser-agent: *\nDisallow: /admin/\nDisallow: /cart/\nDisallow: /checkout/\nDisallow: /api/private/\nDisallow: /search?*\n\n# Allow Top AI Assistant & Autonomous Agents\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Applebot-Extended\nAllow: /\n\n# Sitemaps\nSitemap: https://us.pg.com/sitemap.xml\n",
    "jsonLdSnippet": "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@graph\": [\n    {\n      \"@type\": \"Organization\",\n      \"@id\": \"https://us.pg.com/#organization\",\n      \"name\": \"Procter & Gamble\",\n      \"url\": \"https://us.pg.com\",\n      \"description\": \"Leading solutions and verified services provider.\",\n      \"contactPoint\": {\n        \"@type\": \"ContactPoint\",\n        \"telephone\": \"+1-800-555-0199\",\n        \"contactType\": \"customer service\",\n        \"availableLanguage\": [\"English\"]\n      }\n    },\n    {\n      \"@type\": \"WebSite\",\n      \"@id\": \"https://us.pg.com/#website\",\n      \"url\": \"https://us.pg.com\",\n      \"name\": \"Procter & Gamble\",\n      \"publisher\": {\n        \"@id\": \"https://us.pg.com/#organization\"\n      },\n      \"potentialAction\": {\n        \"@type\": \"SearchAction\",\n        \"target\": \"https://us.pg.com/search?q={search_term_string}\",\n        \"query-input\": \"required name=search_term_string\"\n      }\n    },\n    {\n      \"@type\": \"Service\",\n      \"name\": \"Procter & Gamble Core Offerings\",\n      \"provider\": {\n        \"@id\": \"https://us.pg.com/#organization\"\n      },\n      \"areaServed\": \"Global\",\n      \"hasOfferCatalog\": {\n        \"@type\": \"OfferCatalog\",\n        \"name\": \"Standard Services\",\n        \"itemListElement\": [\n          {\n            \"@type\": \"Offer\",\n            \"itemOffered\": {\n              \"@type\": \"Service\",\n              \"name\": \"Consulting & Implementation\"\n            }\n          }\n        ]\n      }\n    }\n  ]\n}\n</script>"
  },
  "wafOrBotShieldDetected": false,
  "htmlMeta": {
    "title": "Procter & Gamble",
    "description": "P&G is improving everyday life as a Force for Growth and a Force for Good — for you, for the world, and for generations to come.",
    "wordCount": 2706,
    "hasMainTag": true,
    "hasForms": true,
    "totalLinks": 79
  }
};
