import axios, { AxiosInstance } from "axios";

// 创建基础 API 实例
const baseAPI: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:1337/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
baseAPI.interceptors.request.use(
  (config) => {
    // 这里可以添加token等认证信息
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
baseAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    // 统一错误处理
    return Promise.reject(error);
  }
);

// 支持流式响应的请求函数
export async function fetchStream(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    onMessage: (message: string) => void;
    onError?: (error: unknown) => void;
    onComplete?: () => void;
  }
) {
  const { method = "POST", body, onMessage, onError, onComplete } = options;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("无法获取响应流");
    }

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete?.();
        break;
      }

      const chunk = decoder.decode(value);
      onMessage(chunk);
    }
  } catch (error) {
    onError?.(error);
    throw error;
  }
}

// API 请求函数示例
export const apiService = {
  // 普通请求示例
  async getData(params?: unknown) {
    return baseAPI.get("/data", { params });
  },

  async postData(data: unknown) {
    return baseAPI.post("/data", data);
  },

  // 流式请求示例
  async streamChat(
    messages: unknown[],
    callbacks: {
      onMessage: (message: string) => void;
      onError?: (error: unknown) => void;
      onComplete?: () => void;
    }
  ) {
    return fetchStream("/api/chat", {
      method: "POST",
      body: { messages },
      ...callbacks,
    });
  },
};

export default apiService;
