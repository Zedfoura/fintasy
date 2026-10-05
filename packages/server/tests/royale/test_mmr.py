# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: Unit tests for ROYALE-6 Rocket League Tiered MMR & Rating System Engine

import unittest

from services.royale import (
    MatchManager,
    MMREngine,
    RankDivision,
    RankTier,
    UserRank,
)


class TestMMREngine(unittest.TestCase):
    """Assays A through F: Pure Math, Threshold Mapping, Scoring & Protection"""

    def test_tier_and_division_mapping(self):
        # Bronze bands
        self.assertEqual(
            MMREngine.get_tier_and_division(0), (RankTier.BRONZE, RankDivision.III)
        )
        self.assertEqual(
            MMREngine.get_tier_and_division(750), (RankTier.BRONZE, RankDivision.II)
        )
        self.assertEqual(
            MMREngine.get_tier_and_division(1200), (RankTier.BRONZE, RankDivision.I)
        )

        # Silver bands
        self.assertEqual(
            MMREngine.get_tier_and_division(1500), (RankTier.SILVER, RankDivision.III)
        )
        self.assertEqual(
            MMREngine.get_tier_and_division(3000), (RankTier.SILVER, RankDivision.I)
        )

        # Gold bands
        self.assertEqual(
            MMREngine.get_tier_and_division(3500), (RankTier.GOLD, RankDivision.III)
        )
        self.assertEqual(
            MMREngine.get_tier_and_division(5500), (RankTier.GOLD, RankDivision.I)
        )

        # Platinum & Diamond
        self.assertEqual(
            MMREngine.get_tier_and_division(6000), (RankTier.PLATINUM, RankDivision.III)
        )
        self.assertEqual(
            MMREngine.get_tier_and_division(9000), (RankTier.DIAMOND, RankDivision.III)
        )

        # Champion & Golden Trader
        self.assertEqual(
            MMREngine.get_tier_and_division(12500),
            (RankTier.CHAMPION, RankDivision.III),
        )
        self.assertEqual(
            MMREngine.get_tier_and_division(16000),
            (RankTier.GOLDEN_TRADER, RankDivision.I),
        )
        self.assertEqual(
            MMREngine.get_tier_and_division(25000),
            (RankTier.GOLDEN_TRADER, RankDivision.I),
        )

    def test_entry_cost_schedule(self):
        self.assertEqual(MMREngine.compute_entry_cost(RankTier.BRONZE, 500), 15)
        self.assertEqual(MMREngine.compute_entry_cost(RankTier.SILVER, 2000), 25)
        self.assertEqual(MMREngine.compute_entry_cost(RankTier.GOLD, 4000), 40)
        self.assertEqual(MMREngine.compute_entry_cost(RankTier.PLATINUM, 7000), 55)
        self.assertEqual(MMREngine.compute_entry_cost(RankTier.DIAMOND, 10000), 70)
        self.assertEqual(MMREngine.compute_entry_cost(RankTier.CHAMPION, 13000), 85)

        # Golden Trader scaling: base 100 + 5 per full 1000 RP over 16,000
        self.assertEqual(
            MMREngine.compute_entry_cost(RankTier.GOLDEN_TRADER, 16000), 100
        )
        self.assertEqual(
            MMREngine.compute_entry_cost(RankTier.GOLDEN_TRADER, 18500), 110
        )
        self.assertEqual(
            MMREngine.compute_entry_cost(RankTier.GOLDEN_TRADER, 22100), 130
        )

    def test_placement_points_schedule(self):
        self.assertEqual(MMREngine.compute_placement_rp(1), 140)
        self.assertEqual(MMREngine.compute_placement_rp(2), 100)
        self.assertEqual(MMREngine.compute_placement_rp(3), 75)
        self.assertEqual(MMREngine.compute_placement_rp(5), 55)
        self.assertEqual(MMREngine.compute_placement_rp(8), 35)
        self.assertEqual(MMREngine.compute_placement_rp(14), 20)
        self.assertEqual(MMREngine.compute_placement_rp(18), 10)
        self.assertEqual(MMREngine.compute_placement_rp(25), 0)
        self.assertEqual(MMREngine.compute_placement_rp(40), 0)

    def test_kill_rp_and_diminishing_returns(self):
        # 1st place: base 25 RP per kill
        self.assertEqual(MMREngine.compute_liquidation_rp(placement=1, kills=0), 0)
        self.assertEqual(MMREngine.compute_liquidation_rp(placement=1, kills=1), 25)
        self.assertEqual(MMREngine.compute_liquidation_rp(placement=1, kills=3), 75)
        # 4 kills: 3 * 25 + 1 * 20 = 95
        self.assertEqual(MMREngine.compute_liquidation_rp(placement=1, kills=4), 95)
        # 7 kills: 3 * 25 + 3 * 20 + 1 * round(25 * 0.3) = 75 + 60 + 8 = 143
        self.assertEqual(MMREngine.compute_liquidation_rp(placement=1, kills=7), 143)

        # 25th place: base 2 RP per kill
        self.assertEqual(MMREngine.compute_liquidation_rp(placement=25, kills=2), 4)

    def test_profit_bonus_rp(self):
        self.assertEqual(MMREngine.compute_profit_bonus_rp(0), 0)
        self.assertEqual(
            MMREngine.compute_profit_bonus_rp(500000), 5
        )  # $5,000 -> +5 RP
        self.assertEqual(
            MMREngine.compute_profit_bonus_rp(2500000), 25
        )  # $25,000 -> +25 RP
        # Capped at +25 RP
        self.assertEqual(MMREngine.compute_profit_bonus_rp(6000000), 25)

    def test_promotion_bonus_and_demotion_protection(self):
        # Player in Gold I at 5,950 RP
        rank = UserRank(
            user_id="u_pro",
            rp=5950,
            tier=RankTier.GOLD,
            division=RankDivision.I,
            demotion_protection_matches=0,
        )

        # Win match: 1st place (140 RP), 2 kills (50 RP), $2,000 profit (2 RP)
        # Entry cost: 40 RP (Gold)
        # Gross = 192 RP, Net = 152 RP
        # Candidate RP = 5950 + 152 = 6,102 (Crosses into Platinum!)
        # Promotion bonus: +100 RP -> New RP = 6,202, 3 protection games
        res = MMREngine.evaluate_match_result(
            rank=rank,
            placement=1,
            kills=2,
            net_profit_cents=200000,
        )

        self.assertTrue(res.tier_promoted)
        self.assertEqual(res.new_tier, RankTier.PLATINUM)
        self.assertEqual(res.new_rp, 6202)
        self.assertEqual(rank.demotion_protection_matches, 3)

        # Next match: Catastrophic loss dropping below Plat floor (6,000)
        # Rank is now 6,020 (simulated).
        rank.rp = 6020
        # Finish 40th (0 placement, 0 kills, 0 profit) -> Net RP = -55 (Plat entry fee)
        # Candidate RP = 6020 - 55 = 5965 (below 6,000 floor!)
        # Demotion protection must clamp to 6,000
        res2 = MMREngine.evaluate_match_result(
            rank=rank,
            placement=40,
            kills=0,
            net_profit_cents=0,
        )

        self.assertTrue(res2.demotion_protection_used)
        self.assertFalse(res2.tier_demoted)
        self.assertEqual(res2.new_rp, 6000)
        self.assertEqual(rank.demotion_protection_matches, 2)
        self.assertEqual(rank.tier, RankTier.PLATINUM)

    def test_zero_rp_floor(self):
        # Novice at 5 RP
        rank = UserRank(
            user_id="u_novice",
            rp=5,
            tier=RankTier.BRONZE,
            division=RankDivision.III,
        )

        # Finish 40th (-15 RP entry)
        res = MMREngine.evaluate_match_result(
            rank=rank,
            placement=40,
            kills=0,
            net_profit_cents=0,
        )

        # RP must clamp at 0
        self.assertEqual(res.new_rp, 0)
        self.assertEqual(rank.rp, 0)


class TestMatchManagerRankSettlement(unittest.TestCase):
    """Assay G: Full Match Manager Ranked Settlement Integration"""

    def setUp(self):
        MatchManager.reset()
        self.manager = MatchManager()
        self.match = self.manager.create_match(target_players=4, seed=505)
        self.p1 = self.manager.join_match(self.match.match_id, "u1", "Winner")
        self.p2 = self.manager.join_match(self.match.match_id, "u2", "SecondPlace")
        self.p3 = self.manager.join_match(self.match.match_id, "u3", "ThirdPlace")
        self.p4 = self.manager.join_match(self.match.match_id, "u4", "EarlyBusted")

        self.p1.placement = 1
        self.p1.kills = 3
        self.p1.net_profit_cents = 500000

        self.p2.placement = 2
        self.p2.kills = 1
        self.p2.net_profit_cents = 100000

        self.p3.placement = 3
        self.p3.kills = 0
        self.p3.net_profit_cents = -50000

        self.p4.placement = 4
        self.p4.kills = 0
        self.p4.net_profit_cents = -1500000

    def test_settle_match_ranks_all_participants(self):
        results = self.manager.settle_match_ranks(self.match.match_id)

        self.assertEqual(len(results), 4)
        self.assertIn("u1", results)
        self.assertIn("u2", results)
        self.assertIn("u3", results)
        self.assertIn("u4", results)

        # u1: 1st place (+140) + 3 kills (+75) + $5k profit (+5) - 15 entry = +205 Net RP
        r1 = results["u1"]
        self.assertEqual(r1.placement, 1)
        self.assertEqual(r1.gross_rp, 220)
        self.assertEqual(r1.net_rp, 205)
        self.assertEqual(r1.new_rp, 205)

        # User rank object updated in manager
        rank1 = self.manager.get_or_create_user_rank("u1")
        self.assertEqual(rank1.total_matches, 1)
        self.assertEqual(rank1.total_wins, 1)
        self.assertEqual(rank1.total_kills, 3)


if __name__ == "__main__":
    unittest.main()
