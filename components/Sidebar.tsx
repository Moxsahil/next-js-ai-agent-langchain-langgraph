"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/lib/context/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function ChatRow({
  chat,
  onDelete,
}: {
  chat: Doc<"chats">;
  onDelete: (id: Id<"chats">) => void;
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

  return (
    <div
      className="group rounded-xl bg-[#30302E] backdrop-blur-sm hover:bg-[#1F1E1D] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
      onClick={handleClick}
    >
      <div className="p-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-300 truncate flex-1 font-medium">
            {lastMessage ? (
              <>{lastMessage.content.replace(/\\n/g, "\n")}</>
            ) : (
              <span className="text-gray-400">New conversation</span>
            )}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 -mr-1/2 -mt-1/3 ml-1 transition-opacity duration-200 hover:bg-[#3f3d3b] rounded-md"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(chat._id);
            }}
          >
            <TrashIcon className="h-2 w-2 text-gray-400 hover:text-red-500 transition-colors" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const { isMobileNavOpen, setIsMobileNavOpen, closeMobileNav } =
    useNavigation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const chats = useQuery(api.chats.listChats);
  const createChat = useMutation(api.chats.createChat);
  const deleteChat = useMutation(api.chats.deleteChat);

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

  return (
    <>
      {/* Menu Icon (Mobile) - only show when sidebar is closed */}
      {!isMobileNavOpen && (
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="bg-[#30302E] p-1 rounded-md  hover:bg-[#1F1E1D] transition"
          >
            <Image
              src="/Images/Menu.png"
              alt="Menu Icon"
              width={20}
              height={20}
              className="object-contain"
            />
          </button>
        </div>
      )}

      {/* Mobile Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={closeMobileNav}
        />
      )}

      {/* Sidebar */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(true)}
        className={cn(
          "fixed md:inset-y-0 top-0 bottom-0 left-0 z-50 bg-[#30302E] backdrop-blur-xl transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:top-0 flex flex-col overflow-hidden",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full",
          isMobileNavOpen ? "w-72" : isCollapsed ? "w-16" : "w-72"
        )}
      >
        {/* Top Header (Logo and Collapse) */}
        <div
          className={cn(
            "flex items-center border-b border-[#30302E] transition-all duration-300 h-16 px-3",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {/* Mobile Close (X) icon */}
          {isMobileNavOpen ? (
            <>
              <Link href="/" onClick={closeMobileNav}>
                <Image
                  src="/Images/logo.png"
                  alt="Moxsh AI Logo"
                  width={120}
                  height={40}
                  className="transition-all object-contain w-[72px]"
                  priority
                />
              </Link>
              <div className="flex justify-end w-full">
                <button onClick={closeMobileNav}>
                  <X className="w-5 h-5 text-white hover:text-red-500 transition" />
                </button>
              </div>
            </>
          ) : (
            <>
              {!isCollapsed && (
                <Link href="/" onClick={closeMobileNav}>
                  <Image
                    src="/Images/logo.png"
                    alt="Moxsh AI Logo"
                    width={120}
                    height={40}
                    className="transition-all object-contain w-[72px]"
                    priority
                  />
                </Link>
              )}

              {(isHovered || !isCollapsed) && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={cn(
                    "text-gray-400 hover:text-white transition",
                    isCollapsed && "mx-auto"
                  )}
                >
                  <Image
                    src={
                      isCollapsed
                        ? "/Images/sidebar2.png"
                        : "/Images/sidebar.png"
                    }
                    alt="sidebar icon"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </button>
              )}
            </>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-2 border-b border-[#30302E] mt-1">
          <button
            onClick={handleNewChat}
            className={cn(
              "w-full flex items-center px-2 py-2 bg-[#30302E] hover:bg-orange-300/30 rounded-lg transition-colors duration-200 group",
              isCollapsed && "justify-center"
            )}
          >
            <div
              className={cn(
                "w-6 h-6 bg-[#c96442] rounded-full flex items-center justify-center group-hover:bg-orange-400 transition-colors",
                isCollapsed ? "mr-0" : "mr-3"
              )}
            >
              <PlusIcon className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-orange-400 font-medium group-hover:text-orange-400">
                New chat
              </span>
            )}
          </button>
        </div>

        {/* Chat History List */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto space-y-2.5 p-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {chats?.map((chat) => (
              <ChatRow key={chat._id} chat={chat} onDelete={handleDeleteChat} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
