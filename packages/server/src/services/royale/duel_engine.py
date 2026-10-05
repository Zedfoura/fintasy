# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: 30-Second Micro-Trading Duel Engine & Liquidation Mechanism for Fintasy Stock Royale

import uuid
from enum import Enum
from typing import ClassVar, Optional

from pydantic import BaseModel, ConfigDict, Field


class PositionSide(str, Enum):
    LONG = "LONG"
    SHORT = "SHORT"


class DuelPosition(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    position_id: str
    participant_id: str
    symbol: str
    side: PositionSide
    leverage: int  # 1, 2, or 5
    collateral_cents: int
    entry_price_cents: int
    current_price_cents: int
    unrealized_pnl_cents: int = 0
    is_closed: bool = False
    exit_price_cents: int | None = None
    realized_pnl_cents: int = 0
    is_liquidated: bool = False


class DuelResolution(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    duel_id: str
    winner_id: str | None = None
    loser_id: str | None = None
    is_draw: bool = False
    net_profits: dict[str, int] = Field(default_factory=dict)
    bounty_transferred_cents: int = 0
    loot_transferred: list[str] = Field(default_factory=list)
    loser_liquidated: bool = False


class DuelState(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    duel_id: str
    match_id: str
    sector: str
    participant_ids: list[str]
    time_remaining_sec: float = 30.0
    positions: dict[str, list[DuelPosition]] = Field(default_factory=dict)
    is_resolved: bool = False
    resolution: DuelResolution | None = None


class DuelEngine:
    """
    Authoritative Engine managing 30-second trading duels, position margin,
    PnL marking, maintenance liquidation, and duel resolution.
    """

    ALLOWED_LEVERAGE: ClassVar[set[int]] = {1, 2, 5}
    MAINTENANCE_MARGIN_THRESHOLD: ClassVar[float] = (
        0.90  # 90% loss triggers auto-liquidation
    )

    @classmethod
    def create_duel(
        cls,
        match_id: str,
        sector: str,
        participant_a_id: str,
        participant_b_id: str,
    ) -> DuelState:
        duel_id = str(uuid.uuid4())
        return DuelState(
            duel_id=duel_id,
            match_id=match_id,
            sector=sector,
            participant_ids=[participant_a_id, participant_b_id],
            time_remaining_sec=30.0,
            positions={participant_a_id: [], participant_b_id: []},
            is_resolved=False,
        )

    @classmethod
    def compute_position_pnl(
        cls,
        side: PositionSide,
        leverage: int,
        collateral_cents: int,
        entry_price_cents: int,
        current_price_cents: int,
    ) -> int:
        """
        Calculates position PnL in integer cents based on side, leverage, and price delta.
        """
        if entry_price_cents <= 0:
            return 0

        price_delta = current_price_cents - entry_price_cents
        if side == PositionSide.LONG:
            pnl_float = collateral_cents * leverage * (price_delta / entry_price_cents)
        else:  # SHORT
            pnl_float = collateral_cents * leverage * (-price_delta / entry_price_cents)

        return round(pnl_float)

    @classmethod
    def open_position(
        cls,
        duel: DuelState,
        participant_id: str,
        symbol: str,
        side: PositionSide,
        leverage: int,
        collateral_cents: int,
        current_price_cents: int,
    ) -> DuelPosition:
        """
        Opens a micro-order position within the active duel.
        """
        if duel.is_resolved:
            raise ValueError(f"Duel {duel.duel_id} is already resolved.")
        if participant_id not in duel.participant_ids:
            raise ValueError(
                f"Participant {participant_id} is not in duel {duel.duel_id}."
            )
        if leverage not in cls.ALLOWED_LEVERAGE:
            raise ValueError(
                f"Invalid leverage {leverage}x. Allowed leverage tiers: {sorted(list(cls.ALLOWED_LEVERAGE))}."
            )
        if collateral_cents <= 0:
            raise ValueError("Collateral must be greater than 0 cents.")
        if current_price_cents <= 0:
            raise ValueError("Current price must be greater than 0.")

        pos = DuelPosition(
            position_id=str(uuid.uuid4()),
            participant_id=participant_id,
            symbol=symbol,
            side=side,
            leverage=leverage,
            collateral_cents=collateral_cents,
            entry_price_cents=current_price_cents,
            current_price_cents=current_price_cents,
            unrealized_pnl_cents=0,
            is_closed=False,
        )
        duel.positions.setdefault(participant_id, []).append(pos)
        return pos

    @classmethod
    def close_position(
        cls,
        duel: DuelState,
        position_id: str,
        current_price_cents: int,
    ) -> int:
        """
        Closes an open position at current_price_cents and returns realized PnL in cents.
        """
        for p_id, pos_list in duel.positions.items():
            for pos in pos_list:
                if pos.position_id == position_id:
                    if pos.is_closed:
                        raise ValueError(f"Position {position_id} is already closed.")

                    pos.current_price_cents = current_price_cents
                    pos.exit_price_cents = current_price_cents
                    pnl = cls.compute_position_pnl(
                        pos.side,
                        pos.leverage,
                        pos.collateral_cents,
                        pos.entry_price_cents,
                        current_price_cents,
                    )
                    # Loss cannot exceed 100% of collateral
                    clamped_pnl = max(-pos.collateral_cents, pnl)
                    pos.realized_pnl_cents = clamped_pnl
                    pos.unrealized_pnl_cents = 0
                    pos.is_closed = True
                    return clamped_pnl

        raise ValueError(f"Position {position_id} not found in duel {duel.duel_id}.")

    @classmethod
    def update_positions(
        cls,
        duel: DuelState,
        current_prices: dict[str, int],
    ) -> list[DuelPosition]:
        """
        Marks all open positions to market prices and triggers maintenance margin liquidation
        if a position loss reaches 90% of collateral. Returns list of auto-liquidated positions.
        """
        liquidated: list[DuelPosition] = []

        for p_id, pos_list in duel.positions.items():
            for pos in pos_list:
                if pos.is_closed:
                    continue

                price = current_prices.get(pos.symbol, pos.current_price_cents)
                pos.current_price_cents = price
                pnl = cls.compute_position_pnl(
                    pos.side,
                    pos.leverage,
                    pos.collateral_cents,
                    pos.entry_price_cents,
                    price,
                )
                pos.unrealized_pnl_cents = pnl

                # Maintenance margin check: 90% loss
                max_allowed_loss = int(
                    pos.collateral_cents * cls.MAINTENANCE_MARGIN_THRESHOLD
                )
                if pnl <= -max_allowed_loss:
                    pos.is_closed = True
                    pos.is_liquidated = True
                    pos.exit_price_cents = price
                    pos.realized_pnl_cents = -pos.collateral_cents
                    pos.unrealized_pnl_cents = 0
                    liquidated.append(pos)

        return liquidated

    @classmethod
    def resolve_duel(
        cls,
        duel: DuelState,
        current_prices: dict[str, int],
    ) -> DuelResolution:
        """
        Resolves the duel at timer expiry, computing net profit across participants
        and selecting the winner.
        """
        # First mark all open positions and liquidate margin failures
        cls.update_positions(duel, current_prices)

        # Mark-to-market and close all remaining open positions
        net_profits: dict[str, int] = {}
        total_collateral: dict[str, int] = {}

        for p_id in duel.participant_ids:
            net_profit = 0
            tot_col = 0
            for pos in duel.positions.get(p_id, []):
                tot_col += pos.collateral_cents
                if not pos.is_closed:
                    pos.exit_price_cents = pos.current_price_cents
                    pnl = max(-pos.collateral_cents, pos.unrealized_pnl_cents)
                    pos.realized_pnl_cents = pnl
                    pos.unrealized_pnl_cents = 0
                    pos.is_closed = True
                net_profit += pos.realized_pnl_cents

            net_profits[p_id] = net_profit
            total_collateral[p_id] = tot_col

        p_a, p_b = duel.participant_ids[0], duel.participant_ids[1]
        profit_a = net_profits[p_a]
        profit_b = net_profits[p_b]

        # Winner selection
        if profit_a > profit_b:
            winner, loser = p_a, p_b
            is_draw = False
        elif profit_b > profit_a:
            winner, loser = p_b, p_a
            is_draw = False
        else:
            # Profits tied
            if total_collateral[p_a] == 0 and total_collateral[p_b] == 0:
                # Neither traded: draw
                winner, loser = None, None
                is_draw = True
            else:
                # Break tie by collateral ROI
                roi_a = profit_a / max(1, total_collateral[p_a])
                roi_b = profit_b / max(1, total_collateral[p_b])
                if roi_a > roi_b:
                    winner, loser = p_a, p_b
                    is_draw = False
                elif roi_b > roi_a:
                    winner, loser = p_b, p_a
                    is_draw = False
                else:
                    # Final tie-breaker: deterministic string hash
                    winner, loser = (p_a, p_b) if p_a < p_b else (p_b, p_a)
                    is_draw = False

        res = DuelResolution(
            duel_id=duel.duel_id,
            winner_id=winner,
            loser_id=loser,
            is_draw=is_draw,
            net_profits=net_profits,
        )
        duel.is_resolved = True
        duel.resolution = res
        return res
