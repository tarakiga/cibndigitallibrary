# CIBN Digital Library - Frontend

A comprehensive digital platform frontend for the Chartered Institute of Bankers of Nigeria (CIBN), offering digital and physical resources with role-based access control.

## Features

- 📚 **Multi-format Content**: PDFs, videos, audio files, e-books, and physical items
- 🔐 **Role-Based Access**: Public users, CIBN members, and administrators
- 💳 **Secure Payments**: Paystack integration for seamless transactions
- 🎨 **Premium UI**: Glassmorphism design with fluid animations
- 🔍 **Advanced Search**: Filter by type, category, and price range

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + shadcn/ui + Tailwind CSS v3
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Authentication**: JWT tokens

## Quick Start

### Prerequisites

- Node.js 18+
- Backend API running (see root README.md)

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3001](http://localhost:3001) to see your application running.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
│   ├── ui/             # shadcn/ui components
│   ├── library/        # Library-specific components
│   └── sections/       # Page sections
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
│   ├── api/           # API client and services
│   └── stores/        # Zustand stores
└── types/              # TypeScript type definitions
```

## Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

## Documentation

See the `docs/` directory in the root for comprehensive documentation:

- [Getting Started](../docs/getting-started.md)
- [Architecture](../docs/architecture.md)
- [API Reference](../docs/api.md)
- [Content Management](../docs/content-management.md)
- [Testing](../docs/testing.md)

## License

© 2025 Chartered Institute of Bankers of Nigeria. All rights reserved.
