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
      className={`flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-300 hover:shadow-sm transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="text-gray-500">{blockIcons[type]}</div>
      <span className="text-sm font-medium text-gray-700">{blockNames[type]}</span>
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
