export interface KanbanCard {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
  // Leads fields
  contactName?: string;
  email?: string;
  value?: string;
  // Deals fields
  description?: string;
  // Installments fields
  amount?: string;
  dueDate?: string;
  // Tasks fields
  priority?: string;
  assignee?: string;
}

export interface BoardConfig {
  id: string;
  name: string;
  columns: string[];
  cards: KanbanCard[];
}

export const boardsConfig: Record<string, Omit<BoardConfig, 'id'>> = {
  leads: {
    name: 'Leads',
    columns: ['New', 'Contacted', 'Quote', 'Won', 'Lost'],
    cards: [
      { id: 'l1', title: 'Acme Corp', subtitle: 'Contact: John Doe', status: 'New', contactName: 'John Doe', email: 'john@acme.com', value: '$10,000' },
      { id: 'l2', title: 'Stark Industries', subtitle: 'Contact: Pepper Potts', status: 'Contacted', contactName: 'Pepper Potts', email: 'pepper@stark.com', value: '$250,000' },
      { id: 'l3', title: 'Wayne Enterprises', subtitle: 'Contact: Bruce Wayne', status: 'Quote', contactName: 'Bruce Wayne', email: 'bruce@wayne.co', value: '$1,000,000' },
      { id: 'l4', title: 'Cyberdyne Systems', subtitle: 'Contact: Miles Dyson', status: 'Won', contactName: 'Miles Dyson', email: 'dyson@cyberdyne.com', value: '$75,000' },
      { id: 'l5', title: 'Oscorp Industries', subtitle: 'Contact: Norman Osborn', status: 'Lost', contactName: 'Norman Osborn', email: 'norman@oscorp.com', value: '$50,000' },
    ],
  },
  deals: {
    name: 'Deals',
    columns: ['New', 'Inprogress', 'Deployed', 'Collected'],
    cards: [
      { id: 'd1', title: 'Project Sentinel', subtitle: 'Value: $120,000', status: 'New', value: '$120,000', description: 'Sentinel hardware setup deployment' },
      { id: 'd2', title: 'Genesis Expansion', subtitle: 'Value: $85,000', status: 'Inprogress', value: '$85,000', description: 'Core software upgrades phase 2' },
      { id: 'd3', title: 'OmniNet Integration', subtitle: 'Value: $250,000', status: 'Deployed', value: '$250,000', description: 'Integration of regional security hubs' },
      { id: 'd4', title: 'Skynet Terminal', subtitle: 'Value: $480,000', status: 'Collected', value: '$480,000', description: 'Global grid deployment contract' },
    ],
  },
  installments: {
    name: 'Installments',
    columns: ['New', 'In Progress', 'on Hold', 'Done'],
    cards: [
      { id: 'i1', title: 'Genesis First Milestone', subtitle: 'Amount: $25,000', status: 'New', amount: '$25,000', dueDate: '2026-07-01' },
      { id: 'i2', title: 'Sentinel Initial Payout', subtitle: 'Amount: $40,000', status: 'In Progress', amount: '$40,000', dueDate: '2026-06-15' },
      { id: 'i3', title: 'OmniNet Phase 1 Fund', subtitle: 'Amount: $75,000', status: 'on Hold', amount: '$75,000', dueDate: '2026-08-30' },
      { id: 'i4', title: 'Skynet Deposit', subtitle: 'Amount: $100,000', status: 'Done', amount: '$100,000', dueDate: '2026-05-01' },
    ],
  },
  tasks: {
    name: 'Tasks',
    columns: ['New', 'In Progress', 'On Hold', 'Done'],
    cards: [
      { id: 't1', title: 'Verify Drizzle Engine Connection', subtitle: 'Priority: High', status: 'Done', priority: 'High', assignee: 'Operator', description: 'Run test queries and connection limit pool benchmark' },
      { id: 't2', title: 'Integrate Webhook Dispatcher', subtitle: 'Priority: Critical', status: 'New', priority: 'Critical', assignee: 'Agent Chuck', description: 'Add signed JSON payloads to local strategic listener' },
      { id: 't3', title: 'Style Sidebar Workspace layout', subtitle: 'Priority: Medium', status: 'In Progress', priority: 'Medium', assignee: 'Operator', description: 'Align navigation item heights and highlight states' },
      { id: 't4', title: 'Audit Logs pagination setup', subtitle: 'Priority: Low', status: 'On Hold', priority: 'Low', assignee: 'Agent Chuck', description: 'Clean up older trace objects to prevent space bloat' },
    ],
  },
};
