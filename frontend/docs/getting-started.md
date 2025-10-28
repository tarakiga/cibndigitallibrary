---
title: Getting Started
description: How to set up, run, and test the Next.js + TypeScript project
---

---
title: Getting Started
description: Setup, run, and configuration for the frontend.
---

# Getting Started

## Requirements
- Node.js LTS
- PowerShell or a POSIX shell

## Install and Run
- npm install
- $env:NEXT_PUBLIC_API_BASE_URL = "http://localhost:8000/api/v1"
- npm run dev

## Sign Up
- Regular users sign up via the Signup modal (opened from the Sign In modal). CIBN Members do not sign up; they authenticate via Employee ID.

## Admin Settings CMS
- Navigate to /admin to manage Pages, Library, Courses, Resources, and Membership.
- Data is stored in localStorage for demo; refresh the site to see changes reflected immediately.
- Membership plans specifically are saved to cms_resources.membership and consumed by the homepage section with safe defaults for missing fields.

Prerequisites
- Node.js 18+
- npm

Install
- npm install

Run
- Development: npm run dev
- Build: npm run build
- Start: npm start

Frontend v2
- cd frontend-v2
- npm install
- $env:NEXT_PUBLIC_API_BASE_URL = "http://localhost:8000/api/v1"
- npm run dev (http://localhost:3002)

Testing
- CI run with coverage: npm run test:ci
- Run a single test: npx jest path/to/test --runInBand --no-coverage

Environment
- NEXT_PUBLIC_API_BASE_URL controls the API base URL. If unset, defaults to http://localhost:8000/api/v1.

Notes
- jest.setup.js configures global mocks for Next.js, shadcn/ui, framer-motion, and icons.
- __mocks__/axios.js provides a manual axios mock used by jest.mock('axios').
- The Sign In modal (src/components/auth/login-modal.tsx) has two tabs (User, CIBN Member). The CIBN Member tab has no signup link and requires only Employee ID + Password; ensure NEXT_PUBLIC_* envs are set if your login flow depends on backend URLs.

Payments
- After Paystack redirects back, the app handles /payment/callback and verifies the reference via the backend
- On success, users see a confirmation and are redirected to /library

Authentication at Checkout
- Proceed to Checkout requires sign-in
- If you are not signed in, you’ll see a toast and the Sign In modal opens automatically
