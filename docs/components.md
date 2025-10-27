---
title: Component Library
description: Comprehensive guide to the CIBN Digital Library UI components
---

# Component Library

The CIBN Digital Library uses a premium component library built with React, TypeScript, and TailwindCSS, featuring glassmorphism design and fluid animations.

## Design System

### Glassmorphism

All components follow a consistent glassmorphism design language:

```css
background: rgba(255, 255, 255, 0.08);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.12);
border-radius: 16px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### Animation Principles

- **Hardware-accelerated**: Only `transform` and `opacity` are animated
- **Smooth transitions**: 0.25s duration with ease timing
- **Hover effects**: Gentle scale (1.02) and lift with shadow
- **Focus states**: Accessible focus rings with proper contrast

## Core Components

### Button

Multi-variant button component with animations and accessibility.

**Variants:**
- `primary` - Main call-to-action
- `secondary` - Secondary actions
- `ghost` - Minimal styling
- `outline` - Bordered style

**Sizes:**
- `sm` - Small (px-3 py-1.5)
- `md` - Medium (px-4 py-2)
- `lg` - Large (px-6 py-3)

**Usage:**
```tsx
import { Button } from './components/ui/Button';

<Button variant="primary" size="md">
  Click me
</Button>

<Button variant="outline" size="sm" disabled>
  Disabled
</Button>
```

**Features:**
- Hover animations with scale and shadow
- Loading state support
- Disabled state styling
- Forward ref support
- Icon support with proper spacing

### Card

Glassmorphism container component with hover effects.

**Usage:**
```tsx
import { Card } from './components/ui/Card';

<Card className="p-6">
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</Card>
```

**Features:**
- Glassmorphism styling by default
- Hover lift effect with `.hover-lift` class
- Responsive padding and spacing
- Dark/Light mode support

### Modal

Accessible modal with backdrop blur and keyboard navigation.

**Usage:**
```tsx
import { Modal, useModal } from './components/ui/Modal';

function MyComponent() {
  const { isOpen, openModal, closeModal } = useModal();
  
  return (
    <>
      <Button onClick={openModal}>Open Modal</Button>
      
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title="Modal Title"
        size="md"
      >
        <p>Modal content here...</p>
      </Modal>
    </>
  );
}
```

**Props:**
- `isOpen` - Controls modal visibility
- `onClose` - Close handler function
- `title` - Optional modal title
- `size` - Modal size (sm, md, lg, xl)
- `closeOnBackdrop` - Click outside to close (default: true)

**Features:**
- ESC key to close
- Backdrop blur and overlay
- Smooth enter/exit animations
- Body scroll lock when open
- Focus trap for accessibility

### Toast

Auto-dismissing notification system with animations.

**Usage:**
```tsx
import { ToastContainer, useToast } from './components/ui/Toast';

function App() {
  const { toasts, toast, removeToast } = useToast();
  
  return (
    <>
      <Button onClick={() => toast.success('Success!', 'Operation completed')}>
        Show Toast
      </Button>
      
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
```

**Toast Types:**
- `success` - Green with checkmark icon
- `error` - Red with alert icon
- `warning` - Yellow with warning icon
- `info` - Blue with info icon

**Features:**
- Auto-dismiss (default: 5000ms)
- Manual dismiss button
- Slide-in/out animations
- Stacked positioning (top-right)
- Custom duration support

### LoadingSpinner

Animated loading indicator with glassmorphism styling.

**Usage:**
```tsx
import { LoadingSpinner } from './components/ui/LoadingSpinner';

<LoadingSpinner size="md" />
```

**Sizes:**
- `sm` - 16px (w-4 h-4)
- `md` - 24px (w-6 h-6)
- `lg` - 32px (w-8 h-8)

**Features:**
- Smooth rotation animation
- Dual-ring design
- Dark/Light mode support
- Hardware-accelerated

## Page Components

### Header

Fixed navigation header with glassmorphism styling.

**Features:**
- Logo and branding
- Navigation links with hover effects
- Search bar with ⌘K keyboard shortcut
- User menu with avatar
- Notification badge
- Mobile responsive with hamburger menu

**Structure:**
```tsx
<Header>
  <Logo />
  <Navigation />
  <SearchBar />
  <UserMenu />
</Header>
```

### Hero

Landing section with animated backgrounds and stats.

**Features:**
- Floating gradient orbs
- Grid pattern background
- Animated text and buttons
- Stats cards with glassmorphism
- Resource preview grid
- Responsive layout

**Key Elements:**
- Main headline with gradient text
- Call-to-action buttons
- Feature highlights
- Stats counters
- Resource cards

### ContentGrid

Advanced content browsing with search and filters.

**Features:**
- Search input with ⌘K shortcut
- Category filter buttons
- Content type filter buttons
- Sort options (date, views, title)
- Grid/List view toggle
- Featured content badges
- Empty state handling
- Responsive grid layout

**Usage:**
```tsx
import { ContentGrid } from './components/ContentGrid';

<ContentGrid />
```

**Keyboard Shortcuts:**
- `⌘K` or `Ctrl+K` - Focus search input

**Filter Options:**
- Categories: Development, AI/ML, Backend, Design, Database, Security
- Content Types: article, tutorial, guide, workshop, deep-dive, security
- Sort: date, views, title

## Utility Classes

### Glass Effects

```tsx
import { glass } from './lib/utils';

<div className={glass.base}>Base glass</div>
<div className={glass.hover}>Glass with hover</div>
<div className={glass.interactive}>Interactive glass</div>
```

### Animations

```tsx
import { animations } from './lib/utils';

<div className={animations.fadeIn}>Fade in</div>
<div className={animations.fadeInUp}>Fade in up</div>
<div className={animations.scaleIn}>Scale in</div>
<div className={animations.slideUp}>Slide up</div>
```

### Shadows

```tsx
import { shadows } from './lib/utils';

<div className={shadows.premium}>Premium shadow</div>
<div className={shadows.glass}>Glass shadow</div>
```

## Helper Functions

### Class Name Utilities

```tsx
import { cn } from './lib/utils';

// Merge class names with conflict resolution
<div className={cn('px-4 py-2', 'bg-white', active && 'bg-blue-500')}>
```

### Formatting

```tsx
import { formatNumber, formatCurrency, truncate } from './lib/utils';

formatNumber(1234567); // "1,234,567"
formatCurrency(5000); // "₦5,000.00"
truncate("Long text...", 20); // "Long text..."
```

### Debounce

```tsx
import { debounce } from './lib/utils';

const handleSearch = debounce((query: string) => {
  // Search logic
}, 300);
```

## Best Practices

### Component Composition

1. **Keep components focused**: Each component should have a single responsibility
2. **Use composition**: Build complex UIs from simple components
3. **Forward refs**: Use `React.forwardRef` for proper ref forwarding
4. **TypeScript interfaces**: Define clear prop types

### Performance

1. **Hardware-accelerated animations**: Use only `transform` and `opacity`
2. **Avoid layout thrashing**: Don't animate width/height/position
3. **Lazy loading**: Use React.lazy for code splitting
4. **Memoization**: Use React.memo for expensive components

### Accessibility

1. **Keyboard navigation**: All interactive elements must be keyboard accessible
2. **Focus management**: Proper focus states and focus trap in modals
3. **ARIA labels**: Add appropriate ARIA attributes
4. **Color contrast**: Ensure WCAG AA compliance

### Styling

1. **Utility-first**: Prefer TailwindCSS utilities
2. **Consistent spacing**: Use 8px baseline grid
3. **Dark mode**: Support both light and dark themes
4. **Responsive design**: Mobile-first approach

## Extending Components

### Creating New Components

1. **Structure:**
```tsx
import React from 'react';
import { cn } from '../../lib/utils';

interface MyComponentProps {
  className?: string;
  // other props
}

export const MyComponent: React.FC<MyComponentProps> = ({
  className,
  ...props
}) => {
  return (
    <div className={cn('glass', className)} {...props}>
      {/* component content */}
    </div>
  );
};
```

2. **Add to exports:**
```tsx
// components/ui/index.ts
export { MyComponent } from './MyComponent';
```

3. **Document usage:**
- Add to this documentation
- Include usage examples
- List all props and features

## Troubleshooting

### Glassmorphism not working

- Check browser support for `backdrop-filter`
- Add `-webkit-backdrop-filter` for Safari
- Provide fallback backgrounds

### Animations not smooth

- Verify you're only animating `transform` and `opacity`
- Check for layout thrashing
- Reduce animation complexity

### Dark mode issues

- Ensure all colors have dark: variants
- Test in both light and dark modes
- Use CSS custom properties for theme colors

### TypeScript errors

- Check all prop types are defined
- Verify imports are correct
- Ensure @types packages are installed