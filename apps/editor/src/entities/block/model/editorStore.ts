import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Block, BlockType, generateId } from '@shop-builder/shared';

interface ActiveBlock {
  id: string;
  type: BlockType;
  isNew: boolean;
}

interface EditorState {
  blocks: Block[];
  selectedBlockId: string | null;
  activeBlock: ActiveBlock | null;
  isDirty: boolean;

  // Actions
  setActiveBlock: (block: ActiveBlock | null) => void;
  selectBlock: (id: string | null) => void;
  addBlock: (type: BlockType, props?: Record<string, unknown>) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  moveBlock: (activeId: string, overId: string) => void;
  duplicateBlock: (id: string) => void;
  setBlocks: (blocks: Block[]) => void;
  clearSelection: () => void;
}

const getDefaultPropsForType = (type: BlockType): Record<string, unknown> => {
  const defaults: Record<BlockType, Record<string, unknown>> = {
    header: {
      logo: 'Shop Name',
      menuItems: ['Главная', 'Каталог', 'О нас', 'Контакты'],
      showCart: true,
      showSearch: true,
    },
    footer: {
      copyright: '© 2024 Shop Name',
      links: ['Политика конфиденциальности', 'Условия использования'],
      socialLinks: [],
    },
    hero: {
      title: 'Добро пожаловать в наш магазин',
      subtitle: 'Лучшие товары по лучшим ценам',
      buttonText: 'Смотреть каталог',
      backgroundImage: '',
    },
    'product-card': {
      productId: null,
      showPrice: true,
      showRating: true,
      showAddToCart: true,
    },
    'product-grid': {
      columns: 4,
      categoryId: null,
      limit: 8,
      showPagination: true,
    },
    'product-carousel': {
      categoryId: null,
      limit: 10,
      autoplay: true,
      interval: 5000,
    },
    cart: {
      showTotal: true,
      showCheckoutButton: true,
    },
    checkout: {
      steps: ['Корзина', 'Доставка', 'Оплата', 'Подтверждение'],
    },
    text: {
      content: 'Введите текст...',
      alignment: 'left',
    },
    image: {
      src: '',
      alt: '',
      objectFit: 'cover',
    },
    gallery: {
      images: [],
      columns: 3,
    },
    categories: {
      displayType: 'grid',
      showCount: true,
    },
    search: {
      placeholder: 'Поиск товаров...',
      showFilters: false,
    },
    contacts: {
      email: 'info@example.com',
      phone: '+7 (999) 123-45-67',
      address: '',
      showMap: false,
    },
    map: {
      latitude: 55.7558,
      longitude: 37.6173,
      zoom: 12,
    },
    'social-links': {
      links: [],
      style: 'icons',
    },
    reviews: {
      productId: null,
      limit: 5,
    },
    faq: {
      items: [
        { question: 'Как сделать заказ?', answer: 'Ответ...' },
        { question: 'Как оплатить?', answer: 'Ответ...' },
      ],
    },
  };

  return defaults[type] || {};
};

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    blocks: [],
    selectedBlockId: null,
    activeBlock: null,
    isDirty: false,

    setActiveBlock: (block) =>
      set((state) => {
        state.activeBlock = block;
      }),

    selectBlock: (id) =>
      set((state) => {
        state.selectedBlockId = id;
      }),

    addBlock: (type, props = {}) =>
      set((state) => {
        const defaultProps = getDefaultPropsForType(type);
        const newBlock: Block = {
          id: generateId(),
          type,
          props: { ...defaultProps, ...props },
          styles: {
            desktop: {},
          },
          order: state.blocks.length,
        };
        state.blocks.push(newBlock);
        state.selectedBlockId = newBlock.id;
        state.isDirty = true;
      }),

    updateBlock: (id, updates) =>
      set((state) => {
        const index = state.blocks.findIndex((b) => b.id === id);
        if (index !== -1) {
          state.blocks[index] = { ...state.blocks[index], ...updates };
          state.isDirty = true;
        }
      }),

    deleteBlock: (id) =>
      set((state) => {
        state.blocks = state.blocks.filter((b) => b.id !== id);
        if (state.selectedBlockId === id) {
          state.selectedBlockId = null;
        }
        state.isDirty = true;
      }),

    moveBlock: (activeId, overId) =>
      set((state) => {
        const activeIndex = state.blocks.findIndex((b) => b.id === activeId);
        const overIndex = state.blocks.findIndex((b) => b.id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
          const [removed] = state.blocks.splice(activeIndex, 1);
          state.blocks.splice(overIndex, 0, removed);

          // Update order
          state.blocks.forEach((block, index) => {
            block.order = index;
          });
          state.isDirty = true;
        }
      }),

    duplicateBlock: (id) =>
      set((state) => {
        const block = state.blocks.find((b) => b.id === id);
        if (block) {
          const index = state.blocks.findIndex((b) => b.id === id);
          const newBlock: Block = {
            ...JSON.parse(JSON.stringify(block)),
            id: generateId(),
            order: index + 1,
          };
          state.blocks.splice(index + 1, 0, newBlock);
          state.blocks.forEach((b, i) => (b.order = i));
          state.selectedBlockId = newBlock.id;
          state.isDirty = true;
        }
      }),

    setBlocks: (blocks) =>
      set((state) => {
        state.blocks = blocks;
        state.isDirty = false;
      }),

    clearSelection: () =>
      set((state) => {
        state.selectedBlockId = null;
      }),
  }))
);