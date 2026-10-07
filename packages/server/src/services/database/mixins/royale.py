# @author: Tinatsei Chingaya (Zedfoura), Antigravity
# @description: Database mixin for Fintasy Stock Royale ranked seasons, user ranks, and match persistence

from typing import TYPE_CHECKING, Any

import psycopg2

if TYPE_CHECKING:
    from psycopg2.pool import SimpleConnectionPool


class RoyaleMixin:
    """
    A collection of database CRUD operations for Stock Royale ranked seasons,
    competitive player ranks, match history, and duel logs.
    """

    connectionPool: "SimpleConnectionPool"

    def create_season(
        self,
        season_number: int,
        name: str,
        start_date: Any,
        end_date: Any,
        is_active: bool = True,
    ) -> dict | None:
        """
        Creates a new ranked season in the database.
        """
        conn = None
        try:
            conn = self.connectionPool.getconn()
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO ranked_seasons (season_number, name, start_date, end_date, is_active)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING *;
                    """,
                    (season_number, name, start_date, end_date, is_active),
                )
                row = cursor.fetchone()
                conn.commit()
                if row:
                    col_names = [desc[0] for desc in cursor.description]
                    return dict(zip(col_names, row))
                return None
        except Exception as e:
            print("Failed to create ranked season:", e, flush=True)
            return None
        finally:
            if conn:
                self.connectionPool.putconn(conn)

    def get_active_season(self) -> dict | None:
        """
        Retrieves the currently active ranked season.
        """
        conn = None
        try:
            conn = self.connectionPool.getconn()
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT * FROM ranked_seasons
                    WHERE is_active = TRUE
                    ORDER BY season_number DESC
                    LIMIT 1;
                    """
                )
                row = cursor.fetchone()
                if row:
                    col_names = [desc[0] for desc in cursor.description]
                    return dict(zip(col_names, row))
                return None
        except Exception as e:
            print("Failed to get active season:", e, flush=True)
            return None
        finally:
            if conn:
                self.connectionPool.putconn(conn)

    def get_or_create_user_rank_db(
        self,
        user_uuid: str,
        season_uuid: str,
    ) -> dict | None:
        """
        Retrieves existing user rank profile for the season or initializes a new Bronze III rank.
        """
        conn = None
        try:
            conn = self.connectionPool.getconn()
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT * FROM user_ranks
                    WHERE user_uuid = %s AND season_uuid = %s;
                    """,
                    (user_uuid, season_uuid),
                )
                row = cursor.fetchone()
                if row:
                    col_names = [desc[0] for desc in cursor.description]
                    return dict(zip(col_names, row))

                # Insert default rank
                cursor.execute(
                    """
                    INSERT INTO user_ranks (
                        user_uuid, season_uuid, rp, tier, division,
                        demotion_protection_matches, highest_rp, highest_tier,
                        total_matches, total_wins, total_kills
                    ) VALUES (%s, %s, 0, 'BRONZE', 'III', 0, 0, 'BRONZE', 0, 0, 0)
                    ON CONFLICT (user_uuid, season_uuid) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                    RETURNING *;
                    """,
                    (user_uuid, season_uuid),
                )
                row = cursor.fetchone()
                conn.commit()
                if row:
                    col_names = [desc[0] for desc in cursor.description]
                    return dict(zip(col_names, row))
                return None
        except Exception as e:
            print("Failed to get or create user rank:", e, flush=True)
            return None
        finally:
            if conn:
                self.connectionPool.putconn(conn)

    def update_user_rank_db(
        self,
        user_uuid: str,
        season_uuid: str,
        rp: int,
        tier: str,
        division: str,
        demotion_protection: int,
        kills: int = 0,
        is_win: bool = False,
    ) -> dict | None:
        """
        Updates an existing player's ranked standing, lifetime stats, and highest tier.
        """
        conn = None
        try:
            conn = self.connectionPool.getconn()
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE user_ranks
                    SET
                        rp = %s,
                        tier = %s,
                        division = %s,
                        demotion_protection_matches = %s,
                        highest_rp = GREATEST(highest_rp, %s),
                        total_matches = total_matches + 1,
                        total_kills = total_kills + %s,
                        total_wins = total_wins + %s
                    WHERE user_uuid = %s AND season_uuid = %s
                    RETURNING *;
                    """,
                    (
                        rp,
                        tier,
                        division,
                        demotion_protection,
                        rp,
                        kills,
                        1 if is_win else 0,
                        user_uuid,
                        season_uuid,
                    ),
                )
                row = cursor.fetchone()
                conn.commit()
                if row:
                    col_names = [desc[0] for desc in cursor.description]
                    return dict(zip(col_names, row))
                return None
        except Exception as e:
            print("Failed to update user rank:", e, flush=True)
            return None
        finally:
            if conn:
                self.connectionPool.putconn(conn)

    def get_seasonal_leaderboard(
        self,
        season_uuid: str,
        limit: int = 100,
        offset: int = 0,
    ) -> list[dict]:
        """
        Retrieves paginated seasonal leaderboard sorted by RP descending.
        """
        conn = None
        try:
            conn = self.connectionPool.getconn()
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                        ur.uuid AS rank_uuid,
                        ur.user_uuid,
                        u.username,
                        ur.rp,
                        ur.tier,
                        ur.division,
                        ur.total_wins,
                        ur.total_kills,
                        ur.total_matches,
                        ROW_NUMBER() OVER (ORDER BY ur.rp DESC) AS rank_position
                    FROM user_ranks ur
                    JOIN users u ON ur.user_uuid = u.uuid
                    WHERE ur.season_uuid = %s
                    ORDER BY ur.rp DESC
                    LIMIT %s OFFSET %s;
                    """,
                    (season_uuid, min(100, limit), max(0, offset)),
                )
                rows = cursor.fetchall()
                if rows:
                    col_names = [desc[0] for desc in cursor.description]
                    return [dict(zip(col_names, row)) for row in rows]
                return []
        except Exception as e:
            print("Failed to get seasonal leaderboard:", e, flush=True)
            return []
        finally:
            if conn:
                self.connectionPool.putconn(conn)

    def save_match_record(
        self,
        match_id: str,
        season_uuid: str | None,
        seed: int,
        target_players: int,
        winner_uuid: str | None,
        duration_seconds: int,
        participants: list[dict],
        duels: list[dict] | None = None,
    ) -> dict | None:
        """
        Atomically persists completed match record, participant placements, and duels.
        """
        conn = None
        try:
            conn = self.connectionPool.getconn()
            with conn.cursor() as cursor:
                # 1. Insert match header
                cursor.execute(
                    """
                    INSERT INTO matches (
                        match_id, season_uuid, seed, phase,
                        target_players, winner_uuid, duration_seconds
                    ) VALUES (%s, %s, %s, 'MATCH_OVER', %s, %s, %s)
                    ON CONFLICT (match_id) DO UPDATE SET duration_seconds = EXCLUDED.duration_seconds
                    RETURNING *;
                    """,
                    (
                        match_id,
                        season_uuid,
                        seed,
                        target_players,
                        winner_uuid,
                        duration_seconds,
                    ),
                )
                match_row = cursor.fetchone()
                if not match_row:
                    return None
                col_names = [desc[0] for desc in cursor.description]
                match_dict = dict(zip(col_names, match_row))
                match_db_uuid = match_dict["uuid"]

                # 2. Insert participants
                for p in participants:
                    cursor.execute(
                        """
                        INSERT INTO match_participants (
                            match_uuid, user_uuid, username, is_bot,
                            bot_archetype, placement, kills,
                            final_equity_cents, net_profit_cents, rp_earned
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                        """,
                        (
                            match_db_uuid,
                            p.get("user_uuid"),
                            p.get("username", "UnknownTrader"),
                            p.get("is_bot", False),
                            p.get("bot_archetype"),
                            p.get("placement", 0),
                            p.get("kills", 0),
                            p.get("final_equity_cents", 0),
                            p.get("net_profit_cents", 0),
                            p.get("rp_earned", 0),
                        ),
                    )

                # 3. Insert duels if provided
                if duels:
                    for d in duels:
                        cursor.execute(
                            """
                            INSERT INTO match_duels (
                                duel_id, match_uuid, sector,
                                winner_uuid, bounty_cents, third_party_count
                            ) VALUES (%s, %s, %s, %s, %s, %s);
                            """,
                            (
                                d.get("duel_id", ""),
                                match_db_uuid,
                                d.get("sector", ""),
                                d.get("winner_uuid"),
                                d.get("bounty_cents", 0),
                                d.get("third_party_count", 0),
                            ),
                        )

                conn.commit()
                return match_dict
        except Exception as e:
            print("Failed to save match record:", e, flush=True)
            if conn:
                conn.rollback()
            return None
        finally:
            if conn:
                self.connectionPool.putconn(conn)

    def get_user_match_history(
        self,
        user_uuid: str,
        limit: int = 20,
    ) -> list[dict]:
        """
        Retrieves recent match outcomes for a specified user.
        """
        conn = None
        try:
            conn = self.connectionPool.getconn()
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                        m.match_id,
                        m.seed,
                        m.duration_seconds,
                        m.created_at AS match_date,
                        mp.placement,
                        mp.kills,
                        mp.final_equity_cents,
                        mp.net_profit_cents,
                        mp.rp_earned
                    FROM match_participants mp
                    JOIN matches m ON mp.match_uuid = m.uuid
                    WHERE mp.user_uuid = %s
                    ORDER BY m.created_at DESC
                    LIMIT %s;
                    """,
                    (user_uuid, min(50, limit)),
                )
                rows = cursor.fetchall()
                if rows:
                    col_names = [desc[0] for desc in cursor.description]
                    return [dict(zip(col_names, row)) for row in rows]
                return []
        except Exception as e:
            print("Failed to get user match history:", e, flush=True)
            return []
        finally:
            if conn:
                self.connectionPool.putconn(conn)

    def get_match_by_id(self, match_id: str) -> dict | None:
        """
        Retrieves complete match summary including all participants and combat duels.
        """
        conn = None
        try:
            conn = self.connectionPool.getconn()
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT * FROM matches WHERE match_id = %s;
                    """,
                    (match_id,),
                )
                row = cursor.fetchone()
                if not row:
                    return None
                col_names = [desc[0] for desc in cursor.description]
                match_dict = dict(zip(col_names, row))
                match_uuid = match_dict["uuid"]

                # Fetch participants
                cursor.execute(
                    """
                    SELECT * FROM match_participants
                    WHERE match_uuid = %s
                    ORDER BY placement ASC;
                    """,
                    (match_uuid,),
                )
                part_rows = cursor.fetchall()
                p_cols = [desc[0] for desc in cursor.description]
                match_dict["participants"] = [dict(zip(p_cols, pr)) for pr in part_rows]

                # Fetch duels
                cursor.execute(
                    """
                    SELECT * FROM match_duels
                    WHERE match_uuid = %s;
                    """,
                    (match_uuid,),
                )
                duel_rows = cursor.fetchall()
                d_cols = [desc[0] for desc in cursor.description]
                match_dict["duels"] = [dict(zip(d_cols, dr)) for dr in duel_rows]

                return match_dict
        except Exception as e:
            print("Failed to get match by id:", e, flush=True)
            return None
        finally:
            if conn:
                self.connectionPool.putconn(conn)
