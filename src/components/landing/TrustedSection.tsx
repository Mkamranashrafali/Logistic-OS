"use client";

import { motion } from "framer-motion";

export function TrustedSection() {
  return (
    <section className="py-12 border-y border-border/40 bg-muted/20">
      <div className="container mx-auto px-4 md:px-6">
        <p className="text-center text-sm font-medium text-muted-foreground mb-8">
          Built for modern logistics companies
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded bg-muted-foreground/20" />
              <div className="h-4 w-24 rounded bg-muted-foreground/20" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
