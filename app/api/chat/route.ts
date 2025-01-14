import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const encoder = new TextEncoder();
  const { messages } = await req.json();

  // 创建一个 TransformStream 用于流式响应
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // 模拟流式响应
  const sendMessage = async (text: string) => {
    await writer.write(encoder.encode(text));
  };

  // 启动异步处理
  (async () => {
    try {
      // 模拟多条消息流式发送
      for (let i = 0; i < messages.length; i++) {
        await sendMessage(`处理消息 ${i + 1}: ${messages[i]}\n`);
        // 模拟处理延迟
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("Stream error:", error);
    } finally {
      await writer.close();
    }
  })();

  return new NextResponse(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
