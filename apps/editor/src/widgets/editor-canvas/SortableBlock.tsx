import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Block } from '@shop-builder/shared';
import { useEditorStore, blockIcons, blockNames } from '@entities/block';

interface SortableBlockProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
}

export const SortableBlock: React.FC<SortableBlockProps> = ({ block, isSelected, onSelect }) => {
  const { deleteBlock, duplicateBlock } = useEditorStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: {
      type: block.type,
      isNew: false,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBlock(block.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateBlock(block.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`relative group border-2 rounded-lg transition-all ${
        isDragging ? 'opacity-50 z-50' : ''
      } ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-300'}`}
    >
      {/* Block Preview */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <BlockRenderer block={block} />
      </div>

      {/* Block Controls */}
      <div
        className={`absolute -top-3 left-4 flex items-center gap-1 ${
          isSelected || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        } transition-opacity`}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded shadow-sm cursor-grab"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
          <span className="text-xs font-medium text-gray-600">{blockNames[block.type]}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className={`absolute -top-3 right-4 flex items-center gap-1 ${
          isSelected || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        } transition-opacity`}
      >
        <button
          onClick={handleDuplicate}
          className="p-1 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50"
          title="Дублировать"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="p-1 bg-white border border-gray-200 rounded shadow-sm hover:bg-red-50 hover:border-red-200"
          title="Удалить"
        >
          <svg className="w-4 h-4 text-gray-500 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Simple block renderer for preview
const BlockRenderer: React.FC<{ block: Block }> = ({ block }) => {
  const { type, props } = block;

  switch (type) {
    case 'header':
      return (
        <div className="flex items-center justify-between p-4 bg-white">
          <div className="font-bold text-lg">{(props.logo as string) || 'Logo'}</div>
          <div className="flex gap-4">
            {((props.menuItems as string[]) || []).map((item, i) => (
              <span key={i} className="text-gray-600">{item}</span>
            ))}
          </div>
        </div>
      );

    case 'hero':
      return (
        <div className="p-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center rounded">
          <h2 className="text-2xl font-bold mb-2">{(props.title as string) || 'Заголовок'}</h2>
          <p className="mb-4">{(props.subtitle as string) || 'Подзаголовок'}</p>
          <button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium">
            {(props.buttonText as string) || 'Кнопка'}
          </button>
        </div>
      );

    case 'product-grid':
      return (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-white border rounded">
              <div className="w-full h-24 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      );

    case 'text':
      return (
        <div className="p-4">
          <p>{(props.content as string) || 'Текстовый блок'}</p>
        </div>
      );

    case 'footer':
      return (
        <div className="p-6 bg-gray-800 text-white text-center">
          <p>{(props.copyright as string) || '© 2024 Shop Name'}</p>
        </div>
      );

    default:
      return (
        <div className="p-8 flex items-center justify-center text-gray-400">
          <div className="text-center">
            {blockIcons[type]}
            <p className="mt-2">{blockNames[type]}</p>
          </div>
        </div>
      );
  }
};
