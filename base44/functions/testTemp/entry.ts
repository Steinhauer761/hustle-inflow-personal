import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
Deno.serve(async (req) => {
    try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const settingsList = await base44.asServiceRole.entities.UserSetting.list();
    if (settingsList.length === 0) return Response.json({ error: 'Not found' }, { status: 404 });
    const setting = settingsList[0];

    const updated = await base44.asServiceRole.entities.UserSetting.update(setting.id, {
      // Add your update fields here
    });

    return Response.json({ success: true, updated });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};
