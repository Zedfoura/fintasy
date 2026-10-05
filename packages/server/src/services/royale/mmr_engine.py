# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: Competitive Ranked MMR Engine with Rocket League Tiers and Apex Legends RP Mechanics

from enum import Enum
from typing import ClassVar

from pydantic import BaseModel, ConfigDict


class RankTier(str, Enum):
    BRONZE = "BRONZE"
    SILVER = "SILVER"
    GOLD = "GOLD"
    PLATINUM = "PLATINUM"
    DIAMOND = "DIAMOND"
    CHAMPION = "CHAMPION"
    GOLDEN_TRADER = "GOLDEN_TRADER"


class RankDivision(str, Enum):
    III = "III"
    II = "II"
    I = "I"


class UserRank(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    user_id: str
    rp: int = 0
    tier: RankTier = RankTier.BRONZE
    division: RankDivision = RankDivision.III
    demotion_protection_matches: int = 0
    highest_rp: int = 0
    highest_tier: RankTier = RankTier.BRONZE
    total_matches: int = 0
    total_wins: int = 0
    total_kills: int = 0


class MatchRankResult(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    user_id: str
    placement: int
    kills: int
    net_profit_cents: int
    entry_cost: int
    placement_rp: int
    kill_rp: int
    profit_rp: int
    gross_rp: int
    net_rp: int
    previous_rp: int
    new_rp: int
    previous_tier: RankTier
    new_tier: RankTier
    previous_division: RankDivision
    new_division: RankDivision
    tier_promoted: bool = False
    tier_demoted: bool = False
    demotion_protection_used: bool = False


class MMREngine:
    """
    Authoritative competitive rating engine managing RP calculations,
    tier/division thresholds, diminishing returns, and demotion protection.
    """

    TIER_ORDER: ClassVar[list[RankTier]] = [
        RankTier.BRONZE,
        RankTier.SILVER,
        RankTier.GOLD,
        RankTier.PLATINUM,
        RankTier.DIAMOND,
        RankTier.CHAMPION,
        RankTier.GOLDEN_TRADER,
    ]

    TIER_CONFIG: ClassVar[dict[RankTier, dict]] = {
        RankTier.BRONZE: {
            "floor": 0,
            "ceiling": 1499,
            "entry_cost": 15,
            "divisions": {
                RankDivision.III: (0, 499),
                RankDivision.II: (500, 999),
                RankDivision.I: (1000, 1499),
            },
        },
        RankTier.SILVER: {
            "floor": 1500,
            "ceiling": 3499,
            "entry_cost": 25,
            "divisions": {
                RankDivision.III: (1500, 2166),
                RankDivision.II: (2167, 2833),
                RankDivision.I: (2834, 3499),
            },
        },
        RankTier.GOLD: {
            "floor": 3500,
            "ceiling": 5999,
            "entry_cost": 40,
            "divisions": {
                RankDivision.III: (3500, 4333),
                RankDivision.II: (4334, 5166),
                RankDivision.I: (5167, 5999),
            },
        },
        RankTier.PLATINUM: {
            "floor": 6000,
            "ceiling": 8999,
            "entry_cost": 55,
            "divisions": {
                RankDivision.III: (6000, 6999),
                RankDivision.II: (7000, 7999),
                RankDivision.I: (8000, 8999),
            },
        },
        RankTier.DIAMOND: {
            "floor": 9000,
            "ceiling": 12499,
            "entry_cost": 70,
            "divisions": {
                RankDivision.III: (9000, 10166),
                RankDivision.II: (10167, 11333),
                RankDivision.I: (11334, 12499),
            },
        },
        RankTier.CHAMPION: {
            "floor": 12500,
            "ceiling": 15999,
            "entry_cost": 85,
            "divisions": {
                RankDivision.III: (12500, 13666),
                RankDivision.II: (13667, 14833),
                RankDivision.I: (14834, 15999),
            },
        },
        RankTier.GOLDEN_TRADER: {
            "floor": 16000,
            "ceiling": float("inf"),
            "entry_cost": 100,
            "divisions": {
                RankDivision.I: (16000, float("inf")),
            },
        },
    }

    @classmethod
    def get_tier_and_division(cls, rp: int) -> tuple[RankTier, RankDivision]:
        """
        Maps total RP to its corresponding RankTier and RankDivision.
        """
        clamped_rp = max(0, rp)
        if clamped_rp >= 16000:
            return RankTier.GOLDEN_TRADER, RankDivision.I

        for tier in cls.TIER_ORDER:
            config = cls.TIER_CONFIG[tier]
            if config["floor"] <= clamped_rp <= config["ceiling"]:
                for div, (d_min, d_max) in config["divisions"].items():
                    if d_min <= clamped_rp <= d_max:
                        return tier, div
                return tier, RankDivision.III

        return RankTier.BRONZE, RankDivision.III

    @classmethod
    def compute_entry_cost(cls, tier: RankTier, rp: int) -> int:
        """
        Calculates match entry fee. Golden Traders pay +5 RP per full 1,000 RP above 16,000.
        """
        base_cost = cls.TIER_CONFIG[tier]["entry_cost"]
        if tier == RankTier.GOLDEN_TRADER and rp > 16000:
            extra_thousands = (rp - 16000) // 1000
            return base_cost + (extra_thousands * 5)
        return base_cost

    @classmethod
    def compute_placement_rp(cls, placement: int) -> int:
        """
        Apex Legends calibrated placement points for 40-player lobbies.
        """
        if placement == 1:
            return 140
        if placement == 2:
            return 100
        if placement == 3:
            return 75
        if 4 <= placement <= 6:
            return 55
        if 7 <= placement <= 10:
            return 35
        if 11 <= placement <= 15:
            return 20
        if 16 <= placement <= 20:
            return 10
        return 0

    @classmethod
    def compute_liquidation_rp(cls, placement: int, kills: int) -> int:
        """
        Computes kill RP with placement multiplier and diminishing returns.
        """
        if kills <= 0:
            return 0

        if placement == 1:
            base = 25
        elif 2 <= placement <= 5:
            base = 20
        elif 6 <= placement <= 10:
            base = 14
        elif 11 <= placement <= 20:
            base = 8
        else:
            base = 2

        total = 0
        for k in range(1, kills + 1):
            if k <= 3:
                mult = 1.0
            elif k <= 6:
                mult = 0.8
            else:
                mult = 0.3
            total += round(base * mult)

        return total

    @classmethod
    def compute_profit_bonus_rp(cls, net_profit_cents: int) -> int:
        """
        Awards +1 RP per $1,000 (100,000 cents) net trading profit, capped at +25 RP.
        """
        if net_profit_cents <= 0:
            return 0
        dollars_profit = net_profit_cents // 100000
        return min(25, int(dollars_profit))

    @classmethod
    def evaluate_match_result(
        cls,
        rank: UserRank,
        placement: int,
        kills: int,
        net_profit_cents: int,
    ) -> MatchRankResult:
        """
        Evaluates post-match RP mutation, promotion bonus, demotion protection, and stats.
        """
        prev_rp = rank.rp
        prev_tier = rank.tier
        prev_div = rank.division

        entry_cost = cls.compute_entry_cost(prev_tier, prev_rp)
        placement_rp = cls.compute_placement_rp(placement)
        kill_rp = cls.compute_liquidation_rp(placement, kills)
        profit_rp = cls.compute_profit_bonus_rp(net_profit_cents)

        gross_rp = placement_rp + kill_rp + profit_rp
        net_rp = max(-entry_cost, gross_rp - entry_cost)

        tier_promoted = False
        tier_demoted = False
        demotion_protection_used = False

        if net_rp >= 0:
            candidate_rp = prev_rp + net_rp
            tentative_tier, _ = cls.get_tier_and_division(candidate_rp)

            # Check if promoted to a higher tier
            prev_tier_idx = cls.TIER_ORDER.index(prev_tier)
            new_tier_idx = cls.TIER_ORDER.index(tentative_tier)

            if new_tier_idx > prev_tier_idx:
                tier_promoted = True
                candidate_rp += 100  # Promotion buffer
                rank.demotion_protection_matches = 3

            new_rp = candidate_rp
        else:
            candidate_rp = prev_rp + net_rp
            tier_floor = cls.TIER_CONFIG[prev_tier]["floor"]

            if candidate_rp < tier_floor:
                if rank.demotion_protection_matches > 0:
                    new_rp = tier_floor
                    rank.demotion_protection_matches -= 1
                    demotion_protection_used = True
                else:
                    tier_demoted = True
                    new_rp = max(0, candidate_rp)
            else:
                new_rp = max(0, candidate_rp)

        new_tier, new_div = cls.get_tier_and_division(new_rp)

        # Update UserRank object
        rank.rp = new_rp
        rank.tier = new_tier
        rank.division = new_div
        rank.total_matches += 1
        if placement == 1:
            rank.total_wins += 1
        rank.total_kills += kills

        if new_rp > rank.highest_rp:
            rank.highest_rp = new_rp

        if cls.TIER_ORDER.index(new_tier) > cls.TIER_ORDER.index(rank.highest_tier):
            rank.highest_tier = new_tier

        return MatchRankResult(
            user_id=rank.user_id,
            placement=placement,
            kills=kills,
            net_profit_cents=net_profit_cents,
            entry_cost=entry_cost,
            placement_rp=placement_rp,
            kill_rp=kill_rp,
            profit_rp=profit_rp,
            gross_rp=gross_rp,
            net_rp=net_rp,
            previous_rp=prev_rp,
            new_rp=new_rp,
            previous_tier=prev_tier,
            new_tier=new_tier,
            previous_division=prev_div,
            new_division=new_div,
            tier_promoted=tier_promoted,
            tier_demoted=tier_demoted,
            demotion_protection_used=demotion_protection_used,
        )
