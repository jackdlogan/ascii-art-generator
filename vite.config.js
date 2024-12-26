import { defineConfig } from 'vite'

export default defineConfig({
    base: './', // Change this to relative path for Netlify
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    }
}) 