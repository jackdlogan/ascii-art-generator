import { defineConfig } from 'vite'

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                manualChunks: {
                    html2canvas: ['html2canvas']
                }
            }
        }
    },
    resolve: {
        alias: {
            'html2canvas': 'html2canvas/dist/html2canvas.esm.js'
        }
    }
}) 