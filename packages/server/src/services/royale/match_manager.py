# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: In-memory authoritative Match Manager for Fintasy Stock Royale

import random
import uuid
from typing import ClassVar, Optional

from services.royale.duel_engine import (
    DuelEngine,
    DuelPosition,
    DuelResolution,
    DuelState,
    PositionSide,
)
from services.royale.market_sim import MarketSimEngine, MarketTick
from services.royale.mmr_engine import (
    MatchRankResult,
    MMREngine,
    RankDivision,
    RankTier,
    UserRank,
)
from services.royale.models import (
    BotArchetype,
    MatchPhase,
    MatchState,
    Participant,
    ParticipantStatus,
)
from services.royale.storm import StormEngine
from services.royale.topology import SectorTier, SectorTopology

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
    _engines: ClassVar[dict[str, StormEngine]] = {}
    _market_sims: ClassVar[dict[str, MarketSimEngine]] = {}
    _duels: ClassVar[dict[str, DuelState]] = {}
    _participant_duel: ClassVar[dict[str, str]] = {}
    _user_ranks: ClassVar[dict[str, UserRank]] = {}
    _topology: ClassVar[SectorTopology] = SectorTopology()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._matches = {}
            cls._engines = {}
            cls._market_sims = {}
            cls._duels = {}
            cls._participant_duel = {}
            cls._user_ranks = {}
            cls._topology = SectorTopology()
        return cls._instance

    @classmethod
    def reset(cls):
        """Clears all in-memory matches, engines, market sims, duels, and user ranks (used for tests and cleanup)."""
        cls._matches = {}
        cls._engines = {}
        cls._market_sims = {}
        cls._duels = {}
        cls._participant_duel = {}
        cls._user_ranks = {}

    @property
    def topology(self) -> SectorTopology:
        return self._topology

    def get_storm_engine(self, match_id: str) -> StormEngine | None:
        return self._engines.get(match_id)

    def get_market_sim(self, match_id: str) -> MarketSimEngine | None:
        return self._market_sims.get(match_id)

    def get_duel(self, duel_id: str) -> DuelState | None:
        return self._duels.get(duel_id)

    def get_participant_duel(self, participant_id: str) -> DuelState | None:
        duel_id = self._participant_duel.get(participant_id)
        return self._duels.get(duel_id) if duel_id else None

    def create_match(
        self,
        target_players: int = 40,
        seed: int | None = None,
    ) -> MatchState:
        """
        Creates a new match in LOBBY phase with a deterministic storm engine and market simulator.
        """
        if seed is None:
            seed = random.randint(100000, 999999)

        match_id = str(uuid.uuid4())
        storm_engine = StormEngine(seed=seed)
        market_sim = MarketSimEngine(seed=seed)
        self._engines[match_id] = storm_engine
        self._market_sims[match_id] = market_sim

        r0_sched = storm_engine.get_round_schedule(0)

        match = MatchState(
            match_id=match_id,
            phase=MatchPhase.LOBBY,
            target_players=target_players,
            participants={},
            seed=seed,
            round_number=0,
            round_time_remaining_sec=0,
            safe_sectors=r0_sched.safe_sectors,
            collapsing_sectors=r0_sched.collapsed_sectors,
            eliminated_count=0,
        )
        self._matches[match_id] = match
        return match

    def get_match(self, match_id: str) -> MatchState | None:
        return self._matches.get(match_id)

    def tick_market(self, match_id: str) -> dict[str, MarketTick]:
        """
        Advances the 10 Hz market simulator for the match by 1 tick (100ms).
        """
        sim = self._market_sims.get(match_id)
        if not sim:
            raise RuntimeError(f"Market simulator not found for match {match_id}.")
        return sim.step_tick()

    def get_ticker_price(self, match_id: str, symbol: str) -> int:
        """
        Returns the active price of a ticker symbol in integer cents.
        """
        sim = self._market_sims.get(match_id)
        if not sim:
            raise RuntimeError(f"Market simulator not found for match {match_id}.")
        return sim.get_price(symbol)

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

        engine = self._engines.get(match_id)
        r0 = engine.get_round_schedule(0) if engine else None

        match.phase = MatchPhase.DROP_SELECTION
        match.round_number = 0
        match.round_time_remaining_sec = r0.duration_sec if r0 else 20
        if r0:
            match.safe_sectors = r0.safe_sectors
            match.collapsing_sectors = r0.collapsed_sectors
        return match

    def start_active_rounds(self, match_id: str) -> MatchState:
        """
        Transitions match from DROP_SELECTION to ACTIVE_ROUNDS (Round 1).
        Auto-assigns drop sectors to any participant (including bots) who hasn't chosen one.
        """
        match = self._matches.get(match_id)
        if not match:
            raise ValueError(f"Match {match_id} does not exist.")

        if match.phase != MatchPhase.DROP_SELECTION:
            raise ValueError(f"Invalid transition from {match.phase} to ACTIVE_ROUNDS.")

        engine = self._engines.get(match_id)
        r1 = engine.get_round_schedule(1) if engine else None

        match.phase = MatchPhase.ACTIVE_ROUNDS
        match.round_number = 1
        match.round_time_remaining_sec = r1.duration_sec if r1 else 90
        if r1:
            match.safe_sectors = r1.safe_sectors
            match.collapsing_sectors = r1.collapsed_sectors

        # Auto-drop participants without an active sector
        rng = random.Random(match.seed + 777)
        outer_sectors = SectorTopology.get_sectors_by_tier(SectorTier.OUTER)
        mid_sectors = SectorTopology.get_sectors_by_tier(SectorTier.MID)
        inner_sectors = SectorTopology.get_sectors_by_tier(SectorTier.INNER)

        for p in match.participants.values():
            if p.active_sector is None:
                if p.bot_archetype == BotArchetype.DEGEN:
                    p.active_sector = rng.choice(inner_sectors)
                elif p.bot_archetype == BotArchetype.SWING:
                    p.active_sector = rng.choice(mid_sectors)
                elif p.bot_archetype == BotArchetype.SCALPER:
                    # Scalpers prefer outer or mid
                    p.active_sector = rng.choice(outer_sectors + mid_sectors)
                else:
                    # Default human drop: any sector
                    p.active_sector = rng.choice(SectorTopology.all_sectors())

        # Award uncontested drop loot to lone occupants of a sector
        market_sim = self._market_sims.get(match_id)
        if market_sim:
            sector_occupants: dict[str, list[Participant]] = {}
            for p in match.participants.values():
                if p.active_sector:
                    sector_occupants.setdefault(p.active_sector, []).append(p)

            for sec, players in sector_occupants.items():
                if len(players) == 1:
                    loot_tickers = market_sim.get_sector_loot_tickers(sec)
                    if loot_tickers:
                        prime_ticker = loot_tickers[0]
                        if prime_ticker not in players[0].held_tickers:
                            players[0].held_tickers.append(prime_ticker)

        return match

    def move_participant(
        self,
        match_id: str,
        user_id: str,
        target_sector: str,
    ) -> Participant:
        """
        Validates and executes a sector transition for a participant.
        Enforces adjacency graph topology in active rounds; allows free initial selection in drop phase.
        """
        match = self._matches.get(match_id)
        if not match:
            raise ValueError(f"Match {match_id} does not exist.")

        if match.phase not in (
            MatchPhase.DROP_SELECTION,
            MatchPhase.ACTIVE_ROUNDS,
            MatchPhase.FINAL_CIRCLE,
        ):
            raise ValueError(f"Cannot move in {match.phase} phase.")

        participant = match.participants.get(user_id)
        if not participant:
            raise ValueError(f"Participant {user_id} not found in match {match_id}.")

        if participant.status != ParticipantStatus.ALIVE:
            raise ValueError(
                f"Participant {user_id} cannot move: status is {participant.status}."
            )

        if not SectorTopology.is_valid_sector(target_sector):
            raise ValueError(
                f"Target sector '{target_sector}' is not a valid market sector."
            )

        # During DROP_SELECTION, player can pick any sector as their drop zone
        if match.phase == MatchPhase.DROP_SELECTION:
            participant.active_sector = target_sector
            return participant

        # During ACTIVE_ROUNDS and FINAL_CIRCLE, enforce adjacency constraints
        current_sector = participant.active_sector
        if current_sector is not None:
            if not self._topology.can_transition(current_sector, target_sector):
                raise ValueError(
                    f"Invalid sector move: '{target_sector}' is not adjacent to current sector '{current_sector}'."
                )

        participant.active_sector = target_sector
        return participant

    def tick_storm(self, match_id: str, delta_sec: float = 1.0) -> dict:
        """
        Advances the match round timer, triggers round progression and storm collapse,
        and applies capital tick damage to participants outside the safe sectors.
        """
        match = self._matches.get(match_id)
        if not match:
            raise ValueError(f"Match {match_id} does not exist.")

        if match.phase not in (MatchPhase.ACTIVE_ROUNDS, MatchPhase.FINAL_CIRCLE):
            return {"status": "inactive_phase", "phase": match.phase}

        engine = self._engines.get(match_id)
        if not engine:
            raise RuntimeError(f"Storm engine not initialized for match {match_id}.")

        # Decrement round timer
        match.round_time_remaining_sec = max(
            0, int(match.round_time_remaining_sec - delta_sec)
        )

        # Check for round advance
        round_advanced = False
        if match.round_time_remaining_sec <= 0:
            if match.round_number < 5:
                match.round_number += 1
                round_advanced = True
                if match.round_number == 5:
                    match.phase = MatchPhase.FINAL_CIRCLE

                sched = engine.get_round_schedule(match.round_number)
                match.round_time_remaining_sec = sched.duration_sec
                match.safe_sectors = sched.safe_sectors
                match.collapsing_sectors = sched.collapsed_sectors
            else:
                # Round 5 time expired -> MATCH_OVER
                match.phase = MatchPhase.MATCH_OVER

        # Apply storm damage to any participant caught outside safe sectors
        damage_applied: dict[str, int] = {}
        liquidations: list[str] = []

        if match.phase in (MatchPhase.ACTIVE_ROUNDS, MatchPhase.FINAL_CIRCLE):
            damage_rate = engine.get_damage_rate(match.round_number)
            cents_per_tick = int(damage_rate * delta_sec)

            # Sort participants for deterministic tie-breaking on liquidation
            for p_id, participant in sorted(
                match.participants.items(), key=lambda item: item[1].equity_cents
            ):
                if participant.status != ParticipantStatus.ALIVE:
                    continue

                # If outside safe sectors, apply capital bleed
                if (
                    participant.active_sector
                    and participant.active_sector not in match.safe_sectors
                ):
                    if cents_per_tick > 0:
                        participant.capital_cents = max(
                            0, participant.capital_cents - cents_per_tick
                        )
                        participant.equity_cents = max(
                            0, participant.equity_cents - cents_per_tick
                        )
                        damage_applied[p_id] = cents_per_tick

                        # Check for pot liquidation (BUSTED)
                        if participant.equity_cents <= 0:
                            participant.status = ParticipantStatus.BUSTED
                            match.eliminated_count += 1
                            # Placement is based on remaining alive participants count
                            alive_count = sum(
                                1
                                for p in match.participants.values()
                                if p.status == ParticipantStatus.ALIVE
                            )
                            participant.placement = alive_count + 1
                            liquidations.append(p_id)

        # Check win condition: if only 1 participant alive, crown VICTORIOUS
        alive_players = [
            p
            for p in match.participants.values()
            if p.status == ParticipantStatus.ALIVE
        ]
        if len(alive_players) == 1 and len(match.participants) > 1:
            winner = alive_players[0]
            winner.status = ParticipantStatus.VICTORIOUS
            winner.placement = 1
            match.phase = MatchPhase.MATCH_OVER

        return {
            "match_id": match_id,
            "phase": match.phase,
            "round_number": match.round_number,
            "round_time_remaining_sec": match.round_time_remaining_sec,
            "round_advanced": round_advanced,
            "safe_sectors": match.safe_sectors,
            "collapsing_sectors": match.collapsing_sectors,
            "damage_applied": damage_applied,
            "liquidations": liquidations,
            "eliminated_count": match.eliminated_count,
        }

    def initiate_duel(
        self,
        match_id: str,
        sector: str,
        participant_a_id: str,
        participant_b_id: str,
    ) -> DuelState:
        """
        Locks two participants in the same sector into a 30-second trading duel.
        """
        match = self._matches.get(match_id)
        if not match:
            raise ValueError(f"Match {match_id} does not exist.")

        if match.phase not in (MatchPhase.ACTIVE_ROUNDS, MatchPhase.FINAL_CIRCLE):
            raise ValueError(f"Cannot initiate duel during {match.phase} phase.")

        p_a = match.participants.get(participant_a_id)
        p_b = match.participants.get(participant_b_id)

        if not p_a or not p_b:
            raise ValueError("Both participants must exist in the match.")

        if (
            p_a.status != ParticipantStatus.ALIVE
            or p_b.status != ParticipantStatus.ALIVE
        ):
            raise ValueError("Both participants must be ALIVE to initiate a duel.")

        if p_a.active_sector != sector or p_b.active_sector != sector:
            raise ValueError(f"Both participants must be located in sector '{sector}'.")

        if (
            participant_a_id in self._participant_duel
            or participant_b_id in self._participant_duel
        ):
            raise ValueError("One or both participants are already engaged in a duel.")

        duel = DuelEngine.create_duel(
            match_id, sector, participant_a_id, participant_b_id
        )
        self._duels[duel.duel_id] = duel
        self._participant_duel[participant_a_id] = duel.duel_id
        self._participant_duel[participant_b_id] = duel.duel_id

        p_a.status = ParticipantStatus.IN_DUEL
        p_b.status = ParticipantStatus.IN_DUEL
        return duel

    def third_party_duel(
        self,
        match_id: str,
        duel_id: str,
        participant_id: str,
    ) -> DuelState:
        """
        Escalates an ongoing duel by introducing a third (or subsequent) participant
        located in the same contested sector.
        """
        match = self._matches.get(match_id)
        if not match:
            raise ValueError(f"Match {match_id} does not exist.")

        if match.phase not in (MatchPhase.ACTIVE_ROUNDS, MatchPhase.FINAL_CIRCLE):
            raise ValueError(f"Cannot third-party a duel during {match.phase} phase.")

        duel = self._duels.get(duel_id)
        if not duel:
            raise ValueError(f"Duel {duel_id} does not exist.")

        if duel.is_resolved:
            raise ValueError(f"Duel {duel_id} is already resolved.")

        participant = match.participants.get(participant_id)
        if not participant:
            raise ValueError(f"Participant {participant_id} not found.")

        if participant.status != ParticipantStatus.ALIVE:
            raise ValueError(
                f"Participant {participant_id} must be ALIVE to third-party a duel (current status: {participant.status})."
            )

        if participant.active_sector != duel.sector:
            raise ValueError(
                f"Participant {participant_id} is in sector '{participant.active_sector}', but duel is in sector '{duel.sector}'."
            )

        if participant_id in self._participant_duel:
            raise ValueError(
                f"Participant {participant_id} is already engaged in a duel."
            )

        if participant_id in duel.participant_ids:
            raise ValueError(f"Participant {participant_id} is already in this duel.")

        DuelEngine.add_participant(duel, participant_id)
        self._participant_duel[participant_id] = duel.duel_id
        participant.status = ParticipantStatus.IN_DUEL
        return duel

    def get_active_duel_in_sector(
        self,
        match_id: str,
        sector: str,
    ) -> DuelState | None:
        """
        Returns active unresolved duel in a sector, if any exists.
        """
        for duel in self._duels.values():
            if (
                duel.match_id == match_id
                and duel.sector == sector
                and not duel.is_resolved
            ):
                return duel
        return None

    def place_duel_order(
        self,
        duel_id: str,
        participant_id: str,
        symbol: str,
        side: PositionSide,
        leverage: int,
        collateral_cents: int,
    ) -> DuelPosition:
        """
        Places a micro-order in the active duel, locking collateral from liquid pot.
        """
        duel = self._duels.get(duel_id)
        if not duel:
            raise ValueError(f"Duel {duel_id} does not exist.")

        match = self._matches.get(duel.match_id)
        if not match:
            raise ValueError(f"Match {duel.match_id} does not exist.")

        participant = match.participants.get(participant_id)
        if not participant:
            raise ValueError(f"Participant {participant_id} not found.")

        if participant.capital_cents < collateral_cents:
            raise ValueError(
                f"Insufficient capital: requires {collateral_cents} cents, has {participant.capital_cents} cents."
            )

        sim = self._market_sims.get(duel.match_id)
        if not sim:
            raise RuntimeError(f"Market simulator not found for match {duel.match_id}.")

        current_price = sim.get_price(symbol)

        # Deduct collateral from participant's liquid cash pot
        participant.capital_cents -= collateral_cents

        pos = DuelEngine.open_position(
            duel=duel,
            participant_id=participant_id,
            symbol=symbol,
            side=side,
            leverage=leverage,
            collateral_cents=collateral_cents,
            current_price_cents=current_price,
        )
        return pos

    def close_duel_position(
        self,
        duel_id: str,
        participant_id: str,
        position_id: str,
    ) -> int:
        """
        Closes an open position early at current market price, returning collateral + PnL.
        """
        duel = self._duels.get(duel_id)
        if not duel:
            raise ValueError(f"Duel {duel_id} does not exist.")

        match = self._matches.get(duel.match_id)
        if not match:
            raise ValueError(f"Match {duel.match_id} does not exist.")

        participant = match.participants.get(participant_id)
        if not participant:
            raise ValueError(f"Participant {participant_id} not found.")

        pos = next(
            (
                p
                for p in duel.positions.get(participant_id, [])
                if p.position_id == position_id
            ),
            None,
        )
        if not pos:
            raise ValueError(f"Position {position_id} not found.")

        sim = self._market_sims.get(duel.match_id)
        current_price = sim.get_price(pos.symbol) if sim else pos.current_price_cents

        realized_pnl = DuelEngine.close_position(duel, position_id, current_price)

        # Return collateral + realized PnL back into participant's liquid capital & equity
        settled_cents = max(0, pos.collateral_cents + realized_pnl)
        participant.capital_cents += settled_cents
        participant.equity_cents = participant.capital_cents + sum(
            p.collateral_cents + p.unrealized_pnl_cents
            for p in duel.positions.get(participant_id, [])
            if not p.is_closed
        )
        return realized_pnl

    def tick_duels(self, match_id: str, delta_sec: float = 0.1) -> list[DuelResolution]:
        """
        Ticks all active duels in the match, evaluates maintenance margin liquidations,
        and settles completed duels.
        """
        match = self._matches.get(match_id)
        if not match:
            raise ValueError(f"Match {match_id} does not exist.")

        sim = self._market_sims.get(match_id)
        current_prices = {
            t.symbol: t.price_cents for t in (sim.current_ticks.values() if sim else [])
        }

        resolutions: list[DuelResolution] = []
        duels_to_resolve: list[DuelState] = []

        for duel in list(self._duels.values()):
            if duel.match_id != match_id or duel.is_resolved:
                continue

            duel.time_remaining_sec = max(0.0, duel.time_remaining_sec - delta_sec)

            # Update positions and handle maintenance margin auto-liquidations
            auto_liquidated = DuelEngine.update_positions(duel, current_prices)
            for l_pos in auto_liquidated:
                p = match.participants.get(l_pos.participant_id)
                if p:
                    p.equity_cents = p.capital_cents + sum(
                        op.collateral_cents + op.unrealized_pnl_cents
                        for op in duel.positions.get(p.uuid, [])
                        if not op.is_closed
                    )

            if duel.time_remaining_sec <= 0.0:
                duels_to_resolve.append(duel)

        for duel in duels_to_resolve:
            res = self._settle_duel(match, duel, current_prices)
            resolutions.append(res)

        return resolutions

    def _settle_duel(
        self,
        match: MatchState,
        duel: DuelState,
        current_prices: dict[str, int],
    ) -> DuelResolution:
        """
        Settles an expired duel, calculates winners, distributes bounties and loot cards,
        and enforces bankruptcy liquidation.
        """
        resolution = DuelEngine.resolve_duel(duel, current_prices)

        # Settle any remaining positions for both participants
        for p_id in duel.participant_ids:
            p = match.participants.get(p_id)
            if not p:
                continue
            for pos in duel.positions.get(p_id, []):
                settled = max(0, pos.collateral_cents + pos.realized_pnl_cents)
                p.capital_cents += settled

            p.equity_cents = p.capital_cents

        if resolution.winner_id and resolution.loser_ids:
            winner = match.participants.get(resolution.winner_id)
            if winner:
                total_bounty = 0
                all_stolen_loot: list[str] = []
                kills_credited = len(resolution.loser_ids)

                # Winner profit from trading
                winner.net_profit_cents += resolution.net_profits.get(winner.uuid, 0)

                for loser_id in resolution.loser_ids:
                    loser = match.participants.get(loser_id)
                    if not loser:
                        continue

                    # 25% cash bounty from loser
                    bounty = max(0, int(loser.capital_cents * 0.25))
                    loser.capital_cents = max(0, loser.capital_cents - bounty)
                    loser.equity_cents = loser.capital_cents
                    total_bounty += bounty
                    resolution.bounties_by_loser[loser_id] = bounty

                    # Transfer ticker loot cards
                    stolen_loot = list(loser.held_tickers)
                    all_stolen_loot.extend(stolen_loot)
                    winner.held_tickers.extend(stolen_loot)
                    loser.held_tickers.clear()
                    resolution.loot_by_loser[loser_id] = stolen_loot

                    loser.net_profit_cents += (
                        resolution.net_profits.get(loser.uuid, 0) - bounty
                    )

                    # Loser bankruptcy check
                    if loser.equity_cents <= 0:
                        loser.status = ParticipantStatus.BUSTED
                        match.eliminated_count += 1
                        alive_count = sum(
                            1
                            for p in match.participants.values()
                            if p.status
                            in (ParticipantStatus.ALIVE, ParticipantStatus.IN_DUEL)
                        )
                        loser.placement = alive_count + 1
                        resolution.liquidated_participant_ids.append(loser_id)
                        resolution.loser_liquidated = True
                    else:
                        loser.status = ParticipantStatus.ALIVE

                # Credit total bounties, loot, and kills to winner
                winner.capital_cents += total_bounty
                winner.equity_cents += total_bounty
                winner.net_profit_cents += total_bounty
                winner.kills += kills_credited
                winner.status = ParticipantStatus.ALIVE
                resolution.bounty_transferred_cents = total_bounty
                resolution.loot_transferred = all_stolen_loot
                resolution.kills_credited = kills_credited
        else:
            # Draw: return all to ALIVE
            for p_id in duel.participant_ids:
                p = match.participants.get(p_id)
                if p and p.status == ParticipantStatus.IN_DUEL:
                    p.status = ParticipantStatus.ALIVE

        # Clean up participant duel tracking
        for p_id in duel.participant_ids:
            self._participant_duel.pop(p_id, None)

        # Check win condition if only 1 participant remains ALIVE
        alive_players = [
            p
            for p in match.participants.values()
            if p.status == ParticipantStatus.ALIVE
        ]
        if len(alive_players) == 1 and len(match.participants) > 1:
            lone_survivor = alive_players[0]
            lone_survivor.status = ParticipantStatus.VICTORIOUS
            lone_survivor.placement = 1
            match.phase = MatchPhase.MATCH_OVER

        return resolution

    def to_dict(self, match_id: str) -> dict:
        """
        Serializes match state for high-frequency WebSocket and REST broadcast.
        """
        match = self._matches.get(match_id)
        if not match:
            raise ValueError(f"Match {match_id} does not exist.")
        return match.model_dump()

    def get_or_create_user_rank(self, user_id: str) -> UserRank:
        """
        Retrieves active UserRank progression or initializes new Bronze III profile.
        """
        if user_id not in self._user_ranks:
            self._user_ranks[user_id] = UserRank(user_id=user_id)
        return self._user_ranks[user_id]

    def settle_match_ranks(self, match_id: str) -> dict[str, MatchRankResult]:
        """
        Evaluates competitive MMR & RP progression for all participants in a match.
        """
        match = self._matches.get(match_id)
        if not match:
            raise ValueError(f"Match {match_id} does not exist.")

        results: dict[str, MatchRankResult] = {}
        for p in match.participants.values():
            rank = self.get_or_create_user_rank(p.uuid)
            placement = p.placement or match.target_players
            res = MMREngine.evaluate_match_result(
                rank=rank,
                placement=placement,
                kills=p.kills,
                net_profit_cents=p.net_profit_cents,
            )
            results[p.uuid] = res

        return results
