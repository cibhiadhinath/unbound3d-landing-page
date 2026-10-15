import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        manufacturing: resolve(__dirname, 'manufacturing.html'),
        lynx350: resolve(__dirname, 'lynx-350.html'),
        howWeWork: resolve(__dirname, 'how-we-work.html'),
        team: resolve(__dirname, 'team.html'),
        careers: resolve(__dirname, 'careers.html'),
        contact: resolve(__dirname, 'contact.html'),
        hanzofRedirect: resolve(__dirname, 'hanzof.html'),
        platformRedirect: resolve(__dirname, 'platform.html'),
        lynx350Redirect: resolve(__dirname, 'lynx350.html'),
        makuraRedirect: resolve(__dirname, 'makura.html'),
        procureRedirect: resolve(__dirname, 'procure.html'),
        storyRedirect: resolve(__dirname, 'story.html'),
      },
    },
  },
})
