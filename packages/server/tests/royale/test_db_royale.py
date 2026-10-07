# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: Unit tests for ROYALE-7 PostgreSQL Database Migrations & Match Persistence Layer

import asyncio
import unittest
from datetime import datetime
from unittest.mock import MagicMock, patch

from fastapi import HTTPException

from routes.api.v1.royale import (
    CreateSeasonRequest,
    PersistMatchRequest,
    create_season_endpoint,
    get_active_season_endpoint,
    get_leaderboard_endpoint,
    get_match_endpoint,
    get_user_matches_endpoint,
    get_user_rank_endpoint,
    persist_match_endpoint,
)
from routes.api.v1.royale import (
    router as royale_router,
)
from services.database.mixins.royale import RoyaleMixin


class MockRoyaleDB(RoyaleMixin):
    def __init__(self):
        self.connectionPool = MagicMock()


class TestRoyaleDatabase(unittest.TestCase):
    """Assays A through F: RoyaleMixin CRUD, schema, and error handling"""

    def setUp(self):
        self.db = MockRoyaleDB()
        self.mock_conn = MagicMock()
        self.mock_cursor = MagicMock()
        self.db.connectionPool.getconn.return_value = self.mock_conn
        self.mock_conn.cursor.return_value.__enter__.return_value = self.mock_cursor

    def test_assay_a_schema_ddl_and_tables(self):
        """Assay A: Verify all 5 Stock Royale tables and updated_at triggers in database.py"""
        # Read source code of database.py to ensure DDL exists verbatim
        import inspect

        from services.database.database import Database

        source = inspect.getsource(Database.__new__)
        self.assertIn("CREATE TABLE IF NOT EXISTS ranked_seasons", source)
        self.assertIn("CREATE TABLE IF NOT EXISTS user_ranks", source)
        self.assertIn("CREATE TABLE IF NOT EXISTS matches", source)
        self.assertIn("CREATE TABLE IF NOT EXISTS match_participants", source)
        self.assertIn("CREATE TABLE IF NOT EXISTS match_duels", source)
        self.assertIn('"user_ranks"', source)

    def test_assay_b_create_and_get_season(self):
        """Assay B: Season creation and active season query"""
        # 1. create_season success
        self.mock_cursor.description = [
            ("uuid",),
            ("season_number",),
            ("name",),
            ("start_date",),
            ("end_date",),
            ("is_active",),
        ]
        self.mock_cursor.fetchone.return_value = (
            "season-123",
            1,
            "Genesis Royale",
            "2026-10-01",
            "2026-11-01",
            True,
        )

        res = self.db.create_season(
            season_number=1,
            name="Genesis Royale",
            start_date="2026-10-01",
            end_date="2026-11-01",
            is_active=True,
        )
        self.assertIsNotNone(res)
        self.assertEqual(res["season_number"], 1)
        self.assertEqual(res["name"], "Genesis Royale")
        self.mock_conn.commit.assert_called()
        self.db.connectionPool.putconn.assert_called_with(self.mock_conn)

        # 2. get_active_season
        self.mock_cursor.fetchone.return_value = (
            "season-123",
            1,
            "Genesis Royale",
            "2026-10-01",
            "2026-11-01",
            True,
        )
        active = self.db.get_active_season()
        self.assertIsNotNone(active)
        self.assertEqual(active["uuid"], "season-123")

        # 3. get_active_season None
        self.mock_cursor.fetchone.return_value = None
        no_active = self.db.get_active_season()
        self.assertIsNone(no_active)

    def test_assay_c_user_rank_crud(self):
        """Assay C: User rank retrieval, auto-initialization, and update"""
        self.mock_cursor.description = [
            ("uuid",),
            ("user_uuid",),
            ("season_uuid",),
            ("rp",),
            ("tier",),
            ("division",),
            ("demotion_protection_matches",),
            ("highest_rp",),
            ("highest_tier",),
            ("total_matches",),
            ("total_wins",),
            ("total_kills",),
        ]

        # 1. User rank exists
        self.mock_cursor.fetchone.return_value = (
            "rank-1",
            "user-1",
            "season-1",
            1200,
            "BRONZE",
            "I",
            0,
            1200,
            "BRONZE",
            10,
            2,
            5,
        )
        rank = self.db.get_or_create_user_rank_db("user-1", "season-1")
        self.assertIsNotNone(rank)
        self.assertEqual(rank["rp"], 1200)

        # 2. User rank does not exist -> insert default
        self.mock_cursor.fetchone.side_effect = [
            None,
            (
                "rank-new",
                "user-2",
                "season-1",
                0,
                "BRONZE",
                "III",
                0,
                0,
                "BRONZE",
                0,
                0,
                0,
            ),
        ]
        new_rank = self.db.get_or_create_user_rank_db("user-2", "season-1")
        self.assertIsNotNone(new_rank)
        self.assertEqual(new_rank["rp"], 0)
        self.assertEqual(new_rank["tier"], "BRONZE")
        self.mock_cursor.fetchone.side_effect = None

        # 3. Update user rank
        self.mock_cursor.fetchone.return_value = (
            "rank-1",
            "user-1",
            "season-1",
            1450,
            "SILVER",
            "III",
            3,
            1450,
            "SILVER",
            11,
            3,
            8,
        )
        updated = self.db.update_user_rank_db(
            user_uuid="user-1",
            season_uuid="season-1",
            rp=1450,
            tier="SILVER",
            division="III",
            demotion_protection=3,
            kills=3,
            is_win=True,
        )
        self.assertIsNotNone(updated)
        self.assertEqual(updated["rp"], 1450)
        self.assertEqual(updated["tier"], "SILVER")

    def test_assay_d_leaderboard(self):
        """Assay D: Seasonal leaderboard retrieval"""
        self.mock_cursor.description = [
            ("rank_uuid",),
            ("user_uuid",),
            ("username",),
            ("rp",),
            ("tier",),
            ("division",),
            ("total_wins",),
            ("total_kills",),
            ("total_matches",),
            ("rank_position",),
        ]
        self.mock_cursor.fetchall.return_value = [
            (
                "r-1",
                "u-1",
                "ApexTrader",
                16500,
                "GOLDEN_TRADER",
                "I",
                45,
                150,
                80,
                1,
            ),
            ("r-2", "u-2", "DiamondHands", 11200, "DIAMOND", "I", 20, 90, 60, 2),
        ]
        leaderboard = self.db.get_seasonal_leaderboard("season-1", limit=10)
        self.assertEqual(len(leaderboard), 2)
        self.assertEqual(leaderboard[0]["username"], "ApexTrader")
        self.assertEqual(leaderboard[0]["rank_position"], 1)

    def test_assay_e_match_persistence_atomic(self):
        """Assay E: Atomic match, participants, and duel persistence"""
        self.mock_cursor.description = [
            ("uuid",),
            ("match_id",),
            ("season_uuid",),
            ("seed",),
            ("phase",),
            ("target_players",),
            ("winner_uuid",),
            ("duration_seconds",),
        ]
        self.mock_cursor.fetchone.return_value = (
            "match-uuid-1",
            "match-royale-001",
            "season-1",
            42,
            "MATCH_OVER",
            40,
            "winner-uuid",
            480,
        )

        participants = [
            {
                "user_uuid": "winner-uuid",
                "username": "TopBull",
                "is_bot": False,
                "placement": 1,
                "kills": 5,
                "final_equity_cents": 2500000,
                "net_profit_cents": 1000000,
                "rp_earned": 195,
            },
            {
                "user_uuid": None,
                "username": "ScalperBot_1",
                "is_bot": True,
                "bot_archetype": "Scalper",
                "placement": 2,
                "kills": 1,
                "final_equity_cents": 1400000,
                "net_profit_cents": -100000,
                "rp_earned": 0,
            },
        ]
        duels = [
            {
                "duel_id": "duel-1",
                "sector": "TECH_SEMIS",
                "winner_uuid": "winner-uuid",
                "bounty_cents": 375000,
                "third_party_count": 1,
            }
        ]

        saved = self.db.save_match_record(
            match_id="match-royale-001",
            season_uuid="season-1",
            seed=42,
            target_players=40,
            winner_uuid="winner-uuid",
            duration_seconds=480,
            participants=participants,
            duels=duels,
        )
        self.assertIsNotNone(saved)
        self.assertEqual(saved["match_id"], "match-royale-001")
        self.mock_conn.commit.assert_called()

        # Test rollback on exception
        self.mock_cursor.execute.side_effect = Exception("DB Disk Full")
        failed = self.db.save_match_record(
            match_id="match-royale-002",
            season_uuid="season-1",
            seed=42,
            target_players=40,
            winner_uuid=None,
            duration_seconds=100,
            participants=[],
        )
        self.assertIsNone(failed)
        self.mock_conn.rollback.assert_called()

    def test_assay_f_match_history_and_lookup(self):
        """Assay F: Match history retrieval and single match lookup"""
        # 1. get_user_match_history
        self.mock_cursor.description = [
            ("match_id",),
            ("seed",),
            ("duration_seconds",),
            ("match_date",),
            ("placement",),
            ("kills",),
            ("final_equity_cents",),
            ("net_profit_cents",),
            ("rp_earned",),
        ]
        self.mock_cursor.fetchall.return_value = [
            ("match-1", 42, 500, "2026-10-01", 1, 4, 3000000, 1500000, 180)
        ]
        history = self.db.get_user_match_history("u-1", limit=10)
        self.assertEqual(len(history), 1)
        self.assertEqual(history[0]["match_id"], "match-1")

        # 2. get_match_by_id
        # cursor calls: 1st for match, 2nd for participants, 3rd for duels
        def mock_fetchone():
            return (
                "m-uuid",
                "match-1",
                "season-1",
                42,
                "MATCH_OVER",
                40,
                "winner-1",
                500,
                "2026-10-01",
            )

        self.mock_cursor.fetchone = mock_fetchone
        self.mock_cursor.description = [
            ("uuid",),
            ("match_id",),
            ("season_uuid",),
            ("seed",),
            ("phase",),
            ("target_players",),
            ("winner_uuid",),
            ("duration_seconds",),
            ("created_at",),
        ]

        def mock_fetchall():
            if self.mock_cursor.description[0][0] == "mp_uuid":
                return [
                    (
                        "mp-1",
                        "m-uuid",
                        "u-1",
                        "Trader1",
                        False,
                        None,
                        1,
                        3,
                        2000000,
                        500000,
                        150,
                        "now",
                    )
                ]
            return [("d-1", "duel-1", "m-uuid", "TECH", "u-1", 250000, 0, "now")]

        self.mock_cursor.fetchall.side_effect = [
            [
                (
                    "mp-1",
                    "m-uuid",
                    "u-1",
                    "Trader1",
                    False,
                    None,
                    1,
                    3,
                    2000000,
                    500000,
                    150,
                    "now",
                )
            ],
            [("d-1", "duel-1", "m-uuid", "TECH", "u-1", 250000, 0, "now")],
        ]

        match_full = self.db.get_match_by_id("match-1")
        self.assertIsNotNone(match_full)
        self.assertEqual(match_full["match_id"], "match-1")
        self.assertIn("participants", match_full)
        self.assertIn("duels", match_full)


class TestRoyaleAPIRoutes(unittest.TestCase):
    """Assay G: FastAPI REST endpoints and routing behavior"""

    def test_routes_registered_on_router(self):
        """Verify endpoint registration and methods on royale_router"""
        paths = {r.path: list(r.methods) for r in royale_router.routes}
        self.assertIn("/api/v1/royale/seasons", paths)
        self.assertIn("/api/v1/royale/seasons/active", paths)
        self.assertIn("/api/v1/royale/leaderboard", paths)
        self.assertIn("/api/v1/royale/users/{user_uuid}/rank", paths)
        self.assertIn("/api/v1/royale/users/{user_uuid}/matches", paths)
        self.assertIn("/api/v1/royale/matches/{match_id}", paths)
        self.assertIn("/api/v1/royale/matches/{match_id}/persist", paths)

    def test_create_and_active_season_endpoints(self):
        """Test season API endpoints with async calls"""
        with patch("routes.api.v1.royale.db") as mock_db:
            # 1. create_season_endpoint
            mock_db.create_season.return_value = {
                "uuid": "s-1",
                "season_number": 1,
                "name": "Season 1",
                "start_date": "2026-10-01",
                "end_date": "2026-11-01",
                "is_active": True,
            }
            body = CreateSeasonRequest(
                season_number=1,
                name="Season 1",
                start_date="2026-10-01",
                end_date="2026-11-01",
                is_active=True,
            )
            res = asyncio.run(create_season_endpoint(body))
            self.assertEqual(res.code, 201)
            self.assertEqual(res.data["season_number"], 1)

            # 2. get_active_season_endpoint success
            mock_db.get_active_season.return_value = {
                "uuid": "s-1",
                "season_number": 1,
                "name": "Season 1",
            }
            res_active = asyncio.run(get_active_season_endpoint())
            self.assertEqual(res_active.code, 200)
            self.assertEqual(res_active.data["uuid"], "s-1")

            # 3. get_active_season_endpoint 404
            mock_db.get_active_season.return_value = None
            with self.assertRaises(HTTPException) as cm:
                asyncio.run(get_active_season_endpoint())
            self.assertEqual(cm.exception.status_code, 404)

    def test_leaderboard_endpoint(self):
        """Test leaderboard endpoint with fallback to active season"""
        with patch("routes.api.v1.royale.db") as mock_db:
            mock_db.get_active_season.return_value = {"uuid": "s-1"}
            mock_db.get_seasonal_leaderboard.return_value = [
                {"username": "Trader1", "rp": 2500, "rank_position": 1}
            ]
            res = asyncio.run(
                get_leaderboard_endpoint(season_uuid=None, limit=50, offset=0)
            )
            self.assertEqual(res.code, 200)
            self.assertEqual(len(res.data), 1)
            mock_db.get_seasonal_leaderboard.assert_called_with(
                season_uuid="s-1", limit=50, offset=0
            )

    def test_user_rank_and_matches_endpoints(self):
        """Test user rank and match history endpoints"""
        with patch("routes.api.v1.royale.db") as mock_db:
            # 1. get_user_rank_endpoint
            mock_db.get_active_season.return_value = {"uuid": "s-1"}
            mock_db.get_or_create_user_rank_db.return_value = {
                "user_uuid": "u-1",
                "rp": 1500,
                "tier": "SILVER",
                "division": "III",
            }
            rank_res = asyncio.run(
                get_user_rank_endpoint(user_uuid="u-1", season_uuid=None)
            )
            self.assertEqual(rank_res.code, 200)
            self.assertEqual(rank_res.data["tier"], "SILVER")

            # 2. get_user_matches_endpoint
            mock_db.get_user_match_history.return_value = [
                {"match_id": "m-1", "placement": 1, "rp_earned": 140}
            ]
            matches_res = asyncio.run(
                get_user_matches_endpoint(user_uuid="u-1", limit=10)
            )
            self.assertEqual(matches_res.code, 200)
            self.assertEqual(len(matches_res.data), 1)

    def test_persist_match_endpoint(self):
        """Test match persistence endpoint"""
        with patch("routes.api.v1.royale.db") as mock_db:
            mock_db.get_active_season.return_value = {"uuid": "s-1"}
            mock_db.save_match_record.return_value = {
                "uuid": "m-uuid",
                "match_id": "match-999",
            }

            body = PersistMatchRequest(
                season_uuid=None,
                seed=12345,
                target_players=40,
                winner_uuid="u-1",
                duration_seconds=420,
                participants=[
                    {
                        "user_uuid": "u-1",
                        "username": "Trader1",
                        "placement": 1,
                    }
                ],
            )
            res = asyncio.run(persist_match_endpoint("match-999", body))
            self.assertEqual(res.code, 201)
            self.assertEqual(res.data["match_id"], "match-999")
            mock_db.save_match_record.assert_called_with(
                match_id="match-999",
                season_uuid="s-1",
                seed=12345,
                target_players=40,
                winner_uuid="u-1",
                duration_seconds=420,
                participants=body.participants,
                duels=None,
            )


if __name__ == "__main__":
    unittest.main()
