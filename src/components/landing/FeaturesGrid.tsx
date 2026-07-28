"use client";

import { motion } from "framer-motion";
import { 
  Users, Map, Car, Package, UserCircle, 
  Receipt, BarChart3, Mail, Fingerprint, 
  ShieldCheck, Bell, KeySquare
} from "lucide-react";

const features = [
  { title: "Driver Management", description: "Onboard, assign, and track drivers in real-time.", icon: Users },
  { title: "Trip Management", description: "Optimize routes and schedule trips efficiently.", icon: Map },
  { title: "Vehicle Management", description: "Monitor fleet health, maintenance, and assignments.", icon: Car },
  { title: "Order Management", description: "Process and fulfill logistics orders seamlessly.", icon: Package },
  { title: "Customer Management", description: "Maintain a rich CRM for all your shipping clients.", icon: UserCircle },
  { title: "Expense Tracking", description: "Log and categorize operational expenses easily.", icon: Receipt },
  { title: "Reports & Analytics", description: "Generate insights to optimize your bottom line.", icon: BarChart3 },
  { title: "Email Automation", description: "Send automated updates to customers and staff.", icon: Mail },
  { title: "Google Login", description: "Frictionless SSO for your entire team.", icon: Fingerprint },
  { title: "Role Based Access", description: "Granular permissions for different team members.", icon: KeySquare },
  { title: "Secure Authentication", description: "Enterprise-grade JWT based security.", icon: ShieldCheck },
  { title: "Real-time Notifications", description: "Stay updated on critical operational events.", icon: Bell },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-muted/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary text-sm font-semibold"
          >
            Features
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            Everything you need. <br className="hidden md:block" />
            <span className="text-muted-foreground">Nothing you don't.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
