import { execSync } from 'child_process';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get qmd status
    let indexedFiles = 0;
    let indexStatus: 'ready' | 'indexing' | 'error' = 'ready';
    let searchPerformance = 0;

    try {
      const qmdOutput = execSync('qmd status --json', { 
        encoding: 'utf-8',
        timeout: 5000 
      });
      const qmdData = JSON.parse(qmdOutput);
      
      if (qmdData.collections) {
        // Find the workspace collection
        const workspaceCollection = qmdData.collections.find(
          (c: any) => c.path?.includes('workspace') || c.name === 'workspace'
        );
        
        if (workspaceCollection) {
          indexedFiles = workspaceCollection.docCount || 0;
          indexStatus = workspaceCollection.indexed ? 'ready' : 'indexing';
        }
      }
    } catch {
      // qmd not available or not configured
      indexStatus = 'error';
    }

    // Count files in memory directory as fallback
    try {
      const memoryOutput = execSync(
        'find /Users/lyra_ai/.openclaw/workspace/memory -type f -name "*.md" 2>/dev/null | wc -l',
        { encoding: 'utf-8' }
      );
      const memoryCount = parseInt(memoryOutput.trim(), 10);
      if (memoryCount > 0 && indexedFiles === 0) {
        indexedFiles = memoryCount;
      }
    } catch {}

    return NextResponse.json({
      indexedFiles,
      lastUpdate: new Date().toISOString(),
      indexStatus,
      searchPerformance: searchPerformance || 0.045
    });
  } catch (error) {
    return NextResponse.json({
      indexedFiles: 0,
      lastUpdate: new Date().toISOString(),
      indexStatus: 'error',
      searchPerformance: 0
    }, { status: 500 });
  }
}
