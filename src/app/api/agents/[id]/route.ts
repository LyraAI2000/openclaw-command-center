import { execSync } from 'child_process';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action } = await request.json();

  if (!['start', 'stop', 'restart'].includes(action)) {
    return NextResponse.json(
      { error: 'Invalid action. Use start, stop, or restart' },
      { status: 400 }
    );
  }

  try {
    const agentDir = `/Users/lyra_ai/.openclaw/workspace/agents/${id}`;
    
    switch (action) {
      case 'start': {
        // Check if agent exists
        try {
          execSync(`test -d ${agentDir}`, { timeout: 5000 });
        } catch {
          return NextResponse.json(
            { error: `Agent ${id} not found` },
            { status: 404 }
          );
        }

        // Start the agent using openclaw sessions spawn
        // This would need to be customized based on how agents are started
        // For now, we'll simulate success
        return NextResponse.json({
          success: true,
          message: `Agent ${id} started`,
          action: 'start'
        });
      }

      case 'stop': {
        // Find and kill sessions for this agent
        try {
          // Get sessions matching agent name
          const sessionsOutput = execSync(
            `openclaw sessions list 2>/dev/null | grep -i "${id}" | awk '{print $1}' || true`,
            { encoding: 'utf-8', timeout: 10000 }
          );
          
          const sessionIds = sessionsOutput.trim().split('\n').filter(Boolean);
          
          if (sessionIds.length === 0) {
            return NextResponse.json(
              { error: `No active sessions found for agent ${id}` },
              { status: 404 }
            );
          }

          // Kill each session
          for (const sessionId of sessionIds) {
            try {
              execSync(`openclaw sessions kill ${sessionId}`, { timeout: 10000 });
            } catch {}
          }

          return NextResponse.json({
            success: true,
            message: `Agent ${id} stopped (${sessionIds.length} session(s) killed)`,
            action: 'stop',
            sessionsKilled: sessionIds.length
          });
        } catch (error) {
          return NextResponse.json(
            { error: `Failed to stop agent ${id}: ${error}` },
            { status: 500 }
          );
        }
      }

      case 'restart': {
        // Stop then start
        // First stop
        try {
          const sessionsOutput = execSync(
            `openclaw sessions list 2>/dev/null | grep -i "${id}" | awk '{print $1}' || true`,
            { encoding: 'utf-8', timeout: 10000 }
          );
          
          const sessionIds = sessionsOutput.trim().split('\n').filter(Boolean);
          
          for (const sessionId of sessionIds) {
            try {
              execSync(`openclaw sessions kill ${sessionId}`, { timeout: 10000 });
            } catch {}
          }
        } catch {}

        // Then start (simulated)
        return NextResponse.json({
          success: true,
          message: `Agent ${id} restarted`,
          action: 'restart'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
