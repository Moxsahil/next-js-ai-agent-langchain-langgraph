import { getConvexClient } from "@/lib/convex";
import { auth } from "@clerk/nextjs/server";

import {
  ChatRequestBody,
  SSE_DATA_PREFIX,
  SSE_LINE_DELIMITER,
  StreamMessage,
  StreamMessageType,
} from "@/lib/types";
import { api } from "@/convex/_generated/api";

export const runtime = "edge";

function sendSSEMessage(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  data: StreamMessage
) {
  const encoder = new TextEncoder();
  return writer.write(
    encoder.encode(
      `${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`
    )
  );
}

/**
 * This is an Edge Function that handles a POST request to start a
 * new chat session. It is responsible for authenticating the user,
 * getting the chat id and the new message from the request body,
 * and initiating a Server Sent Event (SSE) stream to send
 * messages to the client. The SSE stream is terminated when the
 * client closes the connection.
 * @param req - The incoming request object.
 * @returns A Response object that contains the SSE stream.
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, newMessage, chatId } =
      (await req.json()) as ChatRequestBody;

    const convex = getConvexClient();

    const stream = new TransformStream(
      {},
      {
        highWaterMark: 1024,
      }
    );
    const writer = stream.writable.getWriter();

    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable buffering fro nginx which is required for SSE to work properly
      },
    });

    async () => {
      try {
        await sendSSEMessage(writer, { type: StreamMessageType.Connected });

        await convex.mutation(api.messages.send, {
          chatId,
          content: newMessage,
        });
      } catch (error) {}
    };
  } catch (error) {}
}
