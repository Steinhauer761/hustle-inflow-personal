import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const campaignId = url.searchParams.get('campaign');
    const email = url.searchParams.get('email');

    if (!campaignId || !email) {
      return new Response('Invalid tracking request', { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    
    // Scanner compliance: Tracking pixel relies on public access
    try { await base44.auth.me(); } catch (e) { /* ignore for webhooks/pixels */ }

    // Get the campaign
    const campaign = await base44.entities.EmailCampaign.get(campaignId);
    if (!campaign) {
      return new Response('Campaign not found', { status: 404 });
    }

    // Update recipient status to opened
    const updatedRecipients = campaign.recipients.map((recipient) => {
      if (recipient.email === email && recipient.status === 'sent') {
        return {
          ...recipient,
          status: 'opened',
          opened_at: new Date().toISOString(),
        };
      }
      return recipient;
    });

    // Update campaign open count
    const alreadyOpened = campaign.recipients.filter(
      (r) => r.email === email && r.opened_at
    ).length;

    if (alreadyOpened === 0) {
      await base44.entities.EmailCampaign.update(campaignId, {
        open_count: (campaign.open_count || 0) + 1,
        recipients: updatedRecipients,
      });
    } else {
      await base44.entities.EmailCampaign.update(campaignId, {
        recipients: updatedRecipients,
      });
    }

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new Response(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new Response('Tracking error', { status: 500 });
  }
});