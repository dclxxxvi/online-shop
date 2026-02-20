import React, { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Block, Product, PaginatedResponse, apiClient, formatPrice, getResizedImageUrl } from '@shop-builder/shared';
import { useEditorStore, blockIcons, blockNames } from '@entities/block';

interface SortableBlockProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
}

export const SortableBlock: React.FC<SortableBlockProps> = ({ block, isSelected, onSelect }) => {
  const { deleteBlock, duplicateBlock } = useEditorStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id: block.id,
    data: {
      type: block.type,
      isNew: false,
    },
  });

  const desktopStyles = block.styles?.desktop || {};
  const { marginTop, marginRight, marginBottom, marginLeft, ...contentStyles } = desktopStyles as React.CSSProperties;
  const marginStyle: React.CSSProperties = { marginTop, marginRight, marginBottom, marginLeft };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    ...marginStyle,
  };

  const handleBlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
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
      style={{ ...style, zIndex: isSelected ? 10 : isDragging ? 30 : undefined }}
      onClick={handleBlockClick}
      onMouseEnter={(e) => (e.currentTarget.style.zIndex = '30')}
      onMouseLeave={(e) => (e.currentTarget.style.zIndex = isSelected ? '10' : '')}
      className={`relative group transition-all duration-200 ${
        isDragging ? 'opacity-40 scale-[0.98]' : ''
      } ${isOver && !isDragging ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}
    >
      {/* Drop indicator line */}
      {isOver && !isDragging && (
        <div className="absolute -top-1 left-0 right-0 h-1 bg-emerald-500 rounded-full animate-pulse" />
      )}

      {/* Block container */}
      <div
        className={`relative border-solid transition-all duration-150 ${
          isSelected
            ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-500/20'
            : 'border border-gray-300 hover:border-gray-400'
        }`}
      >
        {/* Block Preview */}
        <div className="bg-white overflow-hidden" style={contentStyles}>
          <BlockRenderer block={block} />
        </div>

        {/* Block Controls */}
        <div
          className={`absolute -top-4 left-4 z-20 flex items-center gap-2 transition-all duration-200 ${
            isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
        >
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-md cursor-grab active:cursor-grabbing hover:border-emerald-400 hover:shadow-lg transition-all"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
            <span className="text-sm font-medium text-gray-700">{blockNames[block.type]}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`absolute -top-4 right-4 z-20 flex items-center gap-2 transition-all duration-200 ${
            isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
        >
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-lg transition-all"
            title="Дублировать"
          >
            <svg className="w-5 h-5 text-gray-500 group-hover:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-600">Копировать</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-red-50 hover:border-red-400 hover:shadow-lg transition-all"
            title="Удалить"
          >
            <svg className="w-5 h-5 text-gray-500 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="text-sm font-medium text-gray-600">Удалить</span>
          </button>
        </div>
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
        <div className="p-12 bg-gradient-to-r from-emerald-500 to-purple-600 text-white text-center rounded">
          <h2 className="text-2xl font-bold mb-2">{(props.title as string) || 'Заголовок'}</h2>
          <p className="mb-4">{(props.subtitle as string) || 'Подзаголовок'}</p>
          <button className="px-6 py-2 bg-white text-emerald-600 rounded-lg font-medium">
            {(props.buttonText as string) || 'Кнопка'}
          </button>
        </div>
      );

    case 'product-card':
      return <ProductCardPreview props={props} />;

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

// Product card preview that fetches real product data
const ProductCardPreview: React.FC<{ props: Record<string, unknown> }> = ({ props }) => {
  const { storeId } = useEditorStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const productId = props.productId as string | null;
  const showPrice = props.showPrice !== false;
  const showRating = props.showRating !== false;
  const showAddToCart = props.showAddToCart !== false;

  useEffect(() => {
    if (!storeId) {
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        if (productId) {
          const response = await apiClient.get<Product>(`/stores/${storeId}/products/${productId}`);
          setProduct(response);
        } else {
          const response = await apiClient.get<PaginatedResponse<Product>>(
            `/stores/${storeId}/products`,
            { limit: 1 }
          );
          setProduct(response.data[0] || null);
        }
      } catch (err) {
        console.error('Failed to load product for preview:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [storeId, productId]);

  if (isLoading) {
    return (
      <div className="max-w-xs mx-auto bg-white border rounded-lg overflow-hidden shadow-sm animate-pulse">
        <div className="w-full h-48 bg-gray-200" />
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-full mb-1" />
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="h-9 bg-gray-200 rounded w-full" />
        </div>
      </div>
    );
  }

  const name = product?.name || 'Название товара';
  const description = product?.description || 'Описание товара будет здесь';
  const price = product ? formatPrice(product.price) : '1 990 ₽';
  const imageUrl = product?.images?.[0];

  return (
    <div className="max-w-xs mx-auto bg-white border rounded-lg overflow-hidden shadow-sm">
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={getResizedImageUrl(imageUrl, 400)}
            alt={name}
            loading="lazy"
            decoding="async"
            onLoad={(e) => e.currentTarget.classList.add('loaded')}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{description}</p>
        {showPrice && (
          <p className="text-lg font-bold text-emerald-600 mb-2">{price}</p>
        )}
        {showRating && (
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}
        {showAddToCart && (
          <button className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
            В корзину
          </button>
        )}
      </div>
    </div>
  );
};
