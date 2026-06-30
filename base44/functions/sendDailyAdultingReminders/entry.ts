import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

export default async function handler(req) {
    try {
        const base44 = createClientFromRequest(req);
        
        // This is an admin/service function, we don't expect a user to be logged in for scheduled runs
        // But we can check if it's run manually by an admin
        // Actually, for scheduled automations, we just use the service role.
        
        const today = new Date().toISOString().split('T')[0];
        const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

        // Get all users
        const allUsers = await base44.asServiceRole.entities.User.list();
        
        let sentCount = 0;

        for (const u of allUsers) {
            if (!u.email) continue;

            // Get user settings
            const settingsList = await base44.asServiceRole.entities.UserSettings.filter({ created_by_id: u.id });
            const settings = settingsList[0];
            
            // Default to true if not explicitly set to false
            if (settings && settings.notifications_reminders === false) {
                continue; // User opted out of reminders
            }

            // Get user's tasks
            const tasks = await base44.asServiceRole.entities.Task.filter({ created_by_id: u.id, status: 'todo' });
            
            // Filter tasks due today or recurring
            const todaysTasks = tasks.filter(t => {
                if (t.date === today) return true;
                if (t.is_recurring) {
                    if (t.recurrence === 'daily') return true;
                    if (t.recurrence === 'weekly' && t.date) {
                        return new Date(t.date).getDay() === new Date().getDay();
                    }
                    if (t.recurrence === 'monthly' && t.date) {
                        return new Date(t.date).getDate() === new Date().getDate();
                    }
                }
                return false;
            });

            // Get user's meal plan for the current week
            const mealPlans = await base44.asServiceRole.entities.MealPlan.filter({ created_by_id: u.id });
            let todaysMeals = [];
            for (const mp of mealPlans) {
                const slotsForToday = mp.slots?.filter(s => s.day.toLowerCase() === dayOfWeek.toLowerCase()) || [];
                todaysMeals.push(...slotsForToday);
            }

            if (todaysTasks.length > 0 || todaysMeals.length > 0) {
                // Prepare email body
                let emailBody = `Good morning ${u.full_name || 'Hustler'}!\n\nHere are your adulting responsibilities for today:\n\n`;
                
                if (todaysTasks.length > 0) {
                    emailBody += `📋 TASKS:\n`;
                    todaysTasks.forEach(t => {
                        emailBody += `- ${t.title} ${t.time ? `at ${t.time}` : ''}\n`;
                    });
                    emailBody += `\n`;
                }

                if (todaysMeals.length > 0) {
                    emailBody += `🍽️ MEALS:\n`;
                    todaysMeals.forEach(m => {
                        emailBody += `- ${m.meal}: ${m.recipe_name}\n`;
                    });
                    emailBody += `\n`;
                }

                emailBody += `Have a great day!\nThe HustleInFlow Team`;

                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: u.email,
                    subject: `📅 Your Daily Adulting Reminders`,
                    body: emailBody
                });
                
                sentCount++;
            }
        }

        return Response.json({ success: true, sentCount });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

Deno.serve(handler);