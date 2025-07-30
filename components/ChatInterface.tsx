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
import { motion } from "framer-motion";
import { useMutation } from "convex/react";

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
  const [isFirstMessage, setIsFirstMessage] = useState(initialMessages.length === 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const updateChatTitle = useMutation(api.chats.updateChatTitle);

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

    // Update chat title if this is the first message
    if (isFirstMessage) {
      try {
        await updateChatTitle({
          chatId,
          firstMessage: trimmedInput,
        });
        setIsFirstMessage(false);
      } catch (error) {
        console.error("Error updating chat title:", error);
      }
    }

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
    <main className="flex flex-col h-full relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
      </div>

      {/* Messages container - with bottom padding for fixed input */}
      <section className="flex-1 overflow-y-auto p-6 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages?.length === 0 && <WelcomeMessage />}

          {messages?.map((message: Doc<"messages">, index: number) => (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <MessageBubble
                content={message.content}
                isUser={message.role === "user"}
              />
            </motion.div>
          ))}

          {streamedResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <MessageBubble content={streamedResponse} isUser={false} />
            </motion.div>
          )}

          {/* Show error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <MessageBubble content={error} isUser={false} />
            </motion.div>
          )}

          {/* Loading indicator */}
          {isLoading && !streamedResponse && !error && (
            <motion.div 
              className="flex justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass rounded-3xl px-8 py-6 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          delay: delay,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-base text-gray-300 font-medium">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Current tool execution */}
          {currentTool && (
            <motion.div 
              className="flex justify-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl px-8 py-6 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <div>
                    <span className="text-white font-semibold text-base">Using {currentTool.name}</span>
                    <div className="text-sm text-blue-100 mt-1 opacity-90">Processing your request...</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </section>

      {/* Fixed Input form - Centered in main content area */}
      <footer 
        className="fixed bottom-0 z-40 bg-background/90 backdrop-blur-xl border-t border-white/10 left-0 right-0 md:left-80"
      >
        <div className="max-w-3xl mx-auto px-4 py-3">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/15 hover:border-white/25 rounded-2xl px-3 py-2.5 transition-all duration-200 focus-within:border-blue-500/40 focus-within:ring-1 focus-within:ring-blue-500/20 focus-within:bg-white/8">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Moxsh AI..."
                className="flex-1 bg-transparent text-white placeholder:text-gray-400 focus:outline-none text-sm font-medium"
                disabled={isLoading}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`rounded-full h-8 w-8 p-0 flex items-center justify-center transition-all duration-200 border-0 shadow-md ${
                    input.trim()
                      ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/20"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            </div>
          </form>
        </div>
      </footer>
    </main>
  );
}
