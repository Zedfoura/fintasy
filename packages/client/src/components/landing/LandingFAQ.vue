<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Interactive FAQ accordion (Element 9) addressing friction & player questions
-->

<script setup lang="ts">
import {
  ChevronDown as ChevronDownIcon,
} from '@vicons/tabler'

const openIndex = ref<number | null>(0)

function toggleFaq(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}

const faqs = [
  {
    question: 'Is real money required to play Stock Royale?',
    answer:
      'No. Every trader enters each match with $15,000 in simulated equity provided by the platform. You experience authentic institutional-grade market volatility and high-stakes duels with zero financial risk.',
  },
  {
    question: 'How does the Federal Reserve Liquidity Storm work?',
    answer:
      'Just like a battle royale ring collapse, macro interest rate shocks drain liquidity from outer sectors (Utilities, Real Estate, Industrials) over 5 timed rounds. Traders remaining outside the safe sectors suffer capital bleed until they migrate into the inner safe zones (Tech & Semiconductors).',
  },
  {
    question: 'What is the duration of a standard match?',
    answer:
      'Matches feature 5 progressive rounds spanning approximately 6 minutes total, with individual 30-second micro-duels occurring whenever you contest another trader in an active sector.',
  },
  {
    question: 'How does the MMR competitive ranking system function?',
    answer:
      'Fintasy implements a skill-based rating system modeled after Rocket League and Apex Legends. Your MMR adjusts dynamically based on match placement (1st through 60th), duel liquidations, net P&L, and opponent skill rating.',
  },
  {
    question: 'Can I play on desktop and mobile?',
    answer:
      'Yes. Fintasy is fully responsive for all modern desktop and mobile browsers, and packages natively for Steam Deck via Tauri 2.0.',
  },
  {
    question: 'How are market prices generated?',
    answer:
      'Prices are driven by our 10 Hz deterministic market tick engine running Geometric Brownian Motion with realistic sector correlations, volume profiles, and sudden macro shock events.',
  },
]
</script>

<template>
  <section
    id="faq-section"
    class="landing-faq-section relative w-full flex flex-col items-center justify-start px-4 py-16 md:py-24"
  >
    <div class="mx-auto max-w-4xl w-full flex flex-col items-center">
      <!-- Section Tag & Taxonomy -->
      <div class="mb-4 inline-flex select-none items-center gap-1.5 border border-[rgba(255,255,255,0.1)] rounded bg-[#0E121B] px-3 py-1 text-xs text-slate-400 font-mono">
        <span class="text-slate-500">[</span>
        <span class="text-cyan-400 font-bold">04</span>
        <span>•</span>
        <span>FREQUENTLY ASKED QUESTIONS</span>
        <span class="text-slate-500">]</span>
      </div>

      <!-- Section Title & Subtitle -->
      <h2 class="mb-4 text-center text-3xl text-white font-extrabold tracking-tight font-serif md:text-5xl sm:text-4xl">
        Frequently Asked Questions.
      </h2>
      <p class="mb-14 max-w-2xl text-center text-base text-slate-300 leading-relaxed sm:text-lg">
        Everything you need to know about Stock Royale game theory, zero-risk simulation mechanics, and tournament rules.
      </p>

      <!-- Accordion List -->
      <div class="w-full space-y-4">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="faq-item overflow-hidden border border-[rgba(255,255,255,0.08)] rounded-xl bg-[#0E121B] transition-all duration-200"
          :class="openIndex === index ? 'border-emerald-500/40 bg-[#151C2B]' : 'hover:border-slate-600'"
        >
          <button
            type="button"
            class="faq-trigger w-full flex cursor-pointer items-center justify-between border-none bg-transparent p-5 text-left"
            @click="toggleFaq(index)"
          >
            <span class="pr-4 text-base text-white font-bold font-mono sm:text-lg">
              {{ faq.question }}
            </span>
            <div
              class="h-7 w-7 flex shrink-0 items-center justify-center rounded-lg bg-[#07090E] text-slate-400 transition-transform duration-200"
              :class="openIndex === index ? 'rotate-180 text-emerald-400' : ''"
            >
              <n-icon size="18">
                <ChevronDownIcon />
              </n-icon>
            </div>
          </button>

          <!-- Accordion Content -->
          <div
            v-show="openIndex === index"
            class="faq-content border-t border-[rgba(255,255,255,0.04)] px-5 pb-5 pt-1 text-sm text-slate-300 leading-relaxed"
          >
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
