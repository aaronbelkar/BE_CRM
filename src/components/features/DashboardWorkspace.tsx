'use client';

import { useState, useEffect } from 'react';
import { KanbanCard } from '../../lib/mockData';

export function DashboardWorkspace() {
  const [yearFilter, setYearFilter] = useState<string>('2026');
  const [quarterFilter, setQuarterFilter] = useState<string>('ALL');

  const [leads, setLeads] = useState<KanbanCard[]>([]);
  const [quotes, setQuotes] = useState<KanbanCard[]>([]);
  const [retainers, setRetainers] = useState<KanbanCard[]>([]);
  const [tasks, setTasks] = useState<KanbanCard[]>([]);
  const [teamMembers, setTeamMembers] = useState<{ name: string; role: string }[]>([]);
  const [logs, setLogs] = useState<{ id: string; text: string; time: string; board: string }[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { getCardsAction, getOrgChartAction, getActivityLogsAction } = await import('../../app/actions');
        
        const dbLeads = await getCardsAction('leads');
        const dbQuotes = await getCardsAction('quotes');
        const dbRetainers = await getCardsAction('retainers');
        const dbTasks = await getCardsAction('tasks');
        const dbOrg = await getOrgChartAction();
        const dbLogs = await getActivityLogsAction();

        setLeads(dbLeads);
        setQuotes(dbQuotes);
        setRetainers(dbRetainers);
        setTasks(dbTasks);
        setTeamMembers(dbOrg.members);
        setLogs(dbLogs);
      } catch (e) {
        console.error('Failed to load database dashboard metrics:', e);
      }
    }
    loadDashboard();
  }, []);

  // Helpers to clean pricing/amounts to numbers
  const parseValue = (valStr: string | undefined): number => {
    if (!valStr) return 0;
    const clean = valStr.replace(/[$,]/g, '').trim();
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  // Helper to determine if a date falls inside selected year + quarter
  const matchesFilter = (dateStr: string | undefined): boolean => {
    if (!dateStr) return true; // Undated items count globally or default
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return true;

    const y = dateObj.getFullYear().toString();
    if (y !== yearFilter) return false;

    if (quarterFilter === 'ALL') return true;

    const m = dateObj.getMonth(); // 0-11
    if (quarterFilter === 'Q1' && m >= 0 && m <= 2) return true;
    if (quarterFilter === 'Q2' && m >= 3 && m <= 5) return true;
    if (quarterFilter === 'Q3' && m >= 6 && m <= 8) return true;
    if (quarterFilter === 'Q4' && m >= 9 && m <= 11) return true;

    return false;
  };

  // 1. Leads Status aggregation
  const leadsFiltered = leads.filter(l => matchesFilter(l.dueDate || '2026-01-01'));
  const statusCounts = {
    New: leadsFiltered.filter(l => l.status === 'New').length,
    Contacted: leadsFiltered.filter(l => l.status === 'Contacted').length,
    Quote: leadsFiltered.filter(l => l.status === 'Quote').length,
    Lost: leadsFiltered.filter(l => l.status === 'Lost').length
  };
  const maxLeadsCount = Math.max(...Object.values(statusCounts), 1);

  // 2. Quote and Invoice Revenue Metrics
  const quotesFiltered = quotes.filter(q => matchesFilter(q.dueDate || q.startDate || '2026-01-01'));
  const totalQuoted = quotesFiltered.reduce((sum, q) => sum + parseValue(q.totalRate), 0);

  const retainersFiltered = retainers.filter(r => matchesFilter(r.endDate || r.startDate || '2026-01-01'));
  const totalInvoiced = retainersFiltered
    .filter(r => r.status.toLowerCase() === 'in progress' || r.status.toLowerCase() === 'inprogress' || r.status.toLowerCase() === 'expired')
    .reduce((sum, r) => sum + parseValue(r.value), 0);

  // 3. Employee Task Stats
  const getEmployeeStats = (empName: string) => {
    const assignedTasks = tasks.filter(t => t.assignee === empName && t.status !== 'Done');
    
    // Completed in last 30 days
    const completedTasks = tasks.filter(t => {
      if (t.assignee !== empName || t.status !== 'Done') return false;
      if (!t.dueDate) return true; // assume yes if date missing
      
      const due = new Date(t.dueDate);
      const today = new Date();
      const diffTime = today.getTime() - due.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    });

    return {
      assigned: assignedTasks.length,
      completed30: completedTasks.length
    };
  };

  return (
    <div className="flex flex-col flex-1 h-full text-text-main">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-main font-serif">
            BOARD.DASHBOARDS_WORKSPACE
          </h2>
          <p className="text-xs text-text-muted font-mono mt-1">performance_analytic_overview</p>
        </div>

        {/* Global Filters */}
        <div className="flex gap-2 items-center bg-surface border border-border-color p-1.5 rounded-full text-xs font-mono">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-transparent border-0 text-text-main focus:outline-none px-2 cursor-pointer uppercase font-bold text-[10px]"
          >
            <option value="2026" className="bg-surface">2026</option>
            <option value="2025" className="bg-surface">2025</option>
          </select>
          <div className="w-[1px] h-4 bg-border-color" />
          <select
            value={quarterFilter}
            onChange={(e) => setQuarterFilter(e.target.value)}
            className="bg-transparent border-0 text-text-main focus:outline-none px-2 cursor-pointer uppercase font-bold text-[10px]"
          >
            <option value="ALL" className="bg-surface">ALL QUARTERS</option>
            <option value="Q1" className="bg-surface">Q1 (JAN-MAR)</option>
            <option value="Q2" className="bg-surface">Q2 (APR-JUN)</option>
            <option value="Q3" className="bg-surface">Q3 (JUL-SEP)</option>
            <option value="Q4" className="bg-surface">Q4 (OCT-DEC)</option>
          </select>
        </div>
      </div>

      {/* Main Dashboard Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Metric Card 1: Total Quoted */}
        <div className="bg-surface border border-border-color p-6 rounded-3xl space-y-2">
          <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider">
            TOTAL_QUOTED_VAL
          </span>
          <h3 className="text-3xl font-bold font-serif text-[#e67e22]">
            ${totalQuoted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] font-mono text-text-muted uppercase">
            active_bids: {quotesFiltered.length} offers
          </p>
        </div>

        {/* Metric Card 2: Total Invoiced / Revenue */}
        <div className="bg-surface border border-border-color p-6 rounded-3xl space-y-2">
          <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider">
            REVENUE_COLLECTED (INVOICED)
          </span>
          <h3 className="text-3xl font-bold font-serif text-emerald-500">
            ${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] font-mono text-text-muted uppercase">
            active_retainers: {retainersFiltered.filter(r => r.status.toLowerCase() === 'in progress' || r.status.toLowerCase() === 'inprogress').length} contracts
          </p>
        </div>

        {/* Metric Card 3: Lead Conversion Rate */}
        <div className="bg-surface border border-border-color p-6 rounded-3xl space-y-2">
          <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider">
            LEAD_CONVERSION_RATIO
          </span>
          <h3 className="text-3xl font-bold font-serif text-sky-400">
            {leadsFiltered.length > 0 
              ? `${Math.round((statusCounts.Quote / leadsFiltered.length) * 100)}%` 
              : '0%'}
          </h3>
          <p className="text-[10px] font-mono text-text-muted uppercase">
            leads_converted: {statusCounts.Quote} of {leadsFiltered.length} leads
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Leads Chart and Org Stats */}
        <div className="space-y-6">
          {/* Leads Per Status Bar Chart */}
          <div className="bg-surface border border-border-color p-6 rounded-3xl">
            <h3 className="text-sm font-bold font-serif text-text-main pb-2 border-b border-border-color mb-4 uppercase">
              Leads count per Status
            </h3>
            
            <div className="space-y-4">
              {Object.entries(statusCounts).map(([status, count]) => {
                const percentage = Math.round((count / maxLeadsCount) * 100);
                const color = 
                  status === 'New' 
                    ? 'bg-blue-500' 
                    : status === 'Contacted' 
                      ? 'bg-amber-500' 
                      : status === 'Quote' 
                        ? 'bg-emerald-500' 
                        : 'bg-zinc-500';

                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold uppercase">{status}</span>
                      <span className="text-text-muted">{count} leads ({leadsFiltered.length > 0 ? Math.round((count / leadsFiltered.length) * 100) : 0}%)</span>
                    </div>
                    <div className="h-3 w-full bg-background rounded-full overflow-hidden border border-border-color">
                      <div 
                        className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Org Chart Performance Matrix */}
          <div className="bg-surface border border-border-color p-6 rounded-3xl">
            <h3 className="text-sm font-bold font-serif text-text-main pb-2 border-b border-border-color mb-4 uppercase">
              Team Member Workloads
            </h3>
            
            <div className="border border-border-color rounded-2xl overflow-hidden bg-background">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-surface border-b border-border-color font-mono text-[9px] text-text-muted uppercase">
                    <th className="p-3">Employee</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-center">Active Assigned Tasks</th>
                    <th className="p-3 text-center">Completed (Last 30 Days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/40">
                  {teamMembers.map((emp) => {
                    const stats = getEmployeeStats(emp.name);
                    return (
                      <tr key={emp.name} className="hover:bg-surface/50 transition-colors">
                        <td className="p-3 font-semibold text-text-main">{emp.name}</td>
                        <td className="p-3 font-mono text-text-muted uppercase text-[10px]">{emp.role}</td>
                        <td className="p-3 text-center font-bold text-[#e67e22]">{stats.assigned}</td>
                        <td className="p-3 text-center font-bold text-emerald-500">{stats.completed30}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Activity log */}
        <div className="bg-surface border border-border-color p-6 rounded-3xl flex flex-col h-full">
          <h3 className="text-sm font-bold font-serif text-text-main pb-2 border-b border-border-color mb-4 uppercase">
            Recent System Activity Log
          </h3>
          
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[420px] pr-2">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start justify-between p-3.5 bg-background border border-border-color rounded-2xl gap-3 text-xs"
              >
                <div className="space-y-1">
                  <p className="text-text-main leading-relaxed font-sans">{log.text}</p>
                  <span className="inline-block px-2 py-0.5 rounded bg-surface border border-border-color text-[9px] font-mono text-text-muted uppercase">
                    {log.board}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted flex-shrink-0">
                  {log.time}
                </span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center py-12 text-xs font-mono text-text-muted/40 uppercase">
                no_activities_logged
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
