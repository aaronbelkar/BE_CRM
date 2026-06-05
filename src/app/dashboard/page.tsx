export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#1a1a1b] text-white p-6 font-sans">
      <header className="flex justify-between items-center pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Sovereign CRM & Kanban Hub</h1>
          <p className="text-xs text-[#e5e7e9] mt-1 font-mono">operator_session: active</p>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <section className="bg-[#25292d] p-6 rounded-lg border border-zinc-800">
          <h2 className="text-lg font-semibold mb-4 text-[#e67e22] tracking-tight font-mono">CRM.leads_registry</h2>
          <div className="space-y-2 text-sm font-mono text-zinc-400">
            <p>[SYSTEM]: leads registry mounted.</p>
            <p>Toggle CRM List and Kanban board.</p>
          </div>
        </section>
        
        <section className="bg-[#25292d] p-6 rounded-lg border border-zinc-800">
          <h2 className="text-lg font-semibold mb-4 text-[#e67e22] tracking-tight font-mono">Kanban.tasks_workflow</h2>
          <div className="space-y-2 text-sm font-mono text-zinc-400">
            <p>[SYSTEM]: tasks workflow mounted.</p>
            <p>Strict transitions: BACKLOG -&gt; ASSIGNED -&gt; IN_PROGRESS -&gt; REVIEW -&gt; DONE</p>
          </div>
        </section>
      </div>
    </main>
  );
}
