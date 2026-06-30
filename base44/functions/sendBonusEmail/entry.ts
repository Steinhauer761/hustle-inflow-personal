import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { to, name } = await req.json();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      subject: '🎁 A Special Bonus Gift — Thank You for Joining HustleINFlow!',
      body: `Hi ${name || 'there'},\n\nThank you SO much for signing up to HustleINFlow — it means the world to us! 🙏\n\nAs a small token of our appreciation, we've added a special bonus just for you:\n\n🎲 100,000 FREE Keno Chips have been loaded into your account!\n\nHead over to the Fireball Keno game and try your luck. Who knows — you might hit the jackpot! 🔥\n\nThis is our way of saying: welcome to the family. We're genuinely excited to have you here.\n\n✨ Here's a quick reminder of everything waiting for you:\n• 📅 Planner & Calendar — Stay on top of life\n• 👨‍👩‍👧‍👦 Family & 🐾 Pets — Keep your whole crew organized\n• 🧭 Discover — Find hidden gems near you\n• 💼 Jobs Board — Kickstart your career search\n• 🎲 Fireball Keno — Play with your 100,000 bonus chips!\n• 💬 AI Assistant — Your personal life coach\n\nIf you ever need help or just want to say hi, reply to this email or reach us at Steinhauer761@gmail.com.\n\nHere's to great things ahead! 💪\n\n— Jeff & The HustleINFlow Team`,
      from_name: 'HustleINFlow',
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Bonus email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});