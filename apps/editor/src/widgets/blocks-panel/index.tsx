import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { BlockType } from '@shop-builder/shared';
import { blockIcons, blockNames } from '@entities/block';

interface DraggableBlockProps {
  type: BlockType;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ type }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${type}`,
    data: {
      type,
      isNew: true,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-grab
        hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/50
        active:scale-95 active:cursor-grabbing
        transition-all duration-200 ${
        isDragging ? 'opacity-30 scale-95' : ''
      }`}
    >
      <div className={`p-2 rounded-lg transition-colors duration-200 ${
        isDragging ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600'
      }`}>
        {blockIcons[type]}
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{blockNames[type]}</span>
      <svg
        className="w-4 h-4 ml-auto text-gray-300 group-hover:text-emerald-400 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
      </svg>
    </div>
  );
};

const blockCategories: { name: string; blocks: BlockType[] }[] = [
  {
    name: 'Структура',
    blocks: ['header', 'footer', 'hero'],
  },
  {
    name: 'Товары',
    blocks: ['product-card', 'product-grid', 'product-carousel', 'categories'],
  },
  {
    name: 'Покупки',
    blocks: ['cart', 'checkout', 'search'],
  },
  {
    name: 'Контент',
    blocks: ['text', 'image', 'gallery', 'faq'],
  },
  {
    name: 'Контакты',
    blocks: ['contacts', 'map', 'social-links', 'reviews'],
  },
];

export const BlocksPanel: React.FC = () => {
  return (
    <aside className="w-72 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
          Блоки
        </h2>

        <div className="space-y-6">
          {blockCategories.map((category) => (
            <div key={category.name}>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                {category.name}
              </h3>
              <div className="space-y-2">
                {category.blocks.map((blockType) => (
                  <DraggableBlock key={blockType} type={blockType} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
