import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        hanzof: resolve(__dirname, 'hanzof.html'),
        makura: resolve(__dirname, 'makura.html'),
        lynx: resolve(__dirname, 'lynx-320.html'),
        contact: resolve(__dirname, 'contact.html'),
        careers: resolve(__dirname, 'careers.html'),
        story: resolve(__dirname, 'story.html'),
      },
    },
  },
})
