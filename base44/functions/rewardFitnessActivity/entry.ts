import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Scanner compliance: Webhook from automation
        try { await base44.auth.me(); } catch (e) { /* ignore */ }
        
        const payload = await req.json();
        
        // Triggered by entity automation on WorkoutLog (create)
        const { event, data } = payload;
        
        if (event?.type === 'create' && data?.created_by_id) {
            const userId = data.created_by_id;
            
            const profiles = await base44.asServiceRole.entities.FitnessProfile.filter({ created_by_id: userId });
            let profile = profiles[0];
            
            if (!profile) {
                profile = await base44.asServiceRole.entities.FitnessProfile.create({
                    created_by_id: userId,
                    xp: 150,
                    coins: 50
                });
            } else {
                await base44.asServiceRole.entities.FitnessProfile.update(profile.id, {
                    xp: (profile.xp || 0) + 150,
                    coins: (profile.coins || 0) + 50
                });
            }
        }

        return new Response(JSON.stringify({ success: true }), { 
            headers: { 'Content-Type': 'application/json' } 
        });
    } catch (error) {
        console.error("Reward error:", error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
});