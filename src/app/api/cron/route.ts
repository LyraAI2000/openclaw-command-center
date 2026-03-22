import { execSync } from 'child_process';
import { NextResponse } from 'next/server';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRunStatus: 'ok' | 'error' | 'unknown' | null;
  lastRunAt: string | null;
  nextRunAt: string | null;
  consecutiveErrors: number;
  lastError: string | null;
  agentId: string;
  target: string;
}

export async function GET() {
  try {
    // Get cron jobs from OpenClaw
    const cronOutput = execSync(
      'openclaw cron list --json 2>/dev/null || echo \'{"jobs":[]}\'',
      { 
        encoding: 'utf-8',
        timeout: 10000 
      }
    );

    let jobs: CronJob[] = [];
    
    try {
      const data = JSON.parse(cronOutput);
      
      if (data.jobs && Array.isArray(data.jobs)) {
        jobs = data.jobs.map((job: any) => ({
          id: job.id || '',
          name: job.name || 'Unnamed Job',
          schedule: formatSchedule(job.schedule),
          enabled: job.enabled !== false,
          lastRunStatus: job.state?.lastRunStatus || null,
          lastRunAt: job.state?.lastRunAtMs ? new Date(job.state.lastRunAtMs).toISOString() : null,
          nextRunAt: job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs).toISOString() : null,
          consecutiveErrors: job.state?.consecutiveErrors || 0,
          lastError: job.state?.lastError || null,
          agentId: job.agentId || 'unknown',
          target: job.sessionTarget || 'isolated',
        }));
      }
    } catch (parseError) {
      console.error('Failed to parse cron output:', parseError);
    }

    return NextResponse.json({ jobs });
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        jobs: [] 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId, action } = body;

    if (!jobId || !action) {
      return NextResponse.json(
        { error: 'Missing jobId or action' },
        { status: 400 }
      );
    }

    if (action === 'enable') {
      execSync(`openclaw cron enable ${jobId} 2>/dev/null`, { timeout: 10000 });
      return NextResponse.json({ success: true, message: 'Job enabled' });
    } else if (action === 'disable') {
      execSync(`openclaw cron disable ${jobId} 2>/dev/null`, { timeout: 10000 });
      return NextResponse.json({ success: true, message: 'Job disabled' });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "enable" or "disable"' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update job' },
      { status: 500 }
    );
  }
}

function formatSchedule(schedule: any): string {
  if (!schedule) return 'Unknown';
  
  if (schedule.kind === 'cron' && schedule.expr) {
    return `cron: ${schedule.expr}`;
  }
  
  if (schedule.kind === 'every' && schedule.everyMs) {
    const ms = schedule.everyMs;
    if (ms < 60000) return `every ${ms / 1000}s`;
    if (ms < 3600000) return `every ${ms / 60000}m`;
    if (ms < 86400000) return `every ${ms / 3600000}h`;
    return `every ${ms / 86400000}d`;
  }
  
  return JSON.stringify(schedule);
}
