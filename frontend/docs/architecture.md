---
title: Architecture
description: Project structure, key modules, and design decisions
---

---
title: Architecture
description: High-level architecture of the Next.js app, contexts, and CMS data flow.
---

# Architecture

## Overview
- Header/Navbar is fixed. Pages that require extra clearance (like Admin Settings) apply additional top padding to avoid overlap on initial load.
- Next.js App Router under src/app with shared layouts and route groups.
- UI components under src/components, organized by domain (auth, cart, layout, sections, ui).
- Admin Settings CMS lives in the app/admin route and persists content to localStorage for demo purposes.

## CMS and Content Data Flow
- Admin edits create/update localStorage payloads under keys like:
  - cms_pages (page content)
  - cms_courses (courses)
  - cms_resources (contact/support/resources + membership)
- Public pages read from these keys at render-time; if data is missing, they fall back to reasonable defaults.
- Library content list is fetched from the backend via `contentService.getContent()` and uses backend content IDs for checkout.

## Membership Plans
- Homepage Membership section reads from cms_resources.membership.
- Resiliency:
  - Missing color -> neutral gradient background.
  - Missing icon -> icon is auto-picked based on plan name.
  - Missing CMS data -> default static plans are displayed.
- Admin can reorder, add, edit, or remove plans in Admin Settings; changes show immediately on the homepage.

Overview
- Next.js App Router with TypeScript (legacy under src/app, new clean build under frontend-v2/app)
- Component library from shadcn/ui (src/components/ui)
- Domain components (auth, cart, layout, sections)
- API layer (src/lib/api) including axios client and services
- Contexts (src/contexts) for authentication

Key modules
- src/lib/api/client.ts
  - Exports a pre-configured axios instance (apiClient)
  - Adds request/response interceptors for auth and error handling
- src/components/cart/shopping-cart.tsx
  - A feature-rich cart modal with checkout flow
- src/components/auth/login-modal.tsx
  - Premium sign-in modal using shadcn/ui Dialog and Tabs with User and CIBN Member flows (CIBN tab: Employee ID + Password only)
- jest.setup.js
  - Global test setup and mocks (Next.js, shadcn/ui, framer-motion, lucide-react)
  - Contains a test-only lightweight mock for the Library page

Design decisions
- Manual axios mock (CommonJS) under __mocks__/axios.js for reliable jest.mock resolution across transforms
- Proxy-based lucide-react mock to reduce DOM complexity and memory usage in tests
- Simplified/test-only implementations for select heavy components during integration tests

Extensibility
- Add services to src/lib/api and reuse apiClient
- Add UI primitives under src/components/ui following existing patterns
- Update jest.setup.js when introducing heavy third-party UI to keep tests fast and deterministic

Payments flow
- initializePayment -> redirect to Paystack -> callback to /payment/callback -> verify -> redirect back to /library
- The callback page reads reference/trxref and calls ordersApi.verifyPayment(reference)

Checkout auth gate
- Proceed to Checkout requires an authenticated user
- If unauthenticated, a global 'open:login' event triggers the Sign In modal from the Navbar

Cart persistence
- Cart state initializes from and persists to localStorage (cart_items)
- Items use real library content IDs and quantities, which are sent to the backend when creating orders
