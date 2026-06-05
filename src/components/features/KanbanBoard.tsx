'use client';

import { useState, useEffect, useRef } from 'react';
import { KanbanCard } from '../../lib/mockData';

interface KanbanBoardProps {
  boardName: string;
  columns: string[];
  initialCards: KanbanCard[];
}

export function KanbanBoard({ boardName, columns, initialCards }: KanbanBoardProps) {
  const [cards, setCards] = useState<KanbanCard[]>(initialCards);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState('');
  // Leads fields
  const [editContactName, setEditContactName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editValue, setEditValue] = useState('');
  // Deals & Tasks fields
  const [editDescription, setEditDescription] = useState('');
  // Installments fields
  const [editAmount, setEditAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  // Tasks fields
  const [editPriority, setEditPriority] = useState('');
  const [editAssignee, setEditAssignee] = useState('');

  // Refs for dialogs
  const detailDialogRef = useRef<HTMLDialogElement>(null);
  const createDialogRef = useRef<HTMLDialogElement>(null);

  // Sync state when initialCards changes (board switched)
  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  // Setup click listeners for dialog backdrop dismissals (light dismiss fallback)
  useEffect(() => {
    const handleBackdropClick = (dialog: HTMLDialogElement) => {
      return (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isInside = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isInside) {
          dialog.close();
        }
      };
    };

    const detailDialog = detailDialogRef.current;
    const createDialog = createDialogRef.current;

    if (detailDialog) {
      detailDialog.addEventListener('click', handleBackdropClick(detailDialog));
    }
    if (createDialog) {
      createDialog.addEventListener('click', handleBackdropClick(createDialog));
    }

    return () => {
      if (detailDialog) {
        detailDialog.removeEventListener('click', handleBackdropClick(detailDialog));
      }
      if (createDialog) {
        createDialog.removeEventListener('click', handleBackdropClick(createDialog));
      }
    };
  }, []);

  const openDetailModal = (card: KanbanCard) => {
    setSelectedCard(card);
    setEditTitle(card.title);
    setEditStatus(card.status);
    setEditContactName(card.contactName || '');
    setEditEmail(card.email || '');
    setEditValue(card.value || '');
    setEditDescription(card.description || '');
    setEditAmount(card.amount || '');
    setEditDueDate(card.dueDate || '');
    setEditPriority(card.priority || 'Medium');
    setEditAssignee(card.assignee || 'Operator');
    detailDialogRef.current?.showModal();
  };

  const openCreateModal = () => {
    setIsCreating(true);
    setEditTitle('');
    setEditStatus(columns[0]);
    setEditContactName('');
    setEditEmail('');
    setEditValue('');
    setEditDescription('');
    setEditAmount('');
    setEditDueDate('');
    setEditPriority('Medium');
    setEditAssignee('Operator');
    createDialogRef.current?.showModal();
  };

  const handleUpdate = () => {
    if (!selectedCard) return;

    // Build subtitle dynamically based on board requirements
    let subtitle = '';
    if (boardName === 'Leads') {
      subtitle = editContactName ? `Contact: ${editContactName}` : '';
    } else if (boardName === 'Deals') {
      subtitle = editValue ? `Value: ${editValue}` : '';
    } else if (boardName === 'Installments') {
      subtitle = editAmount ? `Amount: ${editAmount}` : '';
    } else if (boardName === 'Tasks') {
      subtitle = editPriority ? `Priority: ${editPriority}` : '';
    }

    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCard.id) return c;
        return {
          ...c,
          title: editTitle,
          status: editStatus,
          subtitle,
          contactName: editContactName,
          email: editEmail,
          value: editValue,
          description: editDescription,
          amount: editAmount,
          dueDate: editDueDate,
          priority: editPriority,
          assignee: editAssignee,
        };
      })
    );
    detailDialogRef.current?.close();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `${boardName.toLowerCase().charAt(0)}${Date.now().toString().slice(-6)}`;

    let subtitle = '';
    if (boardName === 'Leads') {
      subtitle = editContactName ? `Contact: ${editContactName}` : '';
    } else if (boardName === 'Deals') {
      subtitle = editValue ? `Value: ${editValue}` : '';
    } else if (boardName === 'Installments') {
      subtitle = editAmount ? `Amount: ${editAmount}` : '';
    } else if (boardName === 'Tasks') {
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
      description: editDescription,
      amount: editAmount,
      dueDate: editDueDate,
      priority: editPriority,
      assignee: editAssignee,
    };

    setCards((prev) => [...prev, newCard]);
    createDialogRef.current?.close();
  };

  const handleDelete = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    detailDialogRef.current?.close();
  };

  const moveCard = (cardId: string, direction: 'left' | 'right') => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;
        const currentIndex = columns.indexOf(card.status);
        if (currentIndex === -1) return card;

        const nextIndex = currentIndex + (direction === 'left' ? -1 : 1);
        if (nextIndex >= 0 && nextIndex < columns.length) {
          return { ...card, status: columns[nextIndex] };
        }
        return card;
      })
    );
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
            board.{boardName.toLowerCase()}_workspace
          </h2>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-zinc-800 text-zinc-400 border border-zinc-700 mt-1">
            total_items: {cards.length}
          </span>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold rounded font-mono transition-colors uppercase tracking-wider cursor-pointer"
        >
          + Create Ticket
        </button>
      </div>

      {/* Columns Grid - Horizontal Scrollable */}
      <div className="flex flex-row gap-4 overflow-x-auto pb-4 flex-1 items-start min-h-[500px]">
        {columns.map((column) => {
          const columnCards = cards.filter((c) => c.status === column);
          return (
            <div
              key={column}
              className="flex flex-col bg-[#25292d] border border-zinc-800 rounded-lg p-3 w-[280px] sm:w-[320px] flex-shrink-0"
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-800">
                <span className="text-sm font-semibold text-[#e5e7e9] tracking-tight">
                  {column}
                </span>
                <span className="text-xs font-mono text-zinc-500 bg-[#1a1a1b] px-1.5 py-0.5 rounded">
                  {columnCards.length}
                </span>
              </div>

              {/* Column Body */}
              <div className="space-y-3 min-h-[400px]">
                {columnCards.map((card) => {
                  const columnIndex = columns.indexOf(card.status);
                  const canMoveLeft = columnIndex > 0;
                  const canMoveRight = columnIndex < columns.length - 1;

                  return (
                    <div
                      key={card.id}
                      className="bg-[#1a1a1b] border border-zinc-800 hover:border-zinc-700 rounded-md p-3 space-y-2 transition-all flex flex-col justify-between"
                    >
                      <div
                        onClick={() => openDetailModal(card)}
                        className="cursor-pointer space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-zinc-500">{card.id}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-white tracking-tight leading-snug">
                          {card.title}
                        </h4>
                        {card.subtitle && (
                          <p className="text-xs text-[#e5e7e9] font-mono leading-relaxed">
                            {card.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="flex justify-between items-center gap-1.5 pt-2 mt-2 border-t border-zinc-800/50">
                        {/* Status Chevrons */}
                        <div className="flex gap-1">
                          {canMoveLeft && (
                            <button
                              onClick={() => moveCard(card.id, 'left')}
                              className="p-1 hover:bg-[#25292d] text-zinc-400 hover:text-white rounded border border-zinc-800 hover:border-zinc-700 text-[10px] font-mono transition-colors cursor-pointer"
                              title="Move Left"
                            >
                              &larr;
                            </button>
                          )}
                          {canMoveRight && (
                            <button
                              onClick={() => moveCard(card.id, 'right')}
                              className="p-1 hover:bg-[#25292d] text-zinc-400 hover:text-white rounded border border-zinc-800 hover:border-zinc-700 text-[10px] font-mono transition-colors cursor-pointer"
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
                            className="text-[10px] font-mono text-zinc-500 hover:text-[#e67e22] transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(card.id)}
                            className="text-[10px] font-mono text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {columnCards.length === 0 && (
                  <div className="flex items-center justify-center h-24 border border-dashed border-zinc-800 rounded-md text-xs font-mono text-zinc-600">
                    empty_bucket
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* DIALOG 1: TICKET DETAIL & EDITING MODAL                        */}
      {/* ============================================================== */}
      <dialog
        ref={detailDialogRef}
        className="bg-[#25292d] text-white p-6 rounded-lg border border-zinc-800 w-[95%] max-w-lg shadow-2xl backdrop:bg-black/60 backdrop:backdrop-filter backdrop:backdrop-blur-sm"
        aria-labelledby="detailTitle"
      >
        {selectedCard && (
          <div className="space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-zinc-800">
              <div>
                <h3 id="detailTitle" className="text-lg font-bold tracking-tight text-[#e67e22]">
                  {selectedCard.id} // TICKET_DETAILS
                </h3>
                <p className="text-[10px] font-mono text-zinc-500">entity_type: {boardName.toLowerCase()}</p>
              </div>
              <button
                onClick={() => detailDialogRef.current?.close()}
                className="text-zinc-500 hover:text-white font-mono text-xs uppercase cursor-pointer"
              >
                [close]
              </button>
            </div>

            <div className="space-y-4">
              {/* Common Title Field */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  {boardName === 'Leads' ? 'Company Name' : 'Title'}
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] font-semibold"
                />
              </div>

              {/* Dynamic inputs based on active board Name */}
              {boardName === 'Leads' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Contact Name</label>
                      <input
                        type="text"
                        value={editContactName}
                        onChange={(e) => setEditContactName(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Lead Value</label>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] font-mono"
                        placeholder="$10,000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22]"
                    />
                  </div>
                </>
              )}

              {boardName === 'Deals' && (
                <>
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Deal Value</label>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] font-mono"
                      placeholder="$120,000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Description / Notes</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] resize-none"
                    />
                  </div>
                </>
              )}

              {boardName === 'Installments' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Installment Amount</label>
                      <input
                        type="text"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] font-mono"
                        placeholder="$25,000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Due Date</label>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {boardName === 'Tasks' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Priority</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22]"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Assignee</label>
                      <select
                        value={editAssignee}
                        onChange={(e) => setEditAssignee(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22]"
                      >
                        <option value="Operator">Operator</option>
                        <option value="Agent Chuck">Agent Chuck</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Task Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] resize-none"
                    />
                  </div>
                </>
              )}

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Change Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] font-mono"
                >
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
              <button
                onClick={() => handleDelete(selectedCard.id)}
                className="px-3 py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-semibold rounded font-mono transition-colors uppercase tracking-wider cursor-pointer"
              >
                Delete Ticket
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => detailDialogRef.current?.close()}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold rounded font-mono transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold rounded font-mono transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Save Changes
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
        className="bg-[#25292d] text-white p-6 rounded-lg border border-zinc-800 w-[95%] max-w-lg shadow-2xl backdrop:bg-black/60 backdrop:backdrop-filter backdrop:backdrop-blur-sm"
        aria-labelledby="createTitle"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="flex justify-between items-start pb-3 border-b border-zinc-800">
            <div>
              <h3 id="createTitle" className="text-lg font-bold tracking-tight text-[#e67e22]">
                NEW_TICKET // CREATE_WORKSPACE
              </h3>
              <p className="text-[10px] font-mono text-zinc-500">target_entity: {boardName.toLowerCase()}</p>
            </div>
            <button
              type="button"
              onClick={() => createDialogRef.current?.close()}
              className="text-zinc-500 hover:text-white font-mono text-xs uppercase cursor-pointer"
            >
              [close]
            </button>
          </div>

          <div className="space-y-4">
            {/* Common Title Input */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                {boardName === 'Leads' ? 'Company Name' : 'Title'}
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22]"
                placeholder={boardName === 'Leads' ? 'Acme Corp' : 'My New Task'}
              />
            </div>

            {/* Dynamic creation forms */}
            {boardName === 'Leads' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={editContactName}
                      onChange={(e) => setEditContactName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22]"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Value Estimate</label>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] font-mono"
                      placeholder="$15,000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22]"
                    placeholder="jane@corp.com"
                  />
                </div>
              </>
            )}

            {boardName === 'Deals' && (
              <>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Deal Value</label>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] font-mono"
                    placeholder="$150,000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Description / Notes</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] resize-none"
                    placeholder="Provide details about the deal scale and goals..."
                  />
                </div>
              </>
            )}

            {boardName === 'Installments' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Amount</label>
                    <input
                      type="text"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] font-mono"
                      placeholder="$10,000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Due Date</label>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            {boardName === 'Tasks' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Priority</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Assignee</label>
                    <select
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22]"
                    >
                      <option value="Operator">Operator</option>
                      <option value="Agent Chuck">Agent Chuck</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Task Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] resize-none"
                    placeholder="Enter task goals and constraints..."
                  />
                </div>
              </>
            )}

            {/* Status input */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Initial Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] font-mono"
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
          <div className="flex justify-end items-center gap-2 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => createDialogRef.current?.close()}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold rounded font-mono transition-colors uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold rounded font-mono transition-colors uppercase tracking-wider cursor-pointer"
            >
              Create Ticket
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
