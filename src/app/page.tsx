import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustedSection } from "@/components/landing/TrustedSection";
import { Footer } from "@/components/landing/Footer";

// Lazy load heavy components that appear below the fold
const AnimatedCounters = dynamic(() => import("@/components/landing/AnimatedCounters").then(mod => mod.AnimatedCounters));
const FeaturesGrid = dynamic(() => import("@/components/landing/FeaturesGrid").then(mod => mod.FeaturesGrid));
const InteractivePreview = dynamic(() => import("@/components/landing/InteractivePreview").then(mod => mod.InteractivePreview));
const HowItWorks = dynamic(() => import("@/components/landing/HowItWorks").then(mod => mod.HowItWorks));
const WhyUs = dynamic(() => import("@/components/landing/WhyUs").then(mod => mod.WhyUs));
const SecuritySection = dynamic(() => import("@/components/landing/SecuritySection").then(mod => mod.SecuritySection));
const DemoPlaceholder = dynamic(() => import("@/components/landing/DemoPlaceholder").then(mod => mod.DemoPlaceholder));
const TestimonialsPlaceholder = dynamic(() => import("@/components/landing/TestimonialsPlaceholder").then(mod => mod.TestimonialsPlaceholder));
const PricingSection = dynamic(() => import("@/components/landing/PricingSection").then(mod => mod.PricingSection));
const FAQSection = dynamic(() => import("@/components/landing/FAQSection").then(mod => mod.FAQSection));
const ContactSection = dynamic(() => import("@/components/landing/ContactSection").then(mod => mod.ContactSection));
const ScrollToTop = dynamic(() => import("@/components/landing/ScrollToTop").then(mod => mod.ScrollToTop));

export const metadata: Metadata = {
  title: "Logistics OS | The Operating System for Modern Logistics",
  description: "Scale your logistics company with an all-in-one platform designed for speed, reliability, and unprecedented operational visibility.",
  openGraph: {
    title: "Logistics OS | Modern Logistics Platform",
    description: "The complete SaaS platform for logistics companies.",
    url: "https://logisticsos.com",
    siteName: "Logistics OS",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Logistics OS Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Logistics OS",
    description: "The complete SaaS platform for logistics companies.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://logisticsos.com",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/30 selection:text-primary">
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        <TrustedSection />
        <AnimatedCounters />
        <FeaturesGrid />
        <InteractivePreview />
        <HowItWorks />
        <WhyUs />
        <SecuritySection />
        <DemoPlaceholder />
        <TestimonialsPlaceholder />
        <PricingSection />
        <FAQSection />
        <ContactSection />
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
