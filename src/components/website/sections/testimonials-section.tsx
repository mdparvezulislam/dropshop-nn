"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  title?: string;
  description?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    name: "Rafiq Hasan",
    role: "Reseller",
    company: "Dhaka",
    content: "DropshopNN transformed my business. The automated fulfillment means I can focus on sales while they handle the logistics. My profit margins have never been better.",
    rating: 5,
  },
  {
    name: "Sadia Rahman",
    role: "Wholesale Buyer",
    company: "Chittagong",
    content: "The wholesale pricing tiers are incredibly competitive. I've been able to scale my retail chain significantly since partnering with DropshopNN.",
    rating: 5,
  },
  {
    name: "Kamal Hossain",
    role: "Retailer",
    company: "Sylhet",
    content: "What sets DropshopNN apart is the real-time inventory and pricing. No more guessing games — I know exactly what's available and at what price.",
    rating: 5,
  },
  {
    name: "Nusrat Jahan",
    role: "Online Store Owner",
    company: "Khulna",
    content: "The product catalog is extensive and the quality is consistently excellent. My customers love the fast delivery and I love the easy returns process.",
    rating: 4,
  },
];

export function TestimonialsSection({
  testimonials = defaultTestimonials,
  title = "What Our Partners Say",
  description = "Trusted by businesses across Bangladesh",
}: TestimonialsSectionProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (testimonials.length === 0) return null;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  };

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-foreground/50">{description}</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative min-h-[220px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="p-8 rounded-xl border border-border/60 bg-card text-center"
              >
                <Quote className="h-8 w-8 text-primary/20 mx-auto mb-4" />
                <div className="flex justify-center gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < testimonials[current].rating ? "text-amber-500 fill-amber-500" : "text-foreground/20"}`}
                    />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-foreground/70 leading-relaxed mb-6 italic">
                  &ldquo;{testimonials[current].content}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-foreground">{testimonials[current].name}</p>
                  <p className="text-xs text-foreground/40">
                    {testimonials[current].role} &middot; {testimonials[current].company}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={prev}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                  className={`h-2 rounded-full transition-all ${
                    i === current ? "w-6 bg-primary" : "w-2 bg-foreground/20 hover:bg-foreground/30"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
