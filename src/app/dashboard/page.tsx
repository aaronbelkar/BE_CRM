import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logoutAction } from '../actions';
import { boardsConfig } from '../../lib/mockData';
import { KanbanBoard } from '../../components/features/KanbanBoard';

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
  const activeBoardId = resolvedSearchParams.board || 'leads';
  const activeBoard = boardsConfig[activeBoardId] || boardsConfig.leads;
  const activeBoardName = activeBoardId.charAt(0).toUpperCase() + activeBoardId.slice(1);

  const sidebarItems = [
    { id: 'leads', name: 'Leads', desc: 'registry_leads' },
    { id: 'deals', name: 'Deals', desc: 'registry_deals' },
    { id: 'installments', name: 'Installments', desc: 'financial_ledger' },
    { id: 'tasks', name: 'Tasks', desc: 'workflow_tasks' },
  ];

  return (
    <div className="flex h-screen bg-[#1a1a1b] text-white font-sans overflow-hidden">
      {/* Sidebar Panel */}
      <aside className="w-64 bg-[#25292d] border-r border-zinc-800 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-lg font-bold tracking-tight text-white uppercase font-mono">Sovereign CRM</h1>
          <p className="text-[10px] text-zinc-500 font-mono mt-1">operator_terminal_v1.0</p>
        </div>
        
        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2 px-2">Workspaces</span>
          {sidebarItems.map((item) => {
            const isActive = activeBoardId === item.id;
            return (
              <Link
                key={item.id}
                href={`/dashboard?board=${item.id}`}
                className={`flex flex-col px-3 py-2 rounded transition-colors ${
                  isActive
                    ? 'bg-[#e67e22] text-white'
                    : 'text-[#e5e7e9] hover:bg-[#1a1a1b]'
                }`}
              >
                <span className="text-sm font-semibold tracking-tight">{item.name}</span>
                <span className={`text-[10px] font-mono mt-0.5 ${isActive ? 'text-orange-100' : 'text-zinc-500'}`}>
                  {item.desc}
                </span>
              </Link>
            );
          })}
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#1e2225]">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded font-mono transition-colors uppercase tracking-wider border border-zinc-700 cursor-pointer"
            >
              Terminate Session
            </button>
          </form>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Workspace Header */}
        <header className="flex justify-between items-center px-8 py-4 border-b border-zinc-800 bg-[#1e2225]/40">
          <div>
            <h2 className="text-sm font-mono text-zinc-400">workspace_status: online</h2>
            <p className="text-xs text-[#e5e7e9] font-mono mt-0.5">operator_session: active</p>
          </div>
          <div className="flex gap-4">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-zinc-800 text-emerald-400 border border-emerald-500/20">
              SYS_ONLINE
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-zinc-800 text-amber-400 border border-amber-500/20">
              AGENT_CONNECTED
            </span>
          </div>
        </header>

        {/* Workspace Kanban Panel */}
        <div className="flex-1 overflow-y-auto p-8">
          <KanbanBoard
            boardName={activeBoardName}
            columns={activeBoard.columns}
            initialCards={activeBoard.cards}
          />
        </div>
      </main>
    </div>
  );
}
