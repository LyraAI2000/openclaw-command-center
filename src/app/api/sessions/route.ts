import { execSync } from 'child_process';
import { NextResponse } from 'next/server';

interface Session {
  key: string;
  agentName: string;
  channel: string;
  status: 'active' | 'idle';
  lastActivity: string;
  createdAt: string;
  type: string;
  model?: string;
  tokens?: {
    input: number;
    output: number;
    total: number;
    context: number;
  };
}

export async function GET() {
  try {
    // Get sessions from OpenClaw
    const sessionsOutput = execSync(
      'openclaw sessions --json --all-agents 2>/dev/null || echo \'{"sessions":[]}\'',
      { 
        encoding: 'utf-8',
        timeout: 10000 
      }
    );

    let sessions: Session[] = [];
    
    try {
      const data = JSON.parse(sessionsOutput);
      
      if (data.sessions && Array.isArray(data.sessions)) {
        sessions = data.sessions.map((entry: any) => {
          // Parse the session key to extract agent name
          const keyParts = entry.key?.split(':') || [];
          const agentName = keyParts[1] || 'system';
          const channel = keyParts[2] || 'unknown';
          
          // Determine if session is idle (older than 5 minutes without update)
          const ageMs = entry.ageMs || 0;
          const isIdle = ageMs > 300000; // 5 minutes
          
          return {
            key: entry.key || 'unknown',
            agentName: agentName.charAt(0).toUpperCase() + agentName.slice(1),
            channel: channel,
            status: isIdle ? 'idle' as const : 'active' as const,
            lastActivity: entry.updatedAt ? new Date(entry.updatedAt).toISOString() : new Date().toISOString(),
            createdAt: entry.sessionId ? new Date(parseInt(entry.sessionId.split('-')[0], 16) / 1000).toISOString() : new Date().toISOString(),
            type: keyParts[0] || 'standard',
            model: entry.model,
            tokens: entry.totalTokens ? {
              input: entry.inputTokens || 0,
              output: entry.outputTokens || 0,
              total: entry.totalTokens || 0,
              context: entry.contextTokens || 0,
            } : undefined,
          };
        });
      }
    } catch (parseError) {
      console.error('Failed to parse sessions:', parseError);
    }

    // Sort by last activity (most recent first)
    sessions.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

    return NextResponse.json({ sessions, total: sessions.length });
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        sessions: [] 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('key');
    const clearOld = searchParams.get('old') === 'true';

    if (clearOld) {
      // Clear old/idle sessions - use sessions cleanup
      const output = execSync('openclaw sessions cleanup 2>&1', { 
        encoding: 'utf-8',
        timeout: 15000 
      });
      return NextResponse.json({ success: true, message: 'Sessions cleaned up', output });
    }

    if (sessionKey) {
      // Note: OpenClaw doesn't have a direct session kill command
      // This would need to be implemented via the gateway API
      return NextResponse.json({ 
        success: false, 
        error: 'Individual session termination requires gateway API access' 
      }, { status: 501 });
    }

    return NextResponse.json(
      { error: 'Missing session key or old parameter' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear sessions' },
      { status: 500 }
    );
  }
}