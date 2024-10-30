let createI18n;

const isI18nDebug = JSON.parse(localStorage.getItem('isI18nDebug') || 'false');

// 监听右键操作
document.addEventListener('contextmenu', event => {
  if (!isI18nDebug) return;
  const targetText = event.target?.innerText;

  // 使用正则表达式匹配所有以 ** 开头并以 && 结尾的文本
  const regex = /(\*\*.*?&&)/g; // 匹配 **key&& 的模式
  const matches = [];
  let match;

  // 提取所有匹配的文本
  while ((match = regex.exec(targetText)) !== null) {
    matches.push(match[1].trim()); // 将匹配的键添加到数组中
  }

  const keys = matches.map(item => {
    return window.I18N_MAP[item]?.key;
  });
  if (keys.length > 0) {
    createIframe(keys); // 创建 iframe
  }
});

let i18nPlatformSrc = '';

function createIframe(keys) {
  if (!i18nPlatformSrc) return;
  // 创建一个容器 div
  const container = document.createElement('div');
  container.style.display = 'block';
  container.style.position = 'fixed';
  container.style.top = '120px';
  container.style.left = '200px';
  container.style.width = '810px';
  container.style.height = 'auto'; // 自适应高度
  container.style.border = '3px dashed';
  container.style.padding = '4px';
  container.style.zIndex = '9999';
  container.style.background = 'beige';

  // 创建 iframe
  const iframe = document.createElement('iframe');
  iframe.src = `${i18nPlatformSrc}${encodeURIComponent(keys)}`; // 设置 iframe 的 src
  iframe.style.width = '100%'; // 设置宽度
  iframe.style.height = '500px'; // 设置高度
  iframe.style.border = 'none'; // 去掉边框

  // 将 iframe 添加到容器中
  container.appendChild(iframe);

  // 将容器添加到页面中
  document.body.appendChild(container);

  // 点击事件处理器
  const handleClickOutside = (event) => {
    // 检查点击的目标是否在容器内
    if (!container.contains(event.target)) {
      document.body.removeChild(container); // 移除容器
      document.removeEventListener('click', handleClickOutside); // 移除事件监听器
    }
  };

  // 添加事件监听器
  document.addEventListener('click', handleClickOutside);

  // 监听 postMessage 事件
  window.addEventListener('message', (event) => {
    if (event.data.type === 'save') {
      setTimeout(() => {
        location.reload(); // 重新加载页面
      }, 2500);
    }
  });
}

let i18n;

let messages;

export const useI18n = () => {
  if (!i18n || !messages || !createI18n) {
    return 'i18n 初始化失败';
  }
  const t = i18n.global.t;
  const i18nCN = createI18n({
    legacy: false,
    locale: 'zh-CN',
    fallbackLocale: 'zh-CN',
    messages,
    globalInjection: true
  });
  const i18nTW = createI18n({
    legacy: false,
    locale: 'zh-TW',
    fallbackLocale: 'zh-TW',
    messages,
    globalInjection: true
  });
  const i18nEN = createI18n({
    legacy: false,
    locale: 'en-US',
    fallbackLocale: 'en-US',
    messages,
    globalInjection: true
  });
  const i18nJP = createI18n({
    legacy: false,
    locale: 'ja-JP',
    fallbackLocale: 'ja-JP',
    messages,
    globalInjection: true
  });
  const tCN = i18nCN.global.t;
  const tTW = i18nTW.global.t;
  const tEN = i18nEN.global.t;
  const tJP = i18nJP.global.t;
  const generatedDiv = ref(null);

  const customT = (key, ...args) => {
    let originalResult = t(key, ...args);
    if (isI18nDebug) {
      originalResult = '**' + t(key, ...args) + '&&';
    }

    const div = document.createElement('div');
    div.textContent = `I18N-${key}-
    ${originalResult}1`;
    window.I18N_MAP = {
      ...(window.I18N_MAP || {}),
      [originalResult]: {
        zh_CN: tCN(key, ...args),
        zh_TW: tTW(key, ...args),
        en_US: tEN(key, ...args),
        ja_JP: tJP(key, ...args),
        key
      }
    };

    return originalResult;
  };

  const debugDiv = document.createElement('div');
  debugDiv.style.position = 'fixed';
  debugDiv.style.top = '50px';
  debugDiv.style.left = '50%';
  debugDiv.style.transform = 'translateX(-50%)';
  debugDiv.style.zIndex = '1000';
  debugDiv.style.background = 'beige';
  debugDiv.style.border = '3px dashed';
  debugDiv.style.padding = '4px';
  debugDiv.innerHTML = '翻译调试模式';
  const debugSelect = document.createElement('select');
  debugSelect.innerHTML = '<option value="true">开启</option><option value="false">关闭</option>';
  debugSelect.value = isI18nDebug.toString();
  debugSelect.addEventListener('change', () => {
    localStorage.setItem('isI18nDebug', debugSelect.value);
    debugDiv.style.display = debugSelect.value === 'true' ? 'block' : 'none';
    location.reload(); // 重新加载页面
  });
  debugDiv.appendChild(debugSelect);
  document.body.appendChild(debugDiv);

  return { t: customT, generatedDiv, isI18nDebug, debugDiv };
};

export const i18nPlugin = {
  install(app, i18n) {
    i18n && app.use(i18n);
    const t = useI18n();
    app.config.globalProperties.$t = t.t; // 将 t 方法挂载到 Vue 实例上
    app.provide('i18n', { t }); // 提供 i18n 对象
  }
};

export const getI18nPluginInstall = (i18nInstance, messagesProvider, src, createI18nFn) => {
  i18n = i18nInstance;
  messages = messagesProvider;
  i18nPlatformSrc = src;
  createI18n = createI18nFn;
  return (app) => i18nPlugin.install(app, i18nInstance);
};
