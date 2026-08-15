import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        // Bind all interfaces — fixes "localhost not working" when the OS
        // resolves localhost to IPv6 (::1) but Vite binds IPv4 only.
        host: true,
        port: 5173,
        strictPort: false,
        open: false,
        // The browser ONLY talks to this dev server (same origin, localhost).
        // PDF requests are forwarded to the local Python backend on this
        // machine — nothing ever leaves the user's system (no VPS needed).
        proxy: {
            '/convert': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
            '/docs': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
            '/openapi.json': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
        },
    },
    preview: {
        host: true,
        port: 4173,
    },
})