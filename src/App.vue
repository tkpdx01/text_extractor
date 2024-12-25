<template>
  <div class="container">
    <div class="decoration-elements"></div>
    <header class="app-header">
      <div class="header-left"></div>
      <div class="header-center">
        <h1>手机号码、身份证号码提取工具</h1>
      </div>
      <div class="header-right">
        <div class="avatar-container" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
          <img :src="avatarSrc" alt="avatar" class="avatar" />
        </div>
      </div>
    </header>
    <div class="main-content">
      <!-- 上部输入区域 -->
      <div class="top-section">
        <div class="textarea-container">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="10"
            :placeholder="placeholder"
            @focus="handleFocus"
            @input="handleInput"
            resize="none"
            class="input-textarea"
          />
          <el-button 
            type="primary" 
            class="clear-button" 
            @click="clearText"
            size="small"
          >清空</el-button>
        </div>
      </div>

      <!-- 下部结果区域 -->
      <div class="bottom-section">
        <div class="results-row">
          <!-- 手机号码部分 -->
          <el-card class="result-card">
            <div class="result-content">
              <div class="result-header">
                <div class="title-section">
                  <span>手机号码</span>
                  <span class="count-info">
                    <span class="count-label">总数</span>
                    <span class="count-number">{{ phoneNumbers.length }}</span>
                  </span>
                </div>
              </div>
              <div class="result-lists">
                <div class="result-list">
                  <div class="list-header">
                    <span>所有项目</span>
                    <span class="copy-text" @click="copyText(phoneNumbers)">复制 [{{ phoneNumbers.length }}]</span>
                  </div>
                  <div class="result-textarea all">
                    <Codemirror
                      v-model="formattedPhoneNumbers"
                      :extensions="editorExtensions"
                      :options="editorConfig"
                      class="editor-view"
                    />
                  </div>
                </div>
                <div class="result-list">
                  <div class="list-header">
                    <span>去重项目</span>
                    <span class="copy-text" @click="copyText(uniquePhoneNumbers)">复制 [{{ uniquePhoneNumbers.length }}]</span>
                  </div>
                  <div class="result-textarea all">
                    <Codemirror
                      v-model="formattedUniquePhoneNumbers"
                      :extensions="editorExtensions"
                      :options="editorConfig"
                      class="editor-view"
                    />
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 身份证号码部分 -->
          <el-card class="result-card">
            <div class="result-content">
              <div class="result-header">
                <div class="title-section">
                  <span>身份证号码</span>
                  <span class="count-info">
                    <span class="count-item">
                      <span class="count-label">总数</span>
                      <span class="count-number">{{ idNumbers.length }}</span>
                    </span>
                    <span class="count-item filter-item" :class="{ active: idNumberFilter === 'unique' }" @click="idNumberFilter = 'unique'">
                      <span class="count-label">去重</span>
                      <span class="count-number">{{ uniqueIdNumbers.length }}</span>
                    </span>
                    <span class="count-item filter-item" :class="{ active: idNumberFilter === 'male' }" @click="idNumberFilter = 'male'">
                      <span class="count-label">男</span>
                      <span class="count-number">{{ genderAndAgeStats.male }}</span>
                    </span>
                    <span class="count-item filter-item" :class="{ active: idNumberFilter === 'female' }" @click="idNumberFilter = 'female'">
                      <span class="count-label">女</span>
                      <span class="count-number">{{ genderAndAgeStats.female }}</span>
                    </span>
                    <span class="count-item filter-item" :class="{ active: idNumberFilter === 'under18' }" @click="idNumberFilter = 'under18'">
                      <span class="count-label">未满18</span>
                      <span class="count-number">{{ genderAndAgeStats.under18 }}</span>
                    </span>
                    <span class="count-item filter-item" :class="{ active: idNumberFilter === 'under14' }" @click="idNumberFilter = 'under14'">
                      <span class="count-label">未满14</span>
                      <span class="count-number">{{ genderAndAgeStats.under14 }}</span>
                    </span>
                  </span>
                </div>
              </div>
              <div class="result-lists">
                <div class="result-list">
                  <div class="list-header">
                    <span>所有项目</span>
                    <span class="copy-text" @click="copyText(idNumbers)">复制 [{{ idNumbers.length }}]</span>
                  </div>
                  <div class="result-textarea all">
                    <Codemirror
                      v-model="formattedIdNumbers"
                      :extensions="editorExtensions"
                      :options="editorConfig"
                      class="editor-view"
                    />
                  </div>
                </div>
                <div class="result-list">
                  <div class="list-header">
                    <span>{{ filteredTitle }}</span>
                    <span class="copy-text" @click="copyText(getFilteredIdNumbers)">复制 [{{ getFilteredIdNumbers.length }}]</span>
                  </div>
                  <div class="result-textarea all">
                    <Codemirror
                      v-model="formattedFilteredIdNumbers"
                      :extensions="editorExtensions"
                      :options="editorConfig"
                      class="editor-view"
                    />
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, shallowRef, onMounted, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import { useDebounceFn } from '@vueuse/core'
import { Codemirror } from 'vue-codemirror'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import hatImg from './assets/hat.png'
import homelanderImg from './assets/homelander.png'

// CodeMirror 基础配置
const editorConfig = {
  tabSize: 2,
  mode: 'text',
  theme: 'light',
  lineNumbers: true,
  readOnly: true,
  lineWrapping: true,
}

// CodeMirror 扩展配置
const editorExtensions = [
  EditorView.theme({
    '&': {
      fontSize: '14px',
      height: '100%'
    },
    '.cm-gutters': {
      backgroundColor: '#f5f7fa',
      color: '#909399',
      border: 'none',
      borderRight: '1px solid #dcdfe6',
      minWidth: '45px',
      padding: '0 8px'
    },
    '.cm-content': {
      fontFamily: 'monospace',
      color: '#303133',
      padding: '8px 8px 8px 12px',
      caretColor: '#409EFF'
    },
    '.cm-line': {
      lineHeight: '1.4'
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent'
    },
    '.cm-gutterElement': {
      textAlign: 'right',
      padding: '0'
    },
    '&.cm-focused': {
      outline: 'none'
    },
    '.cm-selectionBackground': {
      backgroundColor: '#409eff40'
    },
    '&.cm-focused .cm-selectionBackground': {
      backgroundColor: '#409eff40'
    }
  })
]

const toast = useToast()
const inputText = ref('')

// 计算行数
const lineCount = computed(() => {
  return (inputText.value.match(/\n/g) || []).length + 1
})

// 正则表达式
const phoneRegex = /1[3-9]\d{9}/g
const idRegex = /[1-9]\d{5}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]/g

// 提取的数据
const phoneNumbers = ref([])
const idNumbers = ref([])

// 计算去重后的数据
const uniquePhoneNumbers = computed(() => [...new Set(phoneNumbers.value)])
const uniqueIdNumbers = computed(() => [...new Set(idNumbers.value)])

// 计算性别和年龄统计
const genderAndAgeStats = computed(() => {
  const uniqueIds = uniqueIdNumbers.value
  let maleCount = 0
  let femaleCount = 0
  let under18Count = 0
  let under14Count = 0
  
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()
  
  uniqueIds.forEach(id => {
    // 性别统计
    const genderDigit = id.charAt(16)
    const num = (genderDigit.toLowerCase() === 'x') ? parseInt(id.charAt(15)) : parseInt(genderDigit)
    if (num % 2 === 1) {
      maleCount++
    } else {
      femaleCount++
    }
    
    // 年龄统计
    const birthYear = parseInt(id.substring(6, 10))
    const birthMonth = parseInt(id.substring(10, 12))
    const birthDay = parseInt(id.substring(12, 14))
    
    let age = currentYear - birthYear
    // 如果今年还没过生日，年龄减1
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
      age--
    }
    
    if (age < 18) {
      under18Count++
      if (age < 14) {
        under14Count++
      }
    }
  })
  
  return { 
    male: maleCount, 
    female: femaleCount,
    under18: under18Count,
    under14: under14Count
  }
})

// 处理文本提取
const processText = (text) => {
  if (!text || typeof text !== 'string') {
    phoneNumbers.value = []
    idNumbers.value = []
    return
  }
  
  // 提取手机号码
  const phones = text.match(phoneRegex) || []
  phoneNumbers.value = phones
  
  // 提取身份证号码
  const ids = text.match(idRegex) || []
  idNumbers.value = ids
}

// 更新列表内容
const updatePhoneNumber = (index, value, isUnique = false) => {
  const list = isUnique ? uniquePhoneNumbers.value : phoneNumbers.value
  if (index >= 0 && index < list.length) {
    const newList = [...list]
    newList[index] = value
    phoneNumbers.value = isUnique ? [...new Set(newList)] : newList
  }
}

const updateIdNumber = (index, value, isUnique = false) => {
  const list = isUnique ? uniqueIdNumbers.value : idNumbers.value
  if (index >= 0 && index < list.length) {
    const newList = [...list]
    newList[index] = value
    idNumbers.value = isUnique ? [...new Set(newList)] : newList
  }
}

// 清空文本
const clearText = () => {
  inputText.value = ''
  phoneNumbers.value = []
  idNumbers.value = []
  toast.info('已清空所有内容')
}

// 复制文本
const copyText = async (arr) => {
  if (!arr || arr.length === 0) {
    toast.info('没有可复制的内容')
    return
  }

  try {
    const textToCopy = arr.join('\n')
    
    // 创建临时文本区域
    const textarea = document.createElement('textarea')
    textarea.value = textToCopy
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    
    // 选择文本
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length)
    
    // 执行复制
    let success = false
    try {
      // 优先使用新API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy)
        success = true
      } else {
        // 回退到传统方法
        success = document.execCommand('copy')
      }
    } catch (err) {
      // 如果新API失败,尝试传统方法
      success = document.execCommand('copy')
    }
    
    // 清理临时元素
    document.body.removeChild(textarea)
    
    if (success) {
      toast.success('复制成功！')
    } else {
      throw new Error('复制失败')
    }
  } catch (err) {
    toast.error('复制失败，请手动复制')
    console.error('Copy failed:', err)
  }
}

// 默认提示文本
const placeholder = '\n在此处粘贴文本，系统将自动提取：\n\n• 手机号码\n• 身份证号码\n\n支持实时提取和自动去重'

// 处理焦点事件
const handleFocus = (e) => {
  if (inputText.value === placeholder) {
    inputText.value = ''
  }
}

// 修改处理输入变化的函数
const handleInput = (value) => {
  if (value && value !== placeholder) {
    processText(value)
  } else {
    phoneNumbers.value = []
    idNumbers.value = []
  }
}

// 初始化输入框的值
inputText.value = ''

// 添加自动聚焦功能
onMounted(() => {
  // 使用 nextTick 确保 DOM 已经更新
  nextTick(() => {
    const textarea = document.querySelector('.input-textarea textarea')
    if (textarea) {
      textarea.focus()
    }
  })
})

// 格式化数据的计算属性
const formattedPhoneNumbers = computed(() => {
  return phoneNumbers.value.join('\n')
})

const formattedUniquePhoneNumbers = computed(() => {
  return uniquePhoneNumbers.value.join('\n')
})

const formattedIdNumbers = computed(() => {
  return idNumbers.value.join('\n')
})

const formattedFilteredIdNumbers = computed(() => {
  return getFilteredIdNumbers.value.join('\n')
})

// 计算行号
const phoneNumberLines = computed(() => phoneNumbers.value.length)
const uniquePhoneNumberLines = computed(() => uniquePhoneNumbers.value.length)
const idNumberLines = computed(() => idNumbers.value.length)
const uniqueIdNumberLines = computed(() => uniqueIdNumbers.value.length)

// 添加筛选状态
const idNumberFilter = ref('unique') // 默认显示去重数据

// 添加筛选方法
const getFilteredIdNumbers = computed(() => {
  switch (idNumberFilter.value) {
    case 'unique':
      return uniqueIdNumbers.value
    case 'male':
      return uniqueIdNumbers.value.filter(id => {
        const genderDigit = id.charAt(16)
        const num = (genderDigit.toLowerCase() === 'x') ? parseInt(id.charAt(15)) : parseInt(genderDigit)
        return num % 2 === 1
      })
    case 'female':
      return uniqueIdNumbers.value.filter(id => {
        const genderDigit = id.charAt(16)
        const num = (genderDigit.toLowerCase() === 'x') ? parseInt(id.charAt(15)) : parseInt(genderDigit)
        return num % 2 === 0
      })
    case 'under18':
      return uniqueIdNumbers.value.filter(id => {
        const birthYear = parseInt(id.substring(6, 10))
        const birthMonth = parseInt(id.substring(10, 12))
        const birthDay = parseInt(id.substring(12, 14))
        
        const today = new Date()
        const currentYear = today.getFullYear()
        const currentMonth = today.getMonth() + 1
        const currentDay = today.getDate()
        
        let age = currentYear - birthYear
        if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
          age--
        }
        return age < 18
      })
    case 'under14':
      return uniqueIdNumbers.value.filter(id => {
        const birthYear = parseInt(id.substring(6, 10))
        const birthMonth = parseInt(id.substring(10, 12))
        const birthDay = parseInt(id.substring(12, 14))
        
        const today = new Date()
        const currentYear = today.getFullYear()
        const currentMonth = today.getMonth() + 1
        const currentDay = today.getDate()
        
        let age = currentYear - birthYear
        if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
          age--
        }
        return age < 14
      })
    default:
      return uniqueIdNumbers.value
  }
})

// 添加筛选标题计算属性
const filteredTitle = computed(() => {
  switch (idNumberFilter.value) {
    case 'unique':
      return `去重 [${uniqueIdNumbers.value.length}]`
    case 'male':
      return `男性 [${genderAndAgeStats.value.male}]`
    case 'female':
      return `女性 [${genderAndAgeStats.value.female}]`
    case 'under18':
      return `未满18岁 [${genderAndAgeStats.value.under18}]`
    case 'under14':
      return `未满14岁 [${genderAndAgeStats.value.under14}]`
    default:
      return '筛选项目'
  }
})

// 头像切换状态
const isHovered = ref(false)
const avatarSrc = computed(() => isHovered.value ? homelanderImg : hatImg)
</script>

<style>
body {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  height: 100vh;
  background-color: transparent;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  height: 80px;
  background: linear-gradient(135deg, #1a73e8 0%, #3f51b5 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.app-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24' fill='none' stroke='rgba(255, 255, 255, 0.1)' stroke-width='0.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z'%3E%3C/path%3E%3Cline x1='12' y1='18' x2='12' y2='18'%3E%3C/line%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 24 24' fill='none' stroke='rgba(255, 255, 255, 0.08)' stroke-width='0.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='16' rx='2'%3E%3C/rect%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
  background-position: 
    calc(0% + 60px) 50%,
    calc(100% - 60px) 50%;
  background-repeat: no-repeat;
  opacity: 0.6;
  pointer-events: none;
  animation: headerIconsFloat 8s ease-in-out infinite;
}

@keyframes headerIconsFloat {
  0% {
    transform: rotate(-15deg) translateY(0px);
  }
  25% {
    transform: rotate(-10deg) translateY(-5px);
  }
  50% {
    transform: rotate(-15deg) translateY(0px);
  }
  75% {
    transform: rotate(-20deg) translateY(5px);
  }
  100% {
    transform: rotate(-15deg) translateY(0px);
  }
}

.app-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 25%),
    radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 25%);
  opacity: 0.3;
  pointer-events: none;
  animation: headerGlowFloat 6s ease-in-out infinite alternate;
}

@keyframes headerGlowFloat {
  0% {
    opacity: 0.2;
    transform: translateY(-2px);
  }
  100% {
    opacity: 0.4;
    transform: translateY(2px);
  }
}

.header-center {
  flex: 2;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.header-left, .header-right {
  flex: 1;
  position: relative;
  z-index: 1;
}

.header-center h1 {
  margin: 0;
  font-size: 28px;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.avatar-container {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.avatar-container:hover {
  transform: scale(1.1);
  border-color: white;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  min-height: 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.top-section {
  flex: 0 0 auto;
}

.bottom-section {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.results-row {
  display: flex;
  gap: 20px;
  height: 100%;
}

.input-section {
  display: none;
}

.card-header {
  display: none;
}

.textarea-container {
  height: 220px;
  display: flex;
  position: relative;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(235, 238, 245, 0.8);
}

.clear-button {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1;
  padding: 20px 48px !important;
  font-size: 24px !important;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  letter-spacing: 2px;
}

.clear-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

:deep(.input-textarea .el-textarea__inner) {
  background-color: transparent !important;
  border: none !important;
  height: 100% !important;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 12px 180px 12px 12px !important;
  color: #303133;
  border-radius: 8px;
  resize: none !important;
  transition: all 0.3s;
}

.result-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(235, 238, 245, 0.8);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  flex: 1;
  min-height: 0;
}

.result-group {
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  padding: 12px;
  background-color: white;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.group-header h3 {
  margin: 0;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.el-scrollbar {
  background-color: white;
  border-radius: 4px;
  padding: 8px;
  flex: 1;
}

.el-scrollbar p {
  margin: 2px 0;
  color: #606266;
  font-size: 12px;
  line-height: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-index {
  color: #909399;
  font-size: 12px;
  min-width: 30px;
  text-align: right;
  font-family: monospace;
  padding-right: 5px;
  border-right: 1px solid #dcdfe6;
}

.item-content {
  flex: 1;
}

:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

:deep(.el-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0,0,0,0.08);
}

:deep(.el-button) {
  padding: 6px 12px;
  font-size: 13px;
}

:deep(.el-scrollbar__wrap) {
  margin-bottom: 0 !important;
}

.line-numbers {
  padding: 8px 0;
  background-color: #f5f7fa;
  border-right: 1px solid #dcdfe6;
  user-select: none;
  text-align: right;
  color: #909399;
  font-size: 14px;
  line-height: 1.8;
  font-family: monospace;
  z-index: 1;
  min-width: 45px;
  display: flex;
  flex-direction: column;
}

.line-number {
  padding: 0 8px;
  height: 25.2px; /* 1.8 * 14px */
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #909399;
}

:deep(.result-textarea .el-textarea__inner) {
  height: 100% !important;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.8;
  padding: 8px 8px 8px 12px !important;
  color: #303133;
  background-color: white;
  border: none;
  resize: none !important;
  white-space: pre !important;
  overflow-y: auto;
  box-shadow: none !important;
  flex: 1;
  font-weight: 500;
}

.count-info {
  display: flex;
  align-items: center;
  gap: 1px;
  background-color: #f5f7fa;
  padding: 2px;
  border-radius: 6px;
  font-size: 13px;
}

.count-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.count-item:not(.filter-item) {
  background-color: #f5f7fa;
}

.count-item:not(.filter-item):hover {
  background-color: #f5f7fa;
}

.filter-item {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.filter-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.2) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.filter-item:hover::before {
  opacity: 1;
}

.filter-item:hover .count-label {
  color: #409EFF;
}

.filter-item:hover .count-number {
  color: #409EFF;
}

.filter-item.active {
  background: linear-gradient(135deg, #409EFF 0%, #3a8ee6 100%);
}

.filter-item.active::before {
  display: none;
}

.filter-item.active .count-label,
.filter-item.active .count-number {
  color: white;
  font-weight: 600;
}

.count-label {
  color: #909399;
  user-select: none;
  font-weight: 500;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.count-number {
  color: #409EFF;
  font-weight: 600;
  font-family: monospace;
  font-size: 14px;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.filter-item.active .count-number {
  font-weight: 600;
}

.count-divider {
  display: none;
}

.result-header {
  padding: 12px;
  border-bottom: 1px solid #EBEEF5;
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tabs-section {
  display: flex;
  gap: 20px;
}

.tab-group {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.result-lists {
  display: flex;
  gap: 20px;
  padding: 12px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.result-lists .el-scrollbar {
  flex: 1;
  border: 1px solid #EBEEF5;
}

.tab-group {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.tabs-section {
  display: flex;
  gap: 20px;
}

:deep(.el-button) {
  padding: 6px 12px;
  font-size: 13px;
  width: 100%;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2px 0;
}

.unselectable {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

:deep(.el-input__inner) {
  font-family: monospace;
  font-size: 12px;
  line-height: 16px;
  padding: 4px 8px;
  height: 24px;
}

:deep(.el-input__wrapper) {
  padding: 0;
  box-shadow: none !important;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset !important;
}

.item-index {
  color: #909399;
  font-size: 12px;
  min-width: 30px;
  text-align: right;
  font-family: monospace;
  padding-right: 5px;
  border-right: 1px solid #dcdfe6;
}

.item-content {
  flex: 1;
}

.result-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  overflow: hidden;
}

.list-header {
  font-size: 14px;
  color: #303133;
  padding: 4px 0;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copy-text {
  color: #409EFF;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s;
  font-weight: 500;
}

.copy-text:hover {
  opacity: 0.8;
}

.result-textarea {
  flex: 1;
  background-color: white;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  display: flex;
}

.editor-view {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

/* 移除原有的行号和输入框样式 */
.line-numbers,
:deep(.el-textarea),
:deep(.el-textarea__inner) {
  display: none;
}

.title-section > span:first-child {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.filter-label {
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-label:hover {
  color: #409EFF;
}

.filter-label.active {
  color: #409EFF;
  font-weight: 600;
}

.count-label {
  color: #909399;
  user-select: none;
}

.input-textarea {
  height: 100%;
}

:deep(.input-textarea .el-textarea__inner) {
  height: 100% !important;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 12px !important;
  color: #303133;
  background-color: white;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  resize: none !important;
  transition: all 0.3s;
}

:deep(.input-textarea .el-textarea__inner:hover) {
  border-color: #C0C4CC;
}

:deep(.input-textarea .el-textarea__inner:focus) {
  border-color: #409EFF;
}

:deep(.input-textarea .el-textarea__inner::placeholder) {
  color: #909399;
  line-height: 1.6;
}

/* 添加背景装饰 */
.container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 10% 20%, rgba(64, 158, 255, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(63, 81, 181, 0.05) 0%, transparent 20%);
  pointer-events: none;
  z-index: 0;
}

/* 添加 SVG 背景装饰 */
.container::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='rgba(64, 158, 255, 0.05)' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z'%3E%3C/path%3E%3Cline x1='12' y1='18' x2='12' y2='18'%3E%3C/line%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 24 24' fill='none' stroke='rgba(63, 81, 181, 0.05)' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='16' rx='2'%3E%3C/rect%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
  background-position: 
    calc(100% - 100px) 100px,
    100px calc(100% - 100px);
  background-repeat: no-repeat;
  background-size: 120px, 160px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.8;
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(2deg);
  }
}

/* 添加更多装饰元素 */
.decoration-elements {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.decoration-elements::before {
  content: '';
  position: absolute;
  width: 140px;
  height: 140px;
  top: 20%;
  left: 5%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 24 24' fill='none' stroke='rgba(64, 158, 255, 0.03)' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z'%3E%3C/path%3E%3Cline x1='12' y1='18' x2='12' y2='18'%3E%3C/line%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: contain;
  animation: floatLeft 15s ease-in-out infinite;
}

.decoration-elements::after {
  content: '';
  position: absolute;
  width: 180px;
  height: 180px;
  bottom: 15%;
  right: 5%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 24 24' fill='none' stroke='rgba(63, 81, 181, 0.03)' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='16' rx='2'%3E%3C/rect%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: contain;
  animation: floatRight 12s ease-in-out infinite;
}

@keyframes floatLeft {
  0%, 100% {
    transform: translate(0, 0) rotate(-5deg);
  }
  50% {
    transform: translate(-20px, -20px) rotate(0deg);
  }
}

@keyframes floatRight {
  0%, 100% {
    transform: translate(0, 0) rotate(5deg);
  }
  50% {
    transform: translate(20px, -20px) rotate(0deg);
  }
}
</style>
