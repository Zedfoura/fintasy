# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: Deterministic 10 Hz Market Tick Simulator & Sector Volatility Regimes for Fintasy Stock Royale

import math
import random
import time
from dataclasses import dataclass
from typing import ClassVar

from pydantic import BaseModel, ConfigDict

from .topology import MarketSector, SectorTier, SectorTopology


@dataclass(frozen=True)
class TickerDef:
    symbol: str
    name: str
    sector: MarketSector
    base_price_cents: int
    volatility: float  # Annualized volatility parameter (0.07 to 0.90)


TICKER_REGISTRY: list[TickerDef] = [
    # Outer Tier: UTILITIES (Low volatility, defensive)
    TickerDef("NEE", "NextEra Energy", MarketSector.UTILITIES, 8000, 0.08),
    TickerDef("DUK", "Duke Energy", MarketSector.UTILITIES, 10500, 0.07),
    TickerDef("SO", "Southern Co", MarketSector.UTILITIES, 8500, 0.07),
    # Outer Tier: REAL_ESTATE (Low volatility, income)
    TickerDef("PLD", "Prologis", MarketSector.REAL_ESTATE, 12000, 0.10),
    TickerDef("AMT", "American Tower", MarketSector.REAL_ESTATE, 19000, 0.11),
    TickerDef("O", "Realty Income", MarketSector.REAL_ESTATE, 5500, 0.09),
    # Outer Tier: MATERIALS (Cyclical)
    TickerDef("LIN", "Linde", MarketSector.MATERIALS, 44000, 0.14),
    TickerDef("SHW", "Sherwin-Williams", MarketSector.MATERIALS, 35000, 0.13),
    TickerDef("FCX", "Freeport-McMoRan", MarketSector.MATERIALS, 4500, 0.18),
    # Outer Tier: INDUSTRIALS (Cyclical defense)
    TickerDef("CAT", "Caterpillar", MarketSector.INDUSTRIALS, 38000, 0.15),
    TickerDef("GE", "GE Aerospace", MarketSector.INDUSTRIALS, 18500, 0.14),
    TickerDef("LMT", "Lockheed Martin", MarketSector.INDUSTRIALS, 56000, 0.12),
    # Mid Tier: HEALTHCARE (Defensive growth)
    TickerDef("UNH", "UnitedHealth", MarketSector.HEALTHCARE, 58000, 0.16),
    TickerDef("LLY", "Eli Lilly", MarketSector.HEALTHCARE, 88000, 0.22),
    TickerDef("PFE", "Pfizer", MarketSector.HEALTHCARE, 2800, 0.18),
    # Mid Tier: FINANCIALS (Rates sensitive)
    TickerDef("JPM", "JPMorgan Chase", MarketSector.FINANCIALS, 22000, 0.20),
    TickerDef("GS", "Goldman Sachs", MarketSector.FINANCIALS, 50000, 0.24),
    TickerDef("V", "Visa", MarketSector.FINANCIALS, 29000, 0.18),
    # Mid Tier: ENERGY (Commodity volatility)
    TickerDef("XOM", "ExxonMobil", MarketSector.ENERGY, 12000, 0.26),
    TickerDef("CVX", "Chevron", MarketSector.ENERGY, 15500, 0.25),
    TickerDef("OXY", "Occidental Petroleum", MarketSector.ENERGY, 5200, 0.32),
    # Mid Tier: CONSUMER (Discretionary growth)
    TickerDef("AMZN", "Amazon", MarketSector.CONSUMER, 19000, 0.24),
    TickerDef("TSLA", "Tesla", MarketSector.CONSUMER, 24000, 0.38),
    TickerDef("NKE", "Nike", MarketSector.CONSUMER, 8200, 0.22),
    # Inner Tier: BIG_TECH (Megacap liquidity)
    TickerDef("AAPL", "Apple", MarketSector.BIG_TECH, 23000, 0.32),
    TickerDef("MSFT", "Microsoft", MarketSector.BIG_TECH, 43000, 0.30),
    TickerDef("GOOGL", "Alphabet", MarketSector.BIG_TECH, 17000, 0.35),
    # Inner Tier: SEMIS_AI (Ultra-high beta AI momentum)
    TickerDef("NVDA", "Nvidia", MarketSector.SEMIS_AI, 13000, 0.55),
    TickerDef("AMD", "AMD", MarketSector.SEMIS_AI, 16000, 0.50),
    TickerDef("TSM", "TSMC", MarketSector.SEMIS_AI, 19000, 0.45),
    # Inner Tier: BIOTECH (Binary clinical trial volatility)
    TickerDef("MRNA", "Moderna", MarketSector.BIOTECH, 6000, 0.65),
    TickerDef("CRSP", "CRISPR Therapeutics", MarketSector.BIOTECH, 5000, 0.70),
    TickerDef("VRTX", "Vertex Pharmaceuticals", MarketSector.BIOTECH, 47000, 0.45),
    # Inner Tier: MEME_ALPHA (Maximum retail volatility & short squeeze action)
    TickerDef("GME", "GameStop", MarketSector.MEME_ALPHA, 2200, 0.85),
    TickerDef("AMC", "AMC Entertainment", MarketSector.MEME_ALPHA, 500, 0.90),
    TickerDef("COIN", "Coinbase", MarketSector.MEME_ALPHA, 21000, 0.75),
]


class MarketTick(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    symbol: str
    sector: str
    price_cents: int
    timestamp_ms: int
    tick_sequence: int
    change_pct: float
    volume: int


class MarketSimEngine:
    """
    Authoritative High-Frequency (10 Hz) Market Tick Generator.
    Uses seeded Geometric Brownian Motion with Mean-Reversion and Jump-Diffusion Shocks.
    """

    DT: ClassVar[float] = 0.1  # 10 Hz = 100ms per tick
    MEAN_REVERSION_SPEED: ClassVar[float] = 0.005  # Gentle drift pull to baseline
    MAX_HISTORY: ClassVar[int] = 100

    def __init__(self, seed: int = 0) -> None:
        self.seed = seed
        self.rng = random.Random(seed)
        self.tick_sequence: int = 0
        self.start_time_ms: int = int(time.time() * 1000)

        # Internal price state (in float cents for precise math before integer rounding)
        self._prices: dict[str, float] = {}
        self._base_prices: dict[str, int] = {}
        self._volatilities: dict[str, float] = {}
        self._sectors: dict[str, str] = {}
        self._min_prices: dict[str, int] = {}
        self._max_prices: dict[str, int] = {}

        # History buffer for charting (symbol -> list[MarketTick])
        self._history: dict[str, list[MarketTick]] = {}

        # Sector to symbols map
        self._sector_tickers: dict[str, list[str]] = {}

        for t in TICKER_REGISTRY:
            self._prices[t.symbol] = float(t.base_price_cents)
            self._base_prices[t.symbol] = t.base_price_cents
            self._volatilities[t.symbol] = t.volatility
            self._sectors[t.symbol] = t.sector.value
            # Circuit breaker bounds: [0.2x, 5.0x]
            self._min_prices[t.symbol] = max(1, int(t.base_price_cents * 0.20))
            self._max_prices[t.symbol] = int(t.base_price_cents * 5.00)
            self._history[t.symbol] = []

            sec_val = t.sector.value
            if sec_val not in self._sector_tickers:
                self._sector_tickers[sec_val] = []
            self._sector_tickers[sec_val].append(t.symbol)

        # Generate initial tick 0
        self.current_ticks: dict[str, MarketTick] = {}
        self._record_tick_frame(is_initial=True)

    def _record_tick_frame(self, is_initial: bool = False) -> dict[str, MarketTick]:
        now_ms = self.start_time_ms + (self.tick_sequence * 100)
        frame: dict[str, MarketTick] = {}

        for symbol, price_float in self._prices.items():
            base = self._base_prices[symbol]
            price_cents = max(1, round(price_float))
            change_pct = ((price_cents - base) / base) * 100.0

            # Approximate volume based on volatility
            vol_factor = self._volatilities[symbol]
            volume = int(self.rng.randint(50, 500) * (1.0 + vol_factor * 2.0))

            tick = MarketTick(
                symbol=symbol,
                sector=self._sectors[symbol],
                price_cents=price_cents,
                timestamp_ms=now_ms,
                tick_sequence=self.tick_sequence,
                change_pct=round(change_pct, 2),
                volume=volume,
            )
            frame[symbol] = tick

            # Append to history
            hist = self._history[symbol]
            hist.append(tick)
            if len(hist) > self.MAX_HISTORY:
                hist.pop(0)

        self.current_ticks = frame
        return frame

    def step_tick(self) -> dict[str, MarketTick]:
        """
        Advances the simulation by 1 step (100ms / 10 Hz) for all 36 tickers.
        Applies Geometric Brownian Motion with Mean-Reversion.
        """
        self.tick_sequence += 1

        for symbol, current_float in self._prices.items():
            base = float(self._base_prices[symbol])
            vol = self._volatilities[symbol]

            # Mean-reversion drift component (pulls towards base price)
            log_price = math.log(max(1.0, current_float))
            log_base = math.log(base)
            drift = -self.MEAN_REVERSION_SPEED * (log_price - log_base) * self.DT

            # Stochastic diffusion component
            # Scaling factor 0.03 balances thrilling 30s duels with realistic candle behavior
            z = self.rng.gauss(0.0, 1.0)
            diffusion = vol * math.sqrt(self.DT) * 0.03 * z

            # Compute new price in log space
            new_log_price = log_price + drift + diffusion
            new_price = math.exp(new_log_price)

            # Clamp within circuit breakers
            min_p = float(self._min_prices[symbol])
            max_p = float(self._max_prices[symbol])
            clamped = max(min_p, min(max_p, new_price))

            self._prices[symbol] = clamped

        return self._record_tick_frame()

    def get_price(self, symbol: str) -> int:
        """Returns the current price of a ticker in integer cents."""
        if symbol not in self.current_ticks:
            raise ValueError(f"Unknown symbol: {symbol}")
        return self.current_ticks[symbol].price_cents

    def get_tick(self, symbol: str) -> MarketTick:
        """Returns the current MarketTick object for a symbol."""
        if symbol not in self.current_ticks:
            raise ValueError(f"Unknown symbol: {symbol}")
        return self.current_ticks[symbol]

    def get_ticker_history(self, symbol: str, count: int = 50) -> list[MarketTick]:
        """Returns the recent tick history for canvas charting."""
        if symbol not in self._history:
            raise ValueError(f"Unknown symbol: {symbol}")
        hist = self._history[symbol]
        return hist[-count:]

    def get_sector_loot_tickers(self, sector: str) -> list[str]:
        """Returns the list of tickers that can be looted in a specific sector."""
        if sector not in self._sector_tickers:
            raise ValueError(f"Unknown sector: {sector}")
        return list(self._sector_tickers[sector])

    def trigger_event(
        self,
        event_name: str,
        sectors: list[str],
        shock_multiplier: float,
    ) -> dict[str, int]:
        """
        Applies a macro market shock (jump diffusion) across target sectors.
        shock_multiplier: e.g. 1.05 (+5%) or 0.92 (-8%).
        """
        impacted_prices: dict[str, int] = {}
        for sector in sectors:
            symbols = self._sector_tickers.get(sector, [])
            for sym in symbols:
                current = self._prices[sym]
                new_price = current * shock_multiplier
                min_p = float(self._min_prices[sym])
                max_p = float(self._max_prices[sym])
                clamped = max(min_p, min(max_p, new_price))
                self._prices[sym] = clamped
                impacted_prices[sym] = round(clamped)

        # Record immediate tick reflecting the jump
        self.step_tick()
        return impacted_prices
