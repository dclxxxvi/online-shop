import React from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, DragOverlay, closestCenter, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { EditorCanvas } from '@widgets/editor-canvas';
import { BlocksPanel } from '@widgets/blocks-panel';
import { PropertiesPanel } from '@widgets/properties-panel';
import { useEditorStore } from '@entities/block/model/editorStore';
import { BlockPreview } from '@entities/block/ui/BlockPreview';

export const App: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { activeBlock, setActiveBlock, addBlock, moveBlock } = useEditorStore();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type) {
      setActiveBlock({
        id: active.id as string,
        type: active.data.current.type,
        isNew: active.data.current.isNew || false,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBlock(null);

    if (!over) return;

    const activeData = active.data.current;

    if (activeData?.isNew && over.id === 'canvas') {
      // Adding new block from panel
      addBlock(activeData.type, activeData.defaultProps || {});
    } else if (!activeData?.isNew && active.id !== over.id) {
      // Reordering existing blocks
      moveBlock(active.id as string, over.id as string);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Editor Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            <h1 className="text-lg font-semibold">Редактор магазина</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              Предпросмотр
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Сохранить
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Опубликовать
            </button>
          </div>
        </header>

        {/* Editor Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Blocks Panel */}
          <BlocksPanel />

          {/* Canvas */}
          <EditorCanvas />

          {/* Properties Panel */}
          <PropertiesPanel />
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeBlock ? (
          <div className="drag-overlay">
            <BlockPreview type={activeBlock.type} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default App;