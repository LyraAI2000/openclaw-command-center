import { execSync } from 'child_process';
import { NextResponse } from 'next/server';

interface LogEntry {
  timestamp: string;
  source: string;
  message: string;
  severity: 'info' | 'warn' | 'error' | 'debug';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const source = searchParams.get('source') || null;

    // Get logs from OpenClaw
    const logsOutput = execSync(
      `openclaw logs --json --limit ${limit} 2>/dev/null || echo '[]'`,
      { 
        encoding: 'utf-8',
        timeout: 10000 
      }
    );

    let logs: LogEntry[] = [];
    
    try {
      // Parse JSON logs - each line is a JSON object
      const lines = logsOutput.trim().split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          
          // Map OpenClaw log format to our format
          const logEntry: LogEntry = {
            timestamp: entry.time || new Date().toISOString(),
            source: entry.agent || entry.session || entry.source || 'system',
            message: entry.msg || entry.message || JSON.stringify(entry),
            severity: mapSeverity(entry.level || entry.severity || 'info'),
          };
          
          // Filter by source if specified
          if (source && !logEntry.source.toLowerCase().includes(source.toLowerCase())) {
            continue;
          }
          
          logs.push(logEntry);
        } catch {
          // If JSON parsing fails, treat as plain text log line
          if (line.trim()) {
            logs.push({
              timestamp: new Date().toISOString(),
              source: 'system',
              message: line.trim(),
              severity: 'info',
            });
          }
        }
      }
    } catch {
      // Fallback: return empty logs
      logs = [];
    }

    // Sort by timestamp descending (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        logs: [] 
      },
      { status: 500 }
    );
  }
}

function mapSeverity(level: string): 'info' | 'warn' | 'error' | 'debug' {
  const lower = level.toLowerCase();
  if (lower.includes('error') || lower === 'fatal') return 'error';
  if (lower.includes('warn')) return 'warn';
  if (lower.includes('debug') || lower.includes('trace')) return 'debug';
  return 'info';
}
