# @author: adibarra (Alec Ibarra), caleb-j-kim (Caleb Kim)
# @description: Sessions routes for the API

from typing import Optional

from fastapi import APIRouter, Body, Depends, Header, HTTPException, status
from pydantic import UUID4, BaseModel

from helpers.user import User
from services.database import Database

db = Database()
router = APIRouter(
    prefix="/api/v1",
)


class SessionData(BaseModel):
    owner: UUID4
    token: UUID4


class SessionRequest(BaseModel):
    username: str
    password: str


class SessionResponse(BaseModel):
    code: int
    message: str
    data: Optional[SessionData] = None

    class Config:
        exclude_none = True


async def authenticate(
    authorization: str = Header(...),
) -> tuple[str, str]:
    if not len(authorization.split(" ")) == 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bad Request",
        )

    token = authorization.split(" ")[1]
    token_owner = db.get_session(token)

    # Validate the token exists
    if token_owner is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
        )
    return token_owner, token


@router.post(
    "/sessions", response_model=SessionResponse, status_code=status.HTTP_200_OK
)
def create_session(
    data: SessionRequest = Body(...),
):
    # Check if user exists
    user = db.get_user_by_username(data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not Found",
        )

    # Verify password
    if not User.verify_password(data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        )

    # User has been authenticated, create a session
    session = db.create_session(str(user["uuid"]))
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
        )

    return SessionResponse(code=200, message="Ok", data=session)


@router.post(
    "/sessions/guest",
    response_model=SessionResponse,
    status_code=status.HTTP_200_OK,
)
def create_guest_session():
    """
    Creates an instant guest session for playing Stock Royale without registration.
    """
    # Look up or create default guest trader
    guest_user = db.get_user_by_username("guest_trader")
    if guest_user is None:
        guest_uuid = "00000000-0000-4000-8000-000000000001"
        try:
            guest_user = db.create_user(
                username="guest_trader",
                email="guest@fintasy.local",
                password_hash=User.hash_password("guest123"),
            )
        except Exception:
            pass
        if guest_user is None:
            guest_user = {"uuid": guest_uuid, "username": "guest_trader"}

    owner_uuid = str(guest_user["uuid"])
    session = db.create_session(owner_uuid)
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create guest session",
        )

    return SessionResponse(code=200, message="Ok", data=session)


@router.delete(
    "/sessions", response_model=SessionResponse, status_code=status.HTTP_200_OK
)
def delete_session(
    auth: tuple[str, str] = Depends(authenticate),
):
    if not db.delete_session(auth[1]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not Found",
        )

    return SessionResponse(code=200, message="Ok")
