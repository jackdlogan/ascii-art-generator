import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html')
            },
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules/html2canvas')) {
                        return 'html2canvas';
                    }
                }
            }
        }
    },
    optimizeDeps: {
        include: ['html2canvas']
    }
}) 