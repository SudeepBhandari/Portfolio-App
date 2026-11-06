import { run, get } from './db';

export interface EmailSendResult {
  success: boolean;
  provider: string;
  status: 'sent' | 'failed' | 'pending';
  errorSummary?: string;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendInquiryNotification(inquiry: {
  id: number;
  full_name: string;
  email: string;
  company?: string;
  service: string;
  message: string;
  budget?: string;
  deadline?: string;
  preferred_contact?: string;
  reference_url?: string;
}): Promise<EmailSendResult> {
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase() || '';
  const adminDestinationEmail = process.env.ADMIN_EMAIL || 'bhandarysudip5@gmail.com';

  const sanitizedName = escapeHtml(inquiry.full_name);
  const sanitizedEmail = escapeHtml(inquiry.email);
  const sanitizedCompany = inquiry.company ? escapeHtml(inquiry.company) : 'Not specified';
  const sanitizedService = escapeHtml(inquiry.service);
  const sanitizedMessage = escapeHtml(inquiry.message).replace(/\n/g, '<br/>');
  const sanitizedBudget = inquiry.budget ? escapeHtml(inquiry.budget) : 'Not specified';
  const sanitizedDeadline = inquiry.deadline ? escapeHtml(inquiry.deadline) : 'Not specified';

  const emailSubject = `[Portfolio Inquiry #${inquiry.id}] New project inquiry from ${sanitizedName} (${sanitizedService})`;
  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #111827; margin-top: 0;">New Project Inquiry received</h2>
      <p style="color: #4b5563;">You have received a new project inquiry through your portfolio website.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; width: 140px;"><strong>Client Name:</strong></td>
          <td style="padding: 8px 0; color: #111827;">${sanitizedName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td>
          <td style="padding: 8px 0; color: #111827;"><a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Company:</strong></td>
          <td style="padding: 8px 0; color: #111827;">${sanitizedCompany}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Service Required:</strong></td>
          <td style="padding: 8px 0; color: #111827;">${sanitizedService}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Estimated Budget:</strong></td>
          <td style="padding: 8px 0; color: #111827;">${sanitizedBudget}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Target Deadline:</strong></td>
          <td style="padding: 8px 0; color: #111827;">${sanitizedDeadline}</td>
        </tr>
      </table>

      <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h4 style="margin: 0 0 8px 0; color: #374151;">Project Message:</h4>
        <p style="margin: 0; color: #1f2937; line-height: 1.6;">${sanitizedMessage}</p>
      </div>

      <p style="margin-top: 24px; font-size: 13px; color: #9ca3af;">
        This notification was generated from <a href="https://www.sudipbhandari5.com.np" style="color: #6b7280;">sudipbhandari5.com.np</a>. Reply directly to this email to reach the client.
      </p>
    </div>
  `;

  let result: EmailSendResult = {
    success: false,
    provider: provider || 'none',
    status: 'pending',
    errorSummary: 'No email service provider configured in environment variables. Inquiry saved for admin dashboard review.'
  };

  // If Resend API Key is provided
  if (provider === 'resend' && process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: adminDestinationEmail,
          reply_to: inquiry.email,
          subject: emailSubject,
          html: emailHtml
        })
      });

      if (response.ok) {
        result = {
          success: true,
          provider: 'resend',
          status: 'sent'
        };
      } else {
        const errorText = await response.text();
        result = {
          success: false,
          provider: 'resend',
          status: 'failed',
          errorSummary: `Resend API Error: ${response.status} - ${errorText.substring(0, 150)}`
        };
      }
    } catch (err: any) {
      result = {
        success: false,
        provider: 'resend',
        status: 'failed',
        errorSummary: err?.message || 'Network error reaching Resend API'
      };
    }
  } else if (!provider) {
    // Graceful default: recorded in database for owner review
    result = {
      success: true,
      provider: 'internal_queue',
      status: 'pending',
      errorSummary: 'Recorded in database. Email provider setup is optional.'
    };
  }

  // Record attempt in email_notifications table
  try {
    const existingNotification = await get('SELECT id, attempt_count FROM email_notifications WHERE inquiry_id = ?', [inquiry.id]);
    if (existingNotification) {
      await run(`
        UPDATE email_notifications
        SET provider = ?, status = ?, error_summary = ?, attempt_count = attempt_count + 1, last_attempt_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [result.provider, result.status, result.errorSummary || '', existingNotification.id]);
    } else {
      await run(`
        INSERT INTO email_notifications (inquiry_id, provider, status, error_summary, attempt_count, last_attempt_at)
        VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
      `, [inquiry.id, result.provider, result.status, result.errorSummary || '']);
    }
  } catch (dbErr) {
    console.error('Failed to write email notification log:', dbErr);
  }

  return result;
}
