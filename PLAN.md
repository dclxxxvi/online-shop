# План разработки платформы конструктора интернет-магазинов

## Обзор проекта

Платформа для создания интернет-магазинов с drag-and-drop редактором, шаблонами и автоматическим деплоем.

**Технологический стек:**
- Frontend: React 18 + TypeScript
- Backend: NestJS + TypeScript
- Database: PostgreSQL + Prisma ORM
- DnD: @dnd-kit
- Архитектура: Webpack Module Federation + Feature Sliced Design

---

## Архитектура Module Federation

Проект разделён на микрофронтенды для независимой разработки и деплоя:

```
┌─────────────────────────────────────────────────────────────┐
│                      HOST (Shell App)                        │
│                    порт 3000                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Header    │  │  Sidebar    │  │    Router/Layout    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                  │                    │
         ▼                  ▼                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐
│   EDITOR    │    │  STOREFRONT │    │       SHARED        │
│  Remote App │    │  Remote App │    │   (компоненты)      │
│  порт 3001  │    │  порт 3002  │    │     порт 3003       │
└─────────────┘    └─────────────┘    └─────────────────────┘
```

### Приложения:

1. **apps/host** - Shell приложение (точка входа)
   - Авторизация/регистрация
   - Навигация между редактором и витринами
   - Управление магазинами пользователя

2. **apps/editor** - Редактор магазинов
   - Drag-and-drop редактор страниц
   - Панель блоков (товары, корзина, header, footer и т.д.)
   - Предпросмотр
   - Настройки магазина

3. **apps/storefront** - Витрина магазина (публичная часть)
   - Рендеринг страниц по конфигурации
   - Каталог товаров
   - Корзина и checkout
   - Динамическая тема

4. **packages/shared** - Общие компоненты и утилиты
   - UI Kit (кнопки, формы, модалки)
   - Типы TypeScript
   - Утилиты
   - API клиент

5. **apps/backend** - NestJS API
   - REST API
   - Аутентификация JWT
   - Управление магазинами, товарами, заказами

---

## Структура Feature Sliced Design

Каждое frontend приложение следует FSD:

```
apps/editor/src/
├── app/                    # Инициализация приложения
│   ├── providers/          # React провайдеры (Router, Store, Theme)
│   ├── styles/             # Глобальные стили
│   └── index.tsx           # Entry point
│
├── pages/                  # Страницы
│   ├── editor-page/        # Страница редактора
│   ├── templates-page/     # Выбор шаблонов
│   └── settings-page/      # Настройки магазина
│
├── widgets/                # Композиционные блоки страниц
│   ├── editor-canvas/      # Холст редактора
│   ├── blocks-panel/       # Панель доступных блоков
│   ├── properties-panel/   # Панель свойств выбранного блока
│   └── preview-panel/      # Предпросмотр
│
├── features/               # Пользовательские сценарии
│   ├── drag-block/         # Перетаскивание блоков
│   ├── edit-block/         # Редактирование блока
│   ├── save-page/          # Сохранение страницы
│   ├── publish-store/      # Публикация магазина
│   └── select-template/    # Выбор шаблона
│
├── entities/               # Бизнес-сущности
│   ├── block/              # Блок (товар, корзина, header и т.д.)
│   ├── page/               # Страница магазина
│   ├── store/              # Магазин
│   ├── product/            # Товар
│   └── template/           # Шаблон
│
└── shared/                 # Переиспользуемое
    ├── api/                # API клиент
    ├── config/             # Конфигурация
    ├── lib/                # Утилиты
    └── ui/                 # UI компоненты (локальные)
```

---

## Система блоков

### Типы блоков:

```typescript
type BlockType =
  | 'header'           // Шапка сайта
  | 'footer'           // Подвал
  | 'hero'             // Баннер/слайдер
  | 'product-card'     // Карточка товара
  | 'product-grid'     // Сетка товаров
  | 'product-carousel' // Карусель товаров
  | 'cart'             // Корзина
  | 'checkout'         // Оформление заказа
  | 'text'             // Текстовый блок
  | 'image'            // Изображение
  | 'gallery'          // Галерея
  | 'categories'       // Категории товаров
  | 'search'           // Поиск
  | 'contacts'         // Контакты
  | 'map'              // Карта
  | 'social-links'     // Соц. сети
  | 'reviews'          // Отзывы
  | 'faq';             // FAQ
```

### Структура блока:

```typescript
interface Block {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;  // Настраиваемые свойства
  styles: {
    desktop: CSSProperties;
    tablet?: CSSProperties;
    mobile?: CSSProperties;
  };
  children?: Block[];              // Вложенные блоки
  order: number;                   // Порядок на странице
}
```

---

## Схема базы данных (PostgreSQL + Prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  stores    Store[]
  createdAt DateTime @default(now())
}

model Store {
  id          String    @id @default(uuid())
  name        String
  subdomain   String    @unique  // mystore.platform.com
  customDomain String?           // mystore.com
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  pages       Page[]
  products    Product[]
  categories  Category[]
  orders      Order[]
  settings    Json      @default("{}")
  theme       Json      @default("{}")
  isPublished Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Page {
  id        String   @id @default(uuid())
  storeId   String
  store     Store    @relation(fields: [storeId], references: [id])
  slug      String                    // home, catalog, cart, etc.
  title     String
  blocks    Json     @default("[]")   // Массив блоков
  isHome    Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([storeId, slug])
}

model Product {
  id          String   @id @default(uuid())
  storeId     String
  store       Store    @relation(fields: [storeId], references: [id])
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  images      String[] @default([])
  inventory   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Category {
  id        String    @id @default(uuid())
  storeId   String
  store     Store     @relation(fields: [storeId], references: [id])
  name      String
  slug      String
  products  Product[]

  @@unique([storeId, slug])
}

model Order {
  id         String      @id @default(uuid())
  storeId    String
  store      Store       @relation(fields: [storeId], references: [id])
  items      Json
  total      Decimal     @db.Decimal(10, 2)
  status     OrderStatus @default(PENDING)
  customer   Json                           // email, phone, address
  createdAt  DateTime    @default(now())
}

model Template {
  id          String   @id @default(uuid())
  name        String
  description String?
  thumbnail   String?
  pages       Json                          // Предустановленные страницы с блоками
  theme       Json                          // Цвета, шрифты
  category    String                        // fashion, electronics, food, etc.
  isPremium   Boolean  @default(false)
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}
```

---

## Структура файлов проекта

```
online-shop/
├── apps/
│   ├── host/                          # Shell приложение
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── pages/
│   │   │   ├── widgets/
│   │   │   ├── features/
│   │   │   ├── entities/
│   │   │   └── shared/
│   │   ├── webpack.config.ts
│   │   └── package.json
│   │
│   ├── editor/                        # Редактор магазинов
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── pages/
│   │   │   ├── widgets/
│   │   │   ├── features/
│   │   │   ├── entities/
│   │   │   └── shared/
│   │   ├── webpack.config.ts
│   │   └── package.json
│   │
│   ├── storefront/                    # Витрина магазина
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── pages/
│   │   │   ├── widgets/
│   │   │   ├── features/
│   │   │   ├── entities/
│   │   │   └── shared/
│   │   ├── webpack.config.ts
│   │   └── package.json
│   │
│   └── backend/                       # NestJS API
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── stores/
│       │   │   ├── pages/
│       │   │   ├── products/
│       │   │   ├── categories/
│       │   │   ├── orders/
│       │   │   └── templates/
│       │   ├── common/
│       │   │   ├── decorators/
│       │   │   ├── guards/
│       │   │   ├── filters/
│       │   │   └── interceptors/
│       │   ├── prisma/
│       │   └── main.ts
│       └── package.json
│
├── packages/
│   └── shared/                        # Общие компоненты
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── types/
│       │   ├── utils/
│       │   └── api/
│       ├── webpack.config.ts
│       └── package.json
│
├── docker-compose.yml                 # PostgreSQL, Redis
├── package.json                       # Workspaces root
├── turbo.json                         # Turborepo конфиг
└── tsconfig.base.json
```

---

## План реализации по этапам

### Этап 1: Настройка инфраструктуры
- [ ] Настройка monorepo с npm workspaces + Turborepo
- [ ] Конфигурация Webpack Module Federation для всех apps
- [ ] Настройка общего tsconfig
- [ ] Docker-compose для PostgreSQL
- [ ] Базовая структура FSD для каждого приложения

### Этап 2: Backend (NestJS)
- [ ] Настройка NestJS проекта
- [ ] Подключение Prisma + PostgreSQL
- [ ] Модуль аутентификации (JWT)
- [ ] CRUD для магазинов, страниц, товаров
- [ ] API для шаблонов
- [ ] Валидация и error handling

### Этап 3: Shared пакет
- [ ] UI Kit (Button, Input, Modal, Card и т.д.)
- [ ] Типы TypeScript
- [ ] API клиент (axios wrapper)
- [ ] Утилиты

### Этап 4: Host приложение
- [ ] Авторизация/регистрация
- [ ] Dashboard с магазинами пользователя
- [ ] Создание нового магазина
- [ ] Интеграция remote приложений

### Этап 5: Editor приложение
- [ ] Drag-and-drop система с dnd-kit
- [ ] Панель блоков
- [ ] Холст редактора
- [ ] Панель свойств блока
- [ ] Предпросмотр
- [ ] Сохранение и публикация

### Этап 6: Storefront приложение
- [ ] Динамический рендеринг блоков
- [ ] Каталог товаров
- [ ] Корзина
- [ ] Оформление заказа
- [ ] Адаптивность

### Этап 7: Шаблоны и деплой
- [ ] Создание базовых шаблонов (3-5 штук)
- [ ] Система деплоя магазинов
- [ ] Настройка поддоменов
- [ ] CI/CD

---

## Запрашиваемые разрешения

Для реализации плана потребуется:
- Запуск npm команд (install, build, dev)
- Запуск docker-compose
- Генерация Prisma клиента

---

## Готов к реализации?

После утверждения плана начну с Этапа 1: настройка monorepo инфраструктуры.