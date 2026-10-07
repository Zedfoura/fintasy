# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: Unit tests for ROYALE-3 High-Frequency Market Tick Generator

import math
import unittest

from services.royale import (
    TICKER_REGISTRY,
    MarketSector,
    MarketSimEngine,
    MatchManager,
    TickerDef,
)


class TestMarketSimEngine(unittest.TestCase):
    """Assays A, B, C, E, F: Market Simulation Math & Volatility Regimes"""

    def setUp(self):
        self.engine = MarketSimEngine(seed=42)

    def test_registry_coverage_and_sector_counts(self):
        # 36 tickers across 12 sectors (3 per sector)
        self.assertEqual(len(TICKER_REGISTRY), 36)
        by_sector: dict[str, list[TickerDef]] = {}
        for t in TICKER_REGISTRY:
            by_sector.setdefault(t.sector.value, []).append(t)

        self.assertEqual(len(by_sector), 12)
        for sec, tickers in by_sector.items():
            self.assertEqual(
                len(tickers), 3, f"Sector {sec} must have exactly 3 tickers"
            )

    def test_volatility_hierarchy_empirical(self):
        # Compare Outer tier (NEE, vol=0.08) vs Inner tier (GME, vol=0.85)
        engine = MarketSimEngine(seed=777)
        nee_prices: list[float] = []
        gme_prices: list[float] = []

        for _ in range(300):
            frame = engine.step_tick()
            nee_prices.append(frame["NEE"].price_cents)
            gme_prices.append(frame["GME"].price_cents)

        # Calculate standard deviation of percentage returns
        nee_returns = [
            (nee_prices[i] - nee_prices[i - 1]) / nee_prices[i - 1]
            for i in range(1, len(nee_prices))
        ]
        gme_returns = [
            (gme_prices[i] - gme_prices[i - 1]) / gme_prices[i - 1]
            for i in range(1, len(gme_prices))
        ]

        nee_std = math.sqrt(sum(r**2 for r in nee_returns) / len(nee_returns))
        gme_std = math.sqrt(sum(r**2 for r in gme_returns) / len(gme_returns))

        # GME volatility must be significantly greater than NEE
        self.assertGreater(gme_std, nee_std * 2.0)

    def test_seed_determinism(self):
        engine1 = MarketSimEngine(seed=999)
        engine2 = MarketSimEngine(seed=999)

        for _ in range(200):
            frame1 = engine1.step_tick()
            frame2 = engine2.step_tick()
            for sym in frame1:
                self.assertEqual(
                    frame1[sym].price_cents,
                    frame2[sym].price_cents,
                    f"Desync on symbol {sym} at step {frame1[sym].tick_sequence}",
                )

    def test_circuit_breakers_and_non_zero_floor(self):
        engine = MarketSimEngine(seed=123)
        for _ in range(500):
            frame = engine.step_tick()
            for sym, tick in frame.items():
                self.assertGreater(tick.price_cents, 0)
                # Circuit breakers: [0.2x, 5.0x] of base
                base = next(
                    t.base_price_cents for t in TICKER_REGISTRY if t.symbol == sym
                )
                self.assertGreaterEqual(tick.price_cents, int(base * 0.20))
                self.assertLessEqual(tick.price_cents, int(base * 5.00))

    def test_macro_event_shock(self):
        engine = MarketSimEngine(seed=555)
        pre_nvda = engine.get_price("NVDA")
        pre_amd = engine.get_price("AMD")
        pre_nee = engine.get_price("NEE")

        # Trigger positive 10% AI event shock
        engine.trigger_event("AI_BOOM", [MarketSector.SEMIS_AI.value], 1.10)

        post_nvda = engine.get_price("NVDA")
        post_amd = engine.get_price("AMD")
        post_nee = engine.get_price("NEE")

        # SEMIS_AI tickers must jump significantly
        self.assertGreater(post_nvda, pre_nvda)
        self.assertGreater(post_amd, pre_amd)
        # NEE in UTILITIES must not have jumped by 10%
        self.assertAlmostEqual(post_nee, pre_nee, delta=100)

    def test_history_buffer(self):
        engine = MarketSimEngine(seed=101)
        for _ in range(30):
            engine.step_tick()

        hist = engine.get_ticker_history("NVDA", count=25)
        self.assertEqual(len(hist), 25)
        # Timestamps and sequences must be strictly increasing
        for i in range(1, len(hist)):
            self.assertGreater(hist[i].tick_sequence, hist[i - 1].tick_sequence)
            self.assertGreater(hist[i].timestamp_ms, hist[i - 1].timestamp_ms)


class TestMatchLootAllocation(unittest.TestCase):
    """Assay D: Uncontested Drop Loot Allocation"""

    def setUp(self):
        MatchManager.reset()
        self.manager = MatchManager()
        self.match = self.manager.create_match(target_players=3, seed=888)
        self.p1 = self.manager.join_match(self.match.match_id, "u-1", "SoloSemis")
        self.p2 = self.manager.join_match(self.match.match_id, "u-2", "CrowdUtil1")
        self.p3 = self.manager.join_match(self.match.match_id, "u-3", "CrowdUtil2")
        self.manager.start_drop_phase(self.match.match_id)

    def test_uncontested_loot_awarded_on_active_rounds(self):
        # u-1 drops alone in SEMIS_AI
        self.manager.move_participant(self.match.match_id, "u-1", "SEMIS_AI")
        # u-2 and u-3 drop together in UTILITIES
        self.manager.move_participant(self.match.match_id, "u-2", "UTILITIES")
        self.manager.move_participant(self.match.match_id, "u-3", "UTILITIES")

        self.manager.start_active_rounds(self.match.match_id)

        # Solo drop in SEMIS_AI gets prime loot ticker (NVDA)
        self.assertIn("NVDA", self.p1.held_tickers)

        # Contested drop in UTILITIES gets no free loot
        self.assertEqual(len(self.p2.held_tickers), 0)
        self.assertEqual(len(self.p3.held_tickers), 0)


if __name__ == "__main__":
    unittest.main()
