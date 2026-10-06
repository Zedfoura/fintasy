# Battle Plan — Mission CLEAN-1: Dead Code Elimination & Test Suite Hygiene

**Mission:** `CLEAN-1`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`  
**Assigned Parallel Lane:** `lane_cleanup`  
**Target Files to Remove:**
- `packages/server/src/helpers/quote.py`
- `packages/server/src/helpers/sessions.py`
- `packages/server/src/helpers/transactions.py`
- `packages/server/tests/legacy/alpaca.legacy.py`
- `packages/server/tests/legacy/quote.legacy.py`
- `packages/server/tests/legacy/sessions.legacy.py`
- `packages/server/tests/legacy/transactions.legacy.py`
- `packages/server/tests/legacy/` (directory)
- `packages/client/src/components/README.md`
- `packages/client/src/layouts/README.md`
- `packages/client/src/modules/README.md`
- `packages/client/src/stores/README.md`
- `packages/server/src/routes/README.md`
- `packages/server/src/services/README.md`
- `packages/server/src/services/database/mixins/README.md`
- `docs/README.md`
- `docs/assets/README.md`

**Target Files to Modify:**
- `packages/server/pytest.ini` (remove obsolete `legacy` from `norecursedirs`)

---

## 1. Concrete Execution Specification

### 1.1 Deletion Protocol
1. Remove dead mock helper modules:
   ```bash
   rm packages/server/src/helpers/quote.py
   rm packages/server/src/helpers/sessions.py
   rm packages/server/src/helpers/transactions.py
   ```
2. Remove obsolete legacy test directory:
   ```bash
   rm -rf packages/server/tests/legacy
   ```
3. Remove template boilerplate READMEs:
   ```bash
   rm packages/client/src/components/README.md
   rm packages/client/src/layouts/README.md
   rm packages/client/src/modules/README.md
   rm packages/client/src/stores/README.md
   rm packages/server/src/routes/README.md
   rm packages/server/src/services/README.md
   rm packages/server/src/services/database/mixins/README.md
   rm docs/README.md
   rm docs/assets/README.md
   ```

### 1.2 Configuration Updates (`packages/server/pytest.ini`)
* Update `norecursedirs` from `legacy .venv .git __pycache__` to `.venv .git __pycache__`.

---

## 2. Falsifiable Verification Assays

1. **Assay A (File Absence Check):** Verify all 16 target files are completely deleted from the filesystem.
2. **Assay B (Active Helper Preservation):** Verify `helpers/user.py`, `portfolio.py`, and `tournament.py` remain intact and functional.
3. **Assay C (Server Test Suite):** Run `packages/server` test suite (`pytest`) to confirm all 72 tests pass with zero errors.
4. **Assay D (Client Test Suite):** Run `packages/client` test suite (`vitest`) to confirm all 38 tests pass with zero errors.
5. **Assay E (Monorepo Lint & Format):** Run `pnpm run lint` to verify zero formatting or linting errors.
6. **Assay F (Programmatic Blast Radius):** Run `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts` across affected paths.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** All 110 tests pass on HEAD (`feature/stock-royale-full-platform`).
* **Rollback Plan:** `git checkout -- packages/server/ packages/client/ docs/`
* **Point of No Return:** File deletions (tracked in Git).
