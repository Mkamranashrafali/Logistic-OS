"use client";

import { motion } from "framer-motion";
import { Shield, Fingerprint, Lock, Database } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "JWT Authentication",
    description: "Stateless, secure token-based authentication for all API requests ensuring your data remains protected."
  },
  {
    icon: Fingerprint,
    title: "Google SSO",
    description: "Frictionless login experience integrated directly with Google for enhanced security and convenience."
  },
  {
    icon: Database,
    title: "Company Isolation",
    description: "Multi-tenant architecture ensures strict data boundaries between different logistics companies."
  },
  {
    icon: Shield,
    title: "Role Permissions",
    description: "Granular access control ensuring users only see and interact with data they are authorized to."
  }
];

export function SecuritySection() {
  return (
    <section className="py-24 bg-muted/5 border-y border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              Enterprise Security
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Bank-grade security for your logistics data.
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              We understand that your operational data is sensitive. That's why Logistics OS is built from the ground up with a security-first approach, ensuring your data is protected at rest and in transit.
            </p>
          </motion.div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {securityFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
