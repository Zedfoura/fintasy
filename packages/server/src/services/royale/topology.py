# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: Market Sector Graph Topology for Fintasy Stock Royale

from collections import deque
from enum import Enum


class SectorTier(str, Enum):
    OUTER = "OUTER"
    MID = "MID"
    INNER = "INNER"


class MarketSector(str, Enum):
    # Outer Tier (Low volatility, defensive)
    UTILITIES = "UTILITIES"
    REAL_ESTATE = "REAL_ESTATE"
    MATERIALS = "MATERIALS"
    INDUSTRIALS = "INDUSTRIALS"

    # Mid Tier (Medium-high volatility)
    HEALTHCARE = "HEALTHCARE"
    FINANCIALS = "FINANCIALS"
    ENERGY = "ENERGY"
    CONSUMER = "CONSUMER"

    # Inner Tier / Hot Zones (High-beta, AI & maximum volatility)
    BIG_TECH = "BIG_TECH"
    SEMIS_AI = "SEMIS_AI"
    BIOTECH = "BIOTECH"
    MEME_ALPHA = "MEME_ALPHA"


SECTOR_TIERS: dict[MarketSector, SectorTier] = {
    # Outer
    MarketSector.UTILITIES: SectorTier.OUTER,
    MarketSector.REAL_ESTATE: SectorTier.OUTER,
    MarketSector.MATERIALS: SectorTier.OUTER,
    MarketSector.INDUSTRIALS: SectorTier.OUTER,
    # Mid
    MarketSector.HEALTHCARE: SectorTier.MID,
    MarketSector.FINANCIALS: SectorTier.MID,
    MarketSector.ENERGY: SectorTier.MID,
    MarketSector.CONSUMER: SectorTier.MID,
    # Inner
    MarketSector.BIG_TECH: SectorTier.INNER,
    MarketSector.SEMIS_AI: SectorTier.INNER,
    MarketSector.BIOTECH: SectorTier.INNER,
    MarketSector.MEME_ALPHA: SectorTier.INNER,
}

# Bidirectional adjacency graph
_ADJACENCY_EDGES: list[tuple[MarketSector, MarketSector]] = [
    # Outer Ring
    (MarketSector.UTILITIES, MarketSector.REAL_ESTATE),
    (MarketSector.REAL_ESTATE, MarketSector.MATERIALS),
    (MarketSector.MATERIALS, MarketSector.INDUSTRIALS),
    (MarketSector.INDUSTRIALS, MarketSector.UTILITIES),
    # Outer <-> Mid Inward Connectors
    (MarketSector.UTILITIES, MarketSector.HEALTHCARE),
    (MarketSector.REAL_ESTATE, MarketSector.FINANCIALS),
    (MarketSector.MATERIALS, MarketSector.ENERGY),
    (MarketSector.INDUSTRIALS, MarketSector.CONSUMER),
    # Mid Ring
    (MarketSector.HEALTHCARE, MarketSector.FINANCIALS),
    (MarketSector.FINANCIALS, MarketSector.ENERGY),
    (MarketSector.ENERGY, MarketSector.CONSUMER),
    (MarketSector.CONSUMER, MarketSector.HEALTHCARE),
    # Mid <-> Inner Inward Connectors
    (MarketSector.HEALTHCARE, MarketSector.BIOTECH),
    (MarketSector.FINANCIALS, MarketSector.MEME_ALPHA),
    (MarketSector.ENERGY, MarketSector.BIG_TECH),
    (MarketSector.CONSUMER, MarketSector.SEMIS_AI),
    # Inner Hot Zone Ring + Diagonal Cross Links
    (MarketSector.BIG_TECH, MarketSector.SEMIS_AI),
    (MarketSector.SEMIS_AI, MarketSector.MEME_ALPHA),
    (MarketSector.MEME_ALPHA, MarketSector.BIOTECH),
    (MarketSector.BIOTECH, MarketSector.BIG_TECH),
    (MarketSector.BIG_TECH, MarketSector.MEME_ALPHA),
    (MarketSector.SEMIS_AI, MarketSector.BIOTECH),
]


class SectorTopology:
    """Authoritative Graph Topology representing Stock Royale market sectors."""

    def __init__(self) -> None:
        self._adjacencies: dict[str, set[str]] = {s.value: set() for s in MarketSector}
        for u, v in _ADJACENCY_EDGES:
            self._adjacencies[u.value].add(v.value)
            self._adjacencies[v.value].add(u.value)

    @classmethod
    def all_sectors(cls) -> list[str]:
        """Returns all 12 market sector identifiers."""
        return [s.value for s in MarketSector]

    @classmethod
    def get_sectors_by_tier(cls, tier: SectorTier) -> list[str]:
        """Returns all sector identifiers belonging to a specific concentric tier."""
        return [s.value for s, t in SECTOR_TIERS.items() if t == tier]

    @classmethod
    def is_valid_sector(cls, sector: str) -> bool:
        """Validates if sector name exists in the market graph."""
        return sector in [s.value for s in MarketSector]

    @classmethod
    def get_tier(cls, sector: str) -> SectorTier:
        """Returns the concentric tier (OUTER, MID, INNER) for a given sector."""
        if not cls.is_valid_sector(sector):
            raise ValueError(f"Unknown sector: {sector}")
        return SECTOR_TIERS[MarketSector(sector)]

    def get_neighbors(self, sector: str) -> list[str]:
        """Returns all adjacent sector identifiers."""
        if not self.is_valid_sector(sector):
            raise ValueError(f"Unknown sector: {sector}")
        return sorted(list(self._adjacencies[sector]))

    def can_transition(self, from_sector: str, to_sector: str) -> bool:
        """
        Validates whether a participant can transition from from_sector to to_sector.
        Remaining in the same sector is always valid.
        """
        if not self.is_valid_sector(from_sector) or not self.is_valid_sector(to_sector):
            return False
        if from_sector == to_sector:
            return True
        return to_sector in self._adjacencies[from_sector]

    def shortest_path(self, from_sector: str, to_sector: str) -> list[str]:
        """Computes shortest traversal path between two sectors via BFS."""
        if not self.is_valid_sector(from_sector) or not self.is_valid_sector(to_sector):
            raise ValueError("Both start and end sectors must be valid.")
        if from_sector == to_sector:
            return [from_sector]

        queue: deque[list[str]] = deque([[from_sector]])
        visited: set[str] = {from_sector}

        while queue:
            path = queue.popleft()
            current = path[-1]

            for neighbor in self.get_neighbors(current):
                if neighbor == to_sector:
                    return path + [neighbor]
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(path + [neighbor])

        return []  # Disconnected (not possible in connected graph)
