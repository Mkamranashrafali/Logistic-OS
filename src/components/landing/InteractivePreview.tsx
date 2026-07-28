"use client";

import { motion } from "framer-motion";
import { Search, Bell, Settings, LayoutDashboard, Truck, Users, Activity } from "lucide-react";

export function InteractivePreview() {
  return (
    <section id="solutions" className="py-24 bg-background overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Experience the Interface</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A beautiful, intuitive dashboard designed to give you complete control over your logistics operations.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative max-w-6xl mx-auto rounded-xl border border-border bg-background shadow-2xl flex flex-col md:flex-row h-[600px] overflow-hidden"
        >
          {/* Sidebar */}
          <div className="w-64 bg-muted/30 border-r border-border hidden md:flex flex-col p-4">
            <div className="flex items-center gap-2 mb-8 px-2">
              <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">L</div>
              <span className="font-semibold text-lg">Logistics OS</span>
            </div>
            
            <nav className="flex-1 space-y-2">
              {[
                { icon: LayoutDashboard, label: "Dashboard", active: true },
                { icon: Truck, label: "Fleet", active: false },
                { icon: Users, label: "Drivers", active: false },
                { icon: Activity, label: "Analytics", active: false },
                { icon: Settings, label: "Settings", active: false },
              ].map((item) => (
                <div 
                  key={item.label}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col bg-background/50">
            {/* Topbar */}
            <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur">
              <div className="flex items-center gap-4 text-muted-foreground">
                <Search className="w-5 h-5" />
                <span className="text-sm">Search trips, drivers...</span>
              </div>
              <div className="flex items-center gap-4">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div className="w-8 h-8 rounded-full bg-muted border border-border" />
              </div>
            </header>

            {/* Dashboard Content */}
            <main className="flex-1 p-6 overflow-y-auto">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Overview</h3>
                  <p className="text-muted-foreground text-sm">Your logistics activity today.</p>
                </div>
                <div className="h-9 w-32 bg-muted rounded-md" />
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-background rounded-xl border border-border p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-4 w-20 bg-muted rounded" />
                      <div className="w-8 h-8 rounded-full bg-primary/10" />
                    </div>
                    <div className="h-8 w-24 bg-foreground/90 rounded-md mb-2" />
                    <div className="h-3 w-32 bg-muted-foreground/30 rounded" />
                  </div>
                ))}
              </div>

              {/* Main Chart Area */}
              <div className="bg-background rounded-xl border border-border p-6 shadow-sm h-64 flex flex-col">
                 <div className="h-5 w-40 bg-muted rounded mb-6" />
                 <div className="flex-1 flex items-end gap-3">
                   {[...Array(20)].map((_, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${Math.random() * 80 + 20}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.05 }}
                        className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors"
                      />
                   ))}
                 </div>
              </div>
            </main>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
