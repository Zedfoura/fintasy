/**
 * @author: Tinatsei Chingaya (Zedfoura), Claude
 * @description: Locked copy for the FAQ and final CTA (CLOSE-1 direction C1 "Closing bell"), word for word from the
 * campaign's close-direction.md copy table. Sources per answer: 01 ruling D4; 02 royale match_manager.py
 * capital_cents=1500000; 03 ruling D8 (user wording; Alpaca backs paper-trading quotes, in-match prices come from
 * services/royale/market_sim.py; do not change without the user); 04 DATA-MODEL-AUTHORITY §1.2 MatchInstance;
 * 05 DATA-MODEL-AUTHORITY §1.2 phases and storm; 06 server requirements.txt and §1.2 10 Hz loop.
 */

export interface CloseFaqItem {
  id: string
  ordinal: '01' | '02' | '03' | '04' | '05' | '06'
  question: string
  answer: string
}

export const FAQ_ANCHOR = 'faq'

export const CTA_ANCHOR = 'cta'

export const FAQ_KICKER = 'FAQ'

export const FAQ_TITLE_LINES = ['Questions,', 'answered.'] as const

export const FAQ_INTRO = 'The short version of what recruiters and players ask first.'

export const CLOSE_FAQ: readonly CloseFaqItem[] = [
  {
    id: 'play',
    ordinal: '01',
    question: 'Can I play Fintasy?',
    answer: 'Not right now. Fintasy is a portfolio project, not a live service, so there is no public server to join. The full source is on GitHub, and the case study walks through how it was designed and built.',
  },
  {
    id: 'money',
    ordinal: '02',
    question: 'Is real money involved?',
    answer: 'No. Every trader starts each match with the same simulated $15,000 balance, held in integer cents. Nothing is bought or sold on a real exchange.',
  },
  {
    id: 'prices',
    ordinal: '03',
    question: 'Where do the prices come from?',
    answer: 'Live stock market data from the Alpaca Markets API.',
  },
  {
    id: 'rivals',
    ordinal: '04',
    question: 'Who am I up against?',
    answer: 'Up to 60 traders per match. AI bots fill every empty seat, so a match never waits on a half-empty lobby.',
  },
  {
    id: 'end',
    ordinal: '05',
    question: 'How does a match end?',
    answer: 'When one trader is left solvent. Duels move P&L between players, the storm shrinks the map over 5 rounds, and anyone whose balance runs dry is out.',
  },
  {
    id: 'stack',
    ordinal: '06',
    question: 'What is it built with?',
    answer: 'A Vue and TypeScript client, a Python FastAPI server backed by PostgreSQL, and an authoritative match loop that runs at 10 Hz on the server.',
  },
]

/** Items open on first render (close-direction.md: item 01 starts open). */
export const FAQ_INITIALLY_OPEN: readonly string[] = ['play']

export const CTA_KICKER = 'Closing bell'

export const CTA_TITLE = 'That\'s the match.'

export const CTA_BODY = 'Fintasy isn\'t live. The code and the story behind it are.'
