import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logoutAction } from '../actions';
import { boardsConfig } from '../../lib/mockData';
import { KanbanBoard } from '../../components/features/KanbanBoard';
import { DashboardWorkspace } from '../../components/features/DashboardWorkspace';
import { DashboardShell } from '../../components/features/DashboardShell';

interface DashboardPageProps {
  searchParams: Promise<{ board?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session || !session.value) {
    redirect('/login');
  }

  const resolvedSearchParams = await searchParams;
  let activeBoardId = resolvedSearchParams.board || 'leads';
  if (activeBoardId === 'deals') activeBoardId = 'quotes';
  if (activeBoardId === 'installments') activeBoardId = 'retainers';
  const activeBoard = boardsConfig[activeBoardId] || boardsConfig.leads;
  const activeBoardName = activeBoard.name;

  const sidebarItems = [
    { id: 'dashboards', name: 'DASHBOARDS', desc: 'system_performance' },
    { id: 'leads', name: 'LEADS', desc: 'registry_leads' },
    { id: 'quotes', name: 'QUOTES', desc: 'registry_quotes' },
    { id: 'retainers', name: 'RETAINERS', desc: 'retainers_ledger' },
    { id: 'contacts', name: 'CONTACTS', desc: 'client_directory' },
    { id: 'tasks', name: 'TASKS', desc: 'workflow_tasks' },
  ];

  return (
    <DashboardShell
      activeBoardId={activeBoardId}
      sidebarItems={sidebarItems}
      logoutAction={logoutAction}
    >
      {activeBoardId === 'dashboards' ? (
        <DashboardWorkspace />
      ) : (
        <KanbanBoard
          boardName={activeBoardName}
          columns={activeBoard.columns}
          initialCards={[]}
        />
      )}
    </DashboardShell>
  );
}
