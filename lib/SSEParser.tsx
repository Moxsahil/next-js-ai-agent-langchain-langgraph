import {
  SSE_DONE_MESSAGE,
  StreamMessageType,
  SSE_DATA_PREFIX,
  StreamMessage,
} from "./types";

/**
 * Creates a parser for Server-Sent Events (SSE) streams.
 * SSE allows real-time updates from server to client.
 */
export const createSSEParser = () => {
  let buffer = "";

  const parse = (chunk: string): StreamMessage[] => {
    // Add chunk to buffer
    buffer += chunk;

    // Split by double newlines (SSE_LINE_DELIMITER = "\n\n")
    const messages = buffer.split("\n\n");

    // Keep the last incomplete message in buffer
    buffer = messages.pop() || "";

    return messages
      .map((message) => {
        const trimmed = message.trim();
        if (!trimmed || !trimmed.startsWith(SSE_DATA_PREFIX)) return null;

        const data = trimmed.substring(SSE_DATA_PREFIX.length);
        if (data === SSE_DONE_MESSAGE) return { type: StreamMessageType.Done };

        try {
          const parsed = JSON.parse(data) as StreamMessage;
          return Object.values(StreamMessageType).includes(parsed.type)
            ? parsed
            : null;
        } catch {
          return {
            type: StreamMessageType.Error,
            error: "Failed to parse SSE message",
          };
        }
      })
      .filter((msg): msg is StreamMessage => msg !== null);
  };

  return { parse };
};
