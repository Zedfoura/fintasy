# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: Unit tests for ROYALE-2 Market Sector Topology & Storm Collapse Engine

import unittest

from services.royale import (
    MarketSector,
    MatchManager,
    MatchPhase,
    ParticipantStatus,
    SectorTier,
    SectorTopology,
    StormEngine,
)


class TestSectorTopology(unittest.TestCase):
    """Assay A: Graph Topology & Adjacency Constraints"""

    def setUp(self):
        self.topology = SectorTopology()

    def test_tier_partitioning_and_counts(self):
        all_sectors = self.topology.all_sectors()
        self.assertEqual(len(all_sectors), 12)

        outer = self.topology.get_sectors_by_tier(SectorTier.OUTER)
        mid = self.topology.get_sectors_by_tier(SectorTier.MID)
        inner = self.topology.get_sectors_by_tier(SectorTier.INNER)

        self.assertEqual(len(outer), 4)
        self.assertEqual(len(mid), 4)
        self.assertEqual(len(inner), 4)

        # Verify known tier classifications
        self.assertEqual(
            self.topology.get_tier(MarketSector.UTILITIES.value), SectorTier.OUTER
        )
        self.assertEqual(
            self.topology.get_tier(MarketSector.FINANCIALS.value), SectorTier.MID
        )
        self.assertEqual(
            self.topology.get_tier(MarketSector.SEMIS_AI.value), SectorTier.INNER
        )

    def test_adjacency_symmetry_and_connectivity(self):
        # Every edge must be bidirectional
        for sector in self.topology.all_sectors():
            neighbors = self.topology.get_neighbors(sector)
            self.assertGreater(len(neighbors), 0)
            for neighbor in neighbors:
                self.assertIn(sector, self.topology.get_neighbors(neighbor))

        # Test valid transitions
        self.assertTrue(self.topology.can_transition("UTILITIES", "REAL_ESTATE"))
        self.assertTrue(self.topology.can_transition("UTILITIES", "HEALTHCARE"))
        self.assertTrue(
            self.topology.can_transition("UTILITIES", "UTILITIES")
        )  # Stay in place

        # Test invalid transitions (non-adjacent)
        self.assertFalse(self.topology.can_transition("UTILITIES", "SEMIS_AI"))
        self.assertFalse(self.topology.can_transition("UTILITIES", "ENERGY"))

    def test_bfs_shortest_path(self):
        path = self.topology.shortest_path("UTILITIES", "SEMIS_AI")
        self.assertEqual(path[0], "UTILITIES")
        self.assertEqual(path[-1], "SEMIS_AI")
        # Assert each step in path is an adjacent neighbor
        for i in range(len(path) - 1):
            self.assertTrue(self.topology.can_transition(path[i], path[i + 1]))


class TestStormEngine(unittest.TestCase):
    """Assay B: Deterministic Collapse Schedule & Pacing"""

    def test_schedule_counts_and_concentric_progression(self):
        engine = StormEngine(seed=42)
        sched = engine.schedule

        # Check round counts
        self.assertEqual(len(sched[0].safe_sectors), 12)
        self.assertEqual(len(sched[1].safe_sectors), 8)
        self.assertEqual(len(sched[2].safe_sectors), 5)
        self.assertEqual(len(sched[3].safe_sectors), 3)
        self.assertEqual(len(sched[4].safe_sectors), 1)
        self.assertEqual(len(sched[5].safe_sectors), 1)

        # Check damage rates (in cents/sec)
        self.assertEqual(sched[0].damage_rate_cents_per_sec, 0)
        self.assertEqual(sched[1].damage_rate_cents_per_sec, 5000)  # $50/s
        self.assertEqual(sched[2].damage_rate_cents_per_sec, 7500)  # $75/s
        self.assertEqual(sched[3].damage_rate_cents_per_sec, 10000)  # $100/s
        self.assertEqual(sched[4].damage_rate_cents_per_sec, 15000)  # $150/s
        self.assertEqual(sched[5].damage_rate_cents_per_sec, 20000)  # $200/s

        # Epicenter must be an Inner Tier sector
        final_sector = sched[4].safe_sectors[0]
        self.assertEqual(SectorTopology.get_tier(final_sector), SectorTier.INNER)

    def test_seed_reproducibility(self):
        engine1 = StormEngine(seed=12345)
        engine2 = StormEngine(seed=12345)
        engine_diff = StormEngine(seed=99999)

        # Identical seeds generate identical schedules
        for r in range(6):
            self.assertEqual(
                engine1.schedule[r].safe_sectors, engine2.schedule[r].safe_sectors
            )
            self.assertEqual(
                engine1.schedule[r].collapsed_sectors,
                engine2.schedule[r].collapsed_sectors,
            )


class TestMatchMovementAndStorm(unittest.TestCase):
    """Assay C, D, E: Movement validation, Storm Tick Damage & Liquidation"""

    def setUp(self):
        MatchManager.reset()
        self.manager = MatchManager()
        self.match = self.manager.create_match(target_players=10, seed=101)
        self.player1 = self.manager.join_match(
            self.match.match_id, "user-1", "TraderOne"
        )
        self.player2 = self.manager.join_match(
            self.match.match_id, "user-2", "TraderTwo"
        )
        self.manager.start_drop_phase(self.match.match_id)

    def test_drop_phase_free_selection(self):
        # In DROP_SELECTION, player can pick any sector
        p1 = self.manager.move_participant(self.match.match_id, "user-1", "SEMIS_AI")
        self.assertEqual(p1.active_sector, "SEMIS_AI")

        p2 = self.manager.move_participant(self.match.match_id, "user-2", "UTILITIES")
        self.assertEqual(p2.active_sector, "UTILITIES")

    def test_active_rounds_adjacency_enforcement(self):
        # Set initial drops
        self.manager.move_participant(self.match.match_id, "user-1", "UTILITIES")
        self.manager.start_active_rounds(self.match.match_id)

        # Valid move to adjacent REAL_ESTATE
        p1 = self.manager.move_participant(self.match.match_id, "user-1", "REAL_ESTATE")
        self.assertEqual(p1.active_sector, "REAL_ESTATE")

        # Invalid move attempting to teleport to SEMIS_AI
        with self.assertRaises(ValueError):
            self.manager.move_participant(self.match.match_id, "user-1", "SEMIS_AI")

    def test_storm_tick_damage_bleed(self):
        self.manager.move_participant(self.match.match_id, "user-1", "UTILITIES")
        self.manager.move_participant(self.match.match_id, "user-2", "SEMIS_AI")
        self.manager.start_active_rounds(self.match.match_id)

        # In Round 1, UTILITIES is collapsed (Outer tier), while SEMIS_AI is safe (Inner tier)
        self.assertNotIn("UTILITIES", self.match.safe_sectors)
        self.assertIn("SEMIS_AI", self.match.safe_sectors)

        initial_p1_cap = self.player1.capital_cents
        initial_p2_cap = self.player2.capital_cents

        # Tick 2.0 seconds in Round 1 ($50/sec * 2s = $100 = 10,000 cents)
        res = self.manager.tick_storm(self.match.match_id, delta_sec=2.0)

        # Player 1 in storm loses 10,000 cents
        self.assertEqual(self.player1.capital_cents, initial_p1_cap - 10000)
        self.assertEqual(self.player1.equity_cents, initial_p1_cap - 10000)

        # Player 2 in safe sector loses 0 cents
        self.assertEqual(self.player2.capital_cents, initial_p2_cap)
        self.assertEqual(self.player2.equity_cents, initial_p2_cap)

        self.assertIn("user-1", res["damage_applied"])
        self.assertNotIn("user-2", res["damage_applied"])

    def test_storm_liquidation_and_placement(self):
        self.manager.move_participant(self.match.match_id, "user-1", "UTILITIES")
        self.manager.move_participant(self.match.match_id, "user-2", "SEMIS_AI")
        self.manager.start_active_rounds(self.match.match_id)

        # Set player 1 equity low: 10,000 cents ($100.00)
        self.player1.capital_cents = 10000
        self.player1.equity_cents = 10000

        # Round 1 damage rate is $50/s = 5,000 cents/s
        # 3 seconds of damage = 15,000 cents, exceeding remaining equity
        res = self.manager.tick_storm(self.match.match_id, delta_sec=3.0)

        self.assertEqual(self.player1.equity_cents, 0)
        self.assertEqual(self.player1.status, ParticipantStatus.BUSTED)
        self.assertIn("user-1", res["liquidations"])
        self.assertEqual(self.match.eliminated_count, 1)
        self.assertIsNotNone(self.player1.placement)


if __name__ == "__main__":
    unittest.main()
