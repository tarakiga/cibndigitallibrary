---
title: Premium Background & Motion
description: Global gradient mesh background and reveal-on-scroll interactions
---

# Premium Background & Motion

## Background Component

The global Background component adds a premium, brand-aligned gradient mesh behind the UI using animated gold and navy radial gradients.

Usage:
```tsx
import { Background } from '../components/layout/Background'
```

Rendered globally in `App.tsx` to sit behind all content with `fixed` positioning and `-z-10`.

## Reveal-on-scroll

We use a small IntersectionObserver hook to reveal elements when they enter the viewport.

How it works:
- Add `data-reveal` on any element to opt-in
- On intersection, `.is-revealed` is applied (one-time) to transition in the element
- CSS lives in `src/index.css` under the Reveal-on-scroll section

Example:
```tsx
<section data-reveal>
  ...
</section>
```

Hook:
```tsx
import { useRevealOnScroll } from '../lib/hooks/useRevealOnScroll'

function App() {
  useRevealOnScroll()
  ...
}
```

## Animations

CSS keyframes and utilities available:
- `animate-float` for gentle parallax-like motion of orbs
- `animate-pulse-glow` for glowing elements
- `animate-gradient-shift` for animated gradients
- Reveal transitions via `[data-reveal]` and `.is-revealed`

These are implemented in `src/index.css` and used across the Hero, Stats, Features, and Content Library sections.
