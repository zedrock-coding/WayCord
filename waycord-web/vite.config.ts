import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tanstackStart(),
    {
      name: 'vite6-rollup-options-bridge',
      config(config) {
        if (config.environments) {
          for (const env of Object.values(config.environments)) {
            const b = (env as any).build
            if (b?.rolldownOptions && !b.rollupOptions) {
              b.rollupOptions = b.rolldownOptions
            }
          }
        }
      },
    },
    react(),
    tailwindcss(),
  ],
})
