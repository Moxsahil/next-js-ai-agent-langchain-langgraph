# Let's build an AI Agent that can use Tools in NEXT.JS 15! (LangChain, Clerk, Convex, TS, IBM)

A sophisticated AI chat application built with Next.js, featuring real-time conversations, advanced prompt caching, and intelligent tool orchestration powered by LangChain and Claude 3.5 Sonnet or Open AI GPT 3.5 or above.

## Before You Get Started

1. [Sign up for a Free Clerk account](https://go.clerk.com)
2. [Sign up for IBM's FREE WxFlows tool](https://wxflows.ibm.stepzen.com)

## Features

- 🤖 Advanced AI chat interface with Claude 3.5 Sonnet
- 🎨 Modern and responsive UI with Tailwind CSS
- 🔐 Authentication with Clerk
- 💾 Real-time data storage with Convex
- ⚡ Built with Next.js 15 and React 19
- 🌊 Advanced streaming responses with custom implementation
- 📱 Mobile-friendly design
- 🧠 Prompt caching for optimized token usage
- 🔧 Intelligent tool orchestration with LangGraph
- 🔄 Real-time updates and tool execution feedback
- 📚 Integration with various data sources via wxflows

## Advanced Features

### AI and Prompt Management

- **Prompt Caching**: Optimized token usage with Anthropic's caching feature
- **Context Window**: Efficient 4096 token context management
- **Tool-Augmented Responses**: Enhanced AI capabilities with custom tools
- **Context-Aware Conversations**: Intelligent conversation management

### Tool Integration

- **wxflows Integration**:
  - Quick integration of various data sources
  - Support for YouTube transcripts
  - Google Books API integration
  - Custom data source tooling

### LangChain & LangGraph Features

- **State Management**: Sophisticated state handling with StateGraph
- **Tool Orchestration**: Advanced tool management with ToolNode
- **Memory Management**: Efficient context tracking with MemorySaver
- **Message Optimization**: Intelligent message trimming and context management

### Streaming Implementation

- **Custom Streaming Solution**:
  - Real-time token streaming
  - Tool execution feedback
  - Error handling for failed tool calls
  - Workarounds for LangChainAdapter limitations

### Real-time Features

- **Live Updates**: Instant message delivery and updates
- **Tool Visualization**: Real-time tool interaction display
- **History Management**: Efficient message history tracking

## Tech Stack

- **Frontend Framework**: Next.js 15.1.3
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: Convex
- **AI Integration**: LangChain
- **Icons**: Lucide React & Radix UI Icons
- **Type Safety**: TypeScript

## Prerequisites

- Node.js (Latest LTS version recommended)
- NPM package manager or PNPM/Yarn
- Clerk account for authentication
- Convex account for database
- OpenAI/Anthropic API key for AI capabilities

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
ANTHROPIC_API_KEY=your_anthropic_api_key
```

if you want to use Open AI

```
OPENAI_API_KEY=Your_open_ai_key

```
When deploy on any platform of your choice, don't forget to use 

```

CONVEX_DEPLOY_KEY= your_convex_deploy_key

```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Moxsahil/next-js-ai-agent-langchain-langgraph.git
cd next-js-ai-agent-langchain-langgraph
```

2. Install dependencies:

```bash
npm install
```

--> If got errors , TRY

```bash
npm install --legacy-peer-deps
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Check out my other socials:

- [Github](https://github.com/Moxsahil) 👀
- [LinkedIn](https://www.linkedin.com/in/sahil-barak-865063216) 🛎️
- [Instagram](https://www.instagram.com/moksshhh_.20) 🔥

## Support

For support, email sahilmk01@gmail.com

---

Built with ❤️ for the Sahil Barak
