// 服务器默认端口
export const DEFAULT_SERVER_PORT = 3001;

// 获取默认服务器地址
const getDefaultServerUrl = (): string => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = import.meta.env.VITE_SERVER_PORT || String(DEFAULT_SERVER_PORT);
  return `${protocol}//${hostname}:${port}`;
};

export interface ApiConfig {
  baseURL: string;
  endpoints: {
    upload: string;
    files: string;
    download: string;
    delete: string;
    checkFiles: string;
  };
}

// API 配置
const getServerUrl = (): string => {
  // 1. 用户手动保存的地址优先（最明确的连接意图）
  const savedServerUrl = localStorage.getItem('serverUrl');
  if (savedServerUrl) {
    return savedServerUrl;
  }

  // 2. 环境变量（构建/部署时指定，仅作为起始探测地址）
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }

  // 3. 默认使用当前主机名 + 服务器端口
  return getDefaultServerUrl();
};

export const API_CONFIG: ApiConfig = {
  baseURL: getServerUrl(),
  endpoints: {
    upload: '/api/upload',
    files: '/api/files',
    download: '/api/download',
    delete: '/api/files',
    checkFiles: '/api/check-files'
  }
};

// 更新服务器地址
export const updateServerUrl = (url: string): void => {
  localStorage.setItem('serverUrl', url);
  API_CONFIG.baseURL = url;
};

// 获取当前服务器地址
export const getCurrentServerUrl = (): string => {
  return API_CONFIG.baseURL;
};

// 重置为默认地址
export const resetServerUrl = (): void => {
  localStorage.removeItem('serverUrl');
  API_CONFIG.baseURL = getDefaultServerUrl();
};

// 从服务器地址中提取主机名
const getHostnameFromUrl = (url: string): string | null => {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return null;
  }
};

// 探测某个地址是否是文件传输服务器
const probeServer = async (url: string, timeoutMs = 800): Promise<boolean> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${url}/`, { signal: controller.signal });
    if (!response.ok) return false;
    const data = await response.json();
    // 校验响应确实是文件传输服务器，避免误连到其他服务
    return !!(data && data.message && data.message.includes('文件传输'));
  } catch (e) {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
};

// 扫描端口，查找实际运行的文件传输服务器
// 找到则更新内存中的连接地址，返回 true；未找到返回 false
export const discoverServer = async (fromPort = DEFAULT_SERVER_PORT, toPort = 3020): Promise<boolean> => {
  const startUrl = getCurrentServerUrl();
  const hostname = getHostnameFromUrl(startUrl);
  if (!hostname) return false;

  // 先确认当前地址是否可用（覆盖手动配置 / 环境变量指向的服务器）
  if (await probeServer(startUrl)) {
    return true;
  }

  // 扫描端口范围（并行探测，避免串行等待超时）
  const baseUrl = new URL(startUrl);
  const probes: { port: number; origin: string }[] = [];
  for (let port = fromPort; port <= toPort; port++) {
    const probeUrl = new URL(baseUrl);
    probeUrl.port = String(port);
    probeUrl.pathname = '/';
    probeUrl.search = '';
    probes.push({ port, origin: probeUrl.origin });
  }
  const results = await Promise.all(probes.map(p => probeServer(p.origin).then(found => ({ ...p, found }))));
  const hit = results.find(r => r.found);
  if (hit) {
    // 更新内存中的连接地址（不写入 localStorage，保留用户手动配置）
    API_CONFIG.baseURL = hit.origin;
    return true;
  }

  return false;
};
