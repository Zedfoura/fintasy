# Battle Plan — Mission ROYALE-7: PostgreSQL Database Migrations & Match Persistence Layer

**Mission:** `ROYALE-7`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md` (§1.1 Persistent Tier)  
**Assigned Parallel Lane:** `lane_ranked`  
**Target Files:**
- `packages/server/src/services/database/mixins/royale.py`
- `packages/server/src/services/database/database.py`
- `packages/server/src/routes/api/v1/royale.py`
- `packages/server/src/main.py`
- `packages/server/tests/royale/test_db_royale.py`

---

## 1. Concrete Execution Specification

### 1.1 Schema Expansion (`database.py`)
Add 5 new tables in `Database.__new__` using strict `CREATE TABLE IF NOT EXISTS`:
* **`ranked_seasons`**:
  * `uuid UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  * `season_number INT UNIQUE NOT NULL`
  * `name TEXT NOT NULL`
  * `start_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`
  * `end_date TIMESTAMPTZ NOT NULL`
  * `is_active BOOLEAN NOT NULL DEFAULT TRUE`
  * `created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`
* **`user_ranks`**:
  * `uuid UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  * `user_uuid UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE`
  * `season_uuid UUID NOT NULL REFERENCES ranked_seasons(uuid) ON DELETE CASCADE`
  * `rp INT NOT NULL DEFAULT 0`
  * `tier TEXT NOT NULL DEFAULT 'BRONZE'`
  * `division TEXT NOT NULL DEFAULT 'III'`
  * `demotion_protection_matches INT NOT NULL DEFAULT 0`
  * `highest_rp INT NOT NULL DEFAULT 0`
  * `highest_tier TEXT NOT NULL DEFAULT 'BRONZE'`
  * `total_matches INT NOT NULL DEFAULT 0`
  * `total_wins INT NOT NULL DEFAULT 0`
  * `total_kills INT NOT NULL DEFAULT 0`
  * `created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`
  * `updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`
  * `UNIQUE(user_uuid, season_uuid)`
* **`matches`**:
  * `uuid UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  * `match_id TEXT UNIQUE NOT NULL`
  * `season_uuid UUID REFERENCES ranked_seasons(uuid) ON DELETE SET NULL`
  * `seed BIGINT NOT NULL`
  * `phase TEXT NOT NULL DEFAULT 'MATCH_OVER'`
  * `target_players INT NOT NULL`
  * `winner_uuid UUID REFERENCES users(uuid) ON DELETE SET NULL`
  * `duration_seconds INT NOT NULL DEFAULT 0`
  * `created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`
* **`match_participants`**:
  * `uuid UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  * `match_uuid UUID NOT NULL REFERENCES matches(uuid) ON DELETE CASCADE`
  * `user_uuid UUID REFERENCES users(uuid) ON DELETE SET NULL`
  * `username TEXT NOT NULL`
  * `is_bot BOOLEAN NOT NULL DEFAULT FALSE`
  * `bot_archetype TEXT`
  * `placement INT NOT NULL`
  * `kills INT NOT NULL DEFAULT 0`
  * `final_equity_cents BIGINT NOT NULL DEFAULT 0`
  * `net_profit_cents BIGINT NOT NULL DEFAULT 0`
  * `rp_earned INT NOT NULL DEFAULT 0`
  * `created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`
* **`match_duels`**:
  * `uuid UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  * `duel_id TEXT NOT NULL`
  * `match_uuid UUID NOT NULL REFERENCES matches(uuid) ON DELETE CASCADE`
  * `sector TEXT NOT NULL`
  * `winner_uuid UUID REFERENCES users(uuid) ON DELETE SET NULL`
  * `bounty_cents BIGINT NOT NULL DEFAULT 0`
  * `third_party_count INT NOT NULL DEFAULT 0`
  * `created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`

### 1.2 Database CRUD Mixin (`services/database/mixins/royale.py`)
* `RoyaleMixin`:
  * `create_season(season_number, name, start_date, end_date, is_active=True) -> dict | None`
  * `get_active_season() -> dict | None`
  * `get_or_create_user_rank_db(user_uuid, season_uuid) -> dict | None`
  * `update_user_rank_db(user_uuid, season_uuid, rp, tier, division, demotion_protection, kills, is_win) -> dict | None`
  * `get_seasonal_leaderboard(season_uuid, limit=100, offset=0) -> list[dict]`
  * `save_match_record(match_id, season_uuid, seed, target_players, winner_uuid, duration_seconds, participants, duels=None) -> dict | None`
  * `get_user_match_history(user_uuid, limit=20) -> list[dict]`
  * `get_match_by_id(match_id) -> dict | None`

### 1.3 REST API Endpoints (`routes/api/v1/royale.py`)
* `GET /api/v1/royale/seasons/active`: Returns active ranked season.
* `GET /api/v1/royale/leaderboard`: Returns top ranked traders for season.
* `GET /api/v1/royale/users/{user_uuid}/rank`: Returns player's rank card.
* `GET /api/v1/royale/users/{user_uuid}/matches`: Returns match history.
* `GET /api/v1/royale/matches/{match_id}`: Returns match breakdown.
* `POST /api/v1/royale/matches/{match_id}/persist`: Persists in-memory match.

---

## 2. Falsifiable Verification Assay (`packages/server/tests/royale/test_db_royale.py`)

1. **Assay A (Schema DDL & Table Creation):**
   * Verifies DDL queries contain `CREATE TABLE IF NOT EXISTS` for all 5 tables and updated_at triggers.
2. **Assay B (Season Creation & Active Query):**
   * Tests `create_season` and `get_active_season`.
3. **Assay C (User Rank Retrieval & Mutation):**
   * Tests `get_or_create_user_rank_db` and `update_user_rank_db`.
4. **Assay D (Seasonal Leaderboard Pagination):**
   * Tests `get_seasonal_leaderboard` ordering by `rp DESC`.
5. **Assay E (Atomic Match & Participants Persistence):**
   * Tests `save_match_record` with participants and duels.
6. **Assay F (User Match History & Match Lookup):**
   * Tests `get_user_match_history` and `get_match_by_id`.
7. **Assay G (FastAPI REST Endpoint Routing):**
   * Tests HTTP responses from `/api/v1/royale/seasons/active`, `/api/v1/royale/leaderboard`, etc.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** Python 3.12 active; clean tree at commit `2e662e5`; all 51 tests passing.
* **Rollback Plan:** `git checkout -- packages/server/src/services/database/ packages/server/src/routes/`
* **Points of No Return:** Non-destructive schema additions only.
