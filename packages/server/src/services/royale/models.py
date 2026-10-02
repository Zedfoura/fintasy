# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: Real-time domain models for Fintasy Stock Royale in-memory state engine

from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field


class MatchPhase(str, Enum):
    LOBBY = "LOBBY"
    DROP_SELECTION = "DROP_SELECTION"
    ACTIVE_ROUNDS = "ACTIVE_ROUNDS"
    FINAL_CIRCLE = "FINAL_CIRCLE"
    MATCH_OVER = "MATCH_OVER"


class BotArchetype(str, Enum):
    SCALPER = "SCALPER"
    SWING = "SWING"
    DEGEN = "DEGEN"


class ParticipantStatus(str, Enum):
    ALIVE = "ALIVE"
    IN_DUEL = "IN_DUEL"
    BUSTED = "BUSTED"
    VICTORIOUS = "VICTORIOUS"


class Participant(BaseModel):
    uuid: str
    username: str
    is_bot: bool = False
    bot_archetype: BotArchetype | None = None
    capital_cents: int = 1500000  # $15,000.00 initial endowment
    equity_cents: int = 1500000
    held_tickers: list[str] = Field(default_factory=list)
    active_sector: str | None = None
    status: ParticipantStatus = ParticipantStatus.ALIVE
    kills: int = 0
    net_profit_cents: int = 0
    placement: int | None = None
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        use_enum_values = True


class MatchState(BaseModel):
    match_id: str
    phase: MatchPhase = MatchPhase.LOBBY
    target_players: int = 40
    participants: dict[str, Participant] = Field(default_factory=dict)
    seed: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    round_number: int = 0
    round_time_remaining_sec: int = 0
    safe_sectors: list[str] = Field(default_factory=list)
    collapsing_sectors: list[str] = Field(default_factory=list)
    eliminated_count: int = 0

    class Config:
        use_enum_values = True
