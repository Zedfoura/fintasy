# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: In-memory authoritative Match Manager for Fintasy Stock Royale

import random
import uuid
from typing import ClassVar, Optional

from services.royale.models import (
    BotArchetype,
    MatchPhase,
    MatchState,
    Participant,
    ParticipantStatus,
)

BOT_NAMES = [
    # Scalpers
    "ThetaGangster",
    "DeltaHedger",
    "AlgoScalp_01",
    "SpreadSniper",
    "QuantTick",
    "BidAskBarbarian",
    "MicroTraderX",
    "OrderBookGhost",
    "FlashBoy99",
    "VWAP_Warrior",
    "HighFreqHero",
    "LimitOrderLord",
    "CenturionTrader",
    "ArbHunter",
    "PipsCollector",
    "ScalpKing",
    # Swing Traders
    "BuffettDisciple",
    "MacroWhale",
    "ValueVanguard",
    "TrendFollower",
    "GoldenCross",
    "FibonacciFan",
    "BreakoutBull",
    "StochasticSam",
    "CatalystRider",
    "MeanReverter",
    "SectorRotator",
    "CycleSurfer",
    "DividendBaron",
    "FundamentalFrank",
    # Degens
    "CathieDegen",
    "DiamondHands420",
    "ApeArmyGeneral",
    "YOLO_Quant",
    "OptionsGambit",
    "LeverageMaximus",
    "MemeStonkHodler",
    "ToTheMoon69",
    "MarginCallSurvivor",
    "LiquidateMePls",
]


class MatchManager:
    """
    Authoritative in-memory state engine for Fintasy Stock Royale matches.
    """

    _instance: Optional["MatchManager"] = None
    _matches: ClassVar[dict[str, MatchState]] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._matches = {}
        return cls._instance

    @classmethod
    def reset(cls):
        """Clears all in-memory matches (used for unit tests and environment cleanup)."""
        cls._matches = {}

    def create_match(
        self,
        target_players: int = 40,
        seed: int | None = None,
    ) -> MatchState:
        """
        Creates a new match in LOBBY phase.
        """
        if seed is None:
            seed = random.randint(100000, 999999)

        match_id = str(uuid.uuid4())
        match = MatchState(
            match_id=match_id,
            phase=MatchPhase.LOBBY,
            target_players=target_players,
            participants={},
            seed=seed,
            round_number=0,
            round_time_remaining_sec=0,
        )
        self._matches[match_id] = match
        return match

    def get_match(self, match_id: str) -> MatchState | None:
        return self._matches.get(match_id)

    def join_match(
        self,
        match_id: str,
        user_id: str,
        username: str,
    ) -> Participant:
        """
        Registers a human player into an open match lobby.
        """
        match = self._matches.get(match_id)
        if not match:
            raise ValueError(f"Match {match_id} does not exist.")

        if match.phase != MatchPhase.LOBBY:
            raise ValueError(
                f"Cannot join match {match_id}: match is in {match.phase} phase."
            )

        if len(match.participants) >= match.target_players:
            raise ValueError(
                f"Match {match_id} is full ({match.target_players} players)."
            )

        if user_id in match.participants:
            raise ValueError(f"User {user_id} has already joined match {match_id}.")

        participant = Participant(
            uuid=user_id,
            username=username,
            is_bot=False,
            bot_archetype=None,
            capital_cents=1500000,  # $15,000.00
            equity_cents=1500000,
            status=ParticipantStatus.ALIVE,
        )
        match.participants[user_id] = participant
        return participant

    def fill_bots(self, match_id: str) -> list[Participant]:
        """
        Auto-fills the remainder of the lobby up to target_players with calibrated AI bots.
        Archetype ratio: 40% Scalper, 35% Swing, 25% Degen.
        """
        match = self._matches.get(match_id)
        if not match:
            raise ValueError(f"Match {match_id} does not exist.")

        if match.phase != MatchPhase.LOBBY:
            raise ValueError(f"Cannot fill bots: match is in {match.phase} phase.")

        needed = match.target_players - len(match.participants)
        if needed <= 0:
            return []

        # Use seeded RNG for reproducible bot roster
        rng = random.Random(match.seed + len(match.participants))

        # Calibrated archetype distribution
        num_scalpers = round(needed * 0.40)
        num_swings = round(needed * 0.35)
        num_degens = needed - (num_scalpers + num_swings)

        archetype_pool = (
            [BotArchetype.SCALPER] * num_scalpers
            + [BotArchetype.SWING] * num_swings
            + [BotArchetype.DEGEN] * num_degens
        )
        rng.shuffle(archetype_pool)

        # Shuffle names
        available_names = list(BOT_NAMES)
        rng.shuffle(available_names)

        added_bots: list[Participant] = []
        for i, archetype in enumerate(archetype_pool):
            bot_uuid = str(uuid.UUID(int=rng.getrandbits(128)))
            base_name = available_names[i % len(available_names)]
            bot_username = f"AI_{base_name}_{i + 1}"

            bot = Participant(
                uuid=bot_uuid,
                username=bot_username,
                is_bot=True,
                bot_archetype=archetype,
                capital_cents=1500000,
                equity_cents=1500000,
                status=ParticipantStatus.ALIVE,
            )
            match.participants[bot_uuid] = bot
            added_bots.append(bot)

        return added_bots

    def start_drop_phase(self, match_id: str) -> MatchState:
        """
        Transitions match from LOBBY to DROP_SELECTION.
        Auto-fills bots if lobby is not yet at target_players.
        """
        match = self._matches.get(match_id)
        if not match:
            raise ValueError(f"Match {match_id} does not exist.")

        if match.phase != MatchPhase.LOBBY:
            raise ValueError(
                f"Invalid transition from {match.phase} to DROP_SELECTION."
            )

        if len(match.participants) < match.target_players:
            self.fill_bots(match_id)

        match.phase = MatchPhase.DROP_SELECTION
        match.round_time_remaining_sec = 20  # 20 seconds to select drop zone
        return match

    def start_active_rounds(self, match_id: str) -> MatchState:
        """
        Transitions match from DROP_SELECTION to ACTIVE_ROUNDS.
        """
        match = self._matches.get(match_id)
        if not match:
            raise ValueError(f"Match {match_id} does not exist.")

        if match.phase != MatchPhase.DROP_SELECTION:
            raise ValueError(f"Invalid transition from {match.phase} to ACTIVE_ROUNDS.")

        match.phase = MatchPhase.ACTIVE_ROUNDS
        match.round_number = 1
        match.round_time_remaining_sec = 90  # Round 1 duration
        return match

    def to_dict(self, match_id: str) -> dict:
        """
        Serializes match state for high-frequency WebSocket and REST broadcast.
        """
        match = self._matches.get(match_id)
        if not match:
            raise ValueError(f"Match {match_id} does not exist.")
        return match.model_dump()
