import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const allowedHosts = env.VITE_ALLOWED_HOSTS
    ? env.VITE_ALLOWED_HOSTS
        .split(',')
        .map((host) => host.trim())
        .filter(Boolean)
    : undefined

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      host: true,
      ...(allowedHosts ? { allowedHosts } : {}),
    },
  }
})
