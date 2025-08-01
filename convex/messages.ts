import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const SHOW_COMMENTS = true;

export const list = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();

    if (SHOW_COMMENTS) {
      // console.log("Retrieved messages: ", {
      //   chatId: args.chatId,
      //   count: messages.length,
      // });
    }
    return messages;
  },
});

export const send = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    if (SHOW_COMMENTS) {
      console.log("📩 Sending message: ", {
        chatId: args.chatId,
        content: args.content,
      });
    }

    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content.replace(/\n/g, "\\n"),
      role: "user",
      createdAt: Date.now(),
    });

    if (SHOW_COMMENTS) {
      console.log("✅ Saved user message: ", {
        messageId,
        chatId: args.chatId,
      });
    }

    return messageId;
  },
});

export const store = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
  },
  handler: async (ctx, args) => {
    if (SHOW_COMMENTS) {
      console.log("💾 Storing message:", {
        chatId: args.chatId,
        role: args.role,
        contentLength: args.content.length,
      });
    }

    // Store message with preserved newlines and HTML
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content.replace(/\n/g, "\\n").replace(/\\/g, "\\\\"), // Only escape backslashes
      role: args.role,
      createdAt: Date.now(),
    });

    if (SHOW_COMMENTS) {
      console.log("✅ Stored message:", {
        messageId,
        chatId: args.chatId,
        role: args.role,
      });
    }

    return messageId;
  },
});

export const getLastMessage = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .first();

    return messages;
  },
});
