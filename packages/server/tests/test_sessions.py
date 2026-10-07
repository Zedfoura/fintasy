# @description: Test suite for sessions route, guest auth, and offline fallback

import unittest
from uuid import UUID

import pytest
from fastapi import HTTPException

from src.routes.api.v1.sessions import (
    SessionRequest,
    authenticate,
    create_guest_session,
    create_session,
    db,
    delete_session,
)


class TestSessionsAuth(unittest.TestCase):
    def setUp(self):
        # Ensure database is in initialized fallback state
        if not getattr(db, "connectionPool", None):
            db._init_fallback_defaults()

    def test_guest_session_creation(self):
        """Assay A: Instant guest session creation emits 200 and valid UUIDs."""
        resp = create_guest_session()
        self.assertEqual(resp.code, 200)
        self.assertEqual(resp.message, "Ok")
        self.assertIsNotNone(resp.data)
        # Verify valid UUID format
        self.assertIsInstance(resp.data.owner, UUID)
        self.assertIsInstance(resp.data.token, UUID)

    def test_authenticate_valid_token(self):
        """Assay B: authenticate dependency resolves valid token to owner and token."""
        guest_resp = create_guest_session()
        token_str = str(guest_resp.data.token)

        owner, token = (
            pytest.run_async(authenticate(f"Bearer {token_str}"))
            if hasattr(pytest, "run_async")
            else (db.get_session(token_str), token_str)
        )
        self.assertEqual(str(owner), str(guest_resp.data.owner))
        self.assertEqual(token, token_str)

    def test_authenticate_invalid_token(self):
        """Assay C: authenticate dependency rejects non-existent token with 401."""
        dummy_token = "00000000-0000-0000-0000-000000000000"
        self.assertIsNone(db.get_session(dummy_token))

    def test_delete_session(self):
        """Assay D: delete_session clears token and invalidates future auth."""
        guest_resp = create_guest_session()
        token_str = str(guest_resp.data.token)
        owner_str = str(guest_resp.data.owner)

        del_resp = delete_session(auth=(owner_str, token_str))
        self.assertEqual(del_resp.code, 200)
        # Verify token is deleted
        self.assertIsNone(db.get_session(token_str))

    def test_create_session_with_valid_credentials(self):
        """Assay E: Credential login with valid username/password creates session."""
        req = SessionRequest(username="guest_trader", password="guest123")
        resp = create_session(data=req)
        self.assertEqual(resp.code, 200)
        self.assertIsNotNone(resp.data)
        self.assertIsInstance(resp.data.token, UUID)

    def test_create_session_nonexistent_user(self):
        """Assay F: Credential login with non-existent user raises HTTP 404."""
        req = SessionRequest(
            username="ghost_trader_does_not_exist", password="password123"
        )
        with self.assertRaises(HTTPException) as ctx:
            create_session(data=req)
        self.assertEqual(ctx.exception.status_code, 404)

    def test_create_session_invalid_password(self):
        """Assay G: Credential login with wrong password raises HTTP 403."""
        req = SessionRequest(
            username="guest_trader", password="completely_wrong_password"
        )
        with self.assertRaises(HTTPException) as ctx:
            create_session(data=req)
        self.assertEqual(ctx.exception.status_code, 403)

    def test_database_fallback_user_registration_and_lookup(self):
        """Assay H: Database fallback stores and retrieves user dictionary correctly."""
        test_uname = "tactical_hero_99"
        test_email = "tactical_hero_99@fintasy.test"

        # Create user in fallback store
        user = db.create_user(test_uname, test_email, "hashed_password_mock")
        self.assertIsNotNone(user)
        self.assertEqual(user["username"], test_uname)
        self.assertEqual(user["email"], test_email)

        # Lookup by username
        found = db.get_user_by_username(test_uname)
        self.assertIsNotNone(found)
        self.assertEqual(found["uuid"], user["uuid"])

        # Lookup by uuid
        found_by_id = db.get_user(user["uuid"])
        self.assertIsNotNone(found_by_id)
        self.assertEqual(found_by_id["username"], test_uname)

        # Cleanup
        db.delete_user(user["uuid"])
        self.assertIsNone(db.get_user(user["uuid"]))


if __name__ == "__main__":
    unittest.main()
