"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-blue-500/30 blur-[100px] rounded-full mix-blend-multiply" />
      </div>

      <div className="container px-4 md:px-6 relative z-10 mx-auto text-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-sm text-muted-foreground mb-8 cursor-pointer hover:bg-muted/80 transition-colors"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary" />
          Introducing Logistics OS 2.0
          <ChevronRight className="w-4 h-4" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
        >
          The Operating System for <br className="hidden md:block" />
          Modern Logistics
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
        >
          Scale your logistics company with an all-in-one platform designed for speed, reliability, and unprecedented operational visibility.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link href="/signup">
            <Button size="lg" className="h-12 px-8 text-base font-semibold group shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              Start for free
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#contact">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base font-medium">
              Book a Demo
            </Button>
          </Link>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative mx-auto max-w-5xl rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm shadow-2xl p-2 md:p-4"
        >
          <div className="rounded-lg border border-border overflow-hidden bg-background">
            {/* Fake Browser Header */}
            <div className="h-10 border-b border-border bg-muted/30 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto bg-background border border-border rounded-md px-3 py-1 text-xs text-muted-foreground font-mono flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/50" />
                app.logisticsos.com
              </div>
            </div>
            
            {/* Fake Dashboard Content */}
            <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6 h-[400px] md:h-[600px] overflow-hidden relative">
              <div className="col-span-1 hidden md:flex flex-col gap-4 border-r border-border pr-6">
                <div className="h-8 w-3/4 bg-muted rounded-md mb-4" />
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 w-full bg-muted/50 rounded-md" />
                ))}
              </div>
              <div className="col-span-1 md:col-span-3 flex flex-col gap-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-8 w-48 bg-muted rounded-md" />
                  <div className="h-8 w-24 bg-primary/10 rounded-md" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted/30 rounded-lg border border-border/50 p-4 flex flex-col justify-between">
                      <div className="h-3 w-16 bg-muted rounded-full" />
                      <div className="h-6 w-24 bg-foreground/80 rounded-md" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 bg-muted/10 rounded-lg border border-border/50 p-4 mt-2">
                   <div className="h-4 w-32 bg-muted rounded-md mb-6" />
                   <div className="w-full h-full flex items-end gap-2 pb-4">
                     {[...Array(12)].map((_, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.random() * 60 + 20}%` }}
                          transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                          className="flex-1 bg-primary/20 rounded-t-sm"
                        />
                     ))}
                   </div>
                </div>
              </div>

              {/* Overlay Gradient for Fade effect */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
