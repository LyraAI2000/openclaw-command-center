import { execSync } from 'child_process';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get OpenClaw status
    const statusOutput = execSync('openclaw status', { 
      encoding: 'utf-8',
      timeout: 15000 
    });

    const lines = statusOutput.split('\n');
    
    let version = 'unknown';
    let uptime = 'running';
    let status: 'running' | 'stopped' | 'error' = 'stopped';
    let sessions = 0;
    let memoryFiles = 0;
    let gatewayRunning = false;
    
    for (const line of lines) {
      // Parse version from Update line: "Update          │ pnpm · npm latest 2026.3.13"
      if (line.includes('Update') && line.includes('latest')) {
        const match = line.match(/(\d{4}\.\d+\.\d+)/);
        if (match) version = match[1];
      }
      
      // Check if gateway is running
      if (line.includes('Gateway service') && line.includes('running')) {
        gatewayRunning = true;
        status = 'running';
      }
      
      // Parse sessions count: "Agents          │ 2 · 2 bootstrap files present · sessions 321 · default main active just now"
      if (line.includes('sessions') && line.includes('Agents')) {
        const match = line.match(/sessions\s+(\d+)/);
        if (match) sessions = parseInt(match[1], 10);
      }
      
      // Parse memory files: "Memory          │ 66 files · 66 chunks · sources memory · plugin memory-core · vector ready"
      if (line.includes('Memory') && line.includes('files')) {
        const match = line.match(/(\d+)\s+files/);
        if (match) memoryFiles = parseInt(match[1], 10);
      }
    }

    // If gateway is running, we're good
    if (gatewayRunning) {
      status = 'running';
      uptime = 'active';
    }

    return NextResponse.json({
      status,
      version,
      uptime,
      sessions,
      memoryFiles,
      lastError: null,
      raw: statusOutput
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      version: 'unknown',
      uptime: 'unknown',
      sessions: 0,
      memoryFiles: 0,
      lastError: error instanceof Error ? error.message : 'Unknown error',
      raw: null
    }, { status: 500 });
  }
}
