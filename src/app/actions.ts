'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../db';
import { cards as cardsTable, subTasks as subTasksTable, orgMembers as orgMembersTable, activityLogs as activityLogsTable, users as usersTable } from '../db/schema';
import { eq, and, or } from 'drizzle-orm';
import { boardsConfig } from '../lib/mockData';

export type ActionState = {
  success: boolean;
  error?: string;
};

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  return session ? session.value : null;
}


async function upsertAdminUser() {
  try {
    await db
      .insert(usersTable)
      .values({
        id: 'admin-user',
        name: 'admin',
        email: 'admin@sovereign.io',
        password: '!Qaz@Wsx',
        role: 'Admin',
        avatar: 'silhouette',
        approved: true,
      })
      .onDuplicateKeyUpdate({
        set: {
          name: 'admin',
          email: 'admin@sovereign.io',
          password: '!Qaz@Wsx',
          role: 'Admin',
          approved: true,
        },
      });
  } catch (e) {
    console.error('Failed to upsert admin user:', e);
  }
}

export async function loginAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const usernameOrEmail = formData.get('username') as string;
  const password = formData.get('password') as string;
  const remember = formData.get('remember') === 'on';

  await upsertAdminUser();

  // 2. Database users check (accepts email or username matches)
  try {
    const matched = await db
      .select()
      .from(usersTable)
      .where(
        and(
          or(
            eq(usersTable.email, usernameOrEmail),
            eq(usersTable.name, usernameOrEmail)
          ),
          eq(usersTable.password, password)
        )
      )
      .limit(1);

    if (matched.length > 0) {
      const user = matched[0];
      if (!user.approved) {
        return { success: false, error: 'Your account is pending admin approval.' };
      }

      const cookieStore = await cookies();
      cookieStore.set('session', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
      });

      if (remember) {
        cookieStore.set('remember_email', usernameOrEmail, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      } else {
        cookieStore.delete('remember_email');
      }
      redirect('/dashboard');
    }
  } catch (e) {
    // If it's a redirect error, let it propagate
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') {
      throw e;
    }
    console.error('Database login error:', e);
    return { success: false, error: 'Database authentication failed' };
  }

  return { success: false, error: 'Invalid username/email or password' };
}

export async function registerAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { success: false, error: 'All fields are required' };
  }

  try {
    // Check if email already registered
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: 'Email is already registered' };
    }

    // Insert new operator
    const userId = `u${Date.now()}`;
    await db.insert(usersTable).values({
      id: userId,
      name,
      email,
      password,
      role: 'Lead Operator',
      avatar: 'silhouette',
      approved: false, // Must be approved by admin
    });

    return { success: true };
  } catch (e) {
    console.error('Registration failed:', e);
    return { success: false, error: 'Failed to create user. Try again.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/');
}

// User Admin Approval Actions
export async function getPendingUsersAction() {
  const adminId = await getCurrentUserId();
  if (!adminId) return [];
  const currentUser = await db.select().from(usersTable).where(eq(usersTable.id, adminId)).limit(1);
  if (currentUser.length === 0 || currentUser[0].role !== 'Admin') {
    return [];
  }
  return db.select().from(usersTable).where(eq(usersTable.approved, false));
}

export async function approveUserAction(userId: string) {
  const adminId = await getCurrentUserId();
  if (!adminId) return { success: false, error: 'Unauthorized' };
  const currentUser = await db.select().from(usersTable).where(eq(usersTable.id, adminId)).limit(1);
  if (currentUser.length === 0 || currentUser[0].role !== 'Admin') {
    return { success: false, error: 'Unauthorized' };
  }
  await db.update(usersTable).set({ approved: true }).where(eq(usersTable.id, userId));
  return { success: true };
}

export async function rejectUserAction(userId: string) {
  const adminId = await getCurrentUserId();
  if (!adminId) return { success: false, error: 'Unauthorized' };
  const currentUser = await db.select().from(usersTable).where(eq(usersTable.id, adminId)).limit(1);
  if (currentUser.length === 0 || currentUser[0].role !== 'Admin') {
    return { success: false, error: 'Unauthorized' };
  }
  await db.delete(usersTable).where(eq(usersTable.id, userId));
  return { success: true };
}

// Cards Actions
export async function getCardsAction(boardName: string) {
  const lowercaseBoard = boardName.toLowerCase();
  
  // Try to load cards
  let results = await db.select().from(cardsTable).where(eq(cardsTable.board, lowercaseBoard));
  
  // Seeding check
  if (results.length === 0) {
    const defaultCards = boardsConfig[lowercaseBoard]?.cards || [];
    if (defaultCards.length > 0) {
      for (const card of defaultCards) {
        await db.insert(cardsTable).values({
          id: card.id,
          board: lowercaseBoard,
          title: card.title,
          subtitle: card.subtitle || '',
          status: card.status,
          contactName: card.contactName || '',
          email: card.email || '',
          value: card.value || '',
          phone: card.phone || '',
          pricingMethod: card.pricingMethod || 'Fixed Price',
          totalRate: card.totalRate || '',
          startDate: card.startDate || '',
          quoteDescription: card.quoteDescription || '',
          details: card.details || '',
          description: card.description || '',
          amount: card.amount || '',
          dueDate: card.dueDate || '',
          priority: card.priority || 'Medium',
          assignee: card.assignee || 'Operator',
          monthlyFee: card.monthlyFee || '',
          endDate: card.endDate || '',
        });
        
        if (card.subTasks && card.subTasks.length > 0) {
          for (const sub of card.subTasks) {
            await db.insert(subTasksTable).values({
              id: sub.id,
              cardId: card.id,
              description: sub.description,
              details: sub.details || '',
              owner: sub.owner || '',
              startDate: sub.startDate || '',
              dueDate: sub.dueDate || '',
              completed: sub.completed || false,
            });
          }
        }
      }
      results = await db.select().from(cardsTable).where(eq(cardsTable.board, lowercaseBoard));
    }
  }

  // Fetch sub-tasks for these cards
  const cardsWithSubs = [];
  for (const c of results) {
    const subs = await db.select().from(subTasksTable).where(eq(subTasksTable.cardId, c.id));
    cardsWithSubs.push({
      id: c.id,
      board: c.board,
      title: c.title,
      status: c.status,
      subtitle: c.subtitle ?? undefined,
      contactName: c.contactName ?? undefined,
      email: c.email ?? undefined,
      value: c.value ?? undefined,
      phone: c.phone ?? undefined,
      pricingMethod: c.pricingMethod ?? undefined,
      totalRate: c.totalRate ?? undefined,
      startDate: c.startDate ?? undefined,
      quoteDescription: c.quoteDescription ?? undefined,
      details: c.details ?? undefined,
      description: c.description ?? undefined,
      amount: c.amount ?? undefined,
      dueDate: c.dueDate ?? undefined,
      priority: c.priority ?? undefined,
      assignee: c.assignee ?? undefined,
      monthlyFee: c.monthlyFee ?? undefined,
      endDate: c.endDate ?? undefined,
      subTasks: subs.map(s => ({
        id: s.id,
        description: s.description,
        details: s.details ?? undefined,
        owner: s.owner ?? undefined,
        startDate: s.startDate ?? undefined,
        dueDate: s.dueDate ?? undefined,
        completed: s.completed ?? false,
      })),
    });
  }

  return cardsWithSubs;
}

export async function saveCardAction(card: any, boardName: string) {
  const lowercaseBoard = boardName.toLowerCase();
  
  try {
    // Upsert Card
    const existing = await db.select().from(cardsTable).where(eq(cardsTable.id, card.id)).limit(1);
    if (existing.length > 0) {
      await db.update(cardsTable).set({
        title: card.title,
        status: card.status,
        subtitle: card.subtitle || '',
        contactName: card.contactName || '',
        email: card.email || '',
        value: card.value || '',
        phone: card.phone || '',
        pricingMethod: card.pricingMethod || 'Fixed Price',
        totalRate: card.totalRate || '',
        startDate: card.startDate || '',
        quoteDescription: card.quoteDescription || '',
        details: card.details || '',
        description: card.description || '',
        amount: card.amount || '',
        dueDate: card.dueDate || '',
        priority: card.priority || 'Medium',
        assignee: card.assignee || 'Operator',
        monthlyFee: card.monthlyFee || '',
        endDate: card.endDate || '',
      }).where(eq(cardsTable.id, card.id));
    } else {
      await db.insert(cardsTable).values({
        id: card.id,
        board: lowercaseBoard,
        title: card.title,
        status: card.status,
        subtitle: card.subtitle || '',
        contactName: card.contactName || '',
        email: card.email || '',
        value: card.value || '',
        phone: card.phone || '',
        pricingMethod: card.pricingMethod || 'Fixed Price',
        totalRate: card.totalRate || '',
        startDate: card.startDate || '',
        quoteDescription: card.quoteDescription || '',
        details: card.details || '',
        description: card.description || '',
        amount: card.amount || '',
        dueDate: card.dueDate || '',
        priority: card.priority || 'Medium',
        assignee: card.assignee || 'Operator',
        monthlyFee: card.monthlyFee || '',
        endDate: card.endDate || '',
      });
    }

    // Delete existing subtasks
    await db.delete(subTasksTable).where(eq(subTasksTable.cardId, card.id));

    // Insert updated subtasks
    if (card.subTasks && card.subTasks.length > 0) {
      for (const sub of card.subTasks) {
        await db.insert(subTasksTable).values({
          id: sub.id,
          cardId: card.id,
          description: sub.description,
          details: sub.details || '',
          owner: sub.owner || '',
          startDate: sub.startDate || '',
          dueDate: sub.dueDate || '',
          completed: sub.completed ? true : false,
        });
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('[saveCardAction] MySQL error:', err);
    const errDetails = {
      message: err?.message,
      code: err?.code || err?.cause?.code,
      errno: err?.errno || err?.cause?.errno,
      sqlMessage: err?.sqlMessage || err?.cause?.sqlMessage,
      sqlState: err?.sqlState || err?.cause?.sqlState,
      cause: err?.cause ? {
        message: err.cause.message,
        code: err.cause.code,
        errno: err.cause.errno,
        sqlMessage: err.cause.sqlMessage,
      } : undefined,
      stack: err?.stack,
    };
    return { success: false, error: JSON.stringify(errDetails, null, 2) };
  }
}

export async function deleteCardAction(cardId: string) {
  await db.delete(subTasksTable).where(eq(subTasksTable.cardId, cardId));
  await db.delete(cardsTable).where(eq(cardsTable.id, cardId));
  return { success: true };
}

export async function winLeadAction(leadCardId: string, newQuoteCard: any) {
  // Update lead card status
  await db.update(cardsTable).set({
    status: 'Quote',
  }).where(eq(cardsTable.id, leadCardId));

  // Insert new quote card
  await db.insert(cardsTable).values({
    id: newQuoteCard.id,
    board: 'quotes',
    title: newQuoteCard.title,
    status: newQuoteCard.status,
    subtitle: newQuoteCard.subtitle || '',
    contactName: newQuoteCard.contactName || '',
    email: newQuoteCard.email || '',
    phone: newQuoteCard.phone || '',
    totalRate: newQuoteCard.totalRate || '',
    quoteDescription: newQuoteCard.quoteDescription || '',
    details: newQuoteCard.details || '',
    dueDate: newQuoteCard.dueDate || '',
    priority: 'Medium',
    assignee: 'Operator',
  });

  return { success: true };
}

// Org Chart Actions
export async function getOrgChartAction() {
  const members = await db.select().from(orgMembersTable);
  
  // Seed org chart if empty
  if (members.length === 0) {
    await db.insert(orgMembersTable).values([
      { id: '1', name: 'Agent Chuck', role: 'Security Agent' },
      { id: '2', name: 'Operator', role: 'System Operator' },
    ]);
    return {
      userRole: 'Lead Operator',
      members: await db.select().from(orgMembersTable),
    };
  }

  // Get user role from profile
  const userId = await getCurrentUserId() || 'admin-user';
  const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const userRole = user[0]?.role || 'Lead Operator';

  return {
    userRole,
    members,
  };
}

export async function saveOrgChartAction(orgObj: { userRole: string; members: any[] }) {
  // Update user role
  const userId = await getCurrentUserId() || 'admin-user';
  await db.update(usersTable).set({
    role: orgObj.userRole,
  }).where(eq(usersTable.id, userId));

  // Sync org chart members
  await db.delete(orgMembersTable);
  for (const m of orgObj.members) {
    await db.insert(orgMembersTable).values({
      id: m.id,
      name: m.name,
      role: m.role,
    });
  }

  return { success: true };
}

// Profile Actions
export async function getProfileAction() {
  const userId = await getCurrentUserId() || 'admin-user';
  const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (user.length === 0) {
    return {
      name: 'Operator',
      email: 'operator@sovereign.io',
      password: '••••••••',
      avatar: 'silhouette',
      role: 'Lead Operator',
    };
  }
  return {
    name: user[0].name,
    email: user[0].email,
    password: user[0].password,
    avatar: user[0].avatar || 'silhouette',
    role: user[0].role || 'Lead Operator',
  };
}

export async function saveProfileAction(profileObj: any) {
  const userId = await getCurrentUserId() || 'admin-user';
  const existing = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (existing.length > 0) {
    await db.update(usersTable).set({
      name: profileObj.name,
      email: profileObj.email,
      password: profileObj.password,
      avatar: profileObj.avatar,
    }).where(eq(usersTable.id, userId));
  } else {
    await db.insert(usersTable).values({
      id: userId,
      name: profileObj.name,
      email: profileObj.email,
      password: profileObj.password,
      role: 'Lead Operator',
      avatar: profileObj.avatar,
    });
  }

  return { success: true };
}

// Activity Logs Actions
export async function getActivityLogsAction() {
  const logs = await db.select().from(activityLogsTable).limit(50);
  if (logs.length === 0) {
    const initialLogs = [
      { id: '1', text: 'Acme Corp Lead won and converted to Quote', time: '10 mins ago', board: 'LEADS' },
      { id: '2', text: 'Stark Industries ticket updated status to Contacted', time: '1 hour ago', board: 'LEADS' },
      { id: '3', text: 'Initial deposit payout moved to In Progress', time: '2 hours ago', board: 'INSTALLMENTS' },
      { id: '4', text: 'Drizzle engine connection verified successfully', time: '1 day ago', board: 'TASKS' }
    ];
    for (const l of initialLogs) {
      await db.insert(activityLogsTable).values({
        id: l.id,
        text: l.text,
        time: l.time,
        board: l.board,
      });
    }
    return db.select().from(activityLogsTable).limit(50);
  }
  return logs;
}

export async function logActivityAction(text: string, boardName: string) {
  const id = Date.now().toString();
  await db.insert(activityLogsTable).values({
    id,
    text,
    time: 'Just now',
    board: boardName.toUpperCase(),
  });
  return { success: true };
}
