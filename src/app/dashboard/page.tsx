import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logoutAction } from '../actions';
import { boardsConfig } from '../../lib/mockData';
import { KanbanBoard } from '../../components/features/KanbanBoard';
import { ThemeToggle } from '../../components/features/ThemeToggle';
import { UserAvatar } from '../../components/features/UserAvatar';
import { DashboardWorkspace } from '../../components/features/DashboardWorkspace';

interface DashboardPageProps {
  searchParams: Promise<{ board?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session || session.value !== 'authenticated') {
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
    <div className="flex h-screen bg-background text-text-main font-sans overflow-hidden transition-colors duration-200">
      {/* Sidebar Panel */}
      <aside className="w-64 bg-surface border-r border-border-color flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-border-color space-y-4">
          {/* Dynamic Logo */}
          <div className="relative w-40 h-10">
            <img
              src="/assets/site logo light theme.png"
              alt="Sovereign CRM Logo"
              className="h-full object-contain block dark:hidden"
            />
            <img
              src="/assets/site logo dark theme.png"
              alt="Sovereign CRM Logo"
              className="h-full object-contain hidden dark:block"
            />
          </div>
          <p className="text-[10px] text-text-muted font-mono">operator_terminal_v1.0</p>
        </div>
        
        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2 px-2">Workspaces</span>
          {sidebarItems.map((item) => {
            const isActive = activeBoardId === item.id;
            return (
              <Link
                key={item.id}
                href={`/dashboard?board=${item.id}`}
                className={`flex flex-col px-4 py-2 rounded-full transition-colors ${
                  isActive
                    ? 'bg-[#e67e22] text-white'
                    : 'text-text-main hover:bg-background'
                }`}
              >
                <span className="text-sm font-semibold tracking-tight">{item.name}</span>
                <span className={`text-[10px] font-mono mt-0.5 ${isActive ? 'text-orange-100' : 'text-text-muted'}`}>
                  {item.desc}
                </span>
              </Link>
            );
          })}
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border-color bg-surface">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full py-2.5 bg-background dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-text-main text-xs font-semibold rounded-full font-mono transition-colors uppercase tracking-wider border border-border-color cursor-pointer"
            >
              Terminate Session
            </button>
          </form>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Workspace Header */}
        <header className="flex justify-between items-center px-8 py-4 border-b border-border-color bg-surface/50">
          <div>
            <h2 className="text-sm font-mono text-text-muted">workspace_status: online</h2>
            <p className="text-xs text-text-main font-mono mt-0.5">operator_session: active</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-mono bg-zinc-200 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              SYS_ONLINE
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-mono bg-zinc-200 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              AGENT_CONNECTED
            </span>
            <ThemeToggle />
            <UserAvatar />
          </div>
        </header>

        {/* Workspace Kanban Panel */}
        <div className="flex-1 overflow-y-auto p-8 bg-background">
          {activeBoardId === 'dashboards' ? (
            <DashboardWorkspace />
          ) : (
            <KanbanBoard
              boardName={activeBoardName}
              columns={activeBoard.columns}
              initialCards={activeBoard.cards}
            />
          )}
        </div>
      </main>
    </div>
  );
}
