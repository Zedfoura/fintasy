# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: Storm Collapse Scheduler and Capital Tick Damage Engine for Fintasy Stock Royale

import random
from dataclasses import dataclass
from typing import Self

from pydantic import BaseModel, ConfigDict

from .topology import MarketSector, SectorTier, SectorTopology


@dataclass(frozen=True)
class RoundConfig:
    round_number: int
    name: str
    duration_sec: int
    safe_sector_count: int
    damage_rate_cents_per_sec: int  # Capital bleed per second outside safe zone


ROUND_CONFIGS: dict[int, RoundConfig] = {
    0: RoundConfig(
        round_number=0,
        name="Drop Phase",
        duration_sec=20,
        safe_sector_count=12,
        damage_rate_cents_per_sec=0,
    ),
    1: RoundConfig(
        round_number=1,
        name="Outer Sector Contraction",
        duration_sec=90,
        safe_sector_count=8,
        damage_rate_cents_per_sec=5000,  # $50.00/sec
    ),
    2: RoundConfig(
        round_number=2,
        name="Mid Sector Contraction",
        duration_sec=75,
        safe_sector_count=5,
        damage_rate_cents_per_sec=7500,  # $75.00/sec
    ),
    3: RoundConfig(
        round_number=3,
        name="Inner Core Convergence",
        duration_sec=60,
        safe_sector_count=3,
        damage_rate_cents_per_sec=10000,  # $100.00/sec
    ),
    4: RoundConfig(
        round_number=4,
        name="Epicenter Showdown",
        duration_sec=60,
        safe_sector_count=1,
        damage_rate_cents_per_sec=15000,  # $150.00/sec
    ),
    5: RoundConfig(
        round_number=5,
        name="Final Sudden Death",
        duration_sec=55,
        safe_sector_count=1,
        damage_rate_cents_per_sec=20000,  # $200.00/sec
    ),
}


class RoundSchedule(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    round_number: int
    name: str
    duration_sec: int
    damage_rate_cents_per_sec: int
    safe_sectors: list[str]
    collapsed_sectors: list[str]


class StormEngine:
    """Authoritative Storm Collapse Scheduler and Tick Damage Calculator."""

    def __init__(self, seed: int = 0) -> None:
        self.seed = seed
        self.schedule: dict[int, RoundSchedule] = self._generate_schedule(seed)

    def _generate_schedule(self, seed: int) -> dict[int, RoundSchedule]:
        """
        Deterministically computes the 5-round concentric collapse schedule
        based on the provided match seed.
        """
        rng = random.Random(seed)

        all_outer = sorted(SectorTopology.get_sectors_by_tier(SectorTier.OUTER))
        all_mid = sorted(SectorTopology.get_sectors_by_tier(SectorTier.MID))
        all_inner = sorted(SectorTopology.get_sectors_by_tier(SectorTier.INNER))
        all_sectors = set(SectorTopology.all_sectors())

        # Select 1 epicenter sector from Inner Tier that survives until the end
        epicenter = rng.choice(all_inner)

        # Round 0: 12 safe
        r0 = RoundSchedule(
            round_number=0,
            name=ROUND_CONFIGS[0].name,
            duration_sec=ROUND_CONFIGS[0].duration_sec,
            damage_rate_cents_per_sec=ROUND_CONFIGS[0].damage_rate_cents_per_sec,
            safe_sectors=sorted(list(all_sectors)),
            collapsed_sectors=[],
        )

        # Round 1: 8 safe (all 4 outer collapse, all 4 mid + 4 inner safe)
        r1_safe = sorted(all_mid + all_inner)
        r1_collapsed = sorted(all_outer)
        r1 = RoundSchedule(
            round_number=1,
            name=ROUND_CONFIGS[1].name,
            duration_sec=ROUND_CONFIGS[1].duration_sec,
            damage_rate_cents_per_sec=ROUND_CONFIGS[1].damage_rate_cents_per_sec,
            safe_sectors=r1_safe,
            collapsed_sectors=r1_collapsed,
        )

        # Round 2: 5 safe (1 mid safe + 4 inner safe)
        saved_mid = rng.choice(all_mid)
        r2_safe = sorted([saved_mid] + all_inner)
        r2_collapsed = sorted(list(all_sectors - set(r2_safe)))
        r2 = RoundSchedule(
            round_number=2,
            name=ROUND_CONFIGS[2].name,
            duration_sec=ROUND_CONFIGS[2].duration_sec,
            damage_rate_cents_per_sec=ROUND_CONFIGS[2].damage_rate_cents_per_sec,
            safe_sectors=r2_safe,
            collapsed_sectors=r2_collapsed,
        )

        # Round 3: 3 safe (all mid collapsed; epicenter + 2 other inner safe)
        other_inners = sorted([s for s in all_inner if s != epicenter])
        surviving_other_inners = rng.sample(other_inners, 2)
        r3_safe = sorted([epicenter] + surviving_other_inners)
        r3_collapsed = sorted(list(all_sectors - set(r3_safe)))
        r3 = RoundSchedule(
            round_number=3,
            name=ROUND_CONFIGS[3].name,
            duration_sec=ROUND_CONFIGS[3].duration_sec,
            damage_rate_cents_per_sec=ROUND_CONFIGS[3].damage_rate_cents_per_sec,
            safe_sectors=r3_safe,
            collapsed_sectors=r3_collapsed,
        )

        # Round 4: 1 safe (epicenter only)
        r4_safe = [epicenter]
        r4_collapsed = sorted(list(all_sectors - set(r4_safe)))
        r4 = RoundSchedule(
            round_number=4,
            name=ROUND_CONFIGS[4].name,
            duration_sec=ROUND_CONFIGS[4].duration_sec,
            damage_rate_cents_per_sec=ROUND_CONFIGS[4].damage_rate_cents_per_sec,
            safe_sectors=r4_safe,
            collapsed_sectors=r4_collapsed,
        )

        # Round 5: 1 safe (epicenter, maximum damage rate)
        r5 = RoundSchedule(
            round_number=5,
            name=ROUND_CONFIGS[5].name,
            duration_sec=ROUND_CONFIGS[5].duration_sec,
            damage_rate_cents_per_sec=ROUND_CONFIGS[5].damage_rate_cents_per_sec,
            safe_sectors=r4_safe,
            collapsed_sectors=r4_collapsed,
        )

        return {0: r0, 1: r1, 2: r2, 3: r3, 4: r4, 5: r5}

    def get_round_schedule(self, round_number: int) -> RoundSchedule:
        """Returns the schedule metadata for a specific round."""
        if round_number not in self.schedule:
            # Fallback to last round if extended
            return self.schedule[max(self.schedule.keys())]
        return self.schedule[round_number]

    def is_safe(self, sector: str, round_number: int) -> bool:
        """Checks if a given sector is in the safe zone during round_number."""
        sched = self.get_round_schedule(round_number)
        return sector in sched.safe_sectors

    def get_damage_rate(self, round_number: int) -> int:
        """Returns the storm capital damage rate in cents/sec for the round."""
        sched = self.get_round_schedule(round_number)
        return sched.damage_rate_cents_per_sec

    def calculate_tick_damage(
        self, sector: str, round_number: int, delta_sec: float = 1.0
    ) -> int:
        """
        Calculates exact integer cents of storm damage for a participant in sector
        during round_number over delta_sec seconds. Returns 0 if sector is safe.
        """
        if self.is_safe(sector, round_number):
            return 0
        rate = self.get_damage_rate(round_number)
        return int(rate * delta_sec)
