"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const comparisonFeatures = [
  "Real-time Tracking",
  "Automated Reporting",
  "Role-Based Access Control",
  "Driver Performance Analytics",
  "Expense Categorization",
  "Centralized Communications",
  "Mobile Friendly Dashboard",
  "Secure Authentication",
];

export function WhyUs() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Why Logistics OS</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stop relying on scattered spreadsheets and disconnected tools. Upgrade to a modern, unified platform.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-background rounded-2xl border border-border overflow-hidden shadow-xl"
        >
          {/* Table Header */}
          <div className="grid grid-cols-3 border-b border-border bg-muted/30">
            <div className="p-6 font-semibold text-lg flex items-center">Features</div>
            <div className="p-6 font-semibold text-lg text-center text-muted-foreground">Traditional Spreadsheet</div>
            <div className="p-6 font-bold text-lg text-center bg-primary/5 text-primary border-l border-border">Logistics OS</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {comparisonFeatures.map((feature, i) => (
              <div key={feature} className="grid grid-cols-3 hover:bg-muted/10 transition-colors">
                <div className="p-4 md:p-6 text-sm md:text-base font-medium flex items-center">{feature}</div>
                <div className="p-4 md:p-6 flex items-center justify-center">
                  {i > 1 && i !== 4 ? (
                    <X className="w-5 h-5 text-red-500/70" />
                  ) : (
                    <span className="text-yellow-600/70 text-sm font-medium border border-yellow-600/30 px-2 py-1 rounded-md bg-yellow-600/10">Manual</span>
                  )}
                </div>
                <div className="p-4 md:p-6 flex items-center justify-center bg-primary/5 border-l border-border">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Check className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
