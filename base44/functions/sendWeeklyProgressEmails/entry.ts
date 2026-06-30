import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { subDays } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 });
        }
        
        const users = await base44.asServiceRole.entities.User.list();
        const lastWeek = subDays(new Date(), 7).toISOString();
        
        for (const user of users) {
            const workouts = await base44.asServiceRole.entities.WorkoutLog.filter({ created_by_id: user.id });
            const recentWorkouts = workouts.filter(w => new Date(w.created_date) >= new Date(lastWeek));
            
            const allTasks = await base44.asServiceRole.entities.Task.filter({ created_by_id: user.id });
            const recentCompletedTasks = allTasks.filter(t => t.status === 'done' && new Date(t.updated_date || t.created_date) >= new Date(lastWeek));
            
            if (recentWorkouts.length > 0 || recentCompletedTasks.length > 0) {
                const body = `Hey ${user.full_name},\n\nHere is your weekly recap for HustleInFlow! 🚀\n\n`
                  + `🏋️ Fitness Goals:\nYou logged ${recentWorkouts.length} workouts this week.\n\n`
                  + `✅ Tasks Completed:\nYou completed ${recentCompletedTasks.length} tasks this week.\n\n`
                  + `Keep up the great work,\nThe HustleInFlow Team`;
                
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: user.email,
                    subject: 'Your Weekly Recap is Here! 💪',
                    body: body
                });
            }
        }
        
        return new Response(JSON.stringify({ success: true, message: 'Emails dispatched' }), { 
            headers: { 'Content-Type': 'application/json' } 
        });
    } catch (error) {
        console.error("Email error:", error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
});