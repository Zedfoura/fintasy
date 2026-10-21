/**
 * @author: Tinatsei Chingaya (Zedfoura), Claude
 * @description: Standalone entry for the marketing hero (HERO-6). Mounts only the hero and its live visual, with
 * no router, auth, store or API, so the build can be hosted on its own and linked from the portfolio case study.
 */

import { createApp } from 'vue'
import StandaloneHero from './StandaloneHero.vue'

createApp(StandaloneHero).mount('#app')
