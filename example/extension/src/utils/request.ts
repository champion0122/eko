export interface RequestOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
  timeout?: number;
  showError?: boolean;
}

function buildQuery(params: Record<string, any> = {}) {
  const esc = encodeURIComponent;
  return Object.keys(params)
    .map(k => `${esc(k)}=${esc(params[k])}`)
    .join('&');
}

export async function request<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
  let { method = 'GET', headers = {}, data, params, timeout = 15000 } = options;
  let fetchUrl = url;
  if (params && Object.keys(params).length > 0) {
    fetchUrl += (url.includes('?') ? '&' : '?') + buildQuery(params);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(fetchUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: method === 'POST' ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      throw new Error(`请求失败: ${res.status} ${res.statusText}`);
    }
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    } else {
      return (await res.text()) as any;
    }
  } catch (error: any) {
    if (options.showError !== false) {
      console.error('请求出错:', error?.message || error);
    }
    throw error;
  }
} 