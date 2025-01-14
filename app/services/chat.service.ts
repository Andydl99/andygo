import { fetchStream, StreamOptions } from "./stream-client";
import { httpClient } from "./http-client";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  messages: Message[];
  stream?: boolean;
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export const chatService = {
  // 普通聊天请求
  async sendMessage(message: string) {
    return httpClient.post("/chat/send", { message });
  },

  // 获取聊天历史
  async getChatHistory() {
    return httpClient.get("/chat/history");
  },

  // 流式聊天请求
  async streamChat(
    messages: Message[],
    callbacks: Omit<StreamOptions, "body" | "method">
  ) {
    const requestBody: ChatCompletionRequest = {
      messages,
      stream: true,
      model: "deepseek-chat", // 或其他可用模型
      max_tokens: 2000,
      temperature: 0.7,
    };

    //
    // https://api.deepseek.com/chat/completions

    return fetchStream("http://localhost:1337/api/chat/stream", {
      method: "POST",
      body: requestBody,
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`,
      },
      ...callbacks,
    });
  },
};
