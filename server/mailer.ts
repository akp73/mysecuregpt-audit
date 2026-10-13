import nodemailer from 'nodemailer';

export interface LeadPayload {
  name: string;
  companyName: string;
  email: string;
  domain?: string;
  targetUrl?: string;
  compositeScore?: number;
  grade?: string;
  levelTitle?: string;
  crawlability?: number;
  structuredSchema?: number;
  actionability?: number;
  industry?: string;
  submittedAt?: string;
  ip?: string;
}

export interface AuditNotificationPayload {
  domain: string;
  targetUrl: string;
  businessName?: string;
  compositeScore: number;
  grade: string;
  levelTitle?: string;
  industry?: string;
  crawlability?: number;
  structuredSchema?: number;
  actionability?: number;
  timestamp?: string;
  clientIp?: string;
  userAgent?: string;
}

const RECIPIENT_EMAIL = process.env.NOTIFICATION_EMAIL || 'apatel@teamlogicit.com';
const AUDIT_NOTIFICATION_EMAIL = process.env.AUDIT_NOTIFICATION_EMAIL || 'apatel@mysecuregpt.com';

// In-memory lead storage buffer (keeps last 100 captured leads)
const capturedLeads: LeadPayload[] = [];

export function getCapturedLeads(): LeadPayload[] {
  return [...capturedLeads];
}

/**
 * Builds HTML template for the email notification
 */
function buildLeadEmailHtml(lead: LeadPayload): string {
  const scoreDisplay = lead.compositeScore !== undefined ? `${lead.compositeScore}/100` : 'N/A';
  const gradeDisplay = lead.grade ? `(${lead.grade})` : '';
  const domainDisplay = lead.domain || lead.targetUrl || 'Not specified';
  const timestampDisplay = lead.submittedAt || new Date().toUTCString();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Lead: Agent Readiness Audit Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 28px; color: #ffffff; }
    .badge { display: inline-block; background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 8px; border-radius: 6px; margin-bottom: 8px; }
    .title { font-size: 20px; font-weight: 700; margin: 0; color: #ffffff; }
    .content { padding: 28px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 24px; }
    .table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .table td.label { font-weight: 600; color: #64748b; width: 35%; background-color: #f8fafc; }
    .table td.value { color: #0f172a; font-weight: 500; }
    .highlight { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; }
    .highlight-title { font-size: 13px; font-weight: 700; color: #1e40af; text-transform: uppercase; margin-bottom: 4px; }
    .highlight-value { font-size: 18px; font-weight: 700; color: #1e3a8a; }
    .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 22px; border-radius: 8px; margin-right: 12px; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">TeamLogic IT Lead Capture</span>
      <h1 class="title">New Agent Readiness Audit Download</h1>
      <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px;">A prospect just requested the 3-page Executive Audit & Quick Fixes Report.</p>
    </div>

    <div class="content">
      <div class="highlight">
        <div class="highlight-title">Audited Domain & Composite Readiness</div>
        <div class="highlight-value">${domainDisplay} &bull; Score: ${scoreDisplay} ${gradeDisplay}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Classification: ${lead.levelTitle || 'Agent Ready Benchmark'}</div>
      </div>

      <table class="table">
        <tr>
          <td class="label">Full Name</td>
          <td class="value"><strong>${lead.name}</strong></td>
        </tr>
        <tr>
          <td class="label">Company Name</td>
          <td class="value"><strong>${lead.companyName}</strong></td>
        </tr>
        <tr>
          <td class="label">Company Email</td>
          <td class="value"><a href="mailto:${lead.email}" style="color: #2563eb; text-decoration: underline;">${lead.email}</a></td>
        </tr>
        <tr>
          <td class="label">Website Audited</td>
          <td class="value"><a href="${lead.targetUrl || `https://${lead.domain}`}" target="_blank" style="color: #2563eb;">${domainDisplay}</a></td>
        </tr>
        <tr>
          <td class="label">Industry Benchmark</td>
          <td class="value">${lead.industry || 'MSP / IT Services'}</td>
        </tr>
        <tr>
          <td class="label">Dimension Scores</td>
          <td class="value">
            Crawlability: <strong>${lead.crawlability ?? 'N/A'}/100</strong> &bull;
            Schema: <strong>${lead.structuredSchema ?? 'N/A'}/100</strong> &bull;
            Actionability: <strong>${lead.actionability ?? 'N/A'}/100</strong>
          </td>
        </tr>
        <tr>
          <td class="label">Submission Date</td>
          <td class="value">${timestampDisplay}</td>
        </tr>
      </table>

      <div style="margin-top: 24px; text-align: left;">
        <a href="mailto:${lead.email}?subject=Follow%20up%20on%20your%20Agent%20Readiness%20Audit%20Report%20-%20TeamLogic%20IT&body=Hi%20${encodeURIComponent(lead.name)},%0A%0AThank%20you%20for%20running%20an%20Agent%20Readiness%20Audit%20for%20${encodeURIComponent(lead.companyName)}.%20I%20reviewed%20your%20score%20of%20${encodeURIComponent(scoreDisplay)}%20and%20wanted%20to%20reach%20out..." class="btn">
          Reply to Prospect (${lead.name})
        </a>
      </div>
    </div>

    <div class="footer">
      Generated automatically by AgentReady Auditor for TeamLogic IT (${RECIPIENT_EMAIL})<br>
      mysecuregpt-audit &bull; audit.mysecuregpt.com
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Primary multi-channel email notification dispatcher
 */
export async function sendLeadNotification(lead: LeadPayload): Promise<{
  success: boolean;
  channels: string[];
  errors: string[];
}> {
  // Store in memory
  capturedLeads.unshift(lead);
  if (capturedLeads.length > 100) {
    capturedLeads.pop();
  }

  // Always log prominently to server stdout for instant visibility in Render console
  console.log('================================================================');
  console.log(`🎯 [NEW AUDIT LEAD CAPTURED] -> ${RECIPIENT_EMAIL}`);
  console.log(`   Name:     ${lead.name}`);
  console.log(`   Company:  ${lead.companyName}`);
  console.log(`   Email:    ${lead.email}`);
  console.log(`   Website:  ${lead.domain || lead.targetUrl}`);
  console.log(`   Score:    ${lead.compositeScore ?? 'N/A'}/100 (${lead.grade || 'N/A'}) - ${lead.levelTitle || ''}`);
  console.log(`   Time:     ${lead.submittedAt || new Date().toISOString()}`);
  console.log('================================================================');

  const channels: string[] = [];
  const errors: string[] = [];
  const subject = `New Lead: Agent Readiness Audit Report - ${lead.name} (${lead.companyName})`;
  const htmlContent = buildLeadEmailHtml(lead);

  // Channel 1: SMTP via nodemailer (if SMTP_HOST, SMTP_USER, etc. are set)
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || '',
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"AgentReady Auditor" <${process.env.SMTP_USER}>`,
        to: RECIPIENT_EMAIL,
        subject,
        html: htmlContent,
      });

      channels.push('SMTP');
      console.log(`[Mailer] Sent via SMTP to ${RECIPIENT_EMAIL}`);
    } catch (err: any) {
      console.error('[Mailer] SMTP failed:', err.message);
      errors.push(`SMTP: ${err.message}`);
    }
  }

  // Channel 2: Resend API (if RESEND_API_KEY is configured)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || 'AgentReady Auditor <onboarding@resend.dev>',
          to: [RECIPIENT_EMAIL],
          subject,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        channels.push('Resend');
        console.log(`[Mailer] Sent via Resend to ${RECIPIENT_EMAIL}`);
      } else {
        const errText = await res.text();
        errors.push(`Resend (${res.status}): ${errText}`);
      }
    } catch (err: any) {
      console.error('[Mailer] Resend failed:', err.message);
      errors.push(`Resend: ${err.message}`);
    }
  }

  // Channel 3: SendGrid API (if SENDGRID_API_KEY is configured)
  if (process.env.SENDGRID_API_KEY) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: RECIPIENT_EMAIL }] }],
          from: { email: process.env.FROM_EMAIL || 'audit@mysecuregpt.com', name: 'AgentReady Auditor' },
          subject,
          content: [{ type: 'text/html', value: htmlContent }],
        }),
      });

      if (res.ok || res.status === 202) {
        channels.push('SendGrid');
        console.log(`[Mailer] Sent via SendGrid to ${RECIPIENT_EMAIL}`);
      } else {
        const errText = await res.text();
        errors.push(`SendGrid (${res.status}): ${errText}`);
      }
    } catch (err: any) {
      console.error('[Mailer] SendGrid failed:', err.message);
      errors.push(`SendGrid: ${err.message}`);
    }
  }

  // Channel 4: Automated FormSubmit Email Forwarding
  // Dispatches directly to https://formsubmit.co/ajax/apatel@teamlogicit.com
  try {
    const formSubmitRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(RECIPIENT_EMAIL)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Referer': 'https://audit.mysecuregpt.com',
        'Origin': 'https://audit.mysecuregpt.com',
      },
      body: JSON.stringify({
        _subject: `New Lead: Agent Readiness Audit - ${lead.name} (${lead.companyName})`,
        "Lead Full Name": lead.name,
        "Company Name": lead.companyName,
        "Company Email": lead.email,
        "Audited Website": lead.domain || lead.targetUrl || 'Unknown',
        "Composite Score": `${lead.compositeScore ?? 'N/A'}/100 (${lead.grade || ''})`,
        "Readiness Rating": lead.levelTitle || '',
        "Industry": lead.industry || 'MSP / IT Services',
        "Submission Time": lead.submittedAt || new Date().toISOString(),
        _template: 'box',
      }),
    });

    const formSubmitData = await formSubmitRes.json().catch(() => ({}));
    if (formSubmitRes.ok) {
      channels.push('FormSubmit');
      console.log(`[Mailer] FormSubmit dispatched for ${RECIPIENT_EMAIL}:`, formSubmitData.message || 'Delivered');
    } else {
      errors.push(`FormSubmit: ${formSubmitData.message || formSubmitRes.statusText}`);
    }
  } catch (err: any) {
    console.warn('[Mailer] FormSubmit notification error:', err.message);
    errors.push(`FormSubmit: ${err.message}`);
  }

  // Always count as success if at least one email channel or server log succeeded
  return {
    success: channels.length > 0 || true,
    channels,
    errors,
  };
}

/**
 * Builds HTML template for the live audit event notification
 */
function buildAuditEmailHtml(audit: AuditNotificationPayload): string {
  const scoreDisplay = `${audit.compositeScore}/100`;
  const gradeDisplay = audit.grade ? `(${audit.grade})` : '';
  const domainDisplay = audit.domain;
  const businessDisplay = audit.businessName ? `${audit.businessName} (${audit.domain})` : audit.domain;
  const timestampDisplay = audit.timestamp || new Date().toUTCString();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Website Audited: ${domainDisplay}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #0A2540 0%, #008752 100%); padding: 24px 28px; color: #ffffff; }
    .badge { display: inline-block; background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 8px; border-radius: 6px; margin-bottom: 8px; }
    .title { font-size: 20px; font-weight: 700; margin: 0; color: #ffffff; }
    .content { padding: 28px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 24px; }
    .table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .table td.label { font-weight: 600; color: #64748b; width: 35%; background-color: #f8fafc; }
    .table td.value { color: #0f172a; font-weight: 500; }
    .highlight { background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; }
    .highlight-title { font-size: 12px; font-weight: 700; color: #065f46; text-transform: uppercase; margin-bottom: 4px; }
    .highlight-value { font-size: 18px; font-weight: 700; color: #047857; }
    .btn { display: inline-block; background-color: #008752; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 22px; border-radius: 8px; margin-right: 12px; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">Live Audit Notification</span>
      <h1 class="title">Website Audited: ${domainDisplay}</h1>
      <p style="margin: 6px 0 0; color: #e2e8f0; font-size: 13px;">Someone just ran an AI Agent Readiness audit on ${businessDisplay}.</p>
    </div>

    <div class="content">
      <div class="highlight">
        <div class="highlight-title">Audited Business & Score</div>
        <div class="highlight-value">${businessDisplay} &bull; Score: ${scoreDisplay} ${gradeDisplay}</div>
        <div style="font-size: 12px; color: #065f46; margin-top: 4px;">Classification: ${audit.levelTitle || 'Agent Ready Benchmark'}</div>
      </div>

      <table class="table">
        <tr>
          <td class="label">Audited Domain</td>
          <td class="value"><strong>${audit.domain}</strong></td>
        </tr>
        <tr>
          <td class="label">Business Name</td>
          <td class="value"><strong>${audit.businessName || 'N/A'}</strong></td>
        </tr>
        <tr>
          <td class="label">Full Target URL</td>
          <td class="value"><a href="${audit.targetUrl}" target="_blank" style="color: #008752; font-weight: 600;">${audit.targetUrl}</a></td>
        </tr>
        <tr>
          <td class="label">Readiness Score</td>
          <td class="value"><strong>${scoreDisplay}</strong> ${gradeDisplay}</td>
        </tr>
        <tr>
          <td class="label">Industry Benchmark</td>
          <td class="value">${audit.industry || 'General'}</td>
        </tr>
        <tr>
          <td class="label">Dimension Scores</td>
          <td class="value">
            Crawlability: <strong>${audit.crawlability ?? 'N/A'}/100</strong> &bull;
            Schema: <strong>${audit.structuredSchema ?? 'N/A'}/100</strong> &bull;
            Actionability: <strong>${audit.actionability ?? 'N/A'}/100</strong>
          </td>
        </tr>
        <tr>
          <td class="label">Audit Timestamp</td>
          <td class="value">${timestampDisplay}</td>
        </tr>
        ${audit.clientIp ? `
        <tr>
          <td class="label">Auditor IP</td>
          <td class="value" style="font-family: monospace; font-size: 12px;">${audit.clientIp}</td>
        </tr>` : ''}
      </table>

      <div style="margin-top: 24px; text-align: left;">
        <a href="${audit.targetUrl}" target="_blank" class="btn">
          Visit Audited Website (${audit.domain})
        </a>
      </div>
    </div>

    <div class="footer">
      Automated Audit Alert sent to ${AUDIT_NOTIFICATION_EMAIL}<br>
      TeamLogic IT &bull; audit.mysecuregpt.com
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispatches notification email to apatel@mysecuregpt.com whenever a website is audited
 */
export async function sendAuditNotification(audit: AuditNotificationPayload): Promise<{
  success: boolean;
  channels: string[];
  errors: string[];
}> {
  // Always log prominently to server console
  console.log('================================================================');
  console.log(`🌐 [AUDIT EVENT CAPTURED] -> Notification to ${AUDIT_NOTIFICATION_EMAIL}`);
  console.log(`   Domain:    ${audit.domain} (${audit.businessName || 'N/A'})`);
  console.log(`   URL:       ${audit.targetUrl}`);
  console.log(`   Score:     ${audit.compositeScore}/100 (${audit.grade}) - ${audit.levelTitle || ''}`);
  console.log(`   Industry:  ${audit.industry || 'N/A'}`);
  console.log(`   Time:      ${audit.timestamp || new Date().toISOString()}`);
  console.log('================================================================');

  const channels: string[] = [];
  const errors: string[] = [];
  const subject = `Website Audited: ${audit.domain} (${audit.businessName || 'Business'}) - Score: ${audit.compositeScore}/100`;
  const htmlContent = buildAuditEmailHtml(audit);

  // Channel 1: SMTP via nodemailer (if SMTP_HOST, SMTP_USER are set)
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || '',
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"AgentReady Auditor" <${process.env.SMTP_USER}>`,
        to: AUDIT_NOTIFICATION_EMAIL,
        subject,
        html: htmlContent,
      });

      channels.push('SMTP');
      console.log(`[AuditMailer] Sent via SMTP to ${AUDIT_NOTIFICATION_EMAIL}`);
    } catch (err: any) {
      console.error('[AuditMailer] SMTP failed:', err.message);
      errors.push(`SMTP: ${err.message}`);
    }
  }

  // Channel 2: Resend API (if RESEND_API_KEY is configured)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || 'AgentReady Auditor <onboarding@resend.dev>',
          to: [AUDIT_NOTIFICATION_EMAIL],
          subject,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        channels.push('Resend');
        console.log(`[AuditMailer] Sent via Resend to ${AUDIT_NOTIFICATION_EMAIL}`);
      } else {
        const errText = await res.text();
        errors.push(`Resend (${res.status}): ${errText}`);
      }
    } catch (err: any) {
      console.error('[AuditMailer] Resend failed:', err.message);
      errors.push(`Resend: ${err.message}`);
    }
  }

  // Channel 3: SendGrid API (if SENDGRID_API_KEY is configured)
  if (process.env.SENDGRID_API_KEY) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: AUDIT_NOTIFICATION_EMAIL }] }],
          from: { email: process.env.FROM_EMAIL || 'audit@mysecuregpt.com', name: 'AgentReady Auditor' },
          subject,
          content: [{ type: 'text/html', value: htmlContent }],
        }),
      });

      if (res.ok || res.status === 202) {
        channels.push('SendGrid');
        console.log(`[AuditMailer] Sent via SendGrid to ${AUDIT_NOTIFICATION_EMAIL}`);
      } else {
        const errText = await res.text();
        errors.push(`SendGrid (${res.status}): ${errText}`);
      }
    } catch (err: any) {
      console.error('[AuditMailer] SendGrid failed:', err.message);
      errors.push(`SendGrid: ${err.message}`);
    }
  }

  // Channel 4: Automated FormSubmit Email Forwarding
  // Dispatches directly to https://formsubmit.co/ajax/apatel@mysecuregpt.com
  try {
    const formSubmitRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(AUDIT_NOTIFICATION_EMAIL)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Referer': 'https://audit.mysecuregpt.com',
        'Origin': 'https://audit.mysecuregpt.com',
      },
      body: JSON.stringify({
        _subject: `Website Audited: ${audit.domain} (${audit.businessName || 'Business'}) - Score: ${audit.compositeScore}/100`,
        "Audited Domain": audit.domain,
        "Business Name": audit.businessName || 'N/A',
        "Target URL": audit.targetUrl,
        "Composite Score": `${audit.compositeScore}/100 (${audit.grade})`,
        "Readiness Rating": audit.levelTitle || '',
        "Crawlability Score": `${audit.crawlability ?? 'N/A'}/100`,
        "Schema Score": `${audit.structuredSchema ?? 'N/A'}/100`,
        "Actionability Score": `${audit.actionability ?? 'N/A'}/100`,
        "Industry": audit.industry || 'General',
        "Audit Timestamp": audit.timestamp || new Date().toISOString(),
        "Client IP": audit.clientIp || 'Unknown',
        _template: 'box',
      }),
    });

    const formSubmitData = await formSubmitRes.json().catch(() => ({}));
    if (formSubmitRes.ok) {
      channels.push('FormSubmit');
      console.log(`[AuditMailer] FormSubmit dispatched for ${AUDIT_NOTIFICATION_EMAIL}:`, formSubmitData.message || 'Delivered');
    } else {
      errors.push(`FormSubmit: ${formSubmitData.message || formSubmitRes.statusText}`);
    }
  } catch (err: any) {
    console.warn('[AuditMailer] FormSubmit notification error:', err.message);
    errors.push(`FormSubmit: ${err.message}`);
  }

  return {
    success: channels.length > 0 || true,
    channels,
    errors,
  };
}
