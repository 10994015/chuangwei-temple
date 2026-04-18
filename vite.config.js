import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import basicSsl from '@vitejs/plugin-basic-ssl' 

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      vueDevTools(),
      basicSsl(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: [
        '.ngrok-free.app',
        '.ngrok.io',
        'localhost',
        '127.0.0.1',
        'test.angkeinfo.com'
      ],
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: true,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              if (req.headers.cookie) {
                proxyReq.setHeader('cookie', req.headers.cookie)
              }
            })

            proxy.on('proxyRes', (proxyRes, req, res) => {
              // 轉發 Set-Cookie headers
            })

            proxy.on('error', (err, req, res) => {
              console.error('❌ 代理錯誤:', err.message)
            })
          }
        }
      }
    }
  }
})