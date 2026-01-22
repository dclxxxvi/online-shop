import React from 'react';
import { useEditorStore, blockNames } from '@entities/block';
import { Input, Button, Label, Checkbox } from '@shop-builder/shared';

export const PropertiesPanel: React.FC = () => {
  const { blocks, selectedBlockId, updateBlock, deleteBlock } = useEditorStore();
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  if (!selectedBlock) {
    return (
      <aside className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-400 py-12">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
          <p className="text-sm">Выберите блок для редактирования</p>
        </div>
      </aside>
    );
  }

  const handlePropChange = (key: string, value: unknown) => {
    updateBlock(selectedBlock.id, {
      props: { ...selectedBlock.props, [key]: value },
    });
  };

  return (
    <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">{blockNames[selectedBlock.type]}</h2>
        <p className="text-sm text-gray-500">Настройки блока</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Render props based on block type */}
        <PropsEditor block={selectedBlock} onPropChange={handlePropChange} />

        {/* Style Settings */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Отступы</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="paddingTop">Сверху</Label>
              <Input
                id="paddingTop"
                type="number"
                value={(selectedBlock.styles.desktop.paddingTop as string) || '0'}
                onChange={(e) =>
                  updateBlock(selectedBlock.id, {
                    styles: {
                      ...selectedBlock.styles,
                      desktop: { ...selectedBlock.styles.desktop, paddingTop: `${e.target.value}px` },
                    },
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="paddingBottom">Снизу</Label>
              <Input
                id="paddingBottom"
                type="number"
                value={(selectedBlock.styles.desktop.paddingBottom as string) || '0'}
                onChange={(e) =>
                  updateBlock(selectedBlock.id, {
                    styles: {
                      ...selectedBlock.styles,
                      desktop: { ...selectedBlock.styles.desktop, paddingBottom: `${e.target.value}px` },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Delete Block */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => deleteBlock(selectedBlock.id)}
          >
            Удалить блок
          </Button>
        </div>
      </div>
    </aside>
  );
};

// Props editor component
interface PropsEditorProps {
  block: ReturnType<typeof useEditorStore.getState>['blocks'][0];
  onPropChange: (key: string, value: unknown) => void;
}

const PropsEditor: React.FC<PropsEditorProps> = ({ block, onPropChange }) => {
  const { type, props } = block;

  switch (type) {
    case 'header':
      return (
        <>
          <div className="space-y-1">
            <Label htmlFor="logo">Логотип</Label>
            <Input
              id="logo"
              value={(props.logo as string) || ''}
              onChange={(e) => onPropChange('logo', e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="showCart"
              checked={(props.showCart as boolean) || false}
              onCheckedChange={(checked) => onPropChange('showCart', checked)}
            />
            <Label htmlFor="showCart">Показывать корзину</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="showSearch"
              checked={(props.showSearch as boolean) || false}
              onCheckedChange={(checked) => onPropChange('showSearch', checked)}
            />
            <Label htmlFor="showSearch">Показывать поиск</Label>
          </div>
        </>
      );

    case 'hero':
      return (
        <>
          <div className="space-y-1">
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              value={(props.title as string) || ''}
              onChange={(e) => onPropChange('title', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="subtitle">Подзаголовок</Label>
            <Input
              id="subtitle"
              value={(props.subtitle as string) || ''}
              onChange={(e) => onPropChange('subtitle', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="buttonText">Текст кнопки</Label>
            <Input
              id="buttonText"
              value={(props.buttonText as string) || ''}
              onChange={(e) => onPropChange('buttonText', e.target.value)}
            />
          </div>
        </>
      );

    case 'text':
      return (
        <div className="space-y-1">
          <Label htmlFor="content">Текст</Label>
          <textarea
            id="content"
            className="w-full h-32 px-3 py-2 border border-input rounded-md bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={(props.content as string) || ''}
            onChange={(e) => onPropChange('content', e.target.value)}
          />
        </div>
      );

    case 'product-grid':
      return (
        <>
          <div className="space-y-1">
            <Label htmlFor="columns">Колонок</Label>
            <Input
              id="columns"
              type="number"
              min={1}
              max={6}
              value={(props.columns as number) || 4}
              onChange={(e) => onPropChange('columns', parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="limit">Количество товаров</Label>
            <Input
              id="limit"
              type="number"
              min={1}
              max={20}
              value={(props.limit as number) || 8}
              onChange={(e) => onPropChange('limit', parseInt(e.target.value))}
            />
          </div>
        </>
      );

    case 'footer':
      return (
        <div className="space-y-1">
          <Label htmlFor="copyright">Копирайт</Label>
          <Input
            id="copyright"
            value={(props.copyright as string) || ''}
            onChange={(e) => onPropChange('copyright', e.target.value)}
          />
        </div>
      );

    default:
      return (
        <p className="text-sm text-gray-500">
          Нет доступных настроек для этого блока
        </p>
      );
  }
};
