"use client";

import { UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="bg-[#30302E] bg-opacity-50 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center justify-end px-4 py-4">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox:
                "h-8 w-8 ring-2 ring-gray-200/50 ring-offset-2 rounded-full transition-shadow hover:ring-blue-300",
            },
          }}
        />
      </div>
    </header>
  );
}
