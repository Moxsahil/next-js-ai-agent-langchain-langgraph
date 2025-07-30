"use client";

import { useEffect, useRef, useState } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ChatRequestBody, StreamMessageType } from "@/lib/types";
import WelcomeMessage from "@/components/WelcomeMessage";
import { createSSEParser } from "@/lib/SSEParser";
import { MessageBubble } from "@/components/MessageBubble";
import { ArrowRight } from "lucide-react";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

interface ChatInterfaceProps {
  chatId: Id<"chats">;
  initialMessages: Doc<"messages">[];
}

// Create a proper error message instead of HTML
const createErrorMessage = (error: unknown): string => {
  const errorMsg = error instanceof Error ? error.message : "Unknown error";
  return `❌ Error: Failed to process message\n\nDetails: ${errorMsg}`;
};

// Format tool output safely
const formatToolOutput = (output: unknown): string => {
  if (typeof output === "string") return output;
  if (typeof output === "object" && output !== null) {
    try {
      return JSON.stringify(output, null, 2);
    } catch {
      return String(output);
    }
  }
  return String(output);
};

export default function ChatInterface({
  chatId,
  initialMessages,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [currentTool, setCurrentTool] = useState<{
    name: string;
    input: unknown;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedResponse]);

  const processStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onChunk: (chunk: string) => Promise<void>
  ) => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await onChunk(new TextDecoder().decode(value));
      }
    } finally {
      reader.releaseLock();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Reset UI state for new message
    setInput("");
    setStreamedResponse("");
    setCurrentTool(null);
    setIsLoading(true);
    setError(null); // Clear any previous errors

    // Add user's message immediately for better UX
    const optimisticUserMessage: Doc<"messages"> = {
      _id: `temp_${Date.now()}` as Id<"messages">,
      chatId,
      content: trimmedInput,
      role: "user",
      createdAt: Date.now(),
    } as Doc<"messages">;

    setMessages((prev) => [...prev, optimisticUserMessage]);

    // Track complete response for saving to database
    let fullResponse = "";

    try {
      // Prepare chat history and new message for API
      const requestBody: ChatRequestBody = {
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        newMessage: trimmedInput,
        chatId,
      };

      // Initialize SSE connection with better error handling
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(requestBody),
      });

      // Better error handling for HTTP responses
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`
        );
      }

      if (!response.body) {
        throw new Error("No response body available");
      }

      // Create SSE parser and stream reader
      const parser = createSSEParser();
      const reader = response.body.getReader();

      // Process the stream chunks
      await processStream(reader, async (chunk) => {
        try {
          // Parse SSE messages from the chunk
          const messages = parser.parse(chunk);

          // Handle each message based on its type
          for (const message of messages) {
            switch (message.type) {
              case StreamMessageType.Token:
                // Handle streaming tokens (normal text response)
                if ("token" in message && typeof message.token === "string") {
                  fullResponse += message.token;
                  setStreamedResponse(fullResponse);
                }
                break;

              case StreamMessageType.ToolStart:
                // Handle start of tool execution
                if ("tool" in message) {
                  setCurrentTool({
                    name: message.tool,
                    input: message.input,
                  });
                }
                break;

              case StreamMessageType.ToolEnd:
                // Handle completion of tool execution
                if ("tool" in message) {
                  // Add tool output to response if needed
                  if (message.output) {
                    let toolOutput = "";

                    // Check if the output contains an error
                    if (
                      typeof message.output === "string" &&
                      message.output.includes("❌ Tool Error:")
                    ) {
                      toolOutput = `\n\n${message.output}\n`;
                    } else {
                      toolOutput = `\n\n🔧 ${message.tool} search completed successfully.\n`;
                    }

                    fullResponse += toolOutput;
                    setStreamedResponse(fullResponse);
                  }
                  setCurrentTool(null);
                }
                break;

              case StreamMessageType.Error:
                // Handle error messages from the stream
                if ("error" in message) {
                  throw new Error(message.error);
                }
                break;

              case StreamMessageType.Done:
                // Handle completion of the entire response
                try {
                  // Save the complete message to the database
                  const convex = getConvexClient();
                  await convex.mutation(api.messages.store, {
                    chatId,
                    content: fullResponse,
                    role: "assistant",
                  });

                  const assistantMessage: Doc<"messages"> = {
                    _id: `temp_assistant_${Date.now()}` as Id<"messages">,
                    chatId,
                    content: fullResponse,
                    role: "assistant",
                    createdAt: Date.now(),
                  } as Doc<"messages">;

                  setMessages((prev) => [...prev, assistantMessage]);
                  setStreamedResponse("");
                } catch (dbError) {
                  console.error("Error saving to database:", dbError);
                  // Still show the message even if DB save fails
                  const assistantMessage: Doc<"messages"> = {
                    _id: `temp_assistant_${Date.now()}` as Id<"messages">,
                    chatId,
                    content: fullResponse,
                    role: "assistant",
                    createdAt: Date.now(),
                  } as Doc<"messages">;

                  setMessages((prev) => [...prev, assistantMessage]);
                  setStreamedResponse("");
                }
                return;
            }
          }
        } catch (parseError) {
          console.error("Error parsing stream message:", parseError);
          // Continue processing other chunks
        }
      });
    } catch (error) {
      // Handle any errors during streaming
      console.error("Error sending message:", error);

      // Remove the optimistic user message if there was an error
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== optimisticUserMessage._id)
      );

      // Set error message as plain text, not HTML
      const errorMessage = createErrorMessage(error);
      setError(errorMessage);
      setStreamedResponse("");
    } finally {
      setIsLoading(false);
      setCurrentTool(null);
    }
  };

  return (
    <main className="flex flex-col h-[calc(100vh-theme(spacing.14))]">
      {/* Messages container */}
      <section className="flex-1 overflow-y-auto bg-[#262624] p-2 md:p-0">
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {messages?.length === 0 && <WelcomeMessage />}

          {messages?.map((message: Doc<"messages">) => (
            <MessageBubble
              key={message._id}
              content={message.content}
              isUser={message.role === "user"}
            />
          ))}

          {streamedResponse && (
            <MessageBubble content={streamedResponse} isUser={false} />
          )}

          {/* Show error message */}
          {error && <MessageBubble content={error} isUser={false} />}

          {/* Loading indicator */}
          {isLoading && !streamedResponse && !error && (
            <div className="flex justify-start animate-in fade-in-0">
              <div className="rounded-2xl px-4 py-3 bg-white text-gray-900 rounded-bl-none shadow-sm ring-1 ring-inset ring-gray-800">
                <div className="flex items-center gap-1.5">
                  {[0.3, 0.15, 0].map((delay, i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: `-${delay}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Show current tool execution */}
          {currentTool && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 bg-blue-100 text-blue-900 rounded-bl-none shadow-sm">
                🔧 Using tool: {currentTool.name}...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </section>

      {/* Input form */}
      <footer className="bg-[#262624] p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How can I help you today?"
              className="flex-1 py-3 px-4 text-white rounded-2xl border border-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 bg-[#30302e] placeholder:text-gray-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`absolute right-1.5 rounded-xl h-9 w-9 p-0 flex items-center justify-center transition-all ${
                input.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <ArrowRight />
            </Button>
          </div>
        </form>
      </footer>
    </main>
  );
}
