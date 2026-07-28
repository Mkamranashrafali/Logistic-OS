"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the plan that fits your logistics volume. Upgrade anytime as you grow.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col p-8 rounded-3xl bg-background border border-border opacity-60"
          >
            <h3 className="text-xl font-semibold mb-2">Starter</h3>
            <p className="text-muted-foreground text-sm mb-6">Perfect for small fleets.</p>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold">Coming Soon</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {["Up to 10 Drivers", "Basic Routing", "Standard Support"].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button disabled variant="outline" className="w-full">
              Notify Me
            </Button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col p-8 rounded-3xl bg-primary/5 border-2 border-primary relative opacity-60"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold mb-2">Professional</h3>
            <p className="text-muted-foreground text-sm mb-6">For growing operations.</p>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold">Coming Soon</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {["Up to 50 Drivers", "Advanced Routing", "Automated Reports", "Priority Support"].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button disabled className="w-full">
              Notify Me
            </Button>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col p-8 rounded-3xl bg-background border border-border opacity-60"
          >
            <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
            <p className="text-muted-foreground text-sm mb-6">For massive scale.</p>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold">Custom</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {["Unlimited Drivers", "Custom Integrations", "Dedicated Account Manager", "SLA Guarantee"].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button disabled variant="outline" className="w-full">
              Contact Sales
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
