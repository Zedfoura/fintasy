# Mission Ledger — Legacy Entry Point

_Active campaign moved to `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/ledger.md`._

**State model:** proposed → planned → executing → mechanism_verified → canonical → activated → outcome_verified → retained  
**Disposition:** active | blocked | closed_with_accepted_risk | withdrawn_by_user (never overwrites evidence state)  
**Completion rule:** Only explicit `retained` state with a valid receipt may use `[x]`.  
**Legacy rule:** An unmarked legacy `[x]` means `planned` at most after its linked Battle Plan is validated; otherwise route it to `AUDIT/RESUME` without assigning an evidence state.  
