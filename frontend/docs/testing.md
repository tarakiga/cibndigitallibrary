---
title: Testing
description: How tests are structured and how to write reliable, fast tests
---

---
title: Testing
description: How to run the test suite and key mocking strategies.
---

# Testing

- Run full CI: npm run test:ci
- Uses jest + next/jest with global mocks defined in jest.setup.js.
- lucide-react mocked to lightweight svg components via Proxy.
- axios mocked via __mocks__/axios.js; ensure jest.mock('axios') precedes imports that call axios.create.

Runner and environment
- For frontend-v2, tests live in frontend-v2/tests and run with jest + ts-jest.
- Jest with jsdom test environment
- next/jest + babel-jest transform configured in jest.config.js
- setupFilesAfterEnv: jest.setup.js

Global setup (jest.setup.js)
- Mocks Next.js router/navigation, Image, Link
- Lightweight Navbar, HeroSection, Footer, Membership mocks
- shadcn/ui primitive mocks for common components
- Dialog primitives mocked to basic elements
- framer-motion mocked to plain elements
- lucide-react mocked to a Proxy that returns lightweight <svg data-lucide="..." /> icons; this avoids heavy DOM
- Conditional mock for '@/components/cart/shopping-cart' in non-cart tests to reduce overhead
- Test-only Library page mock aligning with the integration tests

axios mocking
- Manual CommonJS mock in __mocks__/axios.js
- Ensure jest.mock('axios') is evaluated before importing modules that call axios.create.
  - Prefer require('../module') after jest.mock when you need to assert on axios.create call counts
- For tests that do jest.resetModules(), re-require the module under test afterward

Patterns and tips
- Prefer asserting on exported artifacts (e.g., apiClient.defaults) to reduce brittleness around module init order
- Keep tests focused; mock heavy subtrees in jest.setup.js or locally via jest.doMock when appropriate
- To avoid OOM in particularly heavy tests, run with --runInBand and consider --no-coverage while iterating

Examples
- API client simple tests (src/lib/api/__tests__/client.simple.test.ts) verify configuration via apiClient.defaults
- Cart tests use icon and framer-motion mocks to keep DOM minimal while exercising behavior