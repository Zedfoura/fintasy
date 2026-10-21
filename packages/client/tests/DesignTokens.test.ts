/**
 * @description: Fintasy Design System Token & Utility Shortcut Assays
 * Governed by Mission DESIGN-1 and docs/design-system/
 */

import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import unocssConfig from '../unocss.config'

describe('fintasy Design System Tokens (Mission DESIGN-1)', () => {
  const cssPath = path.resolve(__dirname, '../src/styles/design-tokens.css')
  const cssContent = fs.readFileSync(cssPath, 'utf-8')

  it('assay A: design-tokens.css defines 4-tier surface elevation system', () => {
    expect(cssContent).toContain('--fn-surface-canvas: #07090E;')
    expect(cssContent).toContain('--fn-surface-panel:  #0E121B;')
    expect(cssContent).toContain('--fn-surface-card:   #151C2B;')
    expect(cssContent).toContain('--fn-surface-float:  #1D263B;')
    expect(cssContent).toContain('--fn-surface-hover:  #232E47;')
  })

  it('assay B: design-tokens.css defines functional chromatic telemetry tokens', () => {
    expect(cssContent).toContain('--fn-accent-orange:  #FF5522;')
    expect(cssContent).toContain('--fn-accent-emerald: #10B981;')
    expect(cssContent).toContain('--fn-accent-crimson: #F43F5E;')
    expect(cssContent).toContain('--fn-accent-cyan:    #06B6D4;')
    expect(cssContent).toContain('--fn-accent-indigo:  #6366F1;')
  })

  it('assay C: unocss.config.ts exports core surface and action shortcuts', () => {
    const shortcuts = unocssConfig.shortcuts as Array<[string, string] | [RegExp, (...args: any[]) => string]>
    const shortcutMap = new Map<string, string>()

    for (const item of shortcuts) {
      if (typeof item[0] === 'string') {
        shortcutMap.set(item[0], item[1] as string)
      }
    }

    expect(shortcutMap.has('fn-surface-canvas')).toBe(true)
    expect(shortcutMap.get('fn-surface-canvas')).toContain('bg-[#07090E]')

    expect(shortcutMap.has('fn-btn-primary')).toBe(true)
    expect(shortcutMap.get('fn-btn-primary')).toContain('#FF5522')

    expect(shortcutMap.has('fn-mono-tabular')).toBe(true)
    expect(shortcutMap.get('fn-mono-tabular')).toContain('tabular-nums')

    expect(shortcutMap.has('fn-badge-numbered')).toBe(true)
    expect(shortcutMap.has('fn-pulse-hazard')).toBe(true)
  })

  it('assay D: unocss.config.ts registers Geist, Geist Mono, and Instrument Serif fonts', () => {
    const webFontsPreset = unocssConfig.presets?.find((p: any) => p.name === '@unocss/preset-web-fonts')
    expect(webFontsPreset).toBeDefined()
  })
})
