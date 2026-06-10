'use client';

import { useState, useEffect, useRef } from 'react';
import { KanbanCard, SubTask } from '../../lib/mockData';
import { presetAvatars } from './UserAvatar';

interface KanbanBoardProps {
  boardName: string;
  columns: string[];
  initialCards: KanbanCard[];
}

function getDueDateStatus(dueDate: string | undefined, status: string) {
  if (!dueDate) return 'on-track';
  const lowerStatus = status.toLowerCase();
  const isCompleted = lowerStatus === 'done' || lowerStatus === 'won' || lowerStatus === 'collected' || lowerStatus === 'approved';
  if (isCompleted) return 'on-track';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (isNaN(due.getTime())) return 'on-track';

  if (due < today) return 'overdue';
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return 'close';
  return 'on-track';
}

function getSubTaskStatus(startDate: string | undefined, dueDate: string | undefined, completed: boolean | undefined) {
  if (completed) return 'on-track';
  if (!dueDate) return 'on-track';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (isNaN(due.getTime())) return 'on-track';

  if (due < today) return 'overdue';
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return 'close';
  return 'on-track';
}

function getEffectiveDueDate(card: KanbanCard): string | undefined {
  if (card.dueDate) {
    return card.dueDate;
  }
  
  if (!card.subTasks || card.subTasks.length === 0) {
    return undefined;
  }

  const incompleteSubTasks = card.subTasks.filter(s => !s.completed && s.dueDate);
  if (incompleteSubTasks.length === 0) {
    return undefined;
  }

  const todayTime = new Date().setHours(0, 0, 0, 0);
  
  const parsedSubTasks = incompleteSubTasks.map(s => {
    const dueTime = new Date(s.dueDate!).setHours(0, 0, 0, 0);
    return { sub: s, time: dueTime };
  }).filter(p => !isNaN(p.time));

  if (parsedSubTasks.length === 0) return undefined;

  parsedSubTasks.sort((a, b) => a.time - b.time);

  return parsedSubTasks[0].sub.dueDate;
}

function StreetlightIndicator({ status, tooltip, size = 'md' }: { status: 'overdue' | 'close' | 'on-track', tooltip?: string, size?: 'sm' | 'md' }) {
  const colorClass = 
    status === 'overdue' 
      ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse' 
      : status === 'close' 
        ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' 
        : 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
  const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  
  return (
    <span 
      className={`inline-block rounded-full ${sizeClass} ${colorClass} transition-all duration-300 flex-shrink-0 cursor-help`} 
      title={tooltip || `Status: ${status}`}
    />
  );
}

export function KanbanBoard({ boardName, columns, initialCards }: KanbanBoardProps) {
  const isContactsBoard = boardName.toLowerCase() === 'contacts';
  const [cards, setCards] = useState<KanbanCard[]>(initialCards);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeView, setActiveView] = useState<'kanban' | 'list' | 'calendar'>(isContactsBoard ? 'list' : 'kanban');
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({});

  const toggleColumnCollapse = (col: string) => {
    setCollapsedColumns(prev => ({ ...prev, [col]: !prev?.[col] }));
  };

  // Calendar view states
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // Form states
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState('');
  // Leads fields
  const [editContactName, setEditContactName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editValue, setEditValue] = useState('');
  // Quotes fields
  const [editPhone, setEditPhone] = useState('');
  const [editPricingMethod, setEditPricingMethod] = useState('Fixed Price');
  const [editTotalRate, setEditTotalRate] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editQuoteDescription, setEditQuoteDescription] = useState('');
  const [editDetails, setEditDetails] = useState('');
  // Deals & Tasks fields
  const [editDescription, setEditDescription] = useState('');
  // Installments & Tasks fields
  const [editAmount, setEditAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  // Tasks fields
  const [editPriority, setEditPriority] = useState('');
  const [editAssignee, setEditAssignee] = useState('');

  // Retainers fields
  const [editMonthlyFee, setEditMonthlyFee] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  // Contacts lookup state
  const [contactsList, setContactsList] = useState<KanbanCard[]>([]);

  // Sub-task form states
  const [subDesc, setSubDesc] = useState('');
  const [subDetails, setSubDetails] = useState('');
  const [subOwner, setSubOwner] = useState('');
  const [subStart, setSubStart] = useState('');
  const [subDue, setSubDue] = useState('');

  // My Account Modal states
  const [accountTab, setAccountTab] = useState<'settings' | 'org' | 'tasks' | 'approvals'>('settings');
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [profile, setProfile] = useState({
    name: 'Operator',
    email: 'operator@sovereign.io',
    password: '••••••••',
    avatar: 'silhouette',
    role: 'Lead Operator',
  });
  const [orgChart, setOrgChart] = useState({
    userRole: 'Lead Operator',
    members: [
      { id: '1', name: 'Agent Chuck', role: 'Security Agent' },
      { id: '2', name: 'Operator', role: 'System Operator' },
    ]
  });
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  // Refs for dialogs
  const detailDialogRef = useRef<HTMLDialogElement>(null);
  const createDialogRef = useRef<HTMLDialogElement>(null);
  const accountDialogRef = useRef<HTMLDialogElement>(null);

  // Load profile, org chart, and cards from SQLite on mount/board transition
  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const { getCardsAction, getProfileAction, getOrgChartAction } = await import('../../app/actions');
        
        // Load cards
        const dbCards = await getCardsAction(boardName);
        if (active) {
          setCards(dbCards);
          localStorage.setItem(`board_cards_${boardName.toLowerCase()}`, JSON.stringify(dbCards));
        }

        // Load contacts list
        const dbContacts = await getCardsAction('contacts');
        if (active) {
          setContactsList(dbContacts);
        }

        // Load profile
        const dbProfile = await getProfileAction();
        if (active) {
          setProfile(dbProfile);
          localStorage.setItem('user_profile', JSON.stringify(dbProfile));
          window.dispatchEvent(new Event('user-profile-updated'));
          
          if (dbProfile.role === 'Admin') {
            const { getPendingUsersAction } = await import('../../app/actions');
            const pending = await getPendingUsersAction();
            setPendingUsers(pending);
          }
        }

        // Load org chart
        const dbOrg = await getOrgChartAction();
        if (active) {
          setOrgChart(dbOrg);
          localStorage.setItem('user_org_chart', JSON.stringify(dbOrg));
        }
      } catch (e) {
        console.error('Failed to load DB state:', e);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [boardName]);

  useEffect(() => {
    const handleOpen = () => {
      accountDialogRef.current?.showModal();
    };
    window.addEventListener('open-my-account-modal', handleOpen);
    return () => {
      window.removeEventListener('open-my-account-modal', handleOpen);
    };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('user_profile', JSON.stringify(profile));
    window.dispatchEvent(new Event('user-profile-updated'));
    try {
      const { saveProfileAction } = await import('../../app/actions');
      await saveProfileAction(profile);
    } catch (err) {
      console.error(err);
    }
    alert('Profile settings saved successfully.');
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const { approveUserAction } = await import('../../app/actions');
      const res = await approveUserAction(userId);
      if (res.success) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert(res.error || 'Failed to approve user');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!confirm('Are you sure you want to reject and delete this registration?')) return;
    try {
      const { rejectUserAction } = await import('../../app/actions');
      const res = await rejectUserAction(userId);
      if (res.success) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert(res.error || 'Failed to reject user');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [uploadError, setUploadError] = useState('');

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = (evt) => {
      if (evt.target?.readyState === FileReader.DONE) {
        const arr = new Uint8Array(evt.target.result as ArrayBuffer);
        let header = '';
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16).padStart(2, '0');
        }
        header = header.toUpperCase();

        const isPng = header.startsWith('89504E47');
        const isJpg = header.startsWith('FFD8FF');
        const isGif = header.startsWith('47494638');
        const isWebp = header.startsWith('52494646');

        if (!isPng && !isJpg && !isGif && !isWebp) {
          setUploadError('Invalid image file. Only PNG, JPG/JPEG, WebP, or GIF are allowed.');
          return;
        }

        const dataReader = new FileReader();
        dataReader.onload = () => {
          if (typeof dataReader.result === 'string') {
            setProfile(prev => ({ ...prev, avatar: dataReader.result as string }));
          }
        };
        dataReader.readAsDataURL(file);
      }
    };
    reader.readAsArrayBuffer(file.slice(0, 12));
  };

  const handleSaveUserRole = async (role: string) => {
    const updated = { ...orgChart, userRole: role };
    setOrgChart(updated);
    localStorage.setItem('user_org_chart', JSON.stringify(updated));
    try {
      const { saveOrgChartAction } = await import('../../app/actions');
      await saveOrgChartAction(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberRole.trim()) return;
    const newMember = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
      role: newMemberRole.trim()
    };
    const updated = {
      ...orgChart,
      members: [...orgChart.members, newMember]
    };
    setOrgChart(updated);
    localStorage.setItem('user_org_chart', JSON.stringify(updated));
    setNewMemberName('');
    setNewMemberRole('');
    try {
      const { saveOrgChartAction } = await import('../../app/actions');
      await saveOrgChartAction(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMember = async (id: string) => {
    const updated = {
      ...orgChart,
      members: orgChart.members.filter(m => m.id !== id)
    };
    setOrgChart(updated);
    localStorage.setItem('user_org_chart', JSON.stringify(updated));
    try {
      const { saveOrgChartAction } = await import('../../app/actions');
      await saveOrgChartAction(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const getMyTasks = () => {
    const boards = ['leads', 'quotes', 'retainers', 'tasks'];
    const myTasksList: {
      id: string;
      title: string;
      boardName: string;
      status: string;
      dueDate: string;
      type: 'Ticket' | 'Sub-task';
      relatedTicket?: string;
    }[] = [];

    boards.forEach((bName) => {
      let bCards: KanbanCard[] = [];
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`board_cards_${bName}`);
        if (saved) {
          try {
            bCards = JSON.parse(saved);
          } catch (e) {}
        }
      }
      if (bCards.length === 0) {
        const { boardsConfig } = require('../../lib/mockData');
        bCards = boardsConfig[bName]?.cards || [];
      }

      bCards.forEach((card) => {
        const uppercaseBoard = bName.toUpperCase();
        const isAssignedToMe = 
          (card.assignee === profile.name) ||
          (uppercaseBoard === 'LEADS' && card.contactName === profile.name) ||
          (uppercaseBoard === 'QUOTES' && card.contactName === profile.name);

        if (isAssignedToMe) {
          myTasksList.push({
            id: card.id,
            title: card.title,
            boardName: uppercaseBoard,
            status: card.status,
            dueDate: card.dueDate || 'No Due Date',
            type: 'Ticket',
          });
        }

        if (card.subTasks && card.subTasks.length > 0) {
          card.subTasks.forEach((sub) => {
            if (sub.owner === profile.name) {
              myTasksList.push({
                id: sub.id,
                title: sub.description,
                boardName: uppercaseBoard,
                status: sub.completed ? 'Done' : 'In Progress',
                dueDate: sub.dueDate || 'No Due Date',
                type: 'Sub-task',
                relatedTicket: card.title,
              });
            }
          });
        }
      });
    });

    return myTasksList;
  };



  // Calculate retainer total value dynamically
  useEffect(() => {
    if (boardName.toUpperCase() === 'RETAINERS') {
      const fee = parseFloat(editMonthlyFee.replace(/[^0-9.]/g, ''));
      if (!isNaN(fee) && editStartDate && editEndDate) {
        const start = new Date(editStartDate);
        const end = new Date(editEndDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
          let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
          const startDay = start.getDate();
          const endDay = end.getDate();
          const daysDiff = endDay - startDay;
          const daysInMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
          months += daysDiff / daysInMonth;
          const roundedMonths = Math.max(0.1, Math.round(months * 10) / 10);
          const totalValue = roundedMonths * fee;
          setEditValue(`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        } else {
          setEditValue('');
        }
      } else {
        setEditValue('');
      }
    }
  }, [editStartDate, editEndDate, editMonthlyFee, boardName]);

  // Save to localStorage when cards change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`board_cards_${boardName.toLowerCase()}`, JSON.stringify(cards));
    }
  }, [cards, boardName]);

  const renderContactSelect = (currentVal: string, onChangeContact: (name: string, email?: string, phone?: string) => void) => {
    return (
      <div className="relative space-y-1">
        <div className="flex gap-2">
          <input
            type="text"
            value={currentVal}
            onChange={(e) => onChangeContact(e.target.value)}
            placeholder="Type contact name..."
            className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
          />
          {contactsList.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                const selected = contactsList.find(c => c.title === e.target.value);
                if (selected) {
                  onChangeContact(selected.title, selected.email, selected.phone);
                }
              }}
              className="px-3 py-2 bg-background border border-border-color rounded-full text-xs text-text-main focus:outline-none focus:border-[#e67e22] max-w-[120px] cursor-pointer"
            >
              <option value="">-- Select --</option>
              {contactsList.map(c => (
                <option key={c.id} value={c.title}>{c.title}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    );
  };

  const openDetailModal = (card: KanbanCard) => {
    setSelectedCard(card);
    setEditTitle(card.title);
    setEditStatus(card.status);
    setEditContactName(card.contactName || '');
    setEditEmail(card.email || '');
    setEditValue(card.value || '');
    setEditPhone(card.phone || '');
    setEditPricingMethod(card.pricingMethod || 'Fixed Price');
    setEditTotalRate(card.totalRate || '');
    setEditStartDate(card.startDate || '');
    setEditQuoteDescription(card.quoteDescription || '');
    setEditDetails(card.details || '');
    setEditDescription(card.description || '');
    setEditAmount(card.amount || '');
    setEditDueDate(card.dueDate || '');
    setEditPriority(card.priority || 'Medium');
    setEditAssignee(card.assignee || 'Operator');
    setEditMonthlyFee(card.monthlyFee || '');
    setEditEndDate(card.endDate || '');
    
    // Clear sub-task states
    setSubDesc('');
    setSubDetails('');
    setSubOwner('');
    setSubStart('');
    setSubDue('');
    
    detailDialogRef.current?.showModal();
  };

  const openCreateModal = () => {
    setIsCreating(true);
    setEditTitle('');
    setEditStatus(columns[0]);
    setEditContactName('');
    setEditEmail('');
    setEditValue('');
    setEditPhone('');
    setEditPricingMethod('Fixed Price');
    setEditTotalRate('');
    setEditStartDate('');
    setEditQuoteDescription('');
    setEditDetails('');
    setEditDescription('');
    setEditAmount('');
    setEditDueDate('');
    setEditPriority('Medium');
    setEditAssignee('Operator');
    setEditMonthlyFee('');
    setEditEndDate('');
    createDialogRef.current?.showModal();
  };

  const logSystemActivity = (text: string, bName: string) => {
    if (typeof window === 'undefined') return;
    const savedLogs = localStorage.getItem('system_activity_log');
    let currentLogs: any[] = [];
    if (savedLogs) {
      try {
        currentLogs = JSON.parse(savedLogs);
      } catch (e) {}
    }
    const newLog = {
      id: Date.now().toString(),
      text,
      time: 'Just now',
      board: bName.toUpperCase()
    };
    const updatedLogs = [newLog, ...currentLogs].slice(0, 30);
    localStorage.setItem('system_activity_log', JSON.stringify(updatedLogs));
  };

  const handleUpdate = async () => {
    if (!selectedCard) return;

    let subtitle = '';
    const upperBoard = boardName.toUpperCase();
    if (upperBoard === 'LEADS') {
      subtitle = editContactName ? `Contact: ${editContactName}` : '';
    } else if (upperBoard === 'QUOTES') {
      subtitle = editTotalRate ? `Rate: ${editTotalRate}` : '';
    } else if (upperBoard === 'RETAINERS') {
      subtitle = editMonthlyFee ? `Monthly: $${parseFloat(editMonthlyFee).toLocaleString()}` : '';
    } else if (upperBoard === 'TASKS') {
      subtitle = editPriority ? `Priority: ${editPriority}` : '';
    }

    const updatedCard = {
      ...selectedCard,
      title: editTitle,
      status: editStatus,
      subtitle,
      contactName: editContactName,
      email: editEmail,
      value: editValue,
      phone: editPhone,
      pricingMethod: editPricingMethod,
      totalRate: editTotalRate,
      startDate: editStartDate,
      quoteDescription: editQuoteDescription,
      details: editDetails,
      description: editDescription,
      amount: editAmount,
      dueDate: editDueDate,
      priority: editPriority,
      assignee: editAssignee,
      monthlyFee: editMonthlyFee,
      endDate: editEndDate,
    };

    setCards((prev) =>
      prev.map((c) => (c.id === selectedCard.id ? updatedCard : c))
    );
    logSystemActivity(`Ticket "${editTitle}" (${selectedCard.id}) updated`, boardName);
    
    try {
      const { saveCardAction, logActivityAction } = await import('../../app/actions');
      await saveCardAction(updatedCard, boardName);
      await logActivityAction(`Ticket "${editTitle}" (${selectedCard.id}) updated`, boardName);
      
      // Auto-create contact card if name doesn't exist on Contacts board yet
      if (editContactName.trim() && boardName.toUpperCase() !== 'CONTACTS') {
        const exists = contactsList.some(c => c.title.toLowerCase() === editContactName.trim().toLowerCase());
        if (!exists) {
          const newContactId = `c${Date.now().toString().slice(-6)}`;
          const newContactCard: KanbanCard = {
            id: newContactId,
            title: editContactName.trim(),
            status: 'Contacts',
            email: editEmail,
            phone: editPhone,
            details: `Created automatically via card ${selectedCard.id}`,
            subTasks: []
          };
          await saveCardAction(newContactCard, 'contacts');
          setContactsList(prev => [...prev, newContactCard]);
        }
      }
    } catch (err) {
      console.error(err);
    }

    detailDialogRef.current?.close();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `${boardName.toLowerCase().charAt(0)}${Date.now().toString().slice(-6)}`;

    let subtitle = '';
    const upperBoard = boardName.toUpperCase();
    if (upperBoard === 'LEADS') {
      subtitle = editContactName ? `Contact: ${editContactName}` : '';
    } else if (upperBoard === 'QUOTES') {
      subtitle = editTotalRate ? `Rate: ${editTotalRate}` : '';
    } else if (upperBoard === 'RETAINERS') {
      subtitle = editMonthlyFee ? `Monthly: $${parseFloat(editMonthlyFee).toLocaleString()}` : '';
    } else if (upperBoard === 'TASKS') {
      subtitle = editPriority ? `Priority: ${editPriority}` : '';
    }

    const newCard: KanbanCard = {
      id: newId,
      title: editTitle,
      status: editStatus,
      subtitle,
      contactName: editContactName,
      email: editEmail,
      value: editValue,
      phone: editPhone,
      pricingMethod: editPricingMethod,
      totalRate: editTotalRate,
      startDate: editStartDate,
      quoteDescription: editQuoteDescription,
      details: editDetails,
      description: editDescription,
      amount: editAmount,
      dueDate: editDueDate,
      priority: editPriority,
      assignee: editAssignee,
      monthlyFee: editMonthlyFee,
      endDate: editEndDate,
      subTasks: [],
    };

    setCards((prev) => [...prev, newCard]);
    logSystemActivity(`Ticket "${editTitle}" (${newId}) created`, boardName);

    try {
      const { saveCardAction, logActivityAction } = await import('../../app/actions');
      await saveCardAction(newCard, boardName);
      await logActivityAction(`Ticket "${editTitle}" (${newId}) created`, boardName);

      // Auto-create contact card if name doesn't exist on Contacts board yet
      if (editContactName.trim() && boardName.toUpperCase() !== 'CONTACTS') {
        const exists = contactsList.some(c => c.title.toLowerCase() === editContactName.trim().toLowerCase());
        if (!exists) {
          const newContactId = `c${Date.now().toString().slice(-6)}`;
          const newContactCard: KanbanCard = {
            id: newContactId,
            title: editContactName.trim(),
            status: 'Contacts',
            email: editEmail,
            phone: editPhone,
            details: `Created automatically via card ${newId}`,
            subTasks: []
          };
          await saveCardAction(newContactCard, 'contacts');
          setContactsList(prev => [...prev, newContactCard]);
        }
      }
    } catch (err) {
      console.error(err);
    }

    createDialogRef.current?.close();
  };

  const handleDelete = async (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    logSystemActivity(`Ticket (${cardId}) deleted`, boardName);
    try {
      const { deleteCardAction, logActivityAction } = await import('../../app/actions');
      await deleteCardAction(cardId);
      await logActivityAction(`Ticket (${cardId}) deleted`, boardName);
    } catch (err) {
      console.error(err);
    }
    detailDialogRef.current?.close();
  };

  const moveCard = async (cardId: string, direction: 'left' | 'right') => {
    let cardToSave: any = null;
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;
        const currentIndex = columns.indexOf(card.status);
        if (currentIndex === -1) return card;

        const nextIndex = currentIndex + (direction === 'left' ? -1 : 1);
        if (nextIndex >= 0 && nextIndex < columns.length) {
          logSystemActivity(`Ticket "${card.title}" moved to ${columns[nextIndex]}`, boardName);
          cardToSave = { ...card, status: columns[nextIndex] };
          return cardToSave;
        }
        return card;
      })
    );
    if (cardToSave) {
      try {
        const { saveCardAction, logActivityAction } = await import('../../app/actions');
        await saveCardAction(cardToSave, boardName);
        await logActivityAction(`Ticket "${cardToSave.title}" moved to ${cardToSave.status}`, boardName);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Convert Lead to Quote
  const winLeadAndCreateQuote = async (leadCard: KanbanCard) => {
    const newQuoteId = `q${Date.now().toString().slice(-6)}`;
    const newQuote: KanbanCard = {
      id: newQuoteId,
      title: leadCard.title,
      status: 'New', // Default status for Quotes
      subtitle: leadCard.value ? `Rate: ${leadCard.value}` : '',
      contactName: leadCard.contactName || '',
      email: leadCard.email || '',
      phone: leadCard.phone || '',
      totalRate: leadCard.value || '',
      quoteDescription: `Converted from Lead ${leadCard.id}`,
      details: `Company: ${leadCard.title}\nContact: ${leadCard.contactName || ''}\nEmail: ${leadCard.email || ''}`,
      subTasks: [],
      dueDate: leadCard.dueDate || '',
    };

    if (typeof window !== 'undefined') {
      const savedQuotes = localStorage.getItem('board_cards_quotes');
      let quotesList = [];
      if (savedQuotes) {
        try {
          quotesList = JSON.parse(savedQuotes);
        } catch (e) {}
      } else {
        const { boardsConfig } = require('../../lib/mockData');
        quotesList = boardsConfig.quotes.cards;
      }
      quotesList.push(newQuote);
      localStorage.setItem('board_cards_quotes', JSON.stringify(quotesList));
    }

    // Set Lead status to 'Quote'
    setCards(prev => prev.map(c => c.id === leadCard.id ? { ...c, status: 'Quote' } : c));
    logSystemActivity(`Lead "${leadCard.title}" converted to Quote`, 'LEADS');
    
    try {
      const { winLeadAction, logActivityAction } = await import('../../app/actions');
      await winLeadAction(leadCard.id, newQuote);
      await logActivityAction(`Lead "${leadCard.title}" converted to Quote`, 'LEADS');
    } catch (err) {
      console.error(err);
    }

    detailDialogRef.current?.close();
  };

  // Sub-task handlers
  const handleAddSubTask = async () => {
    if (!subDesc.trim() || !selectedCard) return;

    const newSub: SubTask = {
      id: `sub-${Date.now()}`,
      description: subDesc,
      details: subDetails,
      owner: subOwner,
      startDate: subStart,
      dueDate: subDue,
      completed: false,
    };

    const updatedSubTasks = [...(selectedCard.subTasks || []), newSub];
    const updatedCard = { ...selectedCard, subTasks: updatedSubTasks };
    setSelectedCard(updatedCard);

    setCards((prev) =>
      prev.map((c) => (c.id === selectedCard.id ? updatedCard : c))
    );

    setSubDesc('');
    setSubDetails('');
    setSubOwner('');
    setSubStart('');
    setSubDue('');

    try {
      const { saveCardAction } = await import('../../app/actions');
      await saveCardAction(updatedCard, boardName);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubTask = async (subId: string) => {
    if (!selectedCard) return;

    const updatedSubTasks = (selectedCard.subTasks || []).map((sub) =>
      sub.id === subId ? { ...sub, completed: !sub.completed } : sub
    );

    const updatedCard = { ...selectedCard, subTasks: updatedSubTasks };
    setSelectedCard(updatedCard);

    setCards((prev) =>
      prev.map((c) => (c.id === selectedCard.id ? updatedCard : c))
    );

    try {
      const { saveCardAction } = await import('../../app/actions');
      await saveCardAction(updatedCard, boardName);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubTask = async (subId: string) => {
    if (!selectedCard) return;

    const updatedSubTasks = (selectedCard.subTasks || []).filter((sub) => sub.id !== subId);
    const updatedCard = { ...selectedCard, subTasks: updatedSubTasks };
    setSelectedCard(updatedCard);

    setCards((prev) =>
      prev.map((c) => (c.id === selectedCard.id ? updatedCard : c))
    );

    try {
      const { saveCardAction } = await import('../../app/actions');
      await saveCardAction(updatedCard, boardName);
    } catch (err) {
      console.error(err);
    }
  };

  // Calendar logic helpers
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const calendarDays = getDaysInMonth(currentYear, currentMonth);

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full text-text-main">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-main font-serif">
            BOARD.{boardName.toUpperCase()}_WORKSPACE
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-mono bg-surface text-text-muted border border-border-color">
              TOTAL_ITEMS: {cards.length}
            </span>
            {!isContactsBoard && (
              <div className="inline-flex bg-surface border border-border-color p-0.5 rounded-full text-xs font-mono">
                {(['kanban', 'list', 'calendar'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setActiveView(view)}
                    className={`px-3 py-1 rounded-full cursor-pointer transition-colors uppercase text-[10px] font-bold ${
                      activeView === view
                        ? 'bg-[#e67e22] text-white'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => accountDialogRef.current?.showModal()}
            className="px-5 py-2.5 bg-surface hover:bg-background border border-border-color text-text-main text-xs font-semibold rounded-full font-mono transition-colors uppercase tracking-wider cursor-pointer font-bold"
          >
            My Account
          </button>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold rounded-full font-mono transition-colors uppercase tracking-wider cursor-pointer"
          >
            + Create Ticket
          </button>
        </div>
      </div>

      {/* 1. KANBAN VIEW */}
      {activeView === 'kanban' && !isContactsBoard && (
        <div className="flex flex-col lg:flex-row gap-4 overflow-y-auto lg:overflow-x-auto pb-4 flex-1 items-stretch lg:items-start min-h-[500px]">
          {columns.map((column) => {
            const columnCards = cards.filter((c) => c.status === column);
            const isCollapsed = collapsedColumns[column];
            
            return (
              <div
                key={column}
                className={`flex flex-col bg-surface border border-border-color rounded-3xl p-4 flex-shrink-0 transition-all duration-300 ${
                  isCollapsed ? 'w-[70px] lg:w-[70px]' : 'w-full lg:w-[320px]'
                }`}
              >
                {/* Column Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-color gap-2">
                  {!isCollapsed ? (
                    <>
                      <span className="text-sm font-bold text-text-main font-serif tracking-tight uppercase truncate">
                        {column}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-text-muted bg-background border border-border-color px-2.5 py-0.5 rounded-full">
                          {columnCards.length}
                        </span>
                        <button
                          onClick={() => toggleColumnCollapse(column)}
                          className="text-text-muted hover:text-text-main font-mono text-xs cursor-pointer font-bold px-1"
                          title="Collapse Column"
                        >
                          [-]
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center w-full gap-3">
                      <button
                        onClick={() => toggleColumnCollapse(column)}
                        className="text-text-muted hover:text-text-main font-mono text-xs cursor-pointer font-bold"
                        title="Expand Column"
                      >
                        [+]
                      </button>
                      <span className="text-[10px] font-mono text-text-muted bg-background border border-border-color px-1.5 py-0.5 rounded-full">
                        {columnCards.length}
                      </span>
                      <span className="text-xs font-bold text-text-muted font-serif tracking-tight uppercase rotate-90 my-8 whitespace-nowrap">
                        {column}
                      </span>
                    </div>
                  )}
                </div>

                {/* Column Body */}
                {!isCollapsed && (
                  <div className="space-y-3 min-h-[400px]">
                    {columnCards.map((card) => {
                      const columnIndex = columns.indexOf(card.status);
                      const canMoveLeft = columnIndex > 0;
                      const canMoveRight = columnIndex < columns.length - 1;
                      const effectiveDueDate = getEffectiveDueDate(card);
                      const statusColor = getDueDateStatus(effectiveDueDate, card.status);

                      return (
                        <div
                          key={card.id}
                          className="bg-background border border-border-color hover:border-text-muted/30 rounded-2xl p-4 space-y-3 transition-all flex flex-col justify-between"
                        >
                          <div
                            onClick={() => openDetailModal(card)}
                            className="cursor-pointer space-y-2"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono text-text-muted">{card.id}</span>
                              {effectiveDueDate && (
                                <StreetlightIndicator 
                                  status={statusColor} 
                                  tooltip={card.dueDate ? `Due Date: ${card.dueDate}` : `Next Sub-task Due: ${effectiveDueDate}`} 
                                />
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-text-main font-serif tracking-tight leading-snug">
                              {card.title}
                            </h4>
                            {card.subtitle && (
                              <p className="text-xs text-text-muted font-mono leading-relaxed">
                                {card.subtitle}
                              </p>
                            )}
                          </div>

                          {/* Card Actions */}
                          <div className="flex justify-between items-center gap-1.5 pt-2 mt-2 border-t border-border-color">
                            {/* Status Chevrons */}
                            <div className="flex gap-1">
                              {canMoveLeft && (
                                <button
                                  onClick={() => moveCard(card.id, 'left')}
                                  className="w-7 h-7 flex items-center justify-center bg-surface hover:bg-background text-text-muted hover:text-text-main rounded-full border border-border-color text-xs font-mono transition-colors cursor-pointer"
                                  title="Move Left"
                                >
                                  &larr;
                                </button>
                              )}
                              {canMoveRight && (
                                <button
                                  onClick={() => moveCard(card.id, 'right')}
                                  className="w-7 h-7 flex items-center justify-center bg-surface hover:bg-background text-text-muted hover:text-text-main rounded-full border border-border-color text-xs font-mono transition-colors cursor-pointer"
                                  title="Move Right"
                                >
                                  &rarr;
                                </button>
                              )}
                            </div>

                            {/* Direct CRUD options */}
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => openDetailModal(card)}
                                className="px-2.5 py-1 text-[10px] font-mono border border-border-color rounded-full bg-surface hover:bg-background text-text-main hover:text-[#e67e22] transition-all cursor-pointer font-bold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(card.id)}
                                className="px-2.5 py-1 text-[10px] font-mono border border-border-color rounded-full bg-surface hover:bg-background text-text-main hover:text-red-500 transition-all cursor-pointer font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {columnCards.length === 0 && (
                      <div className="flex items-center justify-center h-24 border border-dashed border-border-color rounded-2xl text-xs font-mono text-text-muted/50">
                        empty_bucket
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. LIST VIEW */}
      {(activeView === 'list' || isContactsBoard) && (
        <div className="space-y-6">
          {/* ---- CONTACTS: flat table layout ---- */}
          {isContactsBoard ? (
            <div className="bg-surface border border-border-color rounded-3xl overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_160px] gap-0 border-b border-border-color bg-background/60">
                  {['NAME', 'COMPANY', 'EMAIL', 'PHONE', 'ACTIONS'].map((col) => (
                    <div key={col} className="px-5 py-3 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase border-r last:border-r-0 border-border-color">
                      {col}
                    </div>
                  ))}
                </div>
                {/* Table Rows */}
                {cards.length === 0 && (
                  <div className="text-center py-10 text-xs font-mono text-text-muted/50">
                    no_contacts_found
                  </div>
                )}
                {cards.map((card, idx) => (
                  <div
                    key={card.id}
                    className={`grid grid-cols-[1fr_1fr_1fr_1fr_160px] gap-0 items-center hover:bg-background/40 transition-colors ${
                      idx !== cards.length - 1 ? 'border-b border-border-color' : ''
                    }`}
                  >
                    {/* Name */}
                    <div
                      onClick={() => openDetailModal(card)}
                      className="px-5 py-3.5 cursor-pointer min-w-0 border-r border-border-color"
                    >
                      <span className="text-sm font-bold text-text-main hover:text-[#e67e22] transition-colors font-serif truncate block">
                        {card.title}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted">{card.id}</span>
                    </div>
                    {/* Company */}
                    <div className="px-5 py-3.5 border-r border-border-color min-w-0">
                      <span className="text-xs text-text-main font-mono truncate block">
                        {card.subtitle || <span className="text-text-muted/40">—</span>}
                      </span>
                    </div>
                    {/* Email */}
                    <div className="px-5 py-3.5 border-r border-border-color min-w-0">
                      {card.email ? (
                        <a
                          href={`mailto:${card.email}`}
                          className="text-xs text-[#e67e22] hover:underline font-mono truncate block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {card.email}
                        </a>
                      ) : (
                        <span className="text-xs text-text-muted/40 font-mono">—</span>
                      )}
                    </div>
                    {/* Phone */}
                    <div className="px-5 py-3.5 border-r border-border-color min-w-0">
                      {card.phone ? (
                        <a
                          href={`tel:${card.phone}`}
                          className="text-xs text-text-main hover:text-[#e67e22] font-mono truncate block transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {card.phone}
                        </a>
                      ) : (
                        <span className="text-xs text-text-muted/40 font-mono">—</span>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openDetailModal(card)}
                        className="px-3 py-1 text-[10px] font-mono border border-border-color rounded-full bg-background hover:bg-surface text-text-main hover:text-[#e67e22] transition-all cursor-pointer font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="px-3 py-1 text-[10px] font-mono border border-border-color rounded-full bg-background hover:bg-surface text-text-main hover:text-red-500 transition-all cursor-pointer font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
          /* ---- STANDARD: grouped-by-status list ---- */
          columns.map((column) => {
            const columnCards = cards.filter((c) => c.status === column);
            const isCollapsed = collapsedColumns?.[column];
            
            return (
              <div key={column} className="bg-surface border border-border-color rounded-3xl p-6 transition-all duration-300">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-color">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-text-main font-serif tracking-tight uppercase">{column}</h3>
                    <button
                      onClick={() => toggleColumnCollapse(column)}
                      className="text-text-muted hover:text-text-main font-mono text-xs cursor-pointer font-bold px-1"
                    >
                      {isCollapsed ? '[+]' : '[-]'}
                    </button>
                  </div>
                  <span className="text-xs font-mono text-text-muted bg-background border border-border-color px-2.5 py-0.5 rounded-full">
                    {columnCards.length}
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="divide-y divide-border-color">
                    {columnCards.map((card) => {
                      const effectiveDueDate = getEffectiveDueDate(card);
                      const statusColor = getDueDateStatus(effectiveDueDate, card.status);
                      return (
                        <div
                          key={card.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-3 group border-t border-border-color first:border-t-0"
                        >
                          <div
                            onClick={() => openDetailModal(card)}
                            className="flex-1 cursor-pointer min-w-0"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono text-text-muted">{card.id}</span>
                              <h4 className="text-sm font-bold text-text-main hover:text-[#e67e22] transition-colors font-serif truncate">
                                {card.title}
                              </h4>
                              {effectiveDueDate && (
                                <StreetlightIndicator 
                                  status={statusColor} 
                                  tooltip={card.dueDate ? `Due Date: ${card.dueDate}` : `Next Sub-task Due: ${effectiveDueDate}`} 
                                />
                              )}
                            </div>
                            {card.subtitle && (
                              <p className="text-xs text-text-muted font-mono mt-1 truncate">
                                {card.subtitle}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => openDetailModal(card)}
                              className="px-3 py-1 text-[10px] font-mono border border-border-color rounded-full bg-background hover:bg-surface text-text-main hover:text-[#e67e22] transition-all cursor-pointer font-bold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(card.id)}
                              className="px-3 py-1 text-[10px] font-mono border border-border-color rounded-full bg-background hover:bg-surface text-text-main hover:text-red-500 transition-all cursor-pointer font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {columnCards.length === 0 && (
                      <div className="text-center py-6 text-xs font-mono text-text-muted/50">
                        no_items_in_status
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
          )}
        </div>
      )}

      {/* 3. CALENDAR VIEW */}
      {activeView === 'calendar' && !isContactsBoard && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Month Grid */}
          <div className="flex-1 bg-surface border border-border-color rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-serif font-bold text-text-main uppercase">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="px-3 py-1 text-xs border border-border-color rounded-full bg-background text-text-main hover:bg-surface transition-colors cursor-pointer font-mono font-bold"
                >
                  &larr; PREV
                </button>
                <button
                  onClick={handleNextMonth}
                  className="px-3 py-1 text-xs border border-border-color rounded-full bg-background text-text-main hover:bg-surface transition-colors cursor-pointer font-mono font-bold"
                >
                  NEXT &rarr;
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day header */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-xs font-mono font-bold text-text-muted py-2 border-b border-border-color uppercase">
                  {d}
                </div>
              ))}

              {/* Day cells */}
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return (
                    <div key={`empty-${idx}`} className="bg-background/20 min-h-[90px] border border-border-color/10 rounded-xl" />
                  );
                }

                const dateStr = getYYYYMMDD(day);
                const dayCards = cards.filter((c) => c.dueDate === dateStr);

                return (
                  <div
                    key={dateStr}
                    className="bg-background border border-border-color rounded-xl p-2 min-h-[90px] flex flex-col justify-between hover:border-[#e67e22]/40 transition-colors"
                  >
                    <span className="text-xs font-mono font-bold text-text-muted self-end">
                      {day.getDate()}
                    </span>
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-[60px] flex-1">
                      {dayCards.map((card) => {
                        const statusColor = getDueDateStatus(card.dueDate, card.status);

                        return (
                          <div
                            key={card.id}
                            onClick={() => openDetailModal(card)}
                            className="text-[9px] font-mono p-1 rounded bg-surface hover:bg-surface/80 border border-border-color cursor-pointer flex items-center justify-between gap-1 truncate text-text-main"
                            title={`Title: ${card.title} | Due: ${card.dueDate}`}
                          >
                            <span className="truncate font-semibold">{card.title}</span>
                            <StreetlightIndicator status={statusColor} size="sm" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Undated Cards Panel */}
          <div className="w-full lg:w-80 bg-surface border border-border-color rounded-3xl p-6 flex flex-col flex-shrink-0">
            <h3 className="text-sm font-serif font-bold text-text-main pb-2 border-b border-border-color mb-4 uppercase">
              undated_tickets_panel
            </h3>
            <div className="space-y-3 overflow-y-auto max-h-[500px]">
              {cards.filter((c) => !c.dueDate).map((card) => (
                <div
                  key={card.id}
                  onClick={() => openDetailModal(card)}
                  className="bg-background border border-border-color rounded-2xl p-3 cursor-pointer hover:border-[#e67e22]/40 transition-colors space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-text-muted">{card.id}</span>
                    <span className="text-[9px] font-mono bg-surface border border-border-color px-1.5 py-0.5 rounded text-text-muted uppercase">
                      {card.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold font-serif text-text-main truncate">
                    {card.title}
                  </h4>
                </div>
              ))}
              {cards.filter((c) => !c.dueDate).length === 0 && (
                <div className="text-center py-6 text-xs font-mono text-text-muted/50">
                  no_undated_tickets
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DIALOG 1: TICKET DETAIL & EDITING MODAL                        */}
      {/* ============================================================== */}
      <dialog
        ref={detailDialogRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface text-text-main p-6 rounded-3xl border border-border-color w-[95%] max-w-lg shadow-2xl backdrop:bg-black/60 backdrop:backdrop-filter backdrop:backdrop-blur-sm max-h-[90vh] overflow-y-auto"
        aria-labelledby="detailTitle"
      >
        {selectedCard && (
          <div className="space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-border-color">
              <div>
                <h3 id="detailTitle" className="text-lg font-bold tracking-tight text-[#e67e22] font-serif uppercase">
                  {selectedCard.id} // TICKET_DETAILS
                </h3>
                <p className="text-[10px] font-mono text-text-muted uppercase">entity_type: {boardName}</p>
              </div>
              <button
                type="button"
                onClick={() => detailDialogRef.current?.close()}
                className="w-7 h-7 flex items-center justify-center border border-border-color rounded-full hover:bg-background hover:text-text-main transition-colors cursor-pointer text-xs font-mono font-bold"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Common Title Field */}
              <div>
                <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">
                  {boardName === 'LEADS' ? 'Company Name' : 'Title'}
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-semibold"
                />
              </div>

              {/* Dynamic inputs based on active board Name */}
              {boardName === 'LEADS' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Contact Name</label>
                      {renderContactSelect(editContactName, (name, email, phone) => {
                        setEditContactName(name);
                        if (email) setEditEmail(email);
                        if (phone) setEditPhone(phone);
                      })}
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Lead Value</label>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                        placeholder="$10,000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Due Date</label>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                    />
                  </div>
                </>
              )}

              {boardName === 'QUOTES' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Contact Name</label>
                      {renderContactSelect(editContactName, (name, email, phone) => {
                        setEditContactName(name);
                        if (email) setEditEmail(email);
                        if (phone) setEditPhone(phone);
                      })}
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Pricing Method</label>
                      <select
                        value={editPricingMethod}
                        onChange={(e) => setEditPricingMethod(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                      >
                        <option value="Fixed Price">Fixed Price</option>
                        <option value="Daily Rate">Daily Rate</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Total Rate</label>
                      <input
                        type="text"
                        value={editTotalRate}
                        onChange={(e) => setEditTotalRate(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Est. Start Date</label>
                      <input
                        type="date"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Est. End Date</label>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Quote Description</label>
                    <input
                      type="text"
                      value={editQuoteDescription}
                      onChange={(e) => setEditQuoteDescription(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Details</label>
                    <textarea
                      value={editDetails}
                      onChange={(e) => setEditDetails(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-background border border-border-color rounded-2xl text-sm text-text-main focus:outline-none focus:border-[#e67e22] resize-none"
                    />
                  </div>
                </>
              )}

              {boardName === 'RETAINERS' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Customer Name</label>
                      {renderContactSelect(editContactName, (name, email, phone) => {
                        setEditContactName(name);
                        if (email) setEditEmail(email);
                        if (phone) setEditPhone(phone);
                      })}
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Monthly Fee ($)</label>
                      <input
                        type="text"
                        value={editMonthlyFee}
                        onChange={(e) => setEditMonthlyFee(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                        placeholder="2500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Start Date</label>
                      <input
                        type="date"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Expired Date</label>
                      <input
                        type="date"
                        value={editEndDate}
                        onChange={(e) => setEditEndDate(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Total Value (Calculated)</label>
                      <input
                        type="text"
                        value={editValue}
                        disabled
                        className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-border-color rounded-full text-sm text-text-muted font-mono"
                        placeholder="$0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Description</label>
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                      placeholder="Consulting and Support Support"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Details / Notes</label>
                    <textarea
                      value={editDetails}
                      onChange={(e) => setEditDetails(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-background border border-border-color rounded-2xl text-sm text-text-main focus:outline-none focus:border-[#e67e22] resize-none"
                    />
                  </div>
                </>
              )}

              {boardName === 'CONTACTS' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Email</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Phone</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                        placeholder="+1-555-0100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Details / Notes</label>
                    <textarea
                      value={editDetails}
                      onChange={(e) => setEditDetails(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-background border border-border-color rounded-2xl text-sm text-text-main focus:outline-none focus:border-[#e67e22] resize-none"
                    />
                  </div>
                </>
              )}

              {boardName === 'TASKS' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Priority</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Assignee</label>
                      <select
                        value={editAssignee}
                        onChange={(e) => setEditAssignee(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                      >
                        <option value={profile.name}>{profile.name} (You)</option>
                        {orgChart.members.filter(m => m.name !== profile.name).map((m) => (
                          <option key={m.id} value={m.name}>
                            {m.name} ({m.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Due Date</label>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Task Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-background border border-border-color rounded-2xl text-sm text-text-main focus:outline-none focus:border-[#e67e22] resize-none"
                    />
                  </div>
                </>
              )}

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Change Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                >
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sub-tasks Section for LEADS and QUOTES */}
            {(boardName === 'LEADS' || boardName === 'QUOTES') && (
              <div className="pt-4 border-t border-border-color space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-text-main font-serif tracking-tight uppercase">
                    Sub-tasks Board
                  </h4>
                  <span className="text-xs font-mono text-text-muted bg-background border border-border-color px-2 py-0.5 rounded-full">
                    {(selectedCard.subTasks || []).length}
                  </span>
                </div>

                {/* Sub-tasks list */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(selectedCard.subTasks || []).map((sub) => {
                    const subStatus = getSubTaskStatus(sub.startDate, sub.dueDate, sub.completed);
                    return (
                      <div 
                        key={sub.id} 
                        className="flex items-start justify-between p-3 bg-background border border-border-color rounded-2xl gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={sub.completed || false}
                            onChange={() => handleToggleSubTask(sub.id)}
                            className="mt-0.5 rounded border-border-color text-[#e67e22] focus:ring-[#e67e22] cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold text-text-main ${sub.completed ? 'line-through text-text-muted' : ''}`}>
                                {sub.description}
                              </span>
                              <StreetlightIndicator 
                                status={subStatus} 
                                tooltip={`Due: ${sub.dueDate || 'No Date'} | Start: ${sub.startDate || 'No Date'}`} 
                              />
                            </div>
                            {sub.details && (
                              <p className="text-text-muted mt-1 font-sans">{sub.details}</p>
                            )}
                            {(sub.owner || sub.startDate || sub.dueDate) && (
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-text-muted font-mono mt-1">
                                {sub.owner && <span>owner: {sub.owner}</span>}
                                {sub.startDate && <span>start: {sub.startDate}</span>}
                                {sub.dueDate && <span>due: {sub.dueDate}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubTask(sub.id)}
                          className="text-text-muted hover:text-red-500 font-mono text-[10px] font-bold cursor-pointer hover:bg-surface border border-border-color hover:border-red-500/20 px-2 py-0.5 rounded-full transition-colors"
                        >
                          DELETE
                        </button>
                      </div>
                    );
                  })}
                  {(selectedCard.subTasks || []).length === 0 && (
                    <p className="text-center py-4 text-xs font-mono text-text-muted/40 uppercase">
                      no_sub_tasks_defined
                    </p>
                  )}
                </div>

                {/* Create sub-task form */}
                <div className="bg-background border border-border-color rounded-2xl p-4 space-y-3">
                  <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    Add New Sub-task
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Sub-task Description"
                        value={subDesc}
                        onChange={(e) => setSubDesc(e.target.value)}
                        className="w-full px-4 py-2 bg-surface border border-border-color rounded-full text-xs text-text-main focus:outline-none focus:border-[#e67e22]"
                      />
                    </div>
                    <div className="col-span-2">
                      <textarea
                        placeholder="Details & Notes"
                        value={subDetails}
                        onChange={(e) => setSubDetails(e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 bg-surface border border-border-color rounded-xl text-xs text-text-main focus:outline-none focus:border-[#e67e22] resize-none"
                      />
                    </div>
                    <div>
                      <select
                        value={subOwner}
                        onChange={(e) => setSubOwner(e.target.value)}
                        className="w-full px-4 py-2 bg-surface border border-border-color rounded-full text-xs text-text-main focus:outline-none focus:border-[#e67e22]"
                      >
                        <option value="">Select Owner</option>
                        <option value={profile.name}>{profile.name} (You)</option>
                        {orgChart.members.filter(m => m.name !== profile.name).map((m) => (
                          <option key={m.id} value={m.name}>
                            {m.name} ({m.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono text-text-muted mb-0.5">Start Date</span>
                      <input
                        type="date"
                        value={subStart}
                        onChange={(e) => setSubStart(e.target.value)}
                        className="w-full px-4 py-1.5 bg-surface border border-border-color rounded-full text-xs text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono text-text-muted mb-0.5">Due Date</span>
                      <input
                        type="date"
                        value={subDue}
                        onChange={(e) => setSubDue(e.target.value)}
                        className="w-full px-4 py-1.5 bg-surface border border-border-color rounded-full text-xs text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                      />
                    </div>
                    <div className="flex items-end justify-end col-span-2">
                      <button
                        type="button"
                        onClick={handleAddSubTask}
                        className="px-4 py-2 bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold rounded-full font-mono transition-colors uppercase tracking-wider cursor-pointer"
                      >
                        + Add Sub
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Panel */}
            <div className="flex justify-between items-center pt-4 border-t border-border-color">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedCard.id)}
                  className="px-4 py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-semibold rounded-full font-mono transition-colors uppercase tracking-wider cursor-pointer text-left"
                >
                  {isContactsBoard ? 'DELETE CONTACT' : 'DELETE TICKET'}
                </button>
                {boardName.toUpperCase() === 'LEADS' && (
                  <button
                    type="button"
                    onClick={() => winLeadAndCreateQuote(selectedCard)}
                    className="px-4 py-2 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 text-xs font-semibold rounded-full font-mono transition-colors uppercase tracking-wider cursor-pointer font-bold"
                  >
                    🏆 WIN & CONVERT
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => detailDialogRef.current?.close()}
                  className="px-4 py-2 bg-background hover:bg-surface border border-border-color text-text-muted hover:text-text-main text-xs font-semibold rounded-full font-mono transition-colors uppercase tracking-wider cursor-pointer font-bold"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-5 py-2.5 bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold rounded-full font-mono transition-colors uppercase tracking-wider cursor-pointer font-bold"
                >
                  SAVE CHANGES
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>

      {/* ============================================================== */}
      {/* DIALOG 2: TICKET CREATION MODAL                                */}
      {/* ============================================================== */}
      <dialog
        ref={createDialogRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface text-text-main p-6 rounded-3xl border border-border-color w-[95%] max-w-lg shadow-2xl backdrop:bg-black/60 backdrop:backdrop-filter backdrop:backdrop-blur-sm max-h-[90vh] overflow-y-auto"
        aria-labelledby="createTitle"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="flex justify-between items-start pb-3 border-b border-border-color">
            <div>
              <h3 id="createTitle" className="text-lg font-bold tracking-tight text-[#e67e22] font-serif uppercase">
                NEW_TICKET // CREATE_WORKSPACE
              </h3>
              <p className="text-[10px] font-mono text-text-muted uppercase">target_entity: {boardName}</p>
            </div>
            <button
              type="button"
              onClick={() => createDialogRef.current?.close()}
              className="w-7 h-7 flex items-center justify-center border border-border-color rounded-full hover:bg-background hover:text-text-main transition-colors cursor-pointer text-xs font-mono font-bold"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Common Title Input */}
            <div>
              <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">
                {boardName === 'LEADS' ? 'Company Name' : 'Title'}
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-semibold"
                placeholder={boardName === 'LEADS' ? 'Acme Corp' : 'My New Task'}
              />
            </div>

            {/* Dynamic creation forms */}
            {boardName === 'LEADS' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Contact Name</label>
                    {renderContactSelect(editContactName, (name, email, phone) => {
                      setEditContactName(name);
                      if (email) setEditEmail(email);
                      if (phone) setEditPhone(phone);
                    })}
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Value Estimate</label>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                      placeholder="$15,000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                    placeholder="jane@corp.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                  />
                </div>
              </>
            )}

            {boardName === 'QUOTES' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Contact Name</label>
                    {renderContactSelect(editContactName, (name, email, phone) => {
                      setEditContactName(name);
                      if (email) setEditEmail(email);
                      if (phone) setEditPhone(phone);
                    })}
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                      placeholder="stark@genesis.io"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                      placeholder="+1-555-0101"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Pricing Method</label>
                    <select
                      value={editPricingMethod}
                      onChange={(e) => setEditPricingMethod(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                    >
                      <option value="Fixed Price">Fixed Price</option>
                      <option value="Daily Rate">Daily Rate</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Total Rate</label>
                    <input
                      type="text"
                      value={editTotalRate}
                      onChange={(e) => setEditTotalRate(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                      placeholder="$120,000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Est. Start Date</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Est. End Date</label>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Quote Description</label>
                  <input
                    type="text"
                    value={editQuoteDescription}
                    onChange={(e) => setEditQuoteDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                    placeholder="Enter short overview..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Details</label>
                  <textarea
                    value={editDetails}
                    onChange={(e) => setEditDetails(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-border-color rounded-2xl text-sm text-text-main focus:outline-none focus:border-[#e67e22] resize-none"
                    placeholder="Enter detailed scopes of work..."
                  />
                </div>
              </>
            )}

            {boardName === 'RETAINERS' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Customer Name</label>
                    {renderContactSelect(editContactName, (name, email, phone) => {
                      setEditContactName(name);
                      if (email) setEditEmail(email);
                      if (phone) setEditPhone(phone);
                    })}
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Monthly Fee ($)</label>
                    <input
                      type="text"
                      value={editMonthlyFee}
                      onChange={(e) => setEditMonthlyFee(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                      placeholder="2500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Start Date</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Expired Date</label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Total Value (Calculated)</label>
                    <input
                      type="text"
                      value={editValue}
                      disabled
                      className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-border-color rounded-full text-sm text-text-muted font-mono"
                      placeholder="$0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Description</label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                    placeholder="Consulting and support retainer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Details / Notes</label>
                  <textarea
                    value={editDetails}
                    onChange={(e) => setEditDetails(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-border-color rounded-2xl text-sm text-text-main focus:outline-none focus:border-[#e67e22] resize-none"
                    placeholder="Enter details or notes..."
                  />
                </div>
              </>
            )}

            {boardName === 'CONTACTS' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Phone</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                      placeholder="+1-555-0100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Details / Notes</label>
                  <textarea
                    value={editDetails}
                    onChange={(e) => setEditDetails(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-border-color rounded-2xl text-sm text-text-main focus:outline-none focus:border-[#e67e22] resize-none"
                    placeholder="Notes about contact..."
                  />
                </div>
              </>
            )}

            {boardName === 'TASKS' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Priority</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Assignee</label>
                    <select
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                    >
                      <option value={profile.name}>{profile.name} (You)</option>
                      {orgChart.members.filter(m => m.name !== profile.name).map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Due Date</label>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Task Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-border-color rounded-2xl text-sm text-text-main focus:outline-none focus:border-[#e67e22] resize-none"
                    placeholder="Enter task goals and constraints..."
                  />
                </div>
              </>
            )}

            {/* Status input */}
            <div>
              <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Initial Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono"
              >
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Creation dialog buttons */}
          <div className="flex justify-end items-center gap-2 pt-4 border-t border-border-color">
            <button
              type="button"
              onClick={() => createDialogRef.current?.close()}
              className="px-4 py-2 bg-background hover:bg-surface border border-border-color text-text-muted hover:text-text-main text-xs font-semibold rounded-full font-mono transition-colors uppercase tracking-wider cursor-pointer font-bold"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold rounded-full font-mono transition-colors uppercase tracking-wider cursor-pointer font-bold"
            >
              CREATE TICKET
            </button>
          </div>
        </form>
      </dialog>

      {/* ============================================================== */}
      {/* DIALOG 3: MY ACCOUNT MODAL                                     */}
      {/* ============================================================== */}
      <dialog
        ref={accountDialogRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface text-text-main p-6 rounded-3xl border border-border-color w-[95%] max-w-2xl shadow-2xl backdrop:bg-black/60 backdrop:backdrop-filter backdrop:backdrop-blur-sm max-h-[90vh] overflow-y-auto"
        aria-labelledby="accountTitle"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-start pb-3 border-b border-border-color">
            <div>
              <h3 id="accountTitle" className="text-lg font-bold tracking-tight text-[#e67e22] font-serif uppercase">
                MY_ACCOUNT // MANAGEMENT_GATEWAY
              </h3>
              <p className="text-[10px] font-mono text-text-muted uppercase">operator: {profile.name}</p>
            </div>
            <button
              type="button"
              onClick={() => accountDialogRef.current?.close()}
              className="w-7 h-7 flex items-center justify-center border border-border-color rounded-full hover:bg-background hover:text-text-main transition-colors cursor-pointer text-xs font-mono font-bold"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Tabs header */}
          <div className="flex border-b border-border-color pb-2 gap-4 text-xs font-mono">
            {([
              { id: 'settings', label: 'Settings' },
              { id: 'org', label: 'Org Chart' },
              { id: 'tasks', label: 'My Tasks' },
              ...(profile.role === 'Admin' ? [{ id: 'approvals', label: 'Pending Approvals' }] : [])
            ] as Array<{ id: 'settings' | 'org' | 'tasks' | 'approvals'; label: string }>).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAccountTab(tab.id)}
                className={`pb-1 cursor-pointer transition-colors uppercase border-b-2 font-bold ${
                  accountTab === tab.id
                    ? 'border-[#e67e22] text-[#e67e22]'
                    : 'border-transparent text-text-muted hover:text-text-main'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: SETTINGS */}
          {accountTab === 'settings' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={profile.password}
                  onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Profile Avatar</label>
                <div className="flex flex-wrap items-center gap-3">
                  {Object.keys(presetAvatars).map((key) => {
                    const isSelected = profile.avatar === key;
                    const url = presetAvatars[key as keyof typeof presetAvatars];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setProfile({ ...profile, avatar: key })}
                        className={`w-10 h-10 rounded-full border-2 p-0.5 overflow-hidden transition-all duration-200 cursor-pointer ${
                          isSelected ? 'border-[#e67e22] scale-110 shadow-md' : 'border-border-color bg-surface hover:border-text-muted'
                        }`}
                        title={`Preset: ${key}`}
                      >
                        <img src={url} alt={key} className="w-full h-full object-cover rounded-full" />
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-3">
                  <label className="block text-[10px] font-mono text-text-muted mb-1">Or upload image (max 2MB, verified):</label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    onChange={handleAvatarUpload}
                    className="block w-full text-xs text-text-muted file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#e67e22] file:text-white hover:file:bg-[#d35400] cursor-pointer"
                  />
                  {uploadError && (
                    <p className="mt-1 text-[10px] font-mono text-red-500">{uploadError}</p>
                  )}
                </div>

                <div className="mt-3">
                  <label className="block text-[10px] font-mono text-text-muted mb-1">Or input custom image URL:</label>
                  <input
                    type="text"
                    value={Object.keys(presetAvatars).includes(profile.avatar) ? '' : profile.avatar}
                    onChange={(e) => setProfile({ ...profile, avatar: e.target.value || 'silhouette' })}
                    placeholder="https://example.com/avatar.png"
                    className="w-full px-4 py-2 bg-background border border-border-color rounded-full text-xs text-text-main focus:outline-none focus:border-[#e67e22]"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold rounded-full font-mono transition-colors uppercase tracking-wider cursor-pointer font-bold"
                >
                  Save Profile Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ORG CHART */}
          {accountTab === 'org' && (
            <div className="space-y-6 pt-2">
              {/* User role setup */}
              <div>
                <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Define Your Role</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={orgChart.userRole}
                    onChange={(e) => handleSaveUserRole(e.target.value)}
                    className="flex-1 px-4 py-2 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22]"
                    placeholder="CEO / Manager / Operator"
                  />
                </div>
              </div>

              {/* Hierarchy Visual */}
              <div className="bg-background border border-border-color rounded-3xl p-4 flex flex-col items-center gap-4">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider self-start">Visual Org Tree</span>
                
                {/* Visual Tree */}
                <div className="flex flex-col items-center w-full">
                  {/* CEO / Manager Box */}
                  <div className="flex flex-col items-center bg-surface border-2 border-[#e67e22] rounded-2xl px-5 py-2.5 shadow-md">
                    <span className="text-xs font-serif font-bold text-text-main">{profile.name} (You)</span>
                    <span className="text-[10px] font-mono text-[#e67e22] uppercase mt-0.5">{orgChart.userRole}</span>
                  </div>

                  {/* Connecting line */}
                  {orgChart.members.filter(m => m.name !== profile.name).length > 0 && (
                    <>
                      <div className="w-0.5 h-6 bg-border-color" />
                      <div className="w-[80%] h-0.5 bg-border-color" />
                      <div className="flex justify-center items-start w-full gap-4 pt-1">
                        {orgChart.members.filter(m => m.name !== profile.name).map((m) => (
                          <div key={m.id} className="flex flex-col items-center">
                            <div className="w-0.5 h-3 bg-border-color" />
                            <div className="flex flex-col items-center bg-surface border border-border-color rounded-2xl px-4 py-2 shadow-sm">
                              <span className="text-[11px] font-serif font-bold text-text-main">{m.name}</span>
                              <span className="text-[9px] font-mono text-text-muted uppercase mt-0.5">{m.role}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Add team member form */}
              <form onSubmit={handleAddMember} className="bg-background border border-border-color rounded-3xl p-4 space-y-3">
                <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider">
                  Add Team Member or Agent
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-4 py-2 bg-surface border border-border-color rounded-full text-xs text-text-main focus:outline-none focus:border-[#e67e22]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Role"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full px-4 py-2 bg-surface border border-border-color rounded-full text-xs text-text-main focus:outline-none focus:border-[#e67e22]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold rounded-full font-mono transition-colors uppercase tracking-wider cursor-pointer font-bold"
                  >
                    + Add to Org Chart
                  </button>
                </div>
              </form>

              {/* Members List */}
              <div className="space-y-2">
                <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider">
                  Team Members List
                </span>
                <div className="divide-y divide-border-color">
                  {orgChart.members.map((m) => (
                    <div key={m.id} className="flex justify-between items-center py-2">
                      <div>
                        <span className="text-xs font-semibold text-text-main">{m.name}</span>
                        <span className="text-[10px] font-mono text-text-muted ml-2">[{m.role}]</span>
                      </div>
                      {m.name !== profile.name && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(m.id)}
                          className="text-[10px] font-mono text-red-500 hover:text-red-400 font-bold border border-border-color hover:border-red-500/20 px-2 py-0.5 rounded-full cursor-pointer bg-background"
                        >
                          REMOVE
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MY TASKS */}
          {accountTab === 'tasks' && (
            <div className="space-y-4 pt-2">
              <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider">
                Active tasks & items assigned to: {profile.name}
              </span>
              
              <div className="border border-border-color rounded-3xl overflow-hidden bg-background">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-surface border-b border-border-color font-mono text-[10px] text-text-muted uppercase">
                      <th className="p-3">Type</th>
                      <th className="p-3">Task/Ticket</th>
                      <th className="p-3">Connected Board</th>
                      <th className="p-3">Related Ticket</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color/40 dark:divide-zinc-700/80">
                    {getMyTasks().map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface/50 transition-colors">
                        <td className="p-3 font-mono">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            item.type === 'Ticket' 
                              ? 'bg-amber-950/20 border-amber-500/30 text-amber-500' 
                              : 'bg-indigo-950/20 border-indigo-500/30 text-indigo-400'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="p-3 font-serif font-bold text-text-main">{item.title}</td>
                        <td className="p-3 font-mono text-[10px]">{item.boardName}</td>
                        <td className="p-3 text-text-muted italic">{item.relatedTicket || '-'}</td>
                        <td className="p-3 font-mono text-[10px]">{item.status}</td>
                        <td className="p-3 font-mono text-[10px]">{item.dueDate}</td>
                      </tr>
                    ))}
                    {getMyTasks().length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-text-muted font-mono uppercase">
                          No tasks currently assigned to you.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PENDING APPROVALS */}
          {accountTab === 'approvals' && profile.role === 'Admin' && (
            <div className="space-y-4 pt-2">
              <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider">
                Pending Operator Registrations
              </span>
              
              <div className="border border-border-color rounded-3xl overflow-hidden bg-background">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-surface border-b border-border-color font-mono text-[10px] text-text-muted uppercase">
                      <th className="p-3">Operator Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color/40 dark:divide-zinc-700/80">
                    {pendingUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-surface/50 transition-colors">
                        <td className="p-3 font-serif font-bold text-text-main">{u.name}</td>
                        <td className="p-3 font-mono text-[10px] text-text-muted">{u.email}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleApproveUser(u.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectUser(u.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pendingUsers.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-text-muted font-mono uppercase col-span-3">
                          No pending approvals.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
