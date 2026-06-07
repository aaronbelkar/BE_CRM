/**
 * Sovereign CRM - API Auth Middleware
 * Validates the X-API-Key header against the configured secret.
 * Set AGENT_API_KEY in your .env.local to override the default.
 */
import { NextRequest, NextResponse } from 'next/server';

export const API_KEY = process.env.AGENT_API_KEY || 'crm-agent-secret-key';

export function requireApiKey(request: NextRequest): NextResponse | null {
  const provided = request.headers.get('x-api-key');
  if (!provided || provided !== API_KEY) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized — missing or invalid X-API-Key header.',
        hint: 'Set AGENT_API_KEY in .env.local and pass it as the X-API-Key header.',
      },
      { status: 401 }
    );
  }
  return null; // auth passed
}
