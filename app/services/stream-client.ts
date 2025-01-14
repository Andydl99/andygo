export interface StreamOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  onMessage: (message: string) => void;
  onError?: (error: unknown) => void;
  onComplete?: () => void;
}

export async function fetchStream(url: string, options: StreamOptions) {
  const {
    method = "POST",
    body,
    headers = {},
    onMessage,
    onError,
    onComplete,
  } = options;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }

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
