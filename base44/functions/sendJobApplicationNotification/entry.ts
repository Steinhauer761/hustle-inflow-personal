import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get the user from the request context
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'No user found' }, { status: 400 });
    }

    // Get the job application from the payload
    const { event, data, old_data } = await req.json();
    
    if (!data || !data.id) {
      return Response.json({ error: 'No application data found' }, { status: 400 });
    }

    // Check if status changed
    const statusChanged = old_data && data.status !== old_data.status;
    
    if (!statusChanged) {
      return Response.json({ success: true, message: 'No status change' });
    }

    // Status emoji and message mapping
    const statusInfo = {
      viewed: { emoji: '👁️', message: 'Your application has been viewed by the employer' },
      responded: { emoji: '✉️', message: 'Great news! The employer has responded to your application' },
      rejected: { emoji: '💼', message: 'Unfortunately, this application was not successful' },
    };

    const info = statusInfo[data.status] || { emoji: '📋', message: 'Your application status has been updated' };

    // Send notification email
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `${info.emoji} Job Application Update: ${data.job_title} at ${data.company}`,
      body: `Hi ${user.full_name || 'there'},\n\n${info.message}\n\n📋 APPLICATION DETAILS:\n• Position: ${data.job_title}\n• Company: ${data.company}\n• New Status: ${data.status.toUpperCase()}\n• Applied Date: ${data.applied_date || 'N/A'}\n\n${data.notes ? `📝 NOTES:\n${data.notes}\n\n` : ''}Next Steps:\n• Check your email for messages from the employer\n• Log in to HustleINFlow to view all your applications\n• Keep applying - your dream job is out there!\n\nNeed help? Reply to this email or reach out at Steinhauer761@gmail.com\n\nStay motivated! 💪\n\n— The HustleINFlow Team`,
    });

    return Response.json({ 
      success: true, 
      message: `Notification sent for ${data.status} status`
    });
  } catch (error) {
    console.error('Job application notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});