"use client";

import { motion } from "framer-motion";
import { MessageSquareQuote } from "lucide-react";

export function TestimonialsPlaceholder() {
  return (
    <section className="py-24 bg-muted/10 border-y border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary text-sm font-semibold"
          >
            Customer Stories
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-muted-foreground/50"
          >
            Success Stories Coming Soon
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-background border border-border border-dashed flex flex-col items-center justify-center text-center opacity-50"
            >
              <MessageSquareQuote className="w-10 h-10 text-muted-foreground mb-6" />
              <div className="h-4 w-full bg-muted rounded mb-2" />
              <div className="h-4 w-5/6 bg-muted rounded mb-2" />
              <div className="h-4 w-4/6 bg-muted rounded mb-8" />
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted" />
                <div className="text-left">
                  <div className="h-4 w-24 bg-muted rounded mb-2" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
