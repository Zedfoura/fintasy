# Execution receipt — HERO-1 (run 2026-10-20, session a4a10a71)

- Authority: user message "D2: render only the new hero on / and unmount the legacy sections. Proceed to HERO-1."
- Base: 511b80c9f5cfc5eac792084eeb322cbb1a5526da
- Artifact: wargames/hero-directions/index.html sha256 a8c283fb228234ba13db681b3682eab80fdbe8a56f8e38e857cc77ca4c2ac20f
- Served: python3 -m http.server 4477 (127.0.0.1), viewed in the built-in browser pane

## Evidence
- Rendered A/B/C at 1440x900 and at 375x812. scrollWidth==innerWidth for every direction at 375: {"a":[375,375],"b":[375,375],"c":[375,375]}
- Console errors: none ("No console logs.")
- Defects found and fixed during the run: (1) storm damage could kill every trader ("00 / 60") — the last trader is now protected; (2) caption overlays collided with sector labels — moved into a figcaption strip; (3) C equity curves left the canvas — now normalised to a band; (4) C counter showed 00 at the end — the survivor is now counted; (5) the hash switcher failed under the file:// data snapshot — the page is now served over http with a go() switcher.
- packages/ files changed: 0

### Contrast gate (raw)
```
A       PASS 16.04:1 (min 4.5) bone #ECE9E2 on ink
A       PASS  9.51:1 (min 4.5) side text #B9B5AC on ink
A       PASS  5.72:1 (min 4.5) mute #8E8B84 on ink
A       PASS  5.95:1 (min 4.5) violet #8B7CFF on ink (counter)
A       PASS 16.04:1 (min 4.5) ink on bone (CTA)
A       PASS  5.95:1 (min 4.5) ink on violet (CTA hover)
B       PASS 16.59:1 (min 4.5) ink on paper
B       PASS  5.94:1 (min 4.5) mute #5E5B55 on paper
B       PASS  5.74:1 (min 4.5) ink on signal #FF4D3D (CTA bar)
B       PASS 16.59:1 (min 4.5) paper on ink (logo)
C       PASS 17.98:1 (min 4.5) chalk on void
C       PASS  5.71:1 (min 4.5) ash #8A8A86 on void
C       PASS 10.83:1 (min 4.5) amber #FFB020 on void (CTA)
CONTROL FAIL  1.26:1 (min 4.5) known-bad #777777 on #888888
control flagged as failing: true
0 failing pair(s) across 13 direction pairs
```

## Stage
mechanism_verified (prototypes render, instrument validated against a known-bad control). OUTCOME waits on the user's pick; hero-direction.md and tokens.json get written after the pick.

## Flow contract
`validate_flow_coverage.py mission_HERO-1.json` → `INVALID: root: kind must be wargame-flow-claim`. This is a pre-existing schema gap across the workspace, ROUTED to HERO-3 (see ledger). FLOW-HERO-FIRST-IMPRESSION@PLAN is therefore UNVERIFIED by the instrument.

---
# Run 2 — direction lock (2026-10-20)

- Consumer evidence: user message "Lock direction A (Closing Bell) for HERO-1 and write hero-direction.md + tokens.json."
- Written: tokens.json sha256 80df46d7984f94fd3d84909a3f69ca510b58e4be8da4e66a74b943f049879f7c; hero-direction.md sha256 1d665025650f91b5d2fcf95aaa10252fb824e072c0f6a5e7f172147234d07802
- Source link probe: `curl https://github.com/Zedfoura/fintasy` → 200. The [Ranked] nav item was dropped because no route exists.
- Contrast gate now reads tokens.json (exit 0):
```
LOCKED  PASS 16.04:1 (min 4.5) headline/wordmark (#ECE9E2 on #0D0D0C)
LOCKED  PASS  9.51:1 (min 4.5) body paragraph (#B9B5AC on #0D0D0C)
LOCKED  PASS  5.72:1 (min 4.5) captions/meta (#8E8B84 on #0D0D0C)
LOCKED  PASS  5.95:1 (min 4.5) alive counter / hover (#8B7CFF on #0D0D0C)
LOCKED  PASS 16.04:1 (min 4.5) primary CTA label (#0D0D0C on #ECE9E2)
LOCKED  PASS  5.95:1 (min 4.5) primary CTA hover label (#0D0D0C on #8B7CFF)
LOCKED  PASS  6.28:1 (min 4.5) tile labels (live sector) (#9E9C96 on #1B1B19)
LOCKED  PASS 12.11:1 (min 4.5) caption over storm (#ECE9E2 on #29253F)
CONTROL FAIL  1.26:1 (min 4.5) known-bad #777777 on #888888
control flagged as failing: true
0 failing pair(s) across 21 direction pairs
```
- packages/ files changed: 0

## Stage
outcome_verified (the consumer selected the direction and the locked tokens pass the gate). Retention is delegated to the HERO-4 retention guard that consumes tokens.json, so the ledger keeps HERO-1 unchecked until then.
