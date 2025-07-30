"use client";

import { useEffect, useRef } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Search, BookOpen, Brain, Cpu, Globe, Code, Database, Shield } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const containerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance animation
      const tl = gsap.timeline();
      
      tl.from(titleRef.current, {
        duration: 1.2,
        y: 100,
        opacity: 0,
        ease: "power4.out"
      })
      .from(subtitleRef.current, {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: "power3.out"
      }, "-=0.6")
      .from(ctaRef.current?.children, {
        duration: 0.8,
        y: 30,
        opacity: 0,
        stagger: 0.2,
        ease: "back.out(1.7)"
      }, "-=0.4");

      // Floating animation for hero elements
      gsap.to(heroRef.current, {
        y: -10,
        duration: 3,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1
      });

      // Scroll-triggered animations
      gsap.fromTo(".reveal", {
        opacity: 0,
        y: 100
      }, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".reveal",
          start: "top 80%",
          end: "bottom 20%"
        }
      });

      gsap.fromTo(".reveal-left", {
        opacity: 0,
        x: -100
      }, {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".reveal-left",
          start: "top 80%"
        }
      });

      gsap.fromTo(".reveal-right", {
        opacity: 0,
        x: 100
      }, {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".reveal-right",
          start: "top 80%"
        }
      });

      // Feature cards animation
      gsap.fromTo(".feature-card", {
        opacity: 0,
        scale: 0.8,
        rotateY: 45
      }, {
        opacity: 1,
        scale: 1,
        rotateY: 0,
        duration: 1.2,
        ease: "back.out(1.7)",
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".feature-card",
          start: "top 85%"
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const features = [
    { icon: Brain, title: "Neural Processing", description: "Advanced AI reasoning with context awareness", color: "from-purple-500 to-pink-500" },
    { icon: Zap, title: "Lightning Fast", description: "Real-time responses with streaming technology", color: "from-yellow-400 to-orange-500" },
    { icon: Search, title: "Smart Research", description: "Wikipedia, Google Books, YouTube integration", color: "from-blue-500 to-cyan-500" },
    { icon: Code, title: "Code Analysis", description: "Understand and debug complex codebases", color: "from-green-500 to-emerald-500" },
    { icon: Database, title: "Data Processing", description: "Parse and analyze large datasets instantly", color: "from-red-500 to-rose-500" },
    { icon: Shield, title: "Secure & Private", description: "Enterprise-grade security for your data", color: "from-indigo-500 to-purple-500" }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime", suffix: "" },
    { number: "50", label: "AI Tools", suffix: "+" },
    { number: "100", label: "Languages", suffix: "+" },
    { number: "1M", label: "Queries Daily", suffix: "+" }
  ];

  return (
    <main ref={containerRef} className="min-h-screen bg-black overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="video-background opacity-40"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35c1a9a8c8e5&profile_id=165&oauth2_token_id=57447761" type="video/mp4" />
        {/* Fallback gradient */}
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-gray-900/60 to-black/90 z-0" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-2s" }} />
        <div className="absolute top-3/4 left-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-4s" }} />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div ref={heroRef} className="max-w-7xl mx-auto text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 reveal-scale">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-gray-300 font-mono">
              Powered by Advanced AI • Real-time Processing
            </span>
          </div>

          {/* Main Heading */}
          <h1 
            ref={titleRef}
            className="font-display text-7xl md:text-9xl font-bold mb-6 leading-tight"
          >
            <span className="block text-gradient text-shadow-glow">Moxsh</span>
            <span className="block text-white font-light">Intelligence</span>
          </h1>

          {/* Subtitle */}
          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed font-light"
          >
            Experience the future of AI conversation with our intelligent agent that doesn't just chat—it 
            <span className="text-gradient-blue font-semibold"> revolutionizes how you work</span>, 
            learn, and create with cutting-edge tools and real-time insights.
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
            <SignedIn>
              <Link href="/dashboard">
                <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 animate-pulse-glow">
                  <span className="relative z-10 flex items-center gap-2">
                    Launch Dashboard
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </Link>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard">
                <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 animate-pulse-glow">
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </SignInButton>
            </SignedOut>

            <button className="group glass-strong px-8 py-4 text-white text-lg font-semibold rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105">
              <span className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Watch Demo
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map(({ number, label, suffix }, index) => (
              <div key={label} className="reveal text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient font-display mb-2">
                  {number}{suffix}
                </div>
                <div className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 reveal">
            <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
              Powerful <span className="text-gradient">AI Capabilities</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Unlock the full potential of artificial intelligence with our comprehensive suite of tools
              designed to enhance your productivity and creativity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description, color }, index) => (
              <div 
                key={title}
                className="feature-card group glass-strong rounded-3xl p-8 hover:scale-105 transition-all duration-500 cursor-pointer"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-3 group-hover:text-gradient transition-all">
                  {title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-strong rounded-3xl p-12 reveal">
            <h3 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your <span className="text-gradient">Workflow?</span>
            </h3>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Join thousands of professionals who are already using Moxsh AI to accelerate their work and unlock new possibilities.
            </p>
            <SignedOut>
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard">
                <button className="group relative px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                  <span className="relative z-10 flex items-center gap-3">
                    Get Started Today
                    <Sparkles className="w-6 h-6 transition-transform group-hover:rotate-180" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="group relative px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                  <span className="relative z-10 flex items-center gap-3">
                    Continue to Dashboard
                    <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>
    </main>
  );
}
