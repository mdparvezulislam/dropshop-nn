"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "general" | "business" | "technical";
}

const faqs: FAQItem[] = [
  {
    id: "1",
    category: "general",
    question: "What is DropshopNN?",
    answer:
      "DropshopNN is an enterprise commerce operating system designed for Bangladesh. It connects suppliers, resellers, wholesalers, and customers in one unified platform with automation, smart pricing, and growth tools.",
  },
  {
    id: "2",
    category: "business",
    question: "How do I become a reseller?",
    answer:
      "Visit /become-reseller to start the process. Create your shop profile, set up your payment method, and start listing products from our catalog. Our reseller dashboard provides all the tools you need to grow.",
  },
  {
    id: "3",
    category: "business",
    question: "What are the wholesale requirements?",
    answer:
      "Wholesale buyers can access bulk pricing with MOQ (Minimum Order Quantity) support. Visit /become-wholesale-partner to register your business, verify company details, and access wholesale pricing.",
  },
  {
    id: "4",
    category: "technical",
    question: "How are prices calculated?",
    answer:
      "Our Smart Pricing Engine automatically applies the right tier: retail for customers, reseller pricing for partners, and wholesale pricing for bulk orders. All based on your role and order quantity.",
  },
  {
    id: "5",
    category: "general",
    question: "What payment methods are supported?",
    answer:
      "We support credit/debit cards, mobile banking (bKash, Nagad, Rocket), and cash on delivery. Multiple payment options ensure smooth transactions for all customer types.",
  },
  {
    id: "6",
    category: "technical",
    question: "How does order tracking work?",
    answer:
      "Every order gets a tracking number. Customers can track deliveries in real-time. Suppliers and resellers see full order status in their dashboards with courier integration.",
  },
];

const categories = ["general", "business", "technical"] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function FAQSection(): React.ReactElement {
  const [activeId, setActiveId] = useState<string>("1");
  const [activeCategory, setActiveCategory] = useState<"general" | "business" | "technical">(
    "general",
  );

  const filteredFaqs = faqs.filter((faq) => faq.category === activeCategory);

  return (
    <section className="w-full py-16 lg:py-24 bg-[hsl(0_0%_96%)]" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about DropshopNN
          </p>
        </motion.div>

        <div className="flex gap-2 justify-center mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setActiveId("");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-white border border-[hsl(0_0%_91%)] text-foreground hover:border-primary/40"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-2xl mx-auto space-y-3"
        >
          {filteredFaqs.map((faq) => (
            <motion.div
              key={faq.id}
              variants={itemVariants}
              className="border border-[hsl(0_0%_91%)] rounded-lg bg-white overflow-hidden"
            >
              <button
                onClick={() => setActiveId(activeId === faq.id ? "" : faq.id)}
                className="w-full text-left px-6 py-4 hover:bg-[hsl(0_0%_96%)] transition-colors flex items-center justify-between"
              >
                <span className="font-medium text-foreground">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    activeId === faq.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeId === faq.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 py-4 border-t border-[hsl(0_0%_91%)] bg-white"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
