import { useUser } from "@clerk/nextjs";

export default function WelcomeMessage() {
  const { user, isLoaded } = useUser();

  const username = isLoaded
    ? user?.username || user?.firstName || "there"
    : "loading...";

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="rounded-2xl shadow-sm px-6 py-5 max-w-lg w-full bg-[#303030]">
        {/* <h2 className="text-xl font-semibold text-white mb-2">
          {`Welcome, ${username}`} 👋
        </h2> */}
        <p className="text-white mb-4 leading-relaxed">I can help you with:</p>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Finding and analyzing YouTube video transcripts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Searching through Google Books</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Processing data with JSON data</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Retrieve all Customer and Order data</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Retrieve all Comments from the Comments API</span>
          </li>
        </ul>
        <p className="text-gray-400 mt-4 leading-relaxed">
          Feel free to ask me anything! I&apos;m here to help.
        </p>
      </div>
    </div>
  );
}
