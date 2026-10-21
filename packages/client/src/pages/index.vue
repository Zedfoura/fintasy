<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Complete 11 Essential Elements Marketing Landing Page for Fintasy Stock Royale
-->

<script setup lang="ts">
import LandingHeader from '~/components/landing/LandingHeader.vue'
import LandingHero from '~/components/landing/LandingHero.vue'
import LandingMediaSection from '~/components/landing/LandingMediaSection.vue'
import LandingBenefits from '~/components/landing/LandingBenefits.vue'
import LandingTestimonials from '~/components/landing/LandingTestimonials.vue'
import LandingFAQ from '~/components/landing/LandingFAQ.vue'
import LandingFinalCTA from '~/components/landing/LandingFinalCTA.vue'
import LandingFooter from '~/components/landing/LandingFooter.vue'

// Element 1: SEO Keywords, Description, and OpenGraph Meta Configuration
useHead({
  title: 'Fintasy • High-Stakes Stock Royale & Tactical Trading Duels',
  meta: [
    {
      name: 'description',
      content:
        'The competitive 60-player stock market battle royale. Trade 30-second PVP duels, escape the Federal Reserve liquidity storm, and climb to Golden Trader with zero financial risk.',
    },
    {
      name: 'keywords',
      content:
        'stock royale, competitive trading, paper trading battle royale, trading simulator, financial esports, S&P 500 game',
    },
    {
      property: 'og:title',
      content: 'Fintasy • High-Stakes Capital Warfare',
    },
    {
      property: 'og:description',
      content:
        '30-Second PVP tape combat, collapsing sector liquidity, and institutional 10 Hz market simulation.',
    },
    {
      property: 'og:type',
      content: 'website',
    },
  ],
})
</script>

<template>
  <div class="landing-page-root relative min-h-screen w-full flex flex-col items-center overflow-x-hidden bg-[#07090E] fn-dot-matrix text-slate-100">
    <!-- Element 2: Company Logo & Navigation Header -->
    <LandingHeader />

    <main class="w-full flex flex-col items-center">
      <!-- Elements 3, 4, 5: Massive Display Headline, Primary Action CTA, Social Proof Strip -->
      <LandingHero />

      <!-- Element 6: Interactive 3D Perspective Tactical Combat Terminal Preview -->
      <LandingMediaSection />

      <!-- Element 7: Asymmetric Bento Grid Gameplay Pillars -->
      <LandingBenefits />

      <!-- Element 8: Authentic Customer Reviews & Competitive Debriefings -->
      <LandingTestimonials />

      <!-- Element 9: Interactive FAQ Accordion -->
      <LandingFAQ />

      <!-- Element 10: Final Full-Width Hero Conversion CTA -->
      <LandingFinalCTA />
    </main>

    <!-- Element 11: Multi-Column Platform Footer -->
    <LandingFooter />
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>

<style scoped>
.landing-page-root {
  color-scheme: dark;
}
</style>
