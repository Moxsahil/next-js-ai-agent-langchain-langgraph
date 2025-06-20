import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  const numMessages = Math.floor(Math.random() * 5) + 2;

  return (
    <div className="flex-1 overflow-hidden bg-[#30302E]">
      {/* Messages section */}
      <div className="h-[calc(100vh-65px)] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {[...Array(numMessages)].map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`w-2/3 rounded-2xl p-4 ${
                    i % 2 === 0
                      ? "bg-blue-600/10 rounded-br-none"
                      : "bg-gray-600/10 rounded-bl-none border border-gray-500"
                  }`}
                >
                  <div className="space-y-3">
                    <Skeleton
                      className={`h-4 w-[90%] ${
                        i % 2 === 0 ? "bg-white/40" : "bg-gray-400"
                      }`}
                    />
                    <Skeleton
                      className={`h-4 w-[75%] ${
                        i % 2 === 0 ? "bg-white/40" : "bg-gray-400"
                      }`}
                    />
                    <Skeleton
                      className={`h-4 w-[60%] ${
                        i % 2 === 0 ? "bg-white/40" : "bg-gray-400"
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input section */}
        <div className="border-t bg-[#30302E] p-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 rounded-full bg-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
