import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 selection:bg-primary/30 selection:text-primary">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg transition-transform group-hover:scale-105">
            <Package className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">Logistics OS</span>
        </Link>
      </div>

      <div className="text-center space-y-6 max-w-md">
        <div className="w-24 h-24 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-8 border border-border rotate-12">
          <span className="text-5xl font-black text-muted-foreground/50 -rotate-12">404</span>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
        
        <p className="text-muted-foreground text-lg">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>

        <div className="pt-8">
          <Link href="/">
            <Button size="lg" className="group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
