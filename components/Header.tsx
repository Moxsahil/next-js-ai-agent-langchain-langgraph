"use client";

import { UserButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="glass-strong sticky top-0 z-40 border-b border-white/10">
      <div className="flex items-center justify-between min-h-16 pl-16 pr-4 md:px-6 py-3">
        {/* Left side - App info - Clean text only */}
        <div className="flex items-center gap-2 min-h-0">
          <h1 className="font-display text-lg font-bold text-white whitespace-nowrap leading-none">
            Moxsh AI
          </h1>
          <div className="hidden lg:flex items-center gap-2 leading-none">
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-400">Intelligent Assistant</span>
          </div>
        </div>

        {/* Right side - User profile with exact alignment */}
        <div className="flex items-center flex-shrink-0 min-h-0">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 rounded-full transition-all duration-300 ease-out hover:scale-110 border-2 border-white/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/25",
                userButtonPopoverCard: `
                  !bg-gradient-to-br !from-background/95 !to-card/95
                  !border !border-white/10 !shadow-2xl !rounded-2xl
                  !backdrop-blur-xl !min-w-[280px] !p-0
                  after:!content-[''] after:!absolute after:!inset-0
                  after:!bg-gradient-to-br after:!from-primary/5 after:!to-accent/5
                  after:!rounded-2xl after:!pointer-events-none
                `,
                userButtonPopoverActionButton: `
                  !bg-gradient-to-r !from-white/5 !to-white/10
                  !hover:from-primary/10 !hover:to-accent/10
                  !border !border-white/5 !hover:border-primary/20
                  !text-foreground !hover:text-primary
                  !rounded-xl !transition-all !duration-300 !ease-out
                  !hover:scale-[1.02] !hover:shadow-lg !hover:shadow-primary/10
                  !mx-2 !my-1 !font-medium
                `,
                userButtonPopoverActionButtonText: "!text-foreground !font-medium",
                userButtonPopoverActionButtonIcon: "!text-foreground/80",
                userPreviewMainIdentifier: "!text-foreground !font-display !font-semibold !text-base",
                userPreviewSecondaryIdentifier: "!text-muted-foreground !text-sm",
                userPreviewAvatarContainer: "!border-2 !border-white/10",
                userPreviewAvatarBox: "!border-2 !border-white/10 !shadow-lg",
                userButtonPopoverFooter: "!hidden",
                userButtonTrigger: `
                  !transition-all !duration-300 !ease-out
                  hover:!scale-110 focus:!scale-110
                  hover:!shadow-lg hover:!shadow-primary/25
                  focus:!outline-none focus:!ring-2 focus:!ring-primary/50 focus:!ring-offset-0
                `
              },
              variables: {
                colorPrimary: "#3b82f6",
                colorBackground: "rgb(var(--background))",
                colorInputBackground: "rgb(var(--card))",
                colorInputText: "rgb(var(--foreground))",
                colorTextOnPrimaryBackground: "#ffffff",
                borderRadius: "1rem",
                fontFamily: "var(--font-inter), system-ui, sans-serif"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}
