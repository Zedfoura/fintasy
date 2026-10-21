<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Asymmetric bento grid features (Element 7) detailing the 4 core pillars of Stock Royale
-->

<script setup lang="ts">
import {
  ChartArcs as RadarIcon,
  Crosshair as RoyaleIcon,
  Trophy as TrophyIcon,
  Bolt as ZapIcon,
} from '@vicons/tabler'
</script>

<template>
  <section
    id="gameplay-pillars"
    class="landing-benefits-section relative w-full flex flex-col items-center justify-start px-4 py-16 md:py-24"
  >
    <div class="mx-auto max-w-6xl w-full flex flex-col items-center">
      <!-- Section Tag & Taxonomy -->
      <div class="mb-4 inline-flex select-none items-center gap-1.5 border border-[rgba(255,255,255,0.1)] rounded bg-[#0E121B] px-3 py-1 text-xs text-slate-400 font-mono">
        <span class="text-slate-500">[</span>
        <span class="text-emerald-400 font-bold">02</span>
        <span>•</span>
        <span>THE 4 PILLARS OF STOCK ROYALE</span>
        <span class="text-slate-500">]</span>
      </div>

      <!-- Section Title & Subtitle -->
      <h2 class="mb-4 text-center text-3xl text-white font-extrabold tracking-tight font-serif md:text-5xl sm:text-4xl">
        Designed for Pure Competitive Execution.
      </h2>
      <p class="mb-14 max-w-2xl text-center text-base text-slate-300 leading-relaxed sm:text-lg">
        Forget static charts and paper trading spreadsheets. Every match in Fintasy combines institutional market mechanics with tournament-grade game theory.
      </p>

      <!-- Asymmetric Bento Grid Container -->
      <div class="grid grid-cols-1 w-full gap-6 md:grid-cols-3">
        <!-- Bento Card 1: 30-Second Micro-Trading Duels (Spans 2 columns) -->
        <div class="group relative overflow-hidden border border-[rgba(255,255,255,0.08)] rounded-2xl bg-[#0E121B] p-8 transition-all duration-300 md:col-span-2 hover:border-emerald-500/40 hover:bg-[#151C2B] hover:shadow-2xl">
          <div class="h-full flex flex-col justify-between space-y-6">
            <div>
              <div class="mb-3 flex items-center gap-2 text-xs text-emerald-400 font-bold tracking-wider font-mono uppercase">
                <span class="text-slate-500">[</span>
                <n-icon size="16">
                  <RoyaleIcon />
                </n-icon>
                <span>PILLAR 01 • HEAD-TO-HEAD TAPE COMBAT</span>
                <span class="text-slate-500">]</span>
              </div>
              <h3 class="text-2xl text-white font-bold font-serif sm:text-3xl">
                30-Second PVP Micro-Trading Duels
              </h3>
              <p class="mt-3 max-w-xl text-sm text-slate-300 leading-relaxed">
                Contest real-time sector drops against opposing players. Choose your position (Long or Short), dial in 1x to 5x leverage, and trade the 100ms tape. The trader with highest net P&L at zero seconds claims the victory, captures the bounty, and eliminates the opponent.
              </p>
            </div>

            <!-- Visual Mock Ticket -->
            <div class="border border-[rgba(255,255,255,0.06)] rounded-xl bg-[#07090E] p-4 text-xs font-mono">
              <div class="mb-2 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-2 text-slate-400">
                <span>COMBAT PROTOCOL</span>
                <span class="text-emerald-400 font-bold">ACTIVE ORDER TICKET</span>
              </div>
              <div class="flex flex-wrap items-center justify-between gap-2 text-slate-300">
                <span>ACTION: <span class="text-emerald-400 font-bold">5x LONG</span></span>
                <span>ENTRY: <span class="text-white font-bold tabular-nums">$128.40</span></span>
                <span>BOUNTY: <span class="text-amber-400 font-bold tabular-nums">+$1,450.00</span></span>
                <span>MATCH STATUS: <span class="text-emerald-400 font-bold">LIQUIDATION WON</span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bento Card 2: The Liquidity Storm (Spans 1 column) -->
        <div class="group relative overflow-hidden border border-[rgba(255,255,255,0.08)] rounded-2xl bg-[#0E121B] p-8 transition-all duration-300 hover:border-cyan-500/40 hover:bg-[#151C2B] hover:shadow-2xl">
          <div class="h-full flex flex-col justify-between space-y-6">
            <div>
              <div class="mb-3 flex items-center gap-2 text-xs text-cyan-400 font-bold tracking-wider font-mono uppercase">
                <span class="text-slate-500">[</span>
                <n-icon size="16">
                  <RadarIcon />
                </n-icon>
                <span>PILLAR 02 • MACRO GRAPH</span>
                <span class="text-slate-500">]</span>
              </div>
              <h3 class="text-2xl text-white font-bold font-serif">
                Federal Reserve Liquidity Storm
              </h3>
              <p class="mt-3 text-sm text-slate-300 leading-relaxed">
                Macro shock waves drain liquidity from outer defensive sectors (Utilities, Real Estate) over 5 timed rounds. Traders trapped in collapsing zones suffer continuous capital bleed until they migrate into safe inner high-beta tech sectors.
              </p>
            </div>

            <div class="border border-rose-500/20 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-300 font-mono">
              <div class="mb-1 flex items-center gap-1.5 font-bold">
                <span class="h-2 w-2 animate-ping rounded-full bg-rose-500" />
                <span>ZONE DAMAGE ACTIVE</span>
              </div>
              <p class="text-[11px] text-slate-300">
                Outer circle drained. Capital bleed rate: $250.00 / second outside safe zone.
              </p>
            </div>
          </div>
        </div>

        <!-- Bento Card 3: Rocket League Ranked Progression (Spans 1 column) -->
        <div class="group relative overflow-hidden border border-[rgba(255,255,255,0.08)] rounded-2xl bg-[#0E121B] p-8 transition-all duration-300 hover:border-amber-500/40 hover:bg-[#151C2B] hover:shadow-2xl">
          <div class="h-full flex flex-col justify-between space-y-6">
            <div>
              <div class="mb-3 flex items-center gap-2 text-xs text-amber-400 font-bold tracking-wider font-mono uppercase">
                <span class="text-slate-500">[</span>
                <n-icon size="16">
                  <TrophyIcon />
                </n-icon>
                <span>PILLAR 03 • MMR RANKING</span>
                <span class="text-slate-500">]</span>
              </div>
              <h3 class="text-2xl text-white font-bold font-serif">
                Rocket League MMR Ladder
              </h3>
              <p class="mt-3 text-sm text-slate-300 leading-relaxed">
                Climb from Bronze I, Silver, Gold, Platinum, Diamond, and Master up to the apex Golden Trader tier. Skill ratings adjust dynamically based on lobby placement, duel liquidations, net P&L, and opponent MMR strength.
              </p>
            </div>

            <div class="border border-[rgba(255,255,255,0.06)] rounded-xl bg-[#07090E] p-3 text-xs font-mono">
              <div class="mb-1 flex items-center justify-between text-slate-300">
                <span>CURRENT MMR:</span>
                <span class="text-amber-400 font-bold tabular-nums">2,840 (Apex)</span>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div class="h-full w-[84%] from-amber-500 to-emerald-400 bg-gradient-to-r" />
              </div>
            </div>
          </div>
        </div>

        <!-- Bento Card 4: Institutional Simulation Engine (Spans 2 columns) -->
        <div class="group relative overflow-hidden border border-[rgba(255,255,255,0.08)] rounded-2xl bg-[#0E121B] p-8 transition-all duration-300 md:col-span-2 hover:border-cyan-500/40 hover:bg-[#151C2B] hover:shadow-2xl">
          <div class="h-full flex flex-col justify-between space-y-6">
            <div>
              <div class="mb-3 flex items-center gap-2 text-xs text-cyan-400 font-bold tracking-wider font-mono uppercase">
                <span class="text-slate-500">[</span>
                <n-icon size="16">
                  <ZapIcon />
                </n-icon>
                <span>PILLAR 04 • INSTITUTIONAL FIDELITY</span>
                <span class="text-slate-500">]</span>
              </div>
              <h3 class="text-2xl text-white font-bold font-serif sm:text-3xl">
                Institutional 10 Hz Market Simulation
              </h3>
              <p class="mt-3 max-w-xl text-sm text-slate-300 leading-relaxed">
                Engineered with stochastic Geometric Brownian Motion, cross-sector correlation matrices, and sudden macroeconomic shock events. You train on genuine institutional volatility curves without risking a single dollar of real savings.
              </p>
            </div>

            <!-- Engine Invariant Chips -->
            <div class="flex flex-wrap items-center gap-3 text-xs font-mono">
              <div class="border border-[rgba(255,255,255,0.08)] rounded-lg bg-[#07090E] px-3 py-1.5 text-slate-300">
                <span class="text-emerald-400 font-bold">100ms</span> Tick Resolution
              </div>
              <div class="border border-[rgba(255,255,255,0.08)] rounded-lg bg-[#07090E] px-3 py-1.5 text-slate-300">
                <span class="text-cyan-400 font-bold">100%</span> Deterministic Replays
              </div>
              <div class="border border-[rgba(255,255,255,0.08)] rounded-lg bg-[#07090E] px-3 py-1.5 text-slate-300">
                <span class="text-amber-400 font-bold">Tauri 2.0</span> Steam Deck Verified
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
