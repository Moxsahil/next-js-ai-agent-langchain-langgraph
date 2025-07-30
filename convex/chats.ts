import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function generateChatTitle(message: string): string {
    // Clean and truncate the message
    const cleanMessage = message.trim().replace(/\s+/g, ' ');
    
    // If message is short enough, use it directly
    if (cleanMessage.length <= 40) {
        return cleanMessage;
    }
    
    // Extract key phrases or questions
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which'];
    const lowerMessage = cleanMessage.toLowerCase();
    
    // If it's a question, try to preserve the question structure
    if (lowerMessage.includes('?')) {
        const questionPart = cleanMessage.split('?')[0];
        if (questionPart.length <= 40) {
            return questionPart + '?';
        }
    }
    
    // Check if it starts with a question word
    const firstWords = cleanMessage.split(' ').slice(0, 8).join(' ');
    if (questionWords.some(word => lowerMessage.startsWith(word))) {
        if (firstWords.length <= 40) {
            return firstWords + '...';
        }
    }
    
    // For commands or requests
    if (lowerMessage.startsWith('tell me') || lowerMessage.startsWith('explain') || 
        lowerMessage.startsWith('help') || lowerMessage.startsWith('search') ||
        lowerMessage.startsWith('find') || lowerMessage.startsWith('show')) {
        const commandPart = cleanMessage.split(' ').slice(0, 6).join(' ');
        if (commandPart.length <= 40) {
            return commandPart + '...';
        }
    }
    
    // Default: take first 37 characters and add ellipsis
    return cleanMessage.substring(0, 37) + '...';
}

export const createChat = mutation({
    args: {
        title: v.string(),
    },
    handler:  async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity){
            throw new Error("Not authenticated");
        }

        const chat = await ctx.db.insert("chats", {
            title: args.title,
            userId: identity.subject,
            createdAt: Date.now(),
        });
        return chat;
    },
});

export const updateChatTitle = mutation({
    args: {
        chatId: v.id("chats"),
        firstMessage: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const chat = await ctx.db.get(args.chatId);
        if (!chat || chat.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        // Only update if it's still the default "New Chat" title
        if (chat.title === "New Chat") {
            const smartTitle = generateChatTitle(args.firstMessage);
            await ctx.db.patch(args.chatId, {
                title: smartTitle,
            });
        }
    },
});

export const listChats = query({
    handler: async(ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        // console.log(identity);
        if(!identity){
            throw new Error("Not authenticated");
        }

        const chats = await ctx.db
            .query("chats")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .collect();

            return chats;
    },
});

export const deleteChat = mutation({
    args: { id: v.id("chats") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity){
            throw new Error("Not authenticated");
        }

        const chat = await ctx.db.get(args.id);
        if(!chat || chat.userId !== identity.subject){
            throw new Error("Unauthorized");
        }

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_chat", (q) => q.eq("chatId", args.id))
            .collect();

            for(const message of messages){
                await ctx.db.delete(message._id);
            }

            await ctx.db.delete(args.id);
    },
});

export const getChat = query ({
    args: { id: v.id("chats"), userId: v.string() },
    handler: async(ctx, args) => {
        try {
            const chat = await ctx.db.get(args.id);

            if(!chat || chat.userId !== args.userId){
                console.log("❌ Chat not found or unauthorized", {
                    chatExists: !!chat,
                    chatUserId: chat?.userId,
                    requestUserId: args.userId,
                });
                return null;
            }

            console.log("✅ Chat found and authorized");
            return chat;
        } catch(error){
            console.log("❌ Error getting chat", error);
            return null;
        }
    },
});

export const searchChats = query({
    args: { searchQuery: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const searchTerm = args.searchQuery.toLowerCase().trim();

        if (!searchTerm) {
            // Return all chats if no search query
            return await ctx.db
                .query("chats")
                .withIndex("by_user", (q) => q.eq("userId", identity.subject))
                .order("desc")
                .collect();
        }

        // Get all user's chats
        const allChats = await ctx.db
            .query("chats")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .collect();

        const searchResults = [];

        for (const chat of allChats) {
            let isMatch = false;
            let relevanceScore = 0;

            // Search in chat title
            if (chat.title && chat.title.toLowerCase().includes(searchTerm)) {
                isMatch = true;
                relevanceScore += 10; // Higher score for title matches
            }

            // Search in messages
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
                .collect();

            for (const message of messages) {
                if (message.content.toLowerCase().includes(searchTerm)) {
                    isMatch = true;
                    relevanceScore += 1;

                    // Higher score for exact word matches
                    const words = searchTerm.split(' ');
                    for (const word of words) {
                        if (message.content.toLowerCase().includes(word)) {
                            relevanceScore += 0.5;
                        }
                    }
                }
            }

            if (isMatch) {
                searchResults.push({
                    ...chat,
                    relevanceScore
                });
            }
        }

        // Sort by relevance score (highest first) then by creation date
        return searchResults
            .sort((a, b) => {
                if (a.relevanceScore !== b.relevanceScore) {
                    return b.relevanceScore - a.relevanceScore;
                }
                return b.createdAt - a.createdAt;
            });
    },
});