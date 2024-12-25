import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          injectScript: true,
        },
      },
    })
  ],
  build: {
    target: 'es2015',
    minify: 'terser',
    cssCodeSplit: false,
    cssMinify: true,
    assetsInlineLimit: 4096,
    assetsDir: 'static',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'vue',
            'element-plus',
            'vue-toastification',
            '@vueuse/core',
            '@codemirror/view',
            '@codemirror/state'
          ],
          'element-plus-locale': ['element-plus/dist/locale/zh-cn.mjs']
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          let extType = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'media'
          } else if (/\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'img'
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'fonts'
          }
          return `static/${extType}/[name]-[hash][extname]`
        },
        entryFileNames: 'static/js/[name]-[hash].js',
        chunkFileNames: 'static/js/[name]-[hash].js'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  base: './',
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
