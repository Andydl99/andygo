import { useState, useRef, useEffect } from "react";
import { Message, chatService } from "../services";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// 自定义消息组件
const MessageContent = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        code({ _node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              language={match[1]}
              style={vscDarkPlus}
              PreTag="div"
              className="rounded-md !mt-2 !mb-2"
              customStyle={{
                padding: "1rem",
                fontSize: "0.875rem",
              }}
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className=" rounded px-1 py-0.5" {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

const ChatComponent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 当消息列表更新时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理流式聊天请求
  const handleStreamChat = async () => {
    if (!inputMessage.trim()) return;

    try {
      setIsLoading(true);
      const newMessage: Message = {
        role: "user",
        content: inputMessage,
      };

      // 添加用户消息到列表
      setMessages((prev) => [...prev, newMessage]);

      let assistantMessage = "";

      // 发起流式请求
      await chatService.streamChat([...messages, newMessage], {
        onMessage: (chunk) => {
          try {
            // 处理数据块
            const lines = chunk
              .toString()
              .split("\n")
              .filter((line) => line.trim());

            for (const line of lines) {
              if (line.includes("[DONE]")) continue;
              if (!line.startsWith("data:")) continue;

              try {
                const data = JSON.parse(line.slice(5));
                const content = data.choices[0]?.delta?.content || "";
                assistantMessage += content;

                // 更新消息列表
                setMessages((prev) => {
                  const newMessages = [...prev];
                  // 如果最后一条消息是助手的消息，更新它
                  if (
                    newMessages[newMessages.length - 1]?.role === "assistant"
                  ) {
                    newMessages[newMessages.length - 1].content =
                      assistantMessage;
                  } else {
                    // 否则添加新的助手消息
                    newMessages.push({
                      role: "assistant",
                      content: assistantMessage,
                    });
                  }
                  return newMessages;
                });
              } catch (e) {
                // 忽略无效的 JSON
                continue;
              }
            }
          } catch (error) {
            console.error("解析响应数据失败:", error);
          }
        },
        onError: (error) => {
          console.error("流式请求错误:", error);
        },
        onComplete: () => {
          setInputMessage("");
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("流式聊天失败:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl flex flex-col h-screen pt-4">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scroll-smooth">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`relative max-w-[85%] px-4 py-3 rounded-2xl shadow-md
                ${
                  message.role === "user"
                    ? "bg-blue-500 text-white mr-2"
                    : "bg-white dark:bg-gray-800 dark:text-gray-100 ml-2"
                }
                prose dark:prose-invert max-w-none
                ${message.role === "assistant" ? "prose-pre:my-0" : ""}
              `}
            >
              <MessageContent content={message.content} />
              {/* 添加小尾巴 */}
              <div
                className={`absolute bottom-[6px] ${
                  message.role === "user"
                    ? "-right-2 border-blue-500"
                    : "-left-2 border-white dark:border-gray-800"
                } border-8 border-t-transparent border-b-transparent ${
                  message.role === "user"
                    ? "border-l-transparent"
                    : "border-r-transparent"
                }`}
              />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* 输入区域 */}
      <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 pt-2">
        <div className="flex gap-2 max-w-4xl mx-auto bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 p-3 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleStreamChat();
              }
            }}
          />
          <button
            onClick={handleStreamChat}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                发送中...
              </div>
            ) : (
              "发送"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
