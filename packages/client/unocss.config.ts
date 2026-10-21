/**
 * @author: adibarra (Alec Ibarra)
 * @description: UnoCSS configuration file
 */

import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    [/^(.+)--c-([^)\]>\s]+)$/, ([, prefix, color]) => `${prefix}-[var(--c-${color})]`], // bg--c-bg -> bg-[var(--c-bg)], etc.
    ['fn-icon-btn', 'outline-none inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text--c-accent focus:opacity-100 focus:text--c-accent'],
    ['fn-link', 'text--c-accent outline-none underline-1 hover:underline focus:underline'],
    ['fn-outline', 'border--c-inverse outline-none rd-1 b-1'],
    ['fn-hover', 'hover:bg--c-bg focus:bg--c-bg focus:border--c-accent focus-within:border--c-accent'],
    ['text-xs', 'text-[0.75rem] line-height-[1rem]'],
    ['text-xxs', 'text-[0.70rem] line-height-[0.75rem]'],

    // Grounded in Reason Surface Containers (Deep Space Midnight)
    ['fn-surface-canvas', 'bg-[#07090E] text-slate-100'],
    ['fn-surface-panel', 'bg-[#0E121B] border border-white/10 rounded-md'],
    ['fn-surface-card', 'bg-[#151C2B] border border-white/10 rounded-md p-4'],
    ['fn-surface-float', 'bg-[#1D263B] border border-white/20 rounded-lg shadow-2xl'],

    // Drafting Geometry & Blueprint Crosshairs
    ['fn-dot-matrix', 'bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px]'],
    ['fn-border-hairline', 'border border-white/10'],

    // Technical Typography & Numbered Chips
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
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  theme: {
    fontFamily: {
      sans: ['Geist', 'DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['Instrument Serif', 'DM Serif Display', 'Georgia', 'serif'],
      mono: ['Geist Mono', 'DM Mono', 'ui-monospace', 'monospace'],
    },
  },
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  safelist: 'prose mx-auto text-left'.split(' '),
})
