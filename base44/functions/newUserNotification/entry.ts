import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get user info
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Send notification email to admin
    try {
      await base44.integrations.Core.SendEmail({
        to: 'Steinhauer761@gmail.com',
        subject: `🔔 New User ${user.role === 'admin' ? 'Admin' : 'Account'} - HustleInFlow`,
        body: `New User Registration/Login Alert\n\nUser Details:\n- Name: ${user.full_name || 'N/A'}\n- Email: ${user.email}\n- Role: ${user.role}\n- User ID: ${user.id}\n- Time: ${new Date().toISOString()}\n\nThis is an automated notification from HustleInFlow.\n\n— Monitoring Bot`,
      });
      console.log('New user notification sent to admin');
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError.message);
    }

    return Response.json({ 
      success: true, 
      message: 'Notification sent',
      user: { email: user.email, role: user.role }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});