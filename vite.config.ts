import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 3000,
    hmr: {
      port: 3000,
      host: 'localhost' // 或者使用你的实际 IP
    }
  }
})

