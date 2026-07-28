"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Truck, Users, PackageOpen, Car, Building, DollarSign, FileText } from "lucide-react";

interface CounterProps {
  end: number;
  suffix?: string;
  duration?: number;
}

function Counter({ end, suffix = "", duration = 2 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px 0px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };

    animationFrame = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className="font-bold text-3xl md:text-4xl">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const metrics = [
  { label: "Trips", value: 15420, suffix: "+", icon: Truck },
  { label: "Drivers", value: 850, suffix: "+", icon: Users },
  { label: "Orders", value: 125000, suffix: "+", icon: PackageOpen },
  { label: "Vehicles", value: 420, suffix: "+", icon: Car },
  { label: "Customers", value: 2500, suffix: "+", icon: Building },
  { label: "Expenses Tracked", value: 15, suffix: "M+", icon: DollarSign },
  { label: "Reports Generated", value: 45000, suffix: "+", icon: FileText },
];

export function AnimatedCounters() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Scale Without Limits</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our platform handles massive scale effortlessly, letting you focus on growing your business.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {metrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center p-6 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <Counter end={metric.value} suffix={metric.suffix} />
                <span className="text-muted-foreground font-medium mt-2">{metric.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
