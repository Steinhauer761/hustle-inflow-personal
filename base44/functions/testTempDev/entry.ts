import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }
        const files = Array.from(Deno.readDirSync('./entities')).filter(f => f.name.endsWith('.json')).map(f => f.name);
        let issues = [];
        for (const file of files) {
            const content = JSON.parse(Deno.readTextFileSync(`./entities/${file}`));
            if (!content.rls || Object.keys(content.rls).length === 0) {
                issues.push(file);
            }
        }
        return Response.json({ total: files.length, files, issues });
    } catch (e) {
        return Response.json({ error: e.message });
    }
});