import { createI18n } from 'vue-i18n'
import zhTw from './locales/zh-tw'
import zhCn from './locales/zh-cn'
import enUs from './locales/en-us'

export const i18n = createI18n({
  legacy: false,       // 使用 Composition API 模式
  locale: 'ZH-TW',    // 預設語言，對應你 store 的格式
  fallbackLocale: 'ZH-TW',
  messages: {
    'ZH-TW': zhTw,
    'ZH-CN': zhCn,
    'EN-US': enUs,
  },
})