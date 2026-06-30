import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Admin access required' }, { status: 403 });
    }
    const settingsList = await base44.asServiceRole.entities.UserSettings.list();
    if (settingsList.length === 0) return Response.json({ status: "no settings" });
    const setting = settingsList[0];
    
    // try to update
    await base44.asServiceRole.entities.UserSettings.update(setting.id, { temperature_unit: 'celsius' });
    const updated = await base44.asServiceRole.entities.UserSettings.get(setting.id);
    
    return Response.json({ success: true, updated_temp: updated.temperature_unit });
  } catch(e) {
    return Response.json({ error: e.message });
  }
});