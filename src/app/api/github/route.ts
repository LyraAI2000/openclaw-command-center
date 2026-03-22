import { NextResponse } from 'next/server';

interface GitHubRepo {
  id: number;
  name: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
}

interface GitHubEvent {
  type: string;
  created_at: string;
}

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME || 'LyraAI2000';

  if (!token) {
    return NextResponse.json(
      { error: 'GitHub token not configured' },
      { status: 500 }
    );
  }

  try {
    // Fetch user repos
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!reposResponse.ok) {
      throw new Error(`GitHub API error: ${reposResponse.status}`);
    }

    const repos: GitHubRepo[] = await reposResponse.json();

    // Fetch recent events for contribution data
    const eventsResponse = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=100`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    const events: GitHubEvent[] = eventsResponse.ok ? await eventsResponse.json() : [];

    // Calculate stats
    const repoCount = repos.length;
    
    // Count commits from push events in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCommits = events.filter(
      event => event.type === 'PushEvent' && new Date(event.created_at) > thirtyDaysAgo
    ).length;

    // Count open issues across all repos (would need separate API calls for this)
    // For now, estimate or use a simpler metric
    const openIssues = repos.reduce((sum, repo) => sum + (repo.stargazers_count > 0 ? 1 : 0), 0);

    // Generate contribution data for last 30 days
    const contributionData = Array(30).fill(0);
    events.forEach(event => {
      const eventDate = new Date(event.created_at);
      const daysAgo = Math.floor((Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo < 30) {
        contributionData[29 - daysAgo]++;
      }
    });

    // Get recent repos (top 5 by updated)
    const recentRepos = repos
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
      .map(repo => ({
        name: repo.name,
        lang: repo.language || 'Unknown',
        stars: repo.stargazers_count,
      }));

    return NextResponse.json({
      repoCount,
      recentCommits,
      openIssues,
      contributionData,
      recentRepos,
      username,
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch GitHub data',
        repoCount: 0,
        recentCommits: 0,
        openIssues: 0,
        contributionData: Array(30).fill(0),
        recentRepos: [],
      },
      { status: 500 }
    );
  }
}
