/**
 * GET /api/v1/boards
 * Returns all available boards, their display names, and valid status columns.
 * No request body required.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '../_lib/auth';
import { boardsConfig } from '../../../../lib/mockData';

export async function GET(request: NextRequest) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const boards = Object.entries(boardsConfig).map(([id, cfg]) => ({
    id,
    name: cfg.name,
    statuses: cfg.columns,
  }));

  return NextResponse.json({ success: true, boards });
}
