import { execSync } from 'child_process';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get OpenClaw status
    const statusOutput = execSync('openclaw status', { 
      encoding: 'utf-8',
      timeout: 10000 
    });

    // Parse the status output
    const lines = statusOutput.split('\n');
    
    let version = 'unknown';
    let uptime = 'unknown';
    let status: 'running' | 'stopped' | 'error' = 'stopped';
    
    for (const line of lines) {
      if (line.includes('OpenClaw')) {
        const match = line.match(/OpenClaw\s+([\d.]+)/);
        if (match) version = match[1];
      }
      if (line.includes('Uptime') || line.includes('up')) {
        uptime = line.trim();
      }
      if (line.includes('running') || line.includes('active')) {
        status = 'running';
      }
    }

    // If we got output, assume it's running
    if (statusOutput.length > 0) {
      status = 'running';
    }

    return NextResponse.json({
      status,
      version,
      uptime,
      lastError: null,
      raw: statusOutput
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      version: 'unknown',
      uptime: 'unknown',
      lastError: error instanceof Error ? error.message : 'Unknown error',
      raw: null
    }, { status: 500 });
  }
}
