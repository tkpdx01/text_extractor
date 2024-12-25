import { createApp } from 'vue'
import App from './App.vue'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// Toast
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// 创建应用
const app = createApp(App)

// 配置 Element Plus
app.use(ElementPlus, {
  locale: zhCn,
})

// 配置 Toast
app.use(Toast, {
  position: 'bottom-center',
  timeout: 2000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__bounce',
  maxToasts: 3,
  newestOnTop: true
})

// 挂载应用
app.mount('#app')
