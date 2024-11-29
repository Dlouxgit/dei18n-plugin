import type VueI18n from 'vue-i18n'

declare module 'dei18n-plugin' {
  export const useI18n: typeof VueI18n.useI18n
}
