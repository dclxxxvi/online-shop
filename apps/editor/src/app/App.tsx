import React, { useEffect, useCallback, useMemo } from 'react';
import { DndContext, DragOverlay, closestCenter, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { EditorCanvas } from '@widgets/editor-canvas';
import { BlocksPanel } from '@widgets/blocks-panel';
import { PropertiesPanel } from '@widgets/properties-panel';
import { useEditorStore } from '@entities/block/model/editorStore';
import { BlockPreview } from '@entities/block/ui/BlockPreview';
import { Toaster, useToast, Spinner } from '@shop-builder/shared';

// Extract storeId from URL path (e.g., /editor/abc123 -> abc123)
const getStoreIdFromPath = (): string | null => {
  const path = window.location.pathname;
  const match = path.match(/\/editor\/([^/]+)/);
  return match ? match[1] : null;
};

export const App: React.FC = () => {
  const storeId = useMemo(() => getStoreIdFromPath(), []);
  const { toast } = useToast();
  const {
    activeBlock,
    setActiveBlock,
    addBlock,
    moveBlock,
    setStoreId,
    loadPage,
    savePage,
    publishStore,
    store,
    isDirty,
    isLoading,
    isSaving,
    isPublishing,
    error,
  } = useEditorStore();

  // Load page on mount
  useEffect(() => {
    if (storeId) {
      setStoreId(storeId);
      loadPage();
    }
  }, [storeId, setStoreId, loadPage]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({ title: 'Ошибка', description: error, variant: 'destructive' });
    }
  }, [error, toast]);

  const handleSave = useCallback(async () => {
    const success = await savePage();
    if (success) {
      toast({ title: 'Сохранено', description: 'Страница успешно сохранена' });
    }
  }, [savePage, toast]);

  const handlePublish = useCallback(async () => {
    // Save first if dirty
    if (isDirty) {
      const saved = await savePage();
      if (!saved) return;
    }
    const store = await publishStore();
    if (store) {
      const publicUrl = `${store.subdomain}.shopbuilder.com`;
      toast({
        title: 'Магазин опубликован!',
        description: (
          <div className="mt-1">
            <p className="mb-2">Ваш магазин доступен по адресу:</p>
            <a
              href={`/preview/${store.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              {publicUrl}
            </a>
          </div>
        ),
      });
    }
  }, [isDirty, savePage, publishStore, toast]);

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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Загрузка редактора...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-lg font-semibold">{store?.name || 'Редактор магазина'}</h1>
            {store && (
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  store.isPublished
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {store.isPublished ? 'Опубликован' : 'Черновик'}
              </span>
            )}
            {isDirty && (
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                Несохранённые изменения
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(`/preview/${storeId}`, '_blank')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              Предпросмотр
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <Spinner size="sm" />}
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPublishing && <Spinner size="sm" />}
              {isPublishing ? 'Публикация...' : 'Опубликовать'}
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

      <Toaster />
    </DndContext>
  );
};

export default App;