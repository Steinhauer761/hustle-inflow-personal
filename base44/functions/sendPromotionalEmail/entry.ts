import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { recipientEmails, subject, messageBody, campaignName, adminEmail } = await req.json();

    if (!recipientEmails || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return Response.json({ error: 'Please provide recipient emails' }, { status: 400 });
    }

    if (!subject || !messageBody) {
      return Response.json({ error: 'Subject and message body are required' }, { status: 400 });
    }

    // Send email to each recipient
    const results = [];
    for (const email of recipientEmails) {
      try {
        await base44.integrations.Core.SendEmail({
          to: email,
          subject: subject,
          body: messageBody,
        });
        results.push({ 
          email, 
          status: 'sent',
          sent_at: new Date().toISOString()
        });
      } catch (error) {
        results.push({ 
          email, 
          status: 'failed', 
          error: error.message 
        });
      }
    }

    const sentCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    // Save campaign to database
    const campaign = await base44.entities.EmailCampaign.create({
      campaign_name: campaignName || 'Promotional Campaign',
      subject,
      message: messageBody,
      sent_date: new Date().toISOString(),
      sent_count: sentCount,
      open_count: 0,
      click_count: 0,
      recipients: results,
    });

    // Send notification email to admin with full campaign details
    if (adminEmail) {
      const adminNotification = `
📊 CAMPAIGN SENT SUCCESSFULLY

Campaign: ${campaignName || 'Promotional Campaign'}
Sent: ${new Date().toLocaleString('en-US', { timeZone: 'America/Edmonton' })}

📈 RESULTS:
✓ Sent: ${sentCount} emails
✗ Failed: ${failedCount} emails
📬 Total Recipients: ${recipientEmails.length}

📧 RECIPIENTS:
${results.map(r => `• ${r.email} - ${r.status}`).join('\n')}

📝 SUBJECT:
${subject}

📄 FULL MESSAGE:
${messageBody}

---
HustleInFlow Marketing Team
      `.trim();

      try {
        await base44.integrations.Core.SendEmail({
          to: adminEmail,
          subject: `📊 Campaign Sent: ${campaignName || 'Promotional Campaign'}`,
          body: adminNotification,
        });
      } catch (error) {
        console.error('Failed to send admin notification:', error);
      }
    }

    return Response.json({
      success: true,
      campaignId: campaign.id,
      campaignName: campaignName || 'Promotional Campaign',
      totalRecipients: recipientEmails.length,
      sentCount,
      failedCount,
      adminNotified: !!adminEmail,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});