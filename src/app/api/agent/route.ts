import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  const configuredApiKey = process.env.AGENT_API_KEY || 'chuck-secret-token';

  if (!apiKey || apiKey !== configuredApiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    status: 'success',
    message: 'Welcome Agent Chuck, Sovereign CRM API endpoint is operational.',
    timestamp: new Date().toISOString(),
  });
}
