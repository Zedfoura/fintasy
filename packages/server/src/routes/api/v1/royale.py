# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: REST API routes for Fintasy Stock Royale ranked seasons, leaderboard, player ranks, and match history

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from services.database import Database

db = Database()
router = APIRouter(prefix="/api/v1/royale")


class CreateSeasonRequest(BaseModel):
    season_number: int
    name: str
    start_date: Any
    end_date: Any
    is_active: bool = True


class PersistMatchRequest(BaseModel):
    season_uuid: Optional[str] = None
    seed: int
    target_players: int
    winner_uuid: Optional[str] = None
    duration_seconds: int
    participants: list[dict]
    duels: Optional[list[dict]] = None


class GenericResponse(BaseModel):
    code: int
    message: str
    data: Optional[Any] = None


@router.post(
    "/seasons",
    response_model=GenericResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_season_endpoint(body: CreateSeasonRequest):
    """
    Creates a new competitive ranked season.
    """
    season = db.create_season(
        season_number=body.season_number,
        name=body.name,
        start_date=body.start_date,
        end_date=body.end_date,
        is_active=body.is_active,
    )
    if not season:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create ranked season",
        )
    return GenericResponse(
        code=status.HTTP_201_CREATED,
        message="Ranked season created successfully",
        data=season,
    )


@router.get(
    "/seasons/active",
    response_model=GenericResponse,
    status_code=status.HTTP_200_OK,
)
async def get_active_season_endpoint():
    """
    Retrieves the currently active ranked season.
    """
    season = db.get_active_season()
    if not season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active ranked season found",
        )
    return GenericResponse(
        code=status.HTTP_200_OK,
        message="Active season retrieved successfully",
        data=season,
    )


@router.get(
    "/leaderboard",
    response_model=GenericResponse,
    status_code=status.HTTP_200_OK,
)
async def get_leaderboard_endpoint(
    season_uuid: Optional[str] = Query(None, description="UUID of the season"),
    limit: int = Query(100, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """
    Retrieves the ranked leaderboard for a given season or the active season.
    """
    target_season_uuid = season_uuid
    if not target_season_uuid:
        active = db.get_active_season()
        if not active:
            return GenericResponse(
                code=status.HTTP_200_OK,
                message="No active season found, empty leaderboard",
                data=[],
            )
        target_season_uuid = str(active["uuid"])

    leaderboard = db.get_seasonal_leaderboard(
        season_uuid=target_season_uuid,
        limit=limit,
        offset=offset,
    )
    return GenericResponse(
        code=status.HTTP_200_OK,
        message="Leaderboard retrieved successfully",
        data=leaderboard,
    )


@router.get(
    "/users/{user_uuid}/rank",
    response_model=GenericResponse,
    status_code=status.HTTP_200_OK,
)
async def get_user_rank_endpoint(
    user_uuid: str,
    season_uuid: Optional[str] = Query(None, description="Season UUID"),
):
    """
    Retrieves or initializes a user's ranked card for the specified season or active season.
    """
    target_season_uuid = season_uuid
    if not target_season_uuid:
        active = db.get_active_season()
        if not active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active ranked season found",
            )
        target_season_uuid = str(active["uuid"])

    rank = db.get_or_create_user_rank_db(
        user_uuid=user_uuid,
        season_uuid=target_season_uuid,
    )
    if not rank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to retrieve or create user rank",
        )
    return GenericResponse(
        code=status.HTTP_200_OK,
        message="User rank retrieved successfully",
        data=rank,
    )


@router.get(
    "/users/{user_uuid}/matches",
    response_model=GenericResponse,
    status_code=status.HTTP_200_OK,
)
async def get_user_matches_endpoint(
    user_uuid: str,
    limit: int = Query(20, ge=1, le=50),
):
    """
    Retrieves match history for a given user.
    """
    matches = db.get_user_match_history(
        user_uuid=user_uuid,
        limit=limit,
    )
    return GenericResponse(
        code=status.HTTP_200_OK,
        message="User match history retrieved successfully",
        data=matches,
    )


@router.get(
    "/matches/{match_id}",
    response_model=GenericResponse,
    status_code=status.HTTP_200_OK,
)
async def get_match_endpoint(match_id: str):
    """
    Retrieves detailed breakdown of a completed match, including participants and duels.
    """
    match_data = db.get_match_by_id(match_id=match_id)
    if not match_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found",
        )
    return GenericResponse(
        code=status.HTTP_200_OK,
        message="Match retrieved successfully",
        data=match_data,
    )


@router.post(
    "/matches/{match_id}/persist",
    response_model=GenericResponse,
    status_code=status.HTTP_201_CREATED,
)
async def persist_match_endpoint(
    match_id: str,
    body: PersistMatchRequest,
):
    """
    Persists a completed in-memory match, participants, and combat duels to PostgreSQL.
    """
    target_season_uuid = body.season_uuid
    if not target_season_uuid:
        active = db.get_active_season()
        if active:
            target_season_uuid = str(active["uuid"])

    saved = db.save_match_record(
        match_id=match_id,
        season_uuid=target_season_uuid,
        seed=body.seed,
        target_players=body.target_players,
        winner_uuid=body.winner_uuid,
        duration_seconds=body.duration_seconds,
        participants=body.participants,
        duels=body.duels,
    )
    if not saved:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist match record",
        )
    return GenericResponse(
        code=status.HTTP_201_CREATED,
        message="Match persisted successfully",
        data=saved,
    )
