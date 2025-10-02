import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  define: {
    global: {}, // fix ethers.js buffer issue in browser
  },
  optimizeDeps: {
    include: ["ethers"],
  },
});
