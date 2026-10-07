# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: Unit tests for ROYALE-4 30-Second Micro-Trading Duel Engine & Liquidation

import unittest

from services.royale import (
    DuelEngine,
    MatchManager,
    ParticipantStatus,
    PositionSide,
)


class TestDuelEngine(unittest.TestCase):
    """Assays A, B, C: Pure Math, Order Mechanics & Margin Liquidation"""

    def test_pnl_calculation_long_and_short(self):
        # Long: entry 10000 cents ($100), price rises to 11000 cents ($110) [+10%]
        # Collateral 100,000 cents ($1000), 2x leverage -> +$200 profit (20,000 cents)
        long_pnl = DuelEngine.compute_position_pnl(
            side=PositionSide.LONG,
            leverage=2,
            collateral_cents=100000,
            entry_price_cents=10000,
            current_price_cents=11000,
        )
        self.assertEqual(long_pnl, 20000)

        # Short: entry 10000 cents ($100), price falls to 9500 cents ($95) [-5%]
        # Collateral 100,000 cents ($1000), 5x leverage -> +$250 profit (25,000 cents)
        short_pnl = DuelEngine.compute_position_pnl(
            side=PositionSide.SHORT,
            leverage=5,
            collateral_cents=100000,
            entry_price_cents=10000,
            current_price_cents=9500,
        )
        self.assertEqual(short_pnl, 25000)

    def test_margin_maintenance_auto_liquidation(self):
        duel = DuelEngine.create_duel("m1", "SEMIS_AI", "u1", "u2")
        # Open 5x Long on NVDA at 10,000 cents with 50,000 cents collateral
        pos = DuelEngine.open_position(
            duel=duel,
            participant_id="u1",
            symbol="NVDA",
            side=PositionSide.LONG,
            leverage=5,
            collateral_cents=50000,
            current_price_cents=10000,
        )
        self.assertFalse(pos.is_closed)

        # Price drops 19% to 8,100 cents.
        # Loss with 5x leverage is 5 * -19% = -95% of collateral (exceeds 90% threshold)
        liquidated = DuelEngine.update_positions(duel, {"NVDA": 8100})

        self.assertEqual(len(liquidated), 1)
        self.assertTrue(pos.is_closed)
        self.assertTrue(pos.is_liquidated)
        # Realized loss is capped at full collateral
        self.assertEqual(pos.realized_pnl_cents, -50000)


class TestMatchDuelLifecycle(unittest.TestCase):
    """Assays D, E, F, G: Full Match Manager Duel Lifecycle, Bounties, and Liquidation"""

    def setUp(self):
        MatchManager.reset()
        self.manager = MatchManager()
        self.match = self.manager.create_match(target_players=4, seed=101)
        self.p1 = self.manager.join_match(self.match.match_id, "u1", "BullTrader")
        self.p2 = self.manager.join_match(self.match.match_id, "u2", "BearTrader")
        self.p3 = self.manager.join_match(self.match.match_id, "u3", "Spectator")
        self.manager.start_drop_phase(self.match.match_id)

        # Drop p1 and p2 into SEMIS_AI (contested drop)
        self.manager.move_participant(self.match.match_id, "u1", "SEMIS_AI")
        self.manager.move_participant(self.match.match_id, "u2", "SEMIS_AI")
        self.manager.move_participant(self.match.match_id, "u3", "UTILITIES")
        self.manager.start_active_rounds(self.match.match_id)

    def test_duel_initiation_and_movement_lock(self):
        duel = self.manager.initiate_duel(self.match.match_id, "SEMIS_AI", "u1", "u2")
        self.assertEqual(self.p1.status, ParticipantStatus.IN_DUEL)
        self.assertEqual(self.p2.status, ParticipantStatus.IN_DUEL)

        # Movement must be rejected while IN_DUEL
        with self.assertRaises(ValueError):
            self.manager.move_participant(self.match.match_id, "u1", "BIG_TECH")

        # Second duel attempt while in duel must be rejected
        with self.assertRaises(ValueError):
            self.manager.initiate_duel(self.match.match_id, "SEMIS_AI", "u1", "u3")

    def test_order_placement_and_leverage_limits(self):
        duel = self.manager.initiate_duel(self.match.match_id, "SEMIS_AI", "u1", "u2")
        initial_cap = self.p1.capital_cents

        # Valid 2x order
        pos = self.manager.place_duel_order(
            duel_id=duel.duel_id,
            participant_id="u1",
            symbol="NVDA",
            side=PositionSide.LONG,
            leverage=2,
            collateral_cents=100000,  # $1,000
        )
        self.assertEqual(pos.leverage, 2)
        # Collateral reserved from liquid capital
        self.assertEqual(self.p1.capital_cents, initial_cap - 100000)

        # Invalid leverage (3x or 10x) must be rejected
        with self.assertRaises(ValueError):
            self.manager.place_duel_order(
                duel_id=duel.duel_id,
                participant_id="u1",
                symbol="NVDA",
                side=PositionSide.LONG,
                leverage=10,
                collateral_cents=50000,
            )

        # Insufficient capital order must be rejected
        with self.assertRaises(ValueError):
            self.manager.place_duel_order(
                duel_id=duel.duel_id,
                participant_id="u1",
                symbol="NVDA",
                side=PositionSide.LONG,
                leverage=5,
                collateral_cents=999999999,
            )

    def test_early_position_close(self):
        duel = self.manager.initiate_duel(self.match.match_id, "SEMIS_AI", "u1", "u2")
        sim = self.manager.get_market_sim(self.match.match_id)
        current_nvda = sim.get_price("NVDA")

        # p1 opens Long NVDA
        pos = self.manager.place_duel_order(
            duel.duel_id,
            "u1",
            "NVDA",
            PositionSide.LONG,
            leverage=1,
            collateral_cents=50000,
        )

        # Simulate price jump +5%
        sim._prices["NVDA"] = current_nvda * 1.05
        sim._record_tick_frame()

        realized_pnl = self.manager.close_duel_position(
            duel.duel_id, "u1", pos.position_id
        )
        self.assertGreater(realized_pnl, 0)
        # Collateral and profit returned to capital
        self.assertEqual(self.p1.capital_cents, 1500000 + realized_pnl)

    def test_duel_resolution_bounty_and_loot_transfer(self):
        # Give p2 a loot ticker to steal
        self.p2.held_tickers.append("AMD")

        duel = self.manager.initiate_duel(self.match.match_id, "SEMIS_AI", "u1", "u2")
        sim = self.manager.get_market_sim(self.match.match_id)
        current_nvda = sim.get_price("NVDA")

        # p1 goes Long NVDA (5x leverage)
        self.manager.place_duel_order(
            duel.duel_id,
            "u1",
            "NVDA",
            PositionSide.LONG,
            leverage=5,
            collateral_cents=100000,
        )
        # p2 goes Short NVDA (5x leverage)
        self.manager.place_duel_order(
            duel.duel_id,
            "u2",
            "NVDA",
            PositionSide.SHORT,
            leverage=5,
            collateral_cents=100000,
        )

        # Price rises by +4% (p1 wins big, p2 loses)
        sim._prices["NVDA"] = current_nvda * 1.04
        sim._record_tick_frame()

        p2_pre_bounty_cap = self.p2.capital_cents

        # Tick 30 seconds to expire the duel timer
        resolutions = self.manager.tick_duels(self.match.match_id, delta_sec=30.0)

        self.assertEqual(len(resolutions), 1)
        res = resolutions[0]
        self.assertEqual(res.winner_id, "u1")
        self.assertEqual(res.loser_id, "u2")

        # Winner stole 25% cash bounty from loser
        expected_bounty = int(
            (p2_pre_bounty_cap + (100000 - 20000)) * 0.25
        )  # after settlement
        self.assertGreater(res.bounty_transferred_cents, 0)

        # Winner stole AMD loot card from loser
        self.assertIn("AMD", self.p1.held_tickers)
        self.assertNotIn("AMD", self.p2.held_tickers)

        # Winner scored 1 kill
        self.assertEqual(self.p1.kills, 1)

        # Both returned to ALIVE (p2 still had capital left)
        self.assertEqual(self.p1.status, ParticipantStatus.ALIVE)
        self.assertEqual(self.p2.status, ParticipantStatus.ALIVE)

    def test_loser_bankruptcy_liquidation(self):
        duel = self.manager.initiate_duel(self.match.match_id, "SEMIS_AI", "u1", "u2")
        sim = self.manager.get_market_sim(self.match.match_id)

        # Drain p2 capital to near zero ($100 = 10,000 cents)
        self.p2.capital_cents = 10000
        self.p2.equity_cents = 10000

        # p2 puts all 10,000 cents into Long NVDA 5x leverage
        self.manager.place_duel_order(
            duel.duel_id,
            "u2",
            "NVDA",
            PositionSide.LONG,
            leverage=5,
            collateral_cents=10000,
        )

        # Price crashes by 20% -> p2 wiped out (loses all 10,000 cents)
        current_nvda = sim.get_price("NVDA")
        sim._prices["NVDA"] = current_nvda * 0.80
        sim._record_tick_frame()

        resolutions = self.manager.tick_duels(self.match.match_id, delta_sec=30.0)

        self.assertEqual(len(resolutions), 1)
        self.assertEqual(self.p2.status, ParticipantStatus.BUSTED)
        self.assertEqual(self.p2.equity_cents, 0)
        self.assertEqual(self.match.eliminated_count, 1)
        self.assertIsNotNone(self.p2.placement)

    def test_draw_resolution_when_idle(self):
        duel = self.manager.initiate_duel(self.match.match_id, "SEMIS_AI", "u1", "u2")
        # Neither player opens an order
        resolutions = self.manager.tick_duels(self.match.match_id, delta_sec=30.0)

        self.assertEqual(len(resolutions), 1)
        res = resolutions[0]
        self.assertTrue(res.is_draw)
        self.assertIsNone(res.winner_id)
        self.assertEqual(self.p1.status, ParticipantStatus.ALIVE)
        self.assertEqual(self.p2.status, ParticipantStatus.ALIVE)


if __name__ == "__main__":
    unittest.main()
