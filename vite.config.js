import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0', // 允許外部存取
    allowedHosts: [
      '.ngrok-free.app',  // 允許所有 ngrok-free.app 子網域
      '.ngrok.io',        // 允許所有 ngrok.io 子網域
      'localhost',        // 本地開發
      '127.0.0.1'         // 本地 IP
    ],
    proxy: {
      '/api': {
        target: 'https://angkeinfo.com',
        changeOrigin: true,
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // console.log('🔄 代理請求:', req.method, req.url)
            
            // 轉發所有 cookies
            if (req.headers.cookie) {
              // console.log('📤 轉發 cookies:', req.headers.cookie)
              proxyReq.setHeader('cookie', req.headers.cookie)
            }
          })
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // console.log('📥 代理回應:', proxyRes.statusCode, req.url)
            
            // 轉發 Set-Cookie headers
            if (proxyRes.headers['set-cookie']) {
              // console.log('🍪 收到 cookies:', proxyRes.headers['set-cookie'])
            }
          })
          
          proxy.on('error', (err, req, res) => {
            console.error('❌ 代理錯誤:', err.message)
          })
        }
      }
    }
  }
})