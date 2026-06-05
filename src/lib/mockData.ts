export interface KanbanCard {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
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
      { id: 'l1', title: 'Acme Corp', subtitle: 'Contact: John Doe', status: 'New' },
      { id: 'l2', title: 'Stark Industries', subtitle: 'Contact: Pepper Potts', status: 'Contacted' },
      { id: 'l3', title: 'Wayne Enterprises', subtitle: 'Contact: Bruce Wayne', status: 'Quote' },
      { id: 'l4', title: 'Cyberdyne Systems', subtitle: 'Contact: Miles Dyson', status: 'Won' },
      { id: 'l5', title: 'Oscorp Industries', subtitle: 'Contact: Norman Osborn', status: 'Lost' },
    ],
  },
  deals: {
    name: 'Deals',
    columns: ['New', 'Inprogress', 'Deployed', 'Collected'],
    cards: [
      { id: 'd1', title: 'Project Sentinel', subtitle: 'Value: $120,000', status: 'New' },
      { id: 'd2', title: 'Genesis Expansion', subtitle: 'Value: $85,000', status: 'Inprogress' },
      { id: 'd3', title: 'OmniNet Integration', subtitle: 'Value: $250,000', status: 'Deployed' },
      { id: 'd4', title: 'Skynet Terminal', subtitle: 'Value: $480,000', status: 'Collected' },
    ],
  },
  installments: {
    name: 'Installments',
    columns: ['New', 'In Progress', 'on Hold', 'Done'],
    cards: [
      { id: 'i1', title: 'Genesis First Milestone', subtitle: 'Amount: $25,000', status: 'New' },
      { id: 'i2', title: 'Sentinel Initial Payout', subtitle: 'Amount: $40,000', status: 'In Progress' },
      { id: 'i3', title: 'OmniNet Phase 1 Fund', subtitle: 'Amount: $75,000', status: 'on Hold' },
      { id: 'i4', title: 'Skynet Deposit', subtitle: 'Amount: $100,000', status: 'Done' },
    ],
  },
  tasks: {
    name: 'Tasks',
    columns: ['New', 'In Progress', 'On Hold', 'Done'],
    cards: [
      { id: 't1', title: 'Verify Drizzle Engine Connection', subtitle: 'Priority: High', status: 'Done' },
      { id: 't2', title: 'Integrate Webhook Dispatcher', subtitle: 'Priority: Critical', status: 'New' },
      { id: 't3', title: 'Style Sidebar Workspace layout', subtitle: 'Priority: Medium', status: 'In Progress' },
      { id: 't4', title: 'Audit Logs pagination setup', subtitle: 'Priority: Low', status: 'On Hold' },
    ],
  },
};
