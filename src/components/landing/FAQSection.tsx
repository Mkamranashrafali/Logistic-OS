"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is Logistics OS suitable for small fleets?",
    answer: "Yes, Logistics OS is designed to scale. Whether you have 5 vehicles or 500, our platform provides the tools you need to manage your operations efficiently without overwhelming you with unnecessary complexity."
  },
  {
    question: "How long does it take to onboard my team?",
    answer: "Most teams are fully onboarded within 48 hours. Our intuitive interface requires minimal training, and our automated onboarding flows guide your drivers and dispatchers through the setup process step-by-step."
  },
  {
    question: "Does it integrate with our existing ELD devices?",
    answer: "We offer custom integrations on our Enterprise plan. For standard plans, we provide a comprehensive open API that your development team can use to connect your existing hardware and software ecosystem."
  },
  {
    question: "Is my operational data secure?",
    answer: "Absolutely. We employ enterprise-grade JWT authentication, strict company data isolation, and role-based access controls to ensure your sensitive business data is only accessible to authorized personnel."
  },
  {
    question: "Can drivers use Logistics OS on their phones?",
    answer: "Yes, our driver dashboard is fully responsive and optimized for mobile browsers, allowing drivers to update statuses, upload documents, and communicate seamlessly from the road."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-muted/5">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="border border-border rounded-xl bg-background overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left font-medium focus:outline-none focus-visible:bg-muted/50 hover:bg-muted/30 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                {faq.question}
                <ChevronDown 
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`} 
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-4 pt-0 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
