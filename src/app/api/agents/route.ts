import { execSync } from 'child_process';
import { NextResponse } from 'next/server';
import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'offline';
  currentTask: string;
  lastCheckIn: string;
  role: string;
}

export async function GET() {
  try {
    const agents: Agent[] = [];
    const agentsDir = '/Users/lyra_ai/.openclaw/workspace/agents';

    // Check if agents directory exists
    if (existsSync(agentsDir)) {
      const entries = readdirSync(agentsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const agentName = entry.name;
          const agentDir = join(agentsDir, agentName);
          const soulPath = join(agentDir, 'SOUL.md');
          const agentPath = join(agentDir, 'AGENT.md');
          
          let role = 'Agent';
          let currentTask = 'Idle';
          
          // Try to read role from SOUL.md or AGENT.md
          if (existsSync(soulPath)) {
            try {
              const soul = readFileSync(soulPath, 'utf-8');
              const roleMatch = soul.match(/Role:\s*(.+)/i);
              if (roleMatch) role = roleMatch[1].trim();
            } catch {}
          }
          
          if (existsSync(agentPath)) {
            try {
              const agentMd = readFileSync(agentPath, 'utf-8');
              const roleMatch = agentMd.match(/Role:\s*(.+)/i);
              if (roleMatch) role = roleMatch[1].trim();
            } catch {}
          }
          
          // Check if agent has active sessions
          let status: 'active' | 'idle' | 'offline' = 'idle';
          try {
            const sessionsOutput = execSync(
              `openclaw sessions list 2>/dev/null | grep -i "${agentName}" || true`,
              { encoding: 'utf-8', timeout: 5000 }
            );
            if (sessionsOutput.trim()) {
              status = 'active';
              currentTask = 'Running';
            }
          } catch {}
          
          agents.push({
            id: agentName,
            name: agentName.charAt(0).toUpperCase() + agentName.slice(1),
            status,
            currentTask,
            lastCheckIn: new Date().toISOString(),
            role
          });
        }
      }
    }

    // Always include the main agent (Lyra)
    agents.unshift({
      id: 'lyra',
      name: 'Lyra',
      status: 'active',
      currentTask: 'Command Center Operations',
      lastCheckIn: new Date().toISOString(),
      role: 'Digital Chief of Staff'
    });

    return NextResponse.json({ agents });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error', agents: [] },
      { status: 500 }
    );
  }
}
