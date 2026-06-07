export interface SubTask {
  id: string;
  description: string;
  details?: string;
  owner?: string;
  startDate?: string;
  dueDate?: string;
  completed?: boolean;
}

export interface KanbanCard {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
  // Leads fields
  contactName?: string;
  email?: string;
  value?: string;
  // Quotes fields
  phone?: string;
  pricingMethod?: string;
  totalRate?: string;
  startDate?: string;
  quoteDescription?: string;
  details?: string;
  description?: string;
  // Retainers fields
  monthlyFee?: string;
  endDate?: string;
  // Installments fields
  amount?: string;
  dueDate?: string;
  // Tasks fields
  priority?: string;
  assignee?: string;
  subTasks?: SubTask[];
}

export interface BoardConfig {
  id: string;
  name: string;
  columns: string[];
  cards: KanbanCard[];
}

export const boardsConfig: Record<string, Omit<BoardConfig, 'id'>> = {
  leads: {
    name: 'LEADS',
    columns: ['New', 'Contacted', 'Quote', 'Lost'],
    cards: [
      { id: 'l1', title: 'Acme Corp', subtitle: 'Contact: John Doe', status: 'New', contactName: 'John Doe', email: 'john@acme.com', value: '$10,000' },
      { id: 'l2', title: 'Stark Industries', subtitle: 'Contact: Pepper Potts', status: 'Contacted', contactName: 'Pepper Potts', email: 'pepper@stark.com', value: '$250,000' },
      { id: 'l3', title: 'Wayne Enterprises', subtitle: 'Contact: Bruce Wayne', status: 'Quote', contactName: 'Bruce Wayne', email: 'bruce@wayne.co', value: '$1,000,000' },
      { id: 'l4', title: 'Cyberdyne Systems', subtitle: 'Contact: Miles Dyson', status: 'Quote', contactName: 'Miles Dyson', email: 'dyson@cyberdyne.com', value: '$75,000' },
      { id: 'l5', title: 'Oscorp Industries', subtitle: 'Contact: Norman Osborn', status: 'Lost', contactName: 'Norman Osborn', email: 'norman@oscorp.com', value: '$50,000' },
    ],
  },
  quotes: {
    name: 'QUOTES',
    columns: ['New', 'Sent', 'Revise', 'Approved', 'Declined'],
    cards: [
      { id: 'q1', title: 'Project Sentinel', subtitle: 'Rate: $120,000', status: 'New', totalRate: '$120,000', pricingMethod: 'Fixed Price', contactName: 'Pepper Potts', email: 'pepper@stark.com', phone: '+1-555-0101', description: 'Sentinel hardware setup deployment', details: 'Install baseline firewall mainframes', startDate: '2026-06-01', dueDate: '2026-06-30', subTasks: [] },
      { id: 'q2', title: 'Genesis Expansion', subtitle: 'Rate: $85,000', status: 'Sent', totalRate: '$85,000', pricingMethod: 'Daily Rate', contactName: 'Miles Dyson', email: 'dyson@cyberdyne.com', phone: '+1-555-0102', description: 'Core software upgrades phase 2', details: 'Coordinate expansion templates', startDate: '2026-06-15', dueDate: '2026-07-15', subTasks: [] },
      { id: 'q3', title: 'OmniNet Integration', subtitle: 'Rate: $250,000', status: 'Revise', totalRate: '$250,000', pricingMethod: 'Fixed Price', contactName: 'Bruce Wayne', email: 'bruce@wayne.co', phone: '+1-555-0103', description: 'Integration of regional security hubs', details: 'Upgrade encryption relays', startDate: '2026-07-01', dueDate: '2026-08-01', subTasks: [] },
      { id: 'q4', title: 'Skynet Terminal', subtitle: 'Rate: $480,000', status: 'Approved', totalRate: '$480,000', pricingMethod: 'Fixed Price', contactName: 'John Connor', email: 'john@resistance.net', phone: '+1-555-0104', description: 'Global grid deployment contract', details: 'Deliver hardware arrays', startDate: '2026-05-01', dueDate: '2026-05-30', subTasks: [] },
    ],
  },
  retainers: {
    name: 'RETAINERS',
    columns: ['New', 'In Progress', 'On Hold', 'Expired'],
    cards: [
      { id: 'r1', title: 'Acme Monthly Support', subtitle: 'Monthly: $2,500', status: 'In Progress', contactName: 'John Doe', description: 'Ongoing security audit and consulting retainer', startDate: '2026-06-01', endDate: '2026-12-01', monthlyFee: '2500', value: '$15,000.00', details: 'Billed monthly, automatic renewal', subTasks: [] },
      { id: 'r2', title: 'Stark Strategic Advising', subtitle: 'Monthly: $10,000', status: 'New', contactName: 'Pepper Potts', description: 'Energy reactor implementation feedback contract', startDate: '2026-07-01', endDate: '2026-09-01', monthlyFee: '10000', value: '$20,000.00', details: 'Requires double signature verification', subTasks: [] }
    ],
  },
  contacts: {
    name: 'CONTACTS',
    columns: ['Contacts'],
    cards: [
      { id: 'c1', title: 'John Doe', subtitle: 'Acme Corp', status: 'Contacts', email: 'john@acme.com', phone: '+1-555-0101', details: 'CEO of Acme Corp' },
      { id: 'c2', title: 'Pepper Potts', subtitle: 'Stark Industries', status: 'Contacts', email: 'pepper@stark.com', phone: '+1-555-0102', details: 'CEO of Stark Industries' },
      { id: 'c3', title: 'Bruce Wayne', subtitle: 'Wayne Enterprises', status: 'Contacts', email: 'bruce@wayne.co', phone: '+1-555-0103', details: 'Owner of Wayne Enterprises' },
      { id: 'c4', title: 'Miles Dyson', subtitle: 'Cyberdyne Systems', status: 'Contacts', email: 'dyson@cyberdyne.com', phone: '+1-555-0104', details: 'Lead Architect at Cyberdyne' }
    ]
  },
  tasks: {
    name: 'TASKS',
    columns: ['New', 'In Progress', 'On Hold', 'Done'],
    cards: [
      { id: 't1', title: 'Verify Drizzle Engine Connection', subtitle: 'Priority: High', status: 'Done', priority: 'High', assignee: 'Operator', description: 'Run test queries and connection limit pool benchmark' },
      { id: 't2', title: 'Integrate Webhook Dispatcher', subtitle: 'Priority: Critical', status: 'New', priority: 'Critical', assignee: 'Agent Chuck', description: 'Add signed JSON payloads to local strategic listener' },
      { id: 't3', title: 'Style Sidebar Workspace layout', subtitle: 'Priority: Medium', status: 'In Progress', priority: 'Medium', assignee: 'Operator', description: 'Align navigation item heights and highlight states' },
      { id: 't4', title: 'Audit Logs pagination setup', subtitle: 'Priority: Low', status: 'On Hold', priority: 'Low', assignee: 'Agent Chuck', description: 'Clean up older trace objects to prevent space bloat' },
    ],
  },
};
