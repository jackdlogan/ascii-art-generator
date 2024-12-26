import { defineConfig } from 'vite'

export default defineConfig({
    base: '/',
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                manualChunks: null
            }
        },
        commonjsOptions: {
            include: [/node_modules/],
            extensions: ['.js', '.cjs']
        }
    }
}) 