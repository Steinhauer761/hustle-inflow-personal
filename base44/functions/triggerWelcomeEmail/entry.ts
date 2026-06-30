import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Check if already sent (prevent duplicates)
    const existingSettings = await base44.entities.UserSettings.filter({});
    if (existingSettings.length > 0 && existingSettings[0].welcome_email_sent) {
      return Response.json({ success: true, message: 'Already sent' });
    }

    // Send welcome email
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: '🎉 Welcome to HustleINFlow!',
      body: `Hi ${user.full_name || 'there'},\n\nWelcome to HustleINFlow — your all-in-one life management platform! 🚀\n\nWe're thrilled to have you on board. Here's what you can do right now:\n\n✨ CORE FEATURES (FREE):\n• 📅 Planner — Organize your tasks and schedule\n• 👨‍👩‍👧‍👦 Family — Keep track of family members and important info\n• 🐾 Pets — Manage pet care, vet visits, and photos\n• 🧭 Discover — Explore local recommendations\n• 💬 AI Chat — Get personalized assistance\n• 📁 Files — Store and organize documents\n• ✈️ Trips — Plan and track your travels\n• 📆 Calendar — Never miss an appointment\n• 💰 Expenses — Track spending and budgets\n• 🛒 Shopping — Smart shopping lists\n• 🍽️ Meals — Weekly meal planning\n\n🔓 TIER 2 FEATURES (FREE TRIAL):\n• 🏆 Sports Lounge — Live scores and stats\n• 🎲 Fireball Keno — Fun casino-style game\n• 💼 Jobs Board — Search and apply for jobs (with resume upload!)\n• 💳 Wallet — Digital payment management\n• 📄 Invoices — Create and track invoices\n\n🎁 CURRENT PROMOTIONS:\n• Free Tier 2 trial access for all new users\n• Hit 8+ in Keno = 3 days free Tier 2 access\n• Win 3 rounds in a row = 500 bonus tokens\n• Hit a Fireball match = 100 bonus tokens\n\n💡 GETTING STARTED:\n1. Complete your profile in Settings\n2. Explore the features on your Home dashboard\n3. Try the AI Chat for personalized help\n4. Check out the Jobs Board to kickstart your career search\n\nNeed help? Reply to this email or reach out at Steinhauer761@gmail.com\n\nLet's make things happen! 💪\n\n— The HustleINFlow Team`,
    });

    // Mark as sent
    if (existingSettings.length > 0) {
      await base44.entities.UserSettings.update(existingSettings[0].id, { welcome_email_sent: true });
    } else {
      await base44.entities.UserSettings.create({ welcome_email_sent: true });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});