# 06. Code Implementation & UnoCSS Tokens

> **Guide:** _How to implement the Fintasy Design System in Vue 3, UnoCSS, and Naive UI._

---

## 1. CSS Custom Properties (`design-tokens.css`)

The following variables establish the global theme contract across all components:

```css
:root {
  /* Surface Planes (Deep Space Midnight) */
  --fn-surface-canvas: #07090e;
  --fn-surface-panel: #0e121b;
  --fn-surface-card: #151c2b;
  --fn-surface-float: #1d263b;
  --fn-surface-hover: #232e47;

  /* Hairline Drafting Boundaries */
  --fn-border-subtle: rgba(255, 255, 255, 0.06);
  --fn-border-default: rgba(255, 255, 255, 0.1);
  --fn-border-focus: rgba(255, 255, 255, 0.28);

  /* Functional Telemetry Accents */
  --fn-accent-orange: #ff5522; /* High-Urgency Action Horizon */
  --fn-accent-emerald: #10b981; /* Solvency & In-Zone */
  --fn-accent-crimson: #f43f5e; /* Hazard, Storm Damage, BUST */
  --fn-accent-cyan: #06b6d4; /* 10 Hz Telemetry & Bot Archetypes */
  --fn-accent-indigo: #6366f1; /* Governance & Tournaments */

  /* Text & Telemetry Contrast */
  --fn-text-primary: #f8fafc;
  --fn-text-secondary: #94a3b8;
  --fn-text-muted: #64748b;
}
```

---

## 2. UnoCSS Configuration & Shortcuts

Add the following shortcuts to `packages/client/unocss.config.ts`:

```typescript
export default defineConfig({
  shortcuts: [
    // Surface Containers
    ['fn-surface-canvas', 'bg-[#07090E] text-slate-100'],
    ['fn-surface-panel', 'bg-[#0E121B] border border-white/10 rounded-md'],
    ['fn-surface-card', 'bg-[#151C2B] border border-white/10 rounded-md p-4'],
    ['fn-surface-float', 'bg-[#1D263B] border border-white/20 rounded-lg shadow-2xl'],

    // Drafting Geometry & Crosshairs
    ['fn-dot-matrix', 'bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px]'],
    ['fn-border-hairline', 'border border-white/10'],

    // Technical Typography & Chips
    ['fn-mono-tabular', 'font-mono tracking-tight tabular-nums font-feature-settings-["tnum"]'],
    ['fn-chip-mono', 'inline-flex items-center gap-1 font-mono text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm'],
    ['fn-badge-numbered', 'inline-flex items-center gap-1.5 border border-[#FF5522]/30 bg-[#FF5522]/10 px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold'],

    // Action Buttons
    ['fn-btn-primary', 'border border-[#FF5522] bg-[#FF5522] hover:bg-[#FF6B35] text-white font-mono text-xs font-bold px-4 py-2 rounded-sm transition cursor-pointer select-none active:scale-98'],
    ['fn-btn-secondary', 'border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-mono text-xs font-bold px-4 py-2 rounded-sm transition cursor-pointer select-none'],
    ['fn-btn-emerald', 'border border-emerald-500 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold px-4 py-2 rounded-sm transition cursor-pointer select-none'],
    ['fn-btn-crimson', 'border border-rose-500 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold px-4 py-2 rounded-sm transition cursor-pointer select-none'],

    // Telemetry Hazard Pulses
    ['fn-pulse-hazard', 'animate-pulse border-rose-500/80 bg-rose-950/40 text-rose-300'],
    ['fn-pulse-warning', 'animate-pulse border-[#FF5522]/80 bg-[#FF5522]/10 text-amber-200'],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Geist:400,500,600,700',
        mono: 'Geist Mono:400,600,700,900',
        serif: 'Instrument Serif:400,400i',
      },
    }),
  ],
})
```

---

## 3. Formatting Utilities for Financial Digits

Always format financial figures with standard helper functions to prevent floating-point drift and ensure tabular alignment:

```typescript
// packages/client/src/helpers/formatters.ts

/**
 * Formats integer cents into strict USD string with tabular cents.
 * e.g. 1500000 -> "$15,000.00"
 */
export function formatCentsToUsd(cents: number): string {
  const isNegative = cents < 0
  const absDollars = (Math.abs(cents) / 100).toFixed(2)
  return `${isNegative ? '-' : ''}$${Number(absDollars).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Formats integer cents with explicit leading sign (+/-)
 * e.g. 49750 -> "+$497.50", -32000 -> "-$320.00"
 */
export function formatCentsWithSign(cents: number): string {
  const sign = cents > 0 ? '+' : cents < 0 ? '-' : ''
  const absDollars = (Math.abs(cents) / 100).toFixed(2)
  return `${sign}$${Number(absDollars).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
```

---

## 4. Blast Radius Verification Rule

Whenever components or UnoCSS shortcuts are modified, verify downstream project impacts using the native Nx graph:

```bash
npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "packages/client/unocss.config.ts"
```
