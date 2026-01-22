import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Block, BlockType } from '@shop-builder/shared';
import { useStoreData } from '@entities/store/model/storeDataStore';
import { useCartStore } from '@entities/cart/model/cartStore';
import { Spinner } from '@shop-builder/shared';

// Block renderers
import { HeaderBlock } from '@widgets/header';
import { FooterBlock } from '@widgets/footer';
import { ProductGridBlock } from '@widgets/product-grid';
import { CartWidget } from '@widgets/cart';

export const App: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { store, page, isLoading, error, fetchStoreData } = useStoreData();

  useEffect(() => {
    if (storeId) {
      fetchStoreData(storeId);
    }
  }, [storeId, fetchStoreData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !store || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Магазин не найден</h1>
          <p className="text-gray-600">{error || 'Проверьте правильность адреса'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={getThemeStyles(store.theme)}>
      {page.blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} store={store} />
      ))}
    </div>
  );
};

// Theme styles helper
const getThemeStyles = (theme: any): React.CSSProperties => ({
  '--primary-color': theme?.primaryColor || '#3b82f6',
  '--secondary-color': theme?.secondaryColor || '#64748b',
  '--background-color': theme?.backgroundColor || '#ffffff',
  '--text-color': theme?.textColor || '#1f2937',
  fontFamily: theme?.fontFamily || 'inherit',
} as React.CSSProperties);

// Block renderer component
interface BlockRendererProps {
  block: Block;
  store: any;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, store }) => {
  const { type, props, styles } = block;
  const blockStyle = styles.desktop || {};

  const renderBlock = () => {
    switch (type) {
      case 'header':
        return <HeaderBlock props={props} store={store} />;

      case 'footer':
        return <FooterBlock props={props} />;

      case 'hero':
        return (
          <section
            className="py-20 px-4 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            style={{
              backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {(props.title as string) || 'Добро пожаловать'}
              </h1>
              <p className="text-xl mb-8 opacity-90">
                {(props.subtitle as string) || 'В наш магазин'}
              </p>
              {props.buttonText && (
                <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                  {props.buttonText as string}
                </button>
              )}
            </div>
          </section>
        );

      case 'product-grid':
        return <ProductGridBlock props={props} storeId={store.id} />;

      case 'cart':
        return <CartWidget />;

      case 'text':
        return (
          <section className="py-8 px-4">
            <div
              className="max-w-4xl mx-auto prose"
              style={{ textAlign: (props.alignment as string) || 'left' }}
            >
              <p>{(props.content as string) || ''}</p>
            </div>
          </section>
        );

      case 'categories':
        return (
          <section className="py-12 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">Категории</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Placeholder categories */}
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-6 bg-gray-100 rounded-lg text-center hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3" />
                    <span className="font-medium">Категория {i}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'contacts':
        return (
          <section className="py-12 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-8">Контакты</h2>
              <div className="space-y-4">
                {props.email && <p>Email: {props.email as string}</p>}
                {props.phone && <p>Телефон: {props.phone as string}</p>}
                {props.address && <p>Адрес: {props.address as string}</p>}
              </div>
            </div>
          </section>
        );

      default:
        return (
          <section className="py-8 px-4">
            <div className="max-w-6xl mx-auto text-center text-gray-400">
              <p>Блок: {type}</p>
            </div>
          </section>
        );
    }
  };

  return <div style={blockStyle}>{renderBlock()}</div>;
};

export default App;
