import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEditorStore } from '@entities/block';
import { SortableBlock } from './SortableBlock';

export const EditorCanvas: React.FC = () => {
  const { blocks, selectedBlockId, selectBlock, clearSelection } = useEditorStore();
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  };

  return (
    <main className="flex-1 overflow-auto bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div
          ref={setNodeRef}
          onClick={handleCanvasClick}
          className={`min-h-[600px] bg-white rounded-lg shadow-sm border-2 transition-colors ${
            isOver ? 'border-blue-400 border-dashed' : 'border-transparent'
          }`}
        >
          {blocks.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 p-12">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4"
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
                <p className="text-lg font-medium">Перетащите блоки сюда</p>
                <p className="text-sm mt-1">или выберите шаблон для быстрого старта</p>
              </div>
            </div>
          ) : (
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="p-4 space-y-4">
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
        </div>
      </div>
    </main>
  );
};
