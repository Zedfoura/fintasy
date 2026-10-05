# @author: adibarra (Alec Ibarra), soltadd (Solomon Bedane)
# @description: Database class for handling database interactions

import psycopg2
from psycopg2 import pool

from config import POSTGRESQL_URI

# import all mixins here
from services.database.mixins.meta import MetaMixin
from services.database.mixins.portfolios import PortfolioMixin
from services.database.mixins.royale import RoyaleMixin
from services.database.mixins.sessions import SessionsMixin
from services.database.mixins.tournaments import TournamentsMixin
from services.database.mixins.transactions import TransactionsMixin
from services.database.mixins.users import UsersMixin


# add all imported mixins here
class Database(
    MetaMixin,
    PortfolioMixin,
    RoyaleMixin,
    SessionsMixin,
    TournamentsMixin,
    TransactionsMixin,
    UsersMixin,
    object,
):
    """
    A class representing the database.
    """

    connectionPool: pool.SimpleConnectionPool = None

    def __new__(cls):
        """
        Creates a new instance of the Database class if it doesn't already exist.
        If an instance already exists, returns the existing instance.

        To see the available methods, refer to the mixin classes in the `services.database.mixins` package.

        Returns:
            Database: The Database instance.
        """

        if not hasattr(cls, "instance"):
            conn = None
            cls.instance = super(Database, cls).__new__(cls)

            try:
                print("Connecting to PostgreSQL database...", flush=True)
                cls.instance.connectionPool = pool.SimpleConnectionPool(
                    1, 20, POSTGRESQL_URI
                )
                print("Connected. Initializing...", flush=True)

                conn = cls.instance.connectionPool.getconn()
                with conn.cursor() as cursor:
                    # Create pgcrypto extension if it doesn't exist
                    cursor.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")

                    # Create ACTION enum if it doesn't exist
                    cursor.execute("""
                        DO $$
                        BEGIN
                            CREATE TYPE ACTION AS ENUM ('BUY', 'SELL');
                        EXCEPTION
                            WHEN duplicate_object THEN NULL; -- Do nothing if the type already exists
                        END $$;
                    """)

                    # Create STATUS enum if it doesn't exist
                    cursor.execute("""
                        DO $$
                        BEGIN
                            CREATE TYPE STATUS AS ENUM ('SCHEDULED', 'ONGOING', 'FINISHED');
                        EXCEPTION
                            WHEN duplicate_object THEN NULL; -- Do nothing if the type already exists
                        END $$;
                    """)

                    # Initialize necessary tables if they don't exist
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS users (
                            uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            email TEXT UNIQUE NOT NULL,
                            username TEXT UNIQUE NOT NULL,
                            password_hash TEXT NOT NULL,
                            coins INT NOT NULL DEFAULT 10,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                        );
                    """)

                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS tournaments (
                            uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            owner UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
                            name TEXT NOT NULL,
                            status STATUS NOT NULL,
                            start_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            end_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                        );
                    """)

                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS portfolios (
                            uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            owner UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
                            tournament UUID REFERENCES tournaments(uuid) ON DELETE CASCADE,
                            name TEXT NOT NULL,
                            balance_cents BIGINT NOT NULL DEFAULT 1000000,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                        );
                    """)

                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS transactions (
                            uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            portfolio UUID NOT NULL REFERENCES portfolios(uuid) ON DELETE CASCADE,
                            symbol TEXT NOT NULL,
                            action ACTION NOT NULL,
                            quantity INT NOT NULL,
                            price_cents BIGINT NOT NULL,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                        );
                    """)

                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS sessions (
                            owner UUID UNIQUE NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
                            token TEXT NOT NULL DEFAULT gen_random_uuid(),
                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                        );
                    """)

                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS attributes (
                            owner UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
                            key TEXT NOT NULL,
                            value TEXT NOT NULL,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                        );
                    """)

                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS settings (
                            key TEXT NOT NULL,
                            value TEXT NOT NULL
                        );
                    """)

                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS friends (
                            owner UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
                            friend UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE
                        );
                    """)

                    # Stock Royale Ranked Seasons, Ranks, Matches, Participants & Duels
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS ranked_seasons (
                            uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            season_number INT UNIQUE NOT NULL,
                            name TEXT NOT NULL,
                            start_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            end_date TIMESTAMPTZ NOT NULL,
                            is_active BOOLEAN NOT NULL DEFAULT TRUE,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                        );
                    """)

                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS user_ranks (
                            uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            user_uuid UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
                            season_uuid UUID NOT NULL REFERENCES ranked_seasons(uuid) ON DELETE CASCADE,
                            rp INT NOT NULL DEFAULT 0,
                            tier TEXT NOT NULL DEFAULT 'BRONZE',
                            division TEXT NOT NULL DEFAULT 'III',
                            demotion_protection_matches INT NOT NULL DEFAULT 0,
                            highest_rp INT NOT NULL DEFAULT 0,
                            highest_tier TEXT NOT NULL DEFAULT 'BRONZE',
                            total_matches INT NOT NULL DEFAULT 0,
                            total_wins INT NOT NULL DEFAULT 0,
                            total_kills INT NOT NULL DEFAULT 0,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            UNIQUE(user_uuid, season_uuid)
                        );
                    """)

                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS matches (
                            uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            match_id TEXT UNIQUE NOT NULL,
                            season_uuid UUID REFERENCES ranked_seasons(uuid) ON DELETE SET NULL,
                            seed BIGINT NOT NULL,
                            phase TEXT NOT NULL DEFAULT 'MATCH_OVER',
                            target_players INT NOT NULL,
                            winner_uuid UUID REFERENCES users(uuid) ON DELETE SET NULL,
                            duration_seconds INT NOT NULL DEFAULT 0,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                        );
                    """)

                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS match_participants (
                            uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            match_uuid UUID NOT NULL REFERENCES matches(uuid) ON DELETE CASCADE,
                            user_uuid UUID REFERENCES users(uuid) ON DELETE SET NULL,
                            username TEXT NOT NULL,
                            is_bot BOOLEAN NOT NULL DEFAULT FALSE,
                            bot_archetype TEXT,
                            placement INT NOT NULL,
                            kills INT NOT NULL DEFAULT 0,
                            final_equity_cents BIGINT NOT NULL DEFAULT 0,
                            net_profit_cents BIGINT NOT NULL DEFAULT 0,
                            rp_earned INT NOT NULL DEFAULT 0,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                        );
                    """)

                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS match_duels (
                            uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            duel_id TEXT NOT NULL,
                            match_uuid UUID NOT NULL REFERENCES matches(uuid) ON DELETE CASCADE,
                            sector TEXT NOT NULL,
                            winner_uuid UUID REFERENCES users(uuid) ON DELETE SET NULL,
                            bounty_cents BIGINT NOT NULL DEFAULT 0,
                            third_party_count INT NOT NULL DEFAULT 0,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                        );
                    """)

                    # Create a function to update the updated_at column
                    cursor.execute("""
                        CREATE OR REPLACE FUNCTION update_updated_at()
                            RETURNS TRIGGER AS $$
                            BEGIN
                                NEW.updated_at = CURRENT_TIMESTAMP;
                                RETURN NEW;
                            END;
                            $$ LANGUAGE plpgsql;
                    """)

                    # Create a trigger to update the updated_at columns
                    for table in [
                        "users",
                        "tournaments",
                        "portfolios",
                        "sessions",
                        "attributes",
                        "user_ranks",
                    ]:
                        cursor.execute(f"""
                            CREATE OR REPLACE TRIGGER update_{table}_updated_at
                                BEFORE UPDATE ON {table}
                                FOR EACH ROW
                                EXECUTE FUNCTION update_updated_at();
                        """)

                    conn.commit()
                    print("Initialized. Database ready.", flush=True)
            except psycopg2.Error as e:
                print("Failed to initialize database:\n", e, flush=True)
            finally:
                if conn:
                    cls.instance.connectionPool.putconn(conn)

        return cls.instance
