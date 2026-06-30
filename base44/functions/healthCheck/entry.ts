import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Service role - admin only
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const issues = [];
    const recommendations = [];

    // Check for orphaned data
    const expenses = await base44.asServiceRole.entities.Expense.list();
    const tasks = await base44.asServiceRole.entities.Task.list();
    
    // Check for old incomplete tasks
    const oldTasks = tasks.filter(t => t.status === 'todo' && t.date && new Date(t.date) < new Date());
    if (oldTasks.length > 0) {
      recommendations.push({
        type: 'optimization',
        message: `${oldTasks.length} overdue tasks found - consider archiving`,
        priority: 'low',
      });
    }

    // Check for large files
    const uploads = await base44.asServiceRole.entities.Upload.list();
    const largeFiles = uploads.filter(u => u.file_url?.includes('large'));
    if (largeFiles.length > 0) {
      recommendations.push({
        type: 'storage',
        message: 'Consider compressing large uploaded files',
        priority: 'medium',
      });
    }

    // System health score
    const healthScore = 100 - (issues.length * 10) - (recommendations.length * 5);

    return Response.json({
      timestamp: new Date().toISOString(),
      health_score: Math.max(0, healthScore),
      issues,
      recommendations,
      status: healthScore > 80 ? 'excellent' : healthScore > 60 ? 'good' : 'needs_attention',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});