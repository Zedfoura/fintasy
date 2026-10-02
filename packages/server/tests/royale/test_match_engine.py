# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: Falsifiable verification assay for ROYALE-1 Match State Machine & Lobby Orchestrator

import os
import sys
import time
import unittest

# Ensure src is on python path
sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "src"))
)

from services.royale import (
    BotArchetype,
    MatchManager,
    MatchPhase,
    ParticipantStatus,
)


class TestMatchEngine(unittest.TestCase):
    def setUp(self):
        self.mgr = MatchManager()
        self.mgr.reset()

    def test_assay_a_lobby_creation_and_human_join(self):
        """Assay A: Verifies match creation in LOBBY phase and human joining with $15,000 starting pot."""
        match = self.mgr.create_match(target_players=40, seed=12345)
        self.assertEqual(match.phase, MatchPhase.LOBBY)
        self.assertEqual(match.target_players, 40)
        self.assertEqual(len(match.participants), 0)

        # Human joins
        user_id = "user-alpha-001"
        participant = self.mgr.join_match(
            match.match_id, user_id=user_id, username="TraderAlpha"
        )
        self.assertEqual(participant.uuid, user_id)
        self.assertEqual(participant.username, "TraderAlpha")
        self.assertFalse(participant.is_bot)
        self.assertEqual(participant.capital_cents, 1500000)  # $15,000.00
        self.assertEqual(participant.equity_cents, 1500000)
        self.assertEqual(participant.status, ParticipantStatus.ALIVE)
        self.assertEqual(len(match.participants), 1)

    def test_assay_b_bot_autofill_performance_and_distribution(self):
        """Assay B: Fills remaining 39 slots in <20ms and verifies calibrated archetype ratio."""
        match = self.mgr.create_match(target_players=40, seed=999)
        self.mgr.join_match(match.match_id, user_id="human-1", username="HumanTrader")

        start_time = time.perf_counter()
        added_bots = self.mgr.fill_bots(match.match_id)
        elapsed_ms = (time.perf_counter() - start_time) * 1000

        self.assertEqual(len(added_bots), 39)
        self.assertEqual(len(match.participants), 40)
        # Performance requirement: bot fill must take < 20 ms
        self.assertLess(
            elapsed_ms, 20.0, f"Bot fill took {elapsed_ms:.2f}ms, expected < 20ms"
        )

        # Verify archetype counts
        scalpers = [b for b in added_bots if b.bot_archetype == BotArchetype.SCALPER]
        swings = [b for b in added_bots if b.bot_archetype == BotArchetype.SWING]
        degens = [b for b in added_bots if b.bot_archetype == BotArchetype.DEGEN]

        # 39 * 0.40 = 15.6 -> 16; 39 * 0.35 = 13.65 -> 14; 39 - 30 = 9
        self.assertEqual(len(scalpers), 16)
        self.assertEqual(len(swings), 14)
        self.assertEqual(len(degens), 9)

        # Ensure all bots have valid $15,000 capital and bot names
        for bot in added_bots:
            self.assertTrue(bot.is_bot)
            self.assertTrue(bot.username.startswith("AI_"))
            self.assertEqual(bot.capital_cents, 1500000)

    def test_assay_c_state_progression_and_guards(self):
        """Assay C: Verifies transition to DROP_SELECTION, auto-fill on start, and late join rejection."""
        match = self.mgr.create_match(target_players=40, seed=42)
        self.mgr.join_match(
            match.match_id, user_id="human-player", username="AceTrader"
        )

        # Auto-transitions to drop phase (should fill remaining 39 bots automatically)
        updated_match = self.mgr.start_drop_phase(match.match_id)
        self.assertEqual(updated_match.phase, MatchPhase.DROP_SELECTION)
        self.assertEqual(len(updated_match.participants), 40)
        self.assertEqual(updated_match.round_time_remaining_sec, 20)

        # Late join must be rejected
        with self.assertRaises(ValueError) as ctx:
            self.mgr.join_match(
                match.match_id, user_id="late-comer", username="LatePlayer"
            )
        self.assertIn("DROP_SELECTION", str(ctx.exception))

        # Transition to active rounds
        active_match = self.mgr.start_active_rounds(match.match_id)
        self.assertEqual(active_match.phase, MatchPhase.ACTIVE_ROUNDS)
        self.assertEqual(active_match.round_number, 1)
        self.assertEqual(active_match.round_time_remaining_sec, 90)

    def test_assay_d_seed_reproducibility_and_serialization(self):
        """Assay D: Asserts identical seeds generate deterministic bot rosters and validates dictionary serialization."""
        match1 = self.mgr.create_match(target_players=20, seed=777)
        bots1 = self.mgr.fill_bots(match1.match_id)

        self.mgr.reset()
        match2 = self.mgr.create_match(target_players=20, seed=777)
        bots2 = self.mgr.fill_bots(match2.match_id)

        self.assertEqual(len(bots1), len(bots2))
        for b1, b2 in zip(bots1, bots2):
            self.assertEqual(b1.username, b2.username)
            self.assertEqual(b1.bot_archetype, b2.bot_archetype)

        # Serialization check
        serialized = self.mgr.to_dict(match2.match_id)
        self.assertEqual(serialized["match_id"], match2.match_id)
        self.assertEqual(serialized["phase"], "LOBBY")
        self.assertEqual(len(serialized["participants"]), 20)


if __name__ == "__main__":
    unittest.main()
