/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest test suite verifying the comprehensive Stock Royale Game Manual and FAQ content (CLEAN-3)
 */

import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('stock Royale Game Manual & Help Documentation (CLEAN-3)', () => {
  const helpIndexPath = path.resolve(__dirname, '../src/pages/dashboard/help/index.md')
  const helpFaqPath = path.resolve(__dirname, '../src/pages/dashboard/help/faq.md')

  it('assay A: help/index.md contains comprehensive Stock Royale game manual sections', () => {
    expect(fs.existsSync(helpIndexPath)).toBe(true)
    const content = fs.readFileSync(helpIndexPath, 'utf-8')

    // Overview & Pot
    expect(content).toContain('Stock Royale — Official Field Manual')
    expect(content).toContain('60-trader stock market battle royale')
    expect(content).toContain('$15,000.00')
    expect(content).toContain('1,500,000 integer cents')

    // Sectors & Storm Contraction
    expect(content).toContain('12 concentric sector zones')
    expect(content).toContain('OUTER SECTORS')
    expect(content).toContain('INNER HIGH-BETA')
    expect(content).toContain('Storm Contraction & Capital Burn')
    expect(content).toContain('Round 1:')
    expect(content).toContain('Final Circle:')

    // Combat Duels & Third-Party
    expect(content).toContain('30-Second Combat Clock')
    expect(content).toContain('1x')
    expect(content).toContain('5x leverage')
    expect(content).toContain('90% Margin Risk Gauge')
    expect(content).toContain('Third-Party Battle Escalation')
    expect(content).toContain('15.0 seconds')

    // Ranked MMR & Apex RP
    expect(content).toContain('Rocket League MMR')
    expect(content).toContain('Bronze')
    expect(content).toContain('Golden Trader')
    expect(content).toContain('16,000+ RP')
  })

  it('assay B: help/faq.md contains thorough answers to core player questions', () => {
    expect(fs.existsSync(helpFaqPath)).toBe(true)
    const content = fs.readFileSync(helpFaqPath, 'utf-8')

    expect(content).toContain('What is Stock Royale?')
    expect(content).toContain('How does storm damage work?')
    expect(content).toContain('What happens if my equity reaches $0?')
    expect(content).toContain('How does leverage work in duels and when do I get liquidated?')
    expect(content).toContain('Third-Party')
    expect(content).toContain('Rocket League-style tier system')
    expect(content).toContain('Scalpers (40%)')
    expect(content).toContain('Swings (35%)')
    expect(content).toContain('Degens (25%)')
    expect(content).toContain('Tauri 2.0')
    expect(content).toContain('Steam Deck')
    expect(content).toContain('10 Hz Geometric Brownian Motion Market Engine')
  })

  it('assay C: all obsolete class project placeholder text has been completely purged', () => {
    const indexContent = fs.readFileSync(helpIndexPath, 'utf-8')
    const faqContent = fs.readFileSync(helpFaqPath, 'utf-8')

    const legacyPlaceholders = [
      'Click here to go to Google',
      'This is an example of a page that uses the dashboard layout',
      'This is another example of a markdown file',
      'FAQ page placeholder',
      'There is nothing else to see here',
    ]

    for (const phrase of legacyPlaceholders) {
      expect(indexContent).not.toContain(phrase)
      expect(faqContent).not.toContain(phrase)
    }
  })
})
