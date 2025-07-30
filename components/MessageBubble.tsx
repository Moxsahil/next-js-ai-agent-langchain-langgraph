"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import { Bot } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  isUser?: boolean;
}

const formatMessage = (content: string): string => {
  // First unescape backslashes
  content = content.replace(/\\\\/g, "\\");

  // Then handling newlines
  content = content.replace(/\\n/g, "\n");

  // Remove only the markers but keep the content between them
  content = content.replace(/---START---\n?/g, "").replace(/\n?---END---/g, "");

  // Trim any extra whitespace that might be left
  return content.trim();
};

export function MessageBubble({ content, isUser }: MessageBubbleProps) {
  const { user } = useUser();

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isUser ? "bg-gray-700 border border-gray-600" : "bg-gray-700 border border-gray-600"
        }`}>
          {isUser ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="bg-gray-600 text-white text-xs">
                {user?.firstName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Bot className="h-5 w-5 text-gray-300" />
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className={`max-w-[85%] md:max-w-[75%] ${
        isUser
          ? "bg-gray-800 text-gray-100 rounded-2xl rounded-tr-md border border-gray-700"
          : "bg-gray-800 text-gray-100 rounded-2xl rounded-tl-md border border-gray-700"
      }`}>
        <div className="p-4">
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: formatMessage(content) }} />
          </div>
        </div>
      </div>
    </div>
  );
}
