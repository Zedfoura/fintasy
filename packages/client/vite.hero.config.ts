/**
 * @author: Tinatsei Chingaya (Zedfoura), Claude
 * @description: Build config for the standalone marketing hero (HERO-6). Outputs a self-contained static page to
 * dist-hero/ with relative asset paths, so it can be served from any folder or host.
 */

import path from 'node:path'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import WebfontDownload from 'vite-plugin-webfont-dl'

export default defineConfig({
  root: path.resolve(__dirname, 'hero-standalone'),
  base: './',
  plugins: [
    Vue(),
    WebfontDownload([
      'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap',
      'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap',
    ]),
  ],
  build: {
    outDir: path.resolve(__dirname, 'dist-hero'),
    emptyOutDir: true,
    reportCompressedSize: false,
  },
})
