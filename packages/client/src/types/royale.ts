/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Core TypeScript type definitions, constants, and topology for Fintasy Stock Royale
 */

export enum MarketSector {
  // Outer Tier (Defensive, low volatility)
  UTILITIES = 'UTILITIES',
  REAL_ESTATE = 'REAL_ESTATE',
  MATERIALS = 'MATERIALS',
  INDUSTRIALS = 'INDUSTRIALS',

  // Mid Tier (Medium-high volatility)
  HEALTHCARE = 'HEALTHCARE',
  FINANCIALS = 'FINANCIALS',
  ENERGY = 'ENERGY',
  CONSUMER = 'CONSUMER',

  // Inner Tier / Hot Zones (AI, mega-cap & meme alpha)
  BIG_TECH = 'BIG_TECH',
  SEMIS_AI = 'SEMIS_AI',
  BIOTECH = 'BIOTECH',
  MEME_ALPHA = 'MEME_ALPHA',
}

export type SectorTier = 'OUTER' | 'MID' | 'INNER'
export type SectorStatus = 'SAFE' | 'CLOSING' | 'STORM'
export type StormPhase = 'DROP' | 'SAFE' | 'WARNING' | 'CLOSING' | 'FINAL'

export interface TickerSummary {
  symbol: string
  name: string
  basePriceCents: number
  volatility: number
}

export interface SectorDefinition {
  id: MarketSector
  name: string
  tier: SectorTier
  quadrant: number // 0 (top-right), 1 (bottom-right), 2 (bottom-left), 3 (top-left)
  tickers: TickerSummary[]
  adjacentSectors: MarketSector[]
  description: string
}

export interface StormState {
  roundNumber: number
  name: string
  phase: StormPhase
  secondsRemaining: number
  damageRateCentsPerSec: number
  safeSectorCount: number
}

export interface ActiveDuelSummary {
  duelId: string
  sector: MarketSector | string
  participantCount: number
  traderUsernames?: string[]
}

export const SECTOR_DEFINITIONS: Record<MarketSector, SectorDefinition> = {
  // --- OUTER TIER ---
  [MarketSector.UTILITIES]: {
    id: MarketSector.UTILITIES,
    name: 'Utilities & Power',
    tier: 'OUTER',
    quadrant: 0,
    tickers: [
      { symbol: 'NEE', name: 'NextEra Energy', basePriceCents: 8000, volatility: 0.08 },
      { symbol: 'DUK', name: 'Duke Energy', basePriceCents: 10500, volatility: 0.07 },
      { symbol: 'SO', name: 'Southern Co', basePriceCents: 8500, volatility: 0.07 },
    ],
    adjacentSectors: [MarketSector.REAL_ESTATE, MarketSector.INDUSTRIALS, MarketSector.HEALTHCARE],
    description: 'Low-beta defensive infrastructure with stable yield profiles.',
  },
  [MarketSector.REAL_ESTATE]: {
    id: MarketSector.REAL_ESTATE,
    name: 'Real Estate & REITs',
    tier: 'OUTER',
    quadrant: 1,
    tickers: [
      { symbol: 'PLD', name: 'Prologis', basePriceCents: 12000, volatility: 0.10 },
      { symbol: 'AMT', name: 'American Tower', basePriceCents: 19000, volatility: 0.11 },
      { symbol: 'O', name: 'Realty Income', basePriceCents: 5500, volatility: 0.09 },
    ],
    adjacentSectors: [MarketSector.UTILITIES, MarketSector.MATERIALS, MarketSector.FINANCIALS],
    description: 'Income-generating commercial properties and cellular tower REITs.',
  },
  [MarketSector.MATERIALS]: {
    id: MarketSector.MATERIALS,
    name: 'Materials & Mining',
    tier: 'OUTER',
    quadrant: 2,
    tickers: [
      { symbol: 'LIN', name: 'Linde', basePriceCents: 44000, volatility: 0.14 },
      { symbol: 'SHW', name: 'Sherwin-Williams', basePriceCents: 35000, volatility: 0.13 },
      { symbol: 'FCX', name: 'Freeport-McMoRan', basePriceCents: 4500, volatility: 0.18 },
    ],
    adjacentSectors: [MarketSector.REAL_ESTATE, MarketSector.INDUSTRIALS, MarketSector.ENERGY],
    description: 'Cyclical copper, industrial chemicals, and raw commodities.',
  },
  [MarketSector.INDUSTRIALS]: {
    id: MarketSector.INDUSTRIALS,
    name: 'Industrials & Aerospace',
    tier: 'OUTER',
    quadrant: 3,
    tickers: [
      { symbol: 'CAT', name: 'Caterpillar', basePriceCents: 38000, volatility: 0.15 },
      { symbol: 'GE', name: 'GE Aerospace', basePriceCents: 18500, volatility: 0.14 },
      { symbol: 'LMT', name: 'Lockheed Martin', basePriceCents: 56000, volatility: 0.12 },
    ],
    adjacentSectors: [MarketSector.MATERIALS, MarketSector.UTILITIES, MarketSector.CONSUMER],
    description: 'Heavy machinery, aerospace turbines, and defense contractors.',
  },

  // --- MID TIER ---
  [MarketSector.HEALTHCARE]: {
    id: MarketSector.HEALTHCARE,
    name: 'Healthcare & Pharma',
    tier: 'MID',
    quadrant: 0,
    tickers: [
      { symbol: 'UNH', name: 'UnitedHealth', basePriceCents: 58000, volatility: 0.16 },
      { symbol: 'LLY', name: 'Eli Lilly', basePriceCents: 88000, volatility: 0.22 },
      { symbol: 'PFE', name: 'Pfizer', basePriceCents: 2800, volatility: 0.18 },
    ],
    adjacentSectors: [MarketSector.UTILITIES, MarketSector.FINANCIALS, MarketSector.CONSUMER, MarketSector.BIOTECH],
    description: 'Global pharmaceutical giants and managed care institutions.',
  },
  [MarketSector.FINANCIALS]: {
    id: MarketSector.FINANCIALS,
    name: 'Financials & Banking',
    tier: 'MID',
    quadrant: 1,
    tickers: [
      { symbol: 'JPM', name: 'JPMorgan Chase', basePriceCents: 22000, volatility: 0.20 },
      { symbol: 'GS', name: 'Goldman Sachs', basePriceCents: 50000, volatility: 0.24 },
      { symbol: 'V', name: 'Visa', basePriceCents: 29000, volatility: 0.18 },
    ],
    adjacentSectors: [MarketSector.REAL_ESTATE, MarketSector.HEALTHCARE, MarketSector.ENERGY, MarketSector.MEME_ALPHA],
    description: 'Investment banks, payment rails, and global liquidity providers.',
  },
  [MarketSector.ENERGY]: {
    id: MarketSector.ENERGY,
    name: 'Energy & Oil',
    tier: 'MID',
    quadrant: 2,
    tickers: [
      { symbol: 'XOM', name: 'ExxonMobil', basePriceCents: 12000, volatility: 0.26 },
      { symbol: 'CVX', name: 'Chevron', basePriceCents: 15500, volatility: 0.25 },
      { symbol: 'OXY', name: 'Occidental Petroleum', basePriceCents: 5200, volatility: 0.32 },
    ],
    adjacentSectors: [MarketSector.MATERIALS, MarketSector.FINANCIALS, MarketSector.CONSUMER, MarketSector.BIG_TECH],
    description: 'Crude oil exploration, LNG terminals, and petroleum refiners.',
  },
  [MarketSector.CONSUMER]: {
    id: MarketSector.CONSUMER,
    name: 'Consumer Discretionary',
    tier: 'MID',
    quadrant: 3,
    tickers: [
      { symbol: 'AMZN', name: 'Amazon', basePriceCents: 19000, volatility: 0.24 },
      { symbol: 'TSLA', name: 'Tesla', basePriceCents: 24000, volatility: 0.38 },
      { symbol: 'NKE', name: 'Nike', basePriceCents: 8200, volatility: 0.22 },
    ],
    adjacentSectors: [MarketSector.INDUSTRIALS, MarketSector.ENERGY, MarketSector.HEALTHCARE, MarketSector.SEMIS_AI],
    description: 'E-commerce titans, electric vehicles, and lifestyle brands.',
  },

  // --- INNER TIER (HOT ZONES) ---
  [MarketSector.BIOTECH]: {
    id: MarketSector.BIOTECH,
    name: 'Biotech Innovation',
    tier: 'INNER',
    quadrant: 0,
    tickers: [
      { symbol: 'MRNA', name: 'Moderna', basePriceCents: 6000, volatility: 0.65 },
      { symbol: 'CRSP', name: 'CRISPR Therapeutics', basePriceCents: 5000, volatility: 0.70 },
      { symbol: 'VRTX', name: 'Vertex Pharmaceuticals', basePriceCents: 47000, volatility: 0.45 },
    ],
    adjacentSectors: [MarketSector.HEALTHCARE, MarketSector.BIG_TECH, MarketSector.MEME_ALPHA, MarketSector.SEMIS_AI],
    description: 'Clinical trial gene editing with volatile binary FDA catalysts.',
  },
  [MarketSector.MEME_ALPHA]: {
    id: MarketSector.MEME_ALPHA,
    name: 'Meme & High Beta',
    tier: 'INNER',
    quadrant: 1,
    tickers: [
      { symbol: 'GME', name: 'GameStop', basePriceCents: 2200, volatility: 0.85 },
      { symbol: 'AMC', name: 'AMC Entertainment', basePriceCents: 500, volatility: 0.90 },
      { symbol: 'COIN', name: 'Coinbase', basePriceCents: 21000, volatility: 0.75 },
    ],
    adjacentSectors: [MarketSector.FINANCIALS, MarketSector.SEMIS_AI, MarketSector.BIOTECH, MarketSector.BIG_TECH],
    description: 'Short squeeze battlegrounds, viral sentiment, and crypto brokers.',
  },
  [MarketSector.BIG_TECH]: {
    id: MarketSector.BIG_TECH,
    name: 'Mega-Cap Big Tech',
    tier: 'INNER',
    quadrant: 2,
    tickers: [
      { symbol: 'AAPL', name: 'Apple', basePriceCents: 23000, volatility: 0.32 },
      { symbol: 'MSFT', name: 'Microsoft', basePriceCents: 43000, volatility: 0.30 },
      { symbol: 'GOOGL', name: 'Alphabet', basePriceCents: 17000, volatility: 0.35 },
    ],
    adjacentSectors: [MarketSector.ENERGY, MarketSector.SEMIS_AI, MarketSector.BIOTECH, MarketSector.MEME_ALPHA],
    description: 'Multi-trillion dollar cash cows with enterprise cloud moats.',
  },
  [MarketSector.SEMIS_AI]: {
    id: MarketSector.SEMIS_AI,
    name: 'Semiconductors & AI',
    tier: 'INNER',
    quadrant: 3,
    tickers: [
      { symbol: 'NVDA', name: 'Nvidia', basePriceCents: 13000, volatility: 0.55 },
      { symbol: 'AMD', name: 'AMD', basePriceCents: 16000, volatility: 0.50 },
      { symbol: 'TSM', name: 'TSMC', basePriceCents: 19000, volatility: 0.45 },
    ],
    adjacentSectors: [MarketSector.CONSUMER, MarketSector.BIG_TECH, MarketSector.MEME_ALPHA, MarketSector.BIOTECH],
    description: 'High-margin GPU compute clusters and foundry infrastructure.',
  },
}

export function isSectorAdjacent(fromSector: MarketSector | string, toSector: MarketSector | string): boolean {
  const def = SECTOR_DEFINITIONS[fromSector as MarketSector]
  if (!def)
    return false
  return def.adjacentSectors.includes(toSector as MarketSector)
}

export function getSectorsByTier(tier: SectorTier): SectorDefinition[] {
  return Object.values(SECTOR_DEFINITIONS).filter(s => s.tier === tier)
}

// --- TRADING DUEL ARENA TYPES (ROYALE-9) ---

export type DuelSide = 'LONG' | 'SHORT'
export type DuelLeverage = 1 | 2 | 5
export type DuelPhase = 'COUNTDOWN' | 'ACTIVE' | 'SETTLING' | 'CONCLUDED'

export interface DuelPosition {
  side: DuelSide
  leverage: DuelLeverage
  quantity: number
  entryPriceCents: number
}

export interface DuelParticipant {
  userUuid: string
  username: string
  isLocalUser: boolean
  equityCents: number
  position: DuelPosition | null
  netProfitCents: number
  roiPercent: number
  isBusted: boolean
}

export interface DuelOrderPayload {
  side: DuelSide
  leverage: DuelLeverage
  quantity: number
}

// --- REAL-TIME WEBSOCKET & MATCH FLOW TYPES (ROYALE-10) ---

export type RoyaleEventType =
  | 'MATCH_STATE'
  | 'LIQUIDATION'
  | 'STORM_TICK'
  | 'SECTOR_CLOSURE'
  | 'DUEL_START'
  | 'MATCH_OVER'
  | 'ERROR'

export interface RoyaleWebSocketMessage<T = unknown> {
  type: RoyaleEventType
  payload: T
  timestamp: number
}

export type LiquidationReason = 'STORM' | 'MARGIN_CALL' | 'DUEL_LOSS' | 'TIMEOUT'

export interface LiquidationEventPayload {
  victimUuid: string
  victimUsername: string
  killerUuid?: string
  killerUsername?: string
  reason: LiquidationReason
  bountyCents: number
  sector: string
  placement: number
}

export interface StormTickEventPayload {
  roundNumber: number
  damageRateCentsPerSec: number
  damagedPlayerUuids: string[]
  affectedSectors: string[]
}

export interface SectorClosureEventPayload {
  roundNumber: number
  collapsedSector: string
  remainingSafeSectors: string[]
}

export interface DuelStartEventPayload {
  duelId: string
  sector: string
  participantUuids: string[]
  usernames: string[]
  bountyPotCents: number
}

export type RankTier =
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'DIAMOND'
  | 'CHAMPION'
  | 'GRAND_CHAMPION'
  | 'SUPERSONIC_LEGEND'

export type RankDivision = 'I' | 'II' | 'III'

export interface MatchRankResult {
  oldRankTier: RankTier
  oldDivision: RankDivision
  oldRp: number
  newRankTier: RankTier
  newDivision: RankDivision
  newRp: number
  rpDelta: number
  placement: number
  placementBonusRp: number
  kills: number
  killBonusRp: number
  netProfitCents: number
  profitBonusRp: number
  isPromotion: boolean
  isDemotion: boolean
}

export interface MatchParticipantSummary {
  uuid: string
  username: string
  placement: number
  kills: number
  netProfitCents: number
}

export interface MatchOverEventPayload {
  matchId: string
  winnerUuid: string
  winnerUsername: string
  finalPlacements: MatchParticipantSummary[]
  userResult?: MatchRankResult
}

export interface KillFeedItem {
  id: string
  type: RoyaleEventType
  title: string
  description: string
  timestamp: number
  severity: 'info' | 'warning' | 'danger' | 'gold'
  metadata?: Record<string, unknown>
}

export interface SpectatorTarget {
  uuid: string
  username: string
  sector: string
  equityCents: number
  kills: number
  status: string
}

export interface MatchParticipantState {
  uuid: string
  username: string
  equityCents: number
  capitalCents: number
  activeSector: string
  status: 'ALIVE' | 'IN_DUEL' | 'BUSTED' | 'VICTORIOUS'
  kills: number
  placement?: number
  netProfitCents: number
}

export interface LiveMatchState {
  matchId: string
  phase: 'LOBBY' | 'DROP_SELECTION' | 'ACTIVE_ROUNDS' | 'FINAL_CIRCLE' | 'MATCH_OVER'
  roundNumber: number
  roundTimeRemainingSec: number
  safeSectors: string[]
  collapsingSectors: string[]
  participants: Record<string, MatchParticipantState>
  eliminatedCount: number
  totalPlayers: number
}
