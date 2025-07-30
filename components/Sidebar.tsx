"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  MessageSquare,
  Settings,
  Search,
  Bot,
  Menu,
  X,
  Sparkles,
  History,
  Archive,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  XCircle,
  Loader2,
} from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/lib/context/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

function ChatRow({
  chat,
  onDelete,
  isActive = false,
  searchQuery = "",
}: {
  chat: Doc<"chats">;
  onDelete: (id: Id<"chats">) => void;
  isActive?: boolean;
  searchQuery?: string;
}) {
  const router = useRouter();
  const { closeMobileNav } = useNavigation();
  const lastMessage = useQuery(api.messages.getLastMessage, {
    chatId: chat._id,
  });

  const handleClick = () => {
    router.push(`/dashboard/chat/${chat._id}`);
    closeMobileNav();
  };

  // Helper function to highlight search terms
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-blue-500/30 text-blue-200 px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]",
        isActive
          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/10"
          : "glass hover:bg-white/10 border border-white/5 hover:border-white/20"
      )}
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-xs text-gray-400 font-medium">
                {new Date(chat.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm text-gray-200 line-clamp-2 leading-relaxed">
              {lastMessage ? (
                highlightText(
                  lastMessage.content.slice(0, 60) + "...",
                  searchQuery
                )
              ) : (
                <span className="text-gray-500 italic">New conversation</span>
              )}
            </div>
            {searchQuery.trim() && chat.title && (
              <div className="text-xs text-blue-300 mt-1 font-medium">
                Title: {highlightText(chat.title, searchQuery)}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 ml-2 h-8 w-8 p-0 transition-all hover:bg-red-500/20 hover:text-red-400 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(chat._id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
      )}
    </div>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const { user } = useUser();
  const { isMobileNavOpen, setIsMobileNavOpen, closeMobileNav } =
    useNavigation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const chats = useQuery(api.chats.listChats);
  const searchResults = useQuery(api.chats.searchChats, { searchQuery });
  const createChat = useMutation(api.chats.createChat);
  const deleteChat = useMutation(api.chats.deleteChat);

  // Use search results if there's a query, otherwise use all chats
  const displayChats = searchQuery.trim() ? searchResults : chats;

  const handleNewChat = async () => {
    const chatId = await createChat({ title: "New Chat" });
    router.push(`/dashboard/chat/${chatId}`);
    closeMobileNav();
  };

  const handleDeleteChat = async (id: Id<"chats">) => {
    await deleteChat({ id });
    if (window.location.pathname.includes(id)) {
      router.push("/dashboard");
    }
  };

  const currentChatId =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").pop()
      : null;

  return (
    <>
      {/* Mobile Menu Button - Perfectly aligned with text */}
      {!isMobileNavOpen && (
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="bg-gray-900/90 backdrop-blur-sm p-2.5 rounded-lg hover:bg-gray-800/90 transition-all  flex items-center justify-center"
          >
            <Menu className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Mobile Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileNav}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:inset-y-0 top-0 bottom-0 left-0 z-50 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:top-0 flex flex-col md:bg-gray-900/80",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-20" : "w-80"
        )}
      >
        {/* Header Section */}
        <div className="p-6 border-b border-white/10">
          <div
            className={cn(
              "flex items-center",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Moxsh AI
                  </h2>
                  <p className="text-xs text-gray-400">Intelligent Assistant</p>
                </div>
              </div>
            )}

            {/* Mobile Close Button */}
            {isMobileNavOpen && (
              <button
                onClick={closeMobileNav}
                className="bg-gray-800/80 p-2 rounded-lg hover:bg-gray-700/80 transition-all border border-gray-600/50"
              >
                <X className="w-5 h-5 text-gray-300 hover:text-white" />
              </button>
            )}

            {/* Collapse Toggle (Desktop) */}
            {!isMobileNavOpen && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex glass p-2 rounded-lg hover:bg-white/10 transition-all border border-white/20"
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-gray-400 hover:text-white" />
                ) : (
                  <PanelLeftClose className="w-4 h-4 text-gray-400 hover:text-white" />
                )}
              </button>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* New Chat Button */}
            <div className="p-6">
              <button
                onClick={handleNewChat}
                className="w-full group relative px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center gap-3 text-white font-semibold">
                  <Plus className="w-5 h-5" />
                  <span>New Chat</span>
                  <Sparkles className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 mb-4">
              <div className="relative">
                <Search
                  className={cn(
                    "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors",
                    searchQuery.trim() ? "text-blue-400" : "text-gray-400"
                  )}
                />
                <input
                  type="text"
                  placeholder="Search chats and messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
                {searchQuery.trim() && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
                {searchQuery.trim() && !displayChats && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-6 mb-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <History className="w-4 h-4" />
                  {searchQuery.trim()
                    ? `Search Results (${displayChats?.length || 0})`
                    : `Recent Conversations (${displayChats?.length || 0})`}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 space-y-3 scrollbar-hide-until-hover">
                {displayChats?.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                      {searchQuery.trim() ? (
                        <Search className="w-8 h-8 text-gray-500" />
                      ) : (
                        <MessageSquare className="w-8 h-8 text-gray-500" />
                      )}
                    </div>
                    <p className="text-gray-500 text-sm font-medium">
                      {searchQuery.trim()
                        ? "No results found"
                        : "No conversations yet"}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      {searchQuery.trim()
                        ? "Try different keywords"
                        : "Start a new chat to begin"}
                    </p>
                  </div>
                ) : (
                  displayChats?.map((chat) => (
                    <ChatRow
                      key={chat._id}
                      chat={chat}
                      onDelete={handleDeleteChat}
                      isActive={currentChatId === chat._id}
                      searchQuery={searchQuery}
                    />
                  ))
                )}
              </div>
            </div>

            {/* User Profile Section */}
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center gap-3 p-3 glass rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.firstName?.charAt(0) ||
                    user?.emailAddresses[0]?.emailAddress.charAt(0) ||
                    "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {user?.firstName ||
                      user?.emailAddresses[0]?.emailAddress ||
                      "User"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Collapsed State */}
        {isCollapsed && (
          <div className="flex-1 flex flex-col items-center py-6 space-y-4">
            <button
              onClick={handleNewChat}
              className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
            <div className="w-8 h-px bg-white/10" />
            <div className="flex flex-col items-center space-y-3">
              {chats?.slice(0, 3).map((chat) => (
                <button
                  key={chat._id}
                  onClick={() => {
                    router.push(`/dashboard/chat/${chat._id}`);
                    closeMobileNav();
                  }}
                  className={`p-2.5 glass rounded-lg hover:bg-white/10 transition-all w-10 h-10 flex items-center justify-center ${
                    currentChatId === chat._id
                      ? "bg-blue-500/20 border border-blue-500/30"
                      : ""
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
