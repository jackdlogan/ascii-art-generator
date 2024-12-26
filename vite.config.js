import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html')
            }
        }
    },
    optimizeDeps: {
        include: ['html2canvas']
    },
    resolve: {
        alias: {
            'html2canvas': path.resolve(__dirname, 'node_modules/html2canvas/dist/html2canvas.esm.js')
        }
    }
}) 