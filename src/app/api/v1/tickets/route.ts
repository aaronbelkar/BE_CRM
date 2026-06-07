/**
 * GET  /api/v1/tickets          — list tickets (filter by ?board=leads)
 * POST /api/v1/tickets          — create a new ticket on a board
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '../_lib/auth';
import { db } from '../../../../db';
import { cards as cardsTable, subTasks as subTasksTable } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { boardsConfig } from '../../../../lib/mockData';

// ──────────────────────────────────────────────
// GET /api/v1/tickets
// Query params: ?board=leads  (optional — omit to get all tickets)
// ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const boardFilter = searchParams.get('board')?.toLowerCase();

  try {
    let rows;
    if (boardFilter) {
      rows = await db.select().from(cardsTable).where(eq(cardsTable.board, boardFilter));
    } else {
      rows = await db.select().from(cardsTable);
    }

    // Attach subtasks to each card
    const tickets = await Promise.all(
      rows.map(async (card) => {
        const subs = await db.select().from(subTasksTable).where(eq(subTasksTable.cardId, card.id));
        return {
          id: card.id,
          board: card.board,
          title: card.title,
          status: card.status,
          subtitle: card.subtitle ?? undefined,
          contactName: card.contactName ?? undefined,
          email: card.email ?? undefined,
          phone: card.phone ?? undefined,
          value: card.value ?? undefined,
          pricingMethod: card.pricingMethod ?? undefined,
          totalRate: card.totalRate ?? undefined,
          startDate: card.startDate ?? undefined,
          endDate: card.endDate ?? undefined,
          monthlyFee: card.monthlyFee ?? undefined,
          dueDate: card.dueDate ?? undefined,
          description: card.description ?? undefined,
          quoteDescription: card.quoteDescription ?? undefined,
          details: card.details ?? undefined,
          amount: card.amount ?? undefined,
          priority: card.priority ?? undefined,
          assignee: card.assignee ?? undefined,
          subTasks: subs.map((s) => ({
            id: s.id,
            description: s.description,
            completed: s.completed ?? false,
            owner: s.owner ?? undefined,
            startDate: s.startDate ?? undefined,
            dueDate: s.dueDate ?? undefined,
          })),
        };
      })
    );

    return NextResponse.json({ success: true, count: tickets.length, tickets });
  } catch (err) {
    console.error('[API] GET /tickets error:', err);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

// ──────────────────────────────────────────────
// POST /api/v1/tickets
// Body (JSON):
//   board*      : string  — one of: leads | quotes | retainers | contacts | tasks
//   title*      : string
//   status*     : string  — must be a valid column for the board
//   + any optional fields (contactName, email, phone, value, priority, etc.)
// ──────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { board, title, status, ...rest } = body as Record<string, string>;

  // Validate required fields
  if (!board || !title || !status) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields: board, title, status' },
      { status: 400 }
    );
  }

  const boardLower = board.toLowerCase();
  const boardCfg = boardsConfig[boardLower];
  if (!boardCfg) {
    return NextResponse.json(
      {
        success: false,
        error: `Unknown board "${board}". Valid boards: ${Object.keys(boardsConfig).join(', ')}`,
      },
      { status: 400 }
    );
  }

  if (!boardCfg.columns.includes(status)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid status "${status}" for board "${board}". Valid statuses: ${boardCfg.columns.join(', ')}`,
      },
      { status: 400 }
    );
  }

  const newId = `${boardLower[0]}${Date.now()}`;

  try {
    await db.insert(cardsTable).values({
      id: newId,
      board: boardLower,
      title,
      status,
      subtitle: (rest.subtitle as string) || '',
      contactName: (rest.contactName as string) || '',
      email: (rest.email as string) || '',
      phone: (rest.phone as string) || '',
      value: (rest.value as string) || '',
      pricingMethod: (rest.pricingMethod as string) || 'Fixed Price',
      totalRate: (rest.totalRate as string) || '',
      startDate: (rest.startDate as string) || '',
      endDate: (rest.endDate as string) || '',
      monthlyFee: (rest.monthlyFee as string) || '',
      quoteDescription: (rest.quoteDescription as string) || '',
      details: (rest.details as string) || '',
      description: (rest.description as string) || '',
      amount: (rest.amount as string) || '',
      dueDate: (rest.dueDate as string) || '',
      priority: (rest.priority as string) || 'Medium',
      assignee: (rest.assignee as string) || 'Operator',
    });

    const created = await db.select().from(cardsTable).where(eq(cardsTable.id, newId)).limit(1);

    return NextResponse.json({ success: true, ticket: created[0] }, { status: 201 });
  } catch (err) {
    console.error('[API] POST /tickets error:', err);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
