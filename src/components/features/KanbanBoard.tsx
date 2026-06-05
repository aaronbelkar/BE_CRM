'use client';

import { useState, useEffect } from 'react';
import { KanbanCard } from '../../lib/mockData';

interface KanbanBoardProps {
  boardName: string;
  columns: string[];
  initialCards: KanbanCard[];
}

export function KanbanBoard({ boardName, columns, initialCards }: KanbanBoardProps) {
  const [cards, setCards] = useState<KanbanCard[]>(initialCards);

  // Sync state when initialCards changes (board switched)
  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

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
        <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
          board.{boardName.toLowerCase()}_workspace
        </h2>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
          total_items: {cards.length}
        </span>
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
                      className="bg-[#1a1a1b] border border-zinc-800 hover:border-zinc-700 rounded-md p-3 space-y-2 transition-all"
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

                      {/* Card Actions */}
                      <div className="flex justify-end items-center gap-1.5 pt-2 border-t border-zinc-800/50">
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
    </div>
  );
}
