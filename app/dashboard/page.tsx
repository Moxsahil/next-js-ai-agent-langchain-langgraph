"use client";

import { Bot, Search, BookOpen, Youtube, MessageCircle, Sparkles, Brain, Zap, Globe, TrendingUp, Star, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const heroRef = useRef<HTMLDivElement>(null);

  const username = isLoaded
    ? user?.username || user?.firstName || "there"
    : "loading...";

  useEffect(() => {
    if (heroRef.current) {
      gsap.from(heroRef.current.children, {
        duration: 1,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: "power3.out"
      });
    }
  }, [isLoaded]);

  const aiCapabilities = [
    {
      icon: Search,
      title: "Wikipedia Search",
      description: "Access comprehensive knowledge from millions of articles",
      gradient: "from-blue-500 to-cyan-500",
      stats: "40M+ Articles"
    },
    {
      icon: BookOpen,
      title: "Google Books",
      description: "Search through vast libraries of published literature",
      gradient: "from-green-500 to-emerald-500",
      stats: "40M+ Books"
    },
    {
      icon: Youtube,
      title: "YouTube Transcripts",
      description: "Extract insights and content from video resources",
      gradient: "from-red-500 to-pink-500",
      stats: "Billions of Hours"
    }
  ];

  const examplePrompts = [
    { text: "Tell me about quantum computing breakthroughs", category: "Science" },
    { text: "Search for books about machine learning", category: "Research" },
    { text: "Find YouTube videos about space exploration", category: "Discovery" },
    { text: "Research renewable energy developments", category: "Technology" }
  ];

  const stats = [
    { icon: Brain, label: "AI Models", value: "Advanced", color: "text-purple-400" },
    { icon: Zap, label: "Response Time", value: "< 2s", color: "text-yellow-400" },
    { icon: Globe, label: "Languages", value: "100+", color: "text-blue-400" },
    { icon: TrendingUp, label: "Accuracy", value: "99.9%", color: "text-green-400" }
  ];

  return (
    <div className="h-full relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "-2s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "-4s" }} />
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Welcome Section */}
          <motion.div 
            ref={heroRef}
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="inline-flex items-center gap-3 glass px-6 py-3 rounded-full mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-300">AI Assistant Dashboard</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gradient">Welcome back,</span>
              <br />
              <span className="text-white">{username}!</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Your intelligent AI assistant is ready to help you research, analyze, and discover insights 
              from the world's knowledge. Start exploring with powerful AI tools at your fingertips.
            </p>

            {/* Status indicators */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {stats.map(({ icon: Icon, label, value, color }) => (
                <motion.div
                  key={label}
                  className="glass rounded-2xl px-6 py-4 border border-white/10 hover:border-white/20 transition-all"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <div className="text-left">
                      <div className={`font-bold ${color}`}>{value}</div>
                      <div className="text-xs text-gray-400 font-medium">{label}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Capabilities Section */}
          <div className="mb-16">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Powerful <span className="text-gradient">AI Capabilities</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Access a comprehensive suite of AI tools designed to enhance your research and discovery experience.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {aiCapabilities.map(({ icon: Icon, title, description, gradient, stats }, index) => (
                <motion.div
                  key={title}
                  className="group glass-strong rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 cursor-pointer relative overflow-hidden"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 * index }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white mb-3 group-hover:text-gradient transition-all">
                    {title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-4">{description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stats}</span>
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Getting Started Section */}
          <motion.div
            className="glass-strong rounded-3xl p-12 border border-white/10 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-gray-300">Ready to Explore</span>
              </div>
              
              <h3 className="font-display text-3xl font-bold text-white mb-4">
                Start Your <span className="text-gradient">AI Journey</span>
              </h3>
              <p className="text-gray-400 mb-8 text-lg max-w-2xl mx-auto">
                Click "New Chat" in the sidebar to begin your conversation. Here are some inspiring prompts to get you started:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {examplePrompts.map(({ text, category }, index) => (
                  <motion.div
                    key={index}
                    className="glass rounded-2xl p-6 border border-white/5 hover:border-white/20 transition-all duration-300 text-left group cursor-pointer"
                    whileHover={{ scale: 1.02, y: -2 }}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                        {category}
                      </span>
                      <Star className="w-4 h-4 text-gray-500 group-hover:text-yellow-400 transition-colors" />
                    </div>
                    <p className="text-gray-300 font-medium group-hover:text-white transition-colors">
                      "{text}"
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
