# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shop Builder - платформа-конструктор интернет-магазинов с drag-and-drop редактором.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: NestJS, Prisma, PostgreSQL
- **Architecture**: Webpack Module Federation, Feature Sliced Design
- **Monorepo**: npm workspaces + Turborepo

## Build Commands

- `npm install` - Install all dependencies
- `npm run dev` - Run all apps in development mode
- `npm run build` - Build all apps
- `npm run dev:host` - Run host app (port 3000)
- `npm run dev:editor` - Run editor app (port 3001)
- `npm run dev:storefront` - Run storefront app (port 3002)
- `npm run dev:backend` - Run backend API (port 4000)
- `npm run docker:up` - Start PostgreSQL and Redis
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database

## Architecture

### Monorepo Structure

```
online-shop/
├── apps/
│   ├── host/          # Shell app (Module Federation host)
│   ├── editor/        # Editor app (Module Federation remote)
│   ├── storefront/    # Storefront app (Module Federation remote)
│   └── backend/       # NestJS API
└── packages/
    └── shared/        # Shared components, types, utils
```

### Feature Sliced Design (Frontend Apps)

Each frontend app follows FSD:
- `app/` - App initialization, providers
- `pages/` - Page components
- `widgets/` - Composite UI blocks
- `features/` - User scenarios
- `entities/` - Business entities
- `shared/` - Reusable code

### Module Federation

- **host** (port 3000) - Main shell, loads remotes
- **editor** (port 3001) - Exposes editor App
- **storefront** (port 3002) - Exposes storefront App
- **shared** (port 3003) - Shared React components

## Backend API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/stores` - List user's stores
- `POST /api/stores` - Create store
- `GET /api/stores/:id/pages/:slug` - Get page
- `PATCH /api/stores/:id/pages/:slug` - Update page
- `GET /api/stores/:id/products` - List products
- `POST /api/stores/:id/orders` - Create order

## Quick Start

1. Start database: `npm run docker:up`
2. Install deps: `npm install`
3. Setup backend env: `cp apps/backend/.env.example apps/backend/.env`
4. Generate Prisma: `npm run db:generate`
5. Push schema: `npm run db:push`
6. Run all: `npm run dev`
