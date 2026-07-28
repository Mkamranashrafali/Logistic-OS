"use client";

import { motion } from "framer-motion";
import { Building2, UserPlus, Car, Map, Activity, FileText } from "lucide-react";

const steps = [
  { title: "Create Company", description: "Set up your organization profile and preferences in seconds.", icon: Building2 },
  { title: "Add Drivers", description: "Invite your fleet operators with dedicated roles and access.", icon: UserPlus },
  { title: "Add Vehicles", description: "Register your trucks, vans, and manage their statuses.", icon: Car },
  { title: "Assign Trips", description: "Create routes and dispatch assignments to your team.", icon: Map },
  { title: "Track Operations", description: "Monitor progress, location, and statuses in real-time.", icon: Activity },
  { title: "Generate Reports", description: "Analyze performance and expenses with automated reporting.", icon: FileText },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-muted/10 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From setup to scale in six simple steps. Our intuitive flow gets you operational immediately.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />

          <div className="space-y-12 relative">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              const Icon = step.icon;
              
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex flex-col md:flex-row items-start md:items-center gap-8 ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 md:text-right ${!isEven && "md:text-left"} pl-20 md:pl-0`}>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  {/* Icon Node */}
                  <div className="absolute left-8 md:relative md:left-auto -translate-x-1/2 md:translate-x-0 w-12 h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10 shadow-lg shadow-primary/20">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>

                  {/* Empty space for alternating layout */}
                  <div className="hidden md:block flex-1" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
