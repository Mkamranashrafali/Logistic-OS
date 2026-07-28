"use client";

import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

export function DemoPlaceholder() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden group cursor-pointer"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-muted/80" />
          
          {/* Content */}
          <div className="relative h-[400px] md:h-[600px] flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
              <PlayCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-foreground/50">
              Interactive Demo Coming Soon
            </h2>
            <p className="text-muted-foreground/70 text-lg max-w-xl mx-auto">
              We are putting the finishing touches on our interactive product walkthrough. Check back shortly to see Logistics OS in action.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
