# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: Unit tests for ROYALE-5 Sector Contestation & Third-Party Battle Protocol

import unittest

from services.royale import (
    MatchManager,
    ParticipantStatus,
    PositionSide,
)


class TestThirdPartyProtocol(unittest.TestCase):
    """Assays for ROYALE-5: Third-Party Escalation, Multi-Way Combat & Multi-Kill Scoring"""

    def setUp(self):
        MatchManager.reset()
        self.manager = MatchManager()
        self.match = self.manager.create_match(target_players=4, seed=303)
        self.p1 = self.manager.join_match(self.match.match_id, "u1", "ApexPredator")
        self.p2 = self.manager.join_match(self.match.match_id, "u2", "Contender")
        self.p3 = self.manager.join_match(self.match.match_id, "u3", "ThirdPartyShark")
        self.p4 = self.manager.join_match(self.match.match_id, "u4", "DistantTrader")
        self.manager.start_drop_phase(self.match.match_id)

        # Drop p1, p2, p3 into SEMIS_AI (contested 3-way sector)
        self.manager.move_participant(self.match.match_id, "u1", "SEMIS_AI")
        self.manager.move_participant(self.match.match_id, "u2", "SEMIS_AI")
        self.manager.move_participant(self.match.match_id, "u3", "SEMIS_AI")
        # Drop p4 into distant sector
        self.manager.move_participant(self.match.match_id, "u4", "UTILITIES")

        self.manager.start_active_rounds(self.match.match_id)

    def test_third_party_entry_and_timer_extension(self):
        # 1. Initiate 1v1 duel between p1 and p2
        duel = self.manager.initiate_duel(self.match.match_id, "SEMIS_AI", "u1", "u2")
        self.assertEqual(duel.time_remaining_sec, 30.0)
        self.assertEqual(len(duel.participant_ids), 2)
        self.assertEqual(duel.third_party_count, 0)

        # 2. Simulate 22 seconds of combat elapsed (8.0s remaining)
        self.manager.tick_duels(self.match.match_id, delta_sec=22.0)
        self.assertAlmostEqual(duel.time_remaining_sec, 8.0, delta=0.1)

        # 3. Third party p3 enters the active duel
        self.manager.third_party_duel(self.match.match_id, duel.duel_id, "u3")
        self.assertEqual(self.p3.status, ParticipantStatus.IN_DUEL)
        self.assertEqual(len(duel.participant_ids), 3)
        self.assertIn("u3", duel.participant_ids)
        self.assertEqual(duel.third_party_count, 1)

        # 4. Timer must dynamically extend to the 15.0s floor
        self.assertEqual(duel.time_remaining_sec, 15.0)

    def test_third_party_guards_and_validation(self):
        duel = self.manager.initiate_duel(self.match.match_id, "SEMIS_AI", "u1", "u2")

        # Guard 1: Distant sector player cannot join
        with self.assertRaises(ValueError) as ctx:
            self.manager.third_party_duel(self.match.match_id, duel.duel_id, "u4")
        self.assertIn("sector", str(ctx.exception).lower())

        # Guard 2: Already enrolled player cannot rejoin
        with self.assertRaises(ValueError):
            self.manager.third_party_duel(self.match.match_id, duel.duel_id, "u1")

        # Guard 3: Dead/busted player cannot join
        self.p3.status = ParticipantStatus.BUSTED
        with self.assertRaises(ValueError):
            self.manager.third_party_duel(self.match.match_id, duel.duel_id, "u3")

        # Guard 4: Non-existent duel
        self.p3.status = ParticipantStatus.ALIVE
        with self.assertRaises(ValueError):
            self.manager.third_party_duel(self.match.match_id, "invalid_duel_id", "u3")

    def test_multi_way_order_placement_and_position_isolation(self):
        duel = self.manager.initiate_duel(self.match.match_id, "SEMIS_AI", "u1", "u2")
        self.manager.third_party_duel(self.match.match_id, duel.duel_id, "u3")

        # All 3 open distinct positions
        pos1 = self.manager.place_duel_order(
            duel.duel_id,
            "u1",
            "NVDA",
            PositionSide.LONG,
            leverage=2,
            collateral_cents=50000,
        )
        pos2 = self.manager.place_duel_order(
            duel.duel_id,
            "u2",
            "NVDA",
            PositionSide.SHORT,
            leverage=5,
            collateral_cents=30000,
        )
        pos3 = self.manager.place_duel_order(
            duel.duel_id,
            "u3",
            "AMD",
            PositionSide.LONG,
            leverage=1,
            collateral_cents=40000,
        )

        self.assertEqual(len(duel.positions["u1"]), 1)
        self.assertEqual(len(duel.positions["u2"]), 1)
        self.assertEqual(len(duel.positions["u3"]), 1)

        self.assertEqual(pos1.collateral_cents, 50000)
        self.assertEqual(pos2.collateral_cents, 30000)
        self.assertEqual(pos3.collateral_cents, 40000)

        # Capital pots correctly deducted
        self.assertEqual(self.p1.capital_cents, 1500000 - 50000)
        self.assertEqual(self.p2.capital_cents, 1500000 - 30000)
        self.assertEqual(self.p3.capital_cents, 1500000 - 40000)

    def test_3_way_performance_ranking_and_spoils_distribution(self):
        duel = self.manager.initiate_duel(self.match.match_id, "SEMIS_AI", "u1", "u2")
        self.manager.third_party_duel(self.match.match_id, duel.duel_id, "u3")
        sim = self.manager.get_market_sim(self.match.match_id)

        # Give p2 and p3 loot cards to steal
        self.p2.held_tickers = ["TSM"]
        self.p3.held_tickers = ["NVDA"]

        current_nvda = sim.get_price("NVDA")
        # u1: Long NVDA 5x leverage ($1000 collateral)
        self.manager.place_duel_order(
            duel.duel_id,
            "u1",
            "NVDA",
            PositionSide.LONG,
            leverage=5,
            collateral_cents=100000,
        )
        # u2: Short NVDA 5x leverage ($1000 collateral)
        self.manager.place_duel_order(
            duel.duel_id,
            "u2",
            "NVDA",
            PositionSide.SHORT,
            leverage=5,
            collateral_cents=100000,
        )
        # u3: Long NVDA 1x leverage ($500 collateral)
        self.manager.place_duel_order(
            duel.duel_id,
            "u3",
            "NVDA",
            PositionSide.LONG,
            leverage=1,
            collateral_cents=50000,
        )

        # Price rises +5%
        # u1: +25% profit (+25,000 cents)
        # u2: -25% loss (-25,000 cents)
        # u3: +5% profit (+2,500 cents)
        sim._prices["NVDA"] = current_nvda * 1.05
        sim._record_tick_frame()

        # Expire duel
        resolutions = self.manager.tick_duels(self.match.match_id, delta_sec=30.0)
        self.assertEqual(len(resolutions), 1)
        res = resolutions[0]

        self.assertFalse(res.is_draw)
        self.assertEqual(res.winner_id, "u1")
        # Rankings: u1 (1st), u3 (2nd), u2 (3rd)
        self.assertEqual(res.rankings, ["u1", "u3", "u2"])
        self.assertEqual(res.loser_ids, ["u3", "u2"])

        # u1 collected bounties and scored kills
        self.assertGreater(res.bounty_transferred_cents, 0)
        self.assertEqual(self.p1.kills, 2)  # 2 defeated opponents
        self.assertIn("TSM", self.p1.held_tickers)
        self.assertIn("NVDA", self.p1.held_tickers)

        # All participants returned to ALIVE (no bankruptcies)
        self.assertEqual(self.p1.status, ParticipantStatus.ALIVE)
        self.assertEqual(self.p2.status, ParticipantStatus.ALIVE)
        self.assertEqual(self.p3.status, ParticipantStatus.ALIVE)

    def test_multi_kill_double_bankruptcy(self):
        duel = self.manager.initiate_duel(self.match.match_id, "SEMIS_AI", "u1", "u2")
        self.manager.third_party_duel(self.match.match_id, duel.duel_id, "u3")
        sim = self.manager.get_market_sim(self.match.match_id)

        # Drain p2 and p3 to near-bankruptcy ($50 = 5,000 cents each)
        self.p2.capital_cents = 5000
        self.p2.equity_cents = 5000
        self.p3.capital_cents = 5000
        self.p3.equity_cents = 5000

        # p1: Short NVDA 5x ($1,000)
        self.manager.place_duel_order(
            duel.duel_id,
            "u1",
            "NVDA",
            PositionSide.SHORT,
            leverage=5,
            collateral_cents=100000,
        )
        # p2 & p3: 5x Long NVDA ($50 each)
        self.manager.place_duel_order(
            duel.duel_id,
            "u2",
            "NVDA",
            PositionSide.LONG,
            leverage=5,
            collateral_cents=5000,
        )
        self.manager.place_duel_order(
            duel.duel_id,
            "u3",
            "NVDA",
            PositionSide.LONG,
            leverage=5,
            collateral_cents=5000,
        )

        # Price drops 25% -> u2 and u3 suffer -125% loss (100% collateral wipeout)
        current_nvda = sim.get_price("NVDA")
        sim._prices["NVDA"] = current_nvda * 0.75
        sim._record_tick_frame()

        resolutions = self.manager.tick_duels(self.match.match_id, delta_sec=30.0)
        self.assertEqual(len(resolutions), 1)
        res = resolutions[0]

        # Both p2 and p3 wiped out -> BUSTED
        self.assertEqual(self.p2.status, ParticipantStatus.BUSTED)
        self.assertEqual(self.p3.status, ParticipantStatus.BUSTED)
        self.assertEqual(self.p2.equity_cents, 0)
        self.assertEqual(self.p3.equity_cents, 0)

        # Eliminated count increments by 2
        self.assertEqual(self.match.eliminated_count, 2)
        self.assertIsNotNone(self.p2.placement)
        self.assertIsNotNone(self.p3.placement)

    def test_three_way_idle_draw(self):
        duel = self.manager.initiate_duel(self.match.match_id, "SEMIS_AI", "u1", "u2")
        self.manager.third_party_duel(self.match.match_id, duel.duel_id, "u3")

        # Nobody trades
        resolutions = self.manager.tick_duels(self.match.match_id, delta_sec=30.0)
        self.assertEqual(len(resolutions), 1)
        res = resolutions[0]

        self.assertTrue(res.is_draw)
        self.assertIsNone(res.winner_id)
        self.assertEqual(self.p1.status, ParticipantStatus.ALIVE)
        self.assertEqual(self.p2.status, ParticipantStatus.ALIVE)
        self.assertEqual(self.p3.status, ParticipantStatus.ALIVE)

    def test_timer_not_extended_when_plenty_of_time(self):
        duel = self.manager.initiate_duel(self.match.match_id, "SEMIS_AI", "u1", "u2")
        # 30s remaining
        self.manager.third_party_duel(self.match.match_id, duel.duel_id, "u3")
        # Time remaining should still be 30.0s (not reduced or artificially expanded beyond 30)
        self.assertEqual(duel.time_remaining_sec, 30.0)


if __name__ == "__main__":
    unittest.main()
