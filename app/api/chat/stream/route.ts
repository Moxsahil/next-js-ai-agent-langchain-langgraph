import { submitQuestion } from "@/lib/langgraph";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { getConvexClient } from "@/lib/convex";
import {
  ChatRequestBody,
  StreamMessage,
  StreamMessageType,
  SSE_DATA_PREFIX,
  SSE_LINE_DELIMITER,
} from "@/lib/types";

// Try without edge runtime first to see if that fixes the issue
// export const runtime = "edge";

function sendSSEMessage(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  data: StreamMessage
) {
  const encoder = new TextEncoder();
  const message = `${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`;

  try {
    return writer.write(encoder.encode(message));
  } catch (error) {
    console.error("Error writing SSE message:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  console.log("🚀 POST /api/chat/stream called");

  try {
    // Check if request has proper content type
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      console.error("❌ Invalid content type:", contentType);
      return new Response("Content-Type must be application/json", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const { userId } = await auth();
    if (!userId) {
      console.error("❌ Unauthorized request");
      return new Response("Unauthorized", { status: 401 });
    }

    console.log("✅ User authenticated:", userId);

    let requestBody: ChatRequestBody;
    try {
      requestBody = await req.json();
      console.log("✅ Request body parsed:", {
        messagesCount: requestBody.messages?.length,
        newMessage: requestBody.newMessage?.substring(0, 50) + "...",
        chatId: requestBody.chatId,
      });
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return new Response("Invalid JSON in request body", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const { messages, newMessage, chatId } = requestBody;

    // Validate required fields
    if (!newMessage || !chatId || !Array.isArray(messages)) {
      console.error("❌ Missing required fields:", {
        newMessage: !!newMessage,
        chatId: !!chatId,
        messages: Array.isArray(messages),
      });
      return new Response(
        "Missing required fields: newMessage, chatId, messages",
        {
          status: 400,
          headers: { "Content-Type": "text/plain" },
        }
      );
    }

    const convex = getConvexClient();

    // Create stream with better error handling
    const stream = new TransformStream({}, { highWaterMark: 1024 });
    const writer = stream.writable.getWriter();

    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });

    // Handle the streaming response in background
    (async () => {
      let isWriterClosed = false;

      const safeWrite = async (message: StreamMessage) => {
        if (isWriterClosed) return;
        try {
          await sendSSEMessage(writer, message);
        } catch (error) {
          console.error("Error writing message:", error);
          isWriterClosed = true;
        }
      };

      const closeWriter = async () => {
        if (isWriterClosed) return;
        isWriterClosed = true;
        try {
          await writer.close();
        } catch (closeError) {
          console.error("Error closing writer:", closeError);
        }
      };

      try {
        console.log("📡 Starting SSE stream");

        // Send initial connection established message
        await safeWrite({ type: StreamMessageType.Connected });

        // Send user message to Convex
        try {
          await convex.mutation(api.messages.send, {
            chatId,
            content: newMessage,
          });
          console.log("✅ User message stored in Convex");
        } catch (convexError) {
          console.error("❌ Failed to store user message:", convexError);
          // Continue anyway, don't fail the entire request
        }

        // Convert messages to LangChain format
        const langChainMessages = [
          ...messages.map((msg) =>
            msg.role === "user"
              ? new HumanMessage(msg.content)
              : new AIMessage(msg.content)
          ),
          new HumanMessage(newMessage),
        ];

        console.log(
          "🤖 Submitting to LangGraph with",
          langChainMessages.length,
          "messages"
        );

        try {
          // Create the event stream
          const eventStream = await submitQuestion(langChainMessages, chatId);
          console.log("✅ Event stream created");

          let tokenCount = 0;

          // Process the events
          for await (const event of eventStream) {
            if (isWriterClosed) break;

            console.log("🔄 Event received:", event.event);

            if (event.event === "on_chat_model_stream") {
              const chunk = event.data.chunk;
              if (chunk) {
                let text = "";

                // Handle different chunk formats from different LLM providers
                if (typeof chunk.content === "string") {
                  text = chunk.content;
                } else if (Array.isArray(chunk.content)) {
                  text = chunk.content
                    .filter(
                      (item: any) => item && typeof item.text === "string"
                    )
                    .map((item: any) => item.text)
                    .join("");
                } else if (chunk.text) {
                  text = chunk.text;
                } else if (
                  chunk.content &&
                  typeof chunk.content === "object" &&
                  "text" in chunk.content
                ) {
                  text = chunk.content.text;
                }

                if (text) {
                  tokenCount++;
                  await safeWrite({
                    type: StreamMessageType.Token,
                    token: text,
                  });
                }
              }
            } else if (event.event === "on_tool_start") {
              console.log("🔧 Tool started:", event.name);
              await safeWrite({
                type: StreamMessageType.ToolStart,
                tool: event.name || "unknown",
                input: event.data.input,
              });
            } else if (event.event === "on_tool_end") {
              console.log("✅ Tool ended:", event.name);
              const toolMessage = new ToolMessage(event.data.output);

              await safeWrite({
                type: StreamMessageType.ToolEnd,
                tool: toolMessage.lc_kwargs.name || event.name || "unknown",
                output: event.data.output,
              });
            }
          }

          console.log(`✅ Stream completed with ${tokenCount} tokens`);

          // Send completion message
          await safeWrite({ type: StreamMessageType.Done });
        } catch (streamError) {
          console.error("❌ Error in event stream:", streamError);
          await safeWrite({
            type: StreamMessageType.Error,
            error:
              streamError instanceof Error
                ? streamError.message
                : "Stream processing failed",
          });
        }
      } catch (error) {
        console.error("❌ Error in stream handler:", error);
        await safeWrite({
          type: StreamMessageType.Error,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        await closeWriter();
        console.log("🔚 Stream closed");
      }
    })();

    return response;
  } catch (error) {
    console.error("❌ Critical error in chat API:", error);

    // Return a proper error response
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Add explicit method handling to prevent 405 errors
export async function GET() {
  return new Response("Method not allowed. Use POST.", {
    status: 405,
    headers: { Allow: "POST" },
  });
}

export async function PUT() {
  return new Response("Method not allowed. Use POST.", {
    status: 405,
    headers: { Allow: "POST" },
  });
}

export async function DELETE() {
  return new Response("Method not allowed. Use POST.", {
    status: 405,
    headers: { Allow: "POST" },
  });
}
