import { defineConfig } from 'vite'

export default defineConfig({
    base: './', // Change this line to use relative paths
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                manualChunks: {
                    html2canvas: ['html2canvas']
                }
            }
        }
    }
}) 