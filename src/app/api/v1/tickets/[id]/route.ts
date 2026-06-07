/**
 * GET    /api/v1/tickets/[id]   — get a single ticket by ID
 * PATCH  /api/v1/tickets/[id]   — update any field(s) including status
 * DELETE /api/v1/tickets/[id]   — delete a ticket (and its subtasks)
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '../../_lib/auth';
import { db } from '../../../../../db';
import { cards as cardsTable, subTasks as subTasksTable } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { boardsConfig } from '../../../../../lib/mockData';

// Helper — fetch one card with its subtasks
async function fetchTicketById(id: string) {
  const rows = await db.select().from(cardsTable).where(eq(cardsTable.id, id)).limit(1);
  if (rows.length === 0) return null;
  const card = rows[0];
  const subs = await db.select().from(subTasksTable).where(eq(subTasksTable.cardId, id));
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
}

// ──────────────────────────────────────────────
// GET /api/v1/tickets/[id]
// ──────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const ticket = await fetchTicketById(id);
    if (!ticket) {
      return NextResponse.json({ success: false, error: `Ticket "${id}" not found` }, { status: 404 });
    }
    return NextResponse.json({ success: true, ticket });
  } catch (err) {
    console.error('[API] GET /tickets/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

// ──────────────────────────────────────────────
// PATCH /api/v1/tickets/[id]
// Partially update a ticket. All body fields are optional.
// Updatable fields:
//   title, status, subtitle, contactName, email, phone, value,
//   pricingMethod, totalRate, startDate, endDate, monthlyFee,
//   dueDate, description, quoteDescription, details, amount,
//   priority, assignee
// ──────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const { id } = await params;

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    // Fetch existing card first
    const existingRows = await db.select().from(cardsTable).where(eq(cardsTable.id, id)).limit(1);
    if (existingRows.length === 0) {
      return NextResponse.json({ success: false, error: `Ticket "${id}" not found` }, { status: 404 });
    }
    const existing = existingRows[0];

    // Validate status change if provided
    if (body.status) {
      const boardCfg = boardsConfig[existing.board];
      if (boardCfg && !boardCfg.columns.includes(body.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status "${body.status}" for board "${existing.board}". Valid: ${boardCfg.columns.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // Build update payload — only include keys provided in body
    const updatePayload: Record<string, string> = {};
    const allowedFields = [
      'title', 'status', 'subtitle', 'contactName', 'email', 'phone',
      'value', 'pricingMethod', 'totalRate', 'startDate', 'endDate',
      'monthlyFee', 'dueDate', 'description', 'quoteDescription',
      'details', 'amount', 'priority', 'assignee',
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updatePayload[field] = body[field];
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields provided to update.' },
        { status: 400 }
      );
    }

    await db.update(cardsTable).set(updatePayload).where(eq(cardsTable.id, id));

    const updated = await fetchTicketById(id);
    return NextResponse.json({ success: true, ticket: updated });
  } catch (err) {
    console.error('[API] PATCH /tickets/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

// ──────────────────────────────────────────────
// DELETE /api/v1/tickets/[id]
// Permanently removes the ticket and all its subtasks.
// ──────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const existingRows = await db.select().from(cardsTable).where(eq(cardsTable.id, id)).limit(1);
    if (existingRows.length === 0) {
      return NextResponse.json({ success: false, error: `Ticket "${id}" not found` }, { status: 404 });
    }

    await db.delete(subTasksTable).where(eq(subTasksTable.cardId, id));
    await db.delete(cardsTable).where(eq(cardsTable.id, id));

    return NextResponse.json({ success: true, message: `Ticket "${id}" deleted successfully.` });
  } catch (err) {
    console.error('[API] DELETE /tickets/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
