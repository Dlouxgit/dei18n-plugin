import type { createI18n, useI18n as vueI18nUseI18n } from 'vue-i18n'

export declare const useI18n: typeof vueI18nUseI18n

export declare const getI18nPluginInstall: (ins: ReturnType<createI18n>, data: Record<string, any>, url: string, fn: typeof createI18n) => ReturnType<typeof createI18n>
