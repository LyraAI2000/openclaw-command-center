import { execSync } from 'child_process';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    let result: { success: boolean; message: string; output?: string } = { success: false, message: '' };

    switch (action) {
      case 'restartGateway':
        result = await restartGateway();
        break;
      case 'reindexMemory':
        result = await reindexMemory();
        break;
      case 'checkSystemStatus':
        result = await checkSystemStatus();
        break;
      case 'viewAgentLogs':
        const { agentId, lines = 50 } = body;
        result = await viewAgentLogs(agentId, lines);
        break;
      case 'clearOldSessions':
        result = await clearOldSessions();
        break;
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

async function restartGateway(): Promise<{ success: boolean; message: string; output?: string }> {
  try {
    const output = execSync('openclaw gateway restart 2>&1', { 
      encoding: 'utf-8',
      timeout: 30000 
    });
    return { 
      success: true, 
      message: 'Gateway restarted successfully',
      output: output.trim()
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to restart gateway';
    return { success: false, message };
  }
}

async function reindexMemory(): Promise<{ success: boolean; message: string; output?: string }> {
  try {
    const output = execSync('openclaw qmd update 2>&1', { 
      encoding: 'utf-8',
      timeout: 60000 
    });
    return { 
      success: true, 
      message: 'Memory reindexed successfully',
      output: output.trim()
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reindex memory';
    return { success: false, message };
  }
}

async function checkSystemStatus(): Promise<{ success: boolean; message: string; output?: string }> {
  try {
    const output = execSync('openclaw status 2>&1', { 
      encoding: 'utf-8',
      timeout: 15000 
    });
    return { 
      success: true, 
      message: 'System status retrieved',
      output: output.trim()
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to check system status';
    return { success: false, message };
  }
}

async function viewAgentLogs(agentId?: string, lines: number = 50): Promise<{ success: boolean; message: string; output?: string }> {
  try {
    let command = `openclaw logs --limit ${lines} 2>&1`;
    
    if (agentId && agentId !== 'all') {
      command = `openclaw logs --agent ${agentId} --limit ${lines} 2>&1`;
    }
    
    const output = execSync(command, { 
      encoding: 'utf-8',
      timeout: 15000 
    });
    return { 
      success: true, 
      message: `Retrieved ${lines} lines of logs`,
      output: output.trim()
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve logs';
    return { success: false, message };
  }
}

async function clearOldSessions(): Promise<{ success: boolean; message: string; output?: string }> {
  try {
    const output = execSync('openclaw sessions prune --idle 2>&1', { 
      encoding: 'utf-8',
      timeout: 15000 
    });
    return { 
      success: true, 
      message: 'Old idle sessions cleared',
      output: output.trim()
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to clear old sessions';
    return { success: false, message };
  }
}