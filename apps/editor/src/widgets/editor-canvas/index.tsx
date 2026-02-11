import React, { useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEditorStore } from '@entities/block';
import { SortableBlock } from './SortableBlock';

export const EditorCanvas: React.FC = () => {
  const { blocks, selectedBlockId, selectBlock, clearSelection } = useEditorStore();
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  // Escape to deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedBlockId) {
        clearSelection();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, clearSelection]);

  const handleCanvasClick = () => {
    clearSelection();
  };

  return (
    <main
      ref={setNodeRef}
      onClick={handleCanvasClick}
      className={`flex-1 overflow-auto transition-all duration-300 ${
        isOver ? 'bg-emerald-50/50' : 'bg-white'
      }`}
    >
      {blocks.length === 0 ? (
        <div
          className={`h-full min-h-[600px] flex items-center justify-center p-12 transition-all duration-300 ${
            isOver ? 'text-emerald-500' : 'text-gray-400'
          }`}
        >
          <div
            className={`text-center p-8 rounded-2xl border-2 border-dashed transition-all duration-300 ${
              isOver
                ? 'border-emerald-400 bg-emerald-100/50 scale-105'
                : 'border-gray-300'
            }`}
          >
            <div
              className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                isOver ? 'bg-emerald-200 text-emerald-600' : 'bg-gray-100'
              }`}
            >
              <svg
                className={`w-10 h-10 transition-transform duration-300 ${isOver ? 'scale-110' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold mb-1">
              {isOver ? 'Отпустите, чтобы добавить' : 'Перетащите блоки сюда'}
            </p>
            <p className="text-sm opacity-70">
              {isOver ? 'Блок будет добавлен на страницу' : 'или выберите шаблон для быстрого старта'}
            </p>
          </div>
        </div>
      ) : (
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-full" onClick={handleCanvasClick}>
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                onSelect={() => selectBlock(block.id)}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </main>
  );
};
