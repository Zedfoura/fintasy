/**
 * @author: Tinatsei Chingaya (Zedfoura), Claude
 * @description: Shared canvas loop for the hype vignettes. Owns reduced motion (one static frame at 3.7 s, no rAF),
 *   ResizeObserver sizing with DPR capped at 2, IntersectionObserver (>= 10% visible) and visibilitychange pausing,
 *   and full cleanup on unmount. Mirrors the HeroVisual.vue loop; components only supply a draw function.
 */

import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted } from 'vue'
import { VIGNETTE_DPR_CAP, VIGNETTE_REDUCED_MOTION_SECONDS, VIGNETTE_VISIBILITY_THRESHOLD } from './vignetteSim'

/** Draws one frame in CSS pixels at loop time t (seconds). */
export type VignetteDraw = (c: CanvasRenderingContext2D, w: number, h: number, t: number) => void

/** Largest frame delta (s) fed into the clock, so a stalled tab does not jump the animation. */
const MAX_DT = 0.05

export function useVignetteLoop(canvas: Ref<HTMLCanvasElement | null>, draw: VignetteDraw): void {
  let ctx: CanvasRenderingContext2D | null = null
  let width = 0
  let height = 0
  let raf = 0
  let last: number | null = null
  let elapsed = 0
  let reduced = false
  let onScreen = true
  let resizeObs: ResizeObserver | null = null
  let interObs: IntersectionObserver | null = null

  function measure(): boolean {
    const cv = canvas.value
    if (!cv)
      return false
    const w = cv.clientWidth
    const h = cv.clientHeight
    const changed = Math.abs(w - width) >= 1 || Math.abs(h - height) >= 1
    width = w
    height = h
    return changed
  }

  function fit(): CanvasRenderingContext2D | null {
    const cv = canvas.value
    if (!cv)
      return null
    const d = Math.min(window.devicePixelRatio || 1, VIGNETTE_DPR_CAP)
    const bw = Math.round(width * d)
    const bh = Math.round(height * d)
    if (cv.width !== bw || cv.height !== bh) {
      cv.width = bw
      cv.height = bh
    }
    if (!ctx)
      ctx = cv.getContext('2d')
    ctx?.setTransform(d, 0, 0, d, 0, 0)
    return ctx
  }

  function paint(t: number) {
    if (!width || !height)
      return
    const c = fit()
    if (c)
      draw(c, width, height, t)
  }

  function frame(ts: number) {
    raf = 0
    const dt = last === null ? 0 : Math.min(MAX_DT, Math.max(0, (ts - last) / 1000))
    last = ts
    elapsed += dt
    paint(elapsed)
    schedule()
  }

  function schedule() {
    if (raf || reduced || !onScreen || document.visibilityState === 'hidden')
      return
    raf = window.requestAnimationFrame(frame)
  }

  function stop() {
    if (raf)
      window.cancelAnimationFrame(raf)
    raf = 0
    last = null
  }

  function onVisibility() {
    if (document.visibilityState === 'hidden')
      stop()
    else
      schedule()
  }

  onMounted(() => {
    reduced = typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    measure()

    if (typeof ResizeObserver !== 'undefined' && canvas.value) {
      resizeObs = new ResizeObserver(() => {
        if (!measure())
          return
        // Reduced motion repaints its still; animated mode picks the new size up on the next frame.
        paint(reduced ? VIGNETTE_REDUCED_MOTION_SECONDS : elapsed)
      })
      resizeObs.observe(canvas.value)
    }

    if (reduced) {
      paint(VIGNETTE_REDUCED_MOTION_SECONDS)
      return
    }

    if (typeof IntersectionObserver !== 'undefined' && canvas.value) {
      interObs = new IntersectionObserver((entries) => {
        const entry = entries[entries.length - 1]
        if (!entry)
          return
        onScreen = entry.isIntersecting
        if (onScreen)
          schedule()
        else
          stop()
      }, { threshold: VIGNETTE_VISIBILITY_THRESHOLD })
      interObs.observe(canvas.value)
    }
    document.addEventListener('visibilitychange', onVisibility)
    schedule()
  })

  onBeforeUnmount(() => {
    stop()
    resizeObs?.disconnect()
    interObs?.disconnect()
    resizeObs = null
    interObs = null
    document.removeEventListener('visibilitychange', onVisibility)
    ctx = null
  })
}
