"use client";

import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, Truck, CreditCard, Headset } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    label: "অরিজিনাল প্রোডাক্ট",
    description: "১০০% অরিজিনাল ও গ্যারান্টি",
  },
  {
    icon: TrendingUp,
    label: "সহজ ড্রপশিপিং",
    description: "বীজ ছাড়াই ব্যবসা শুরু করুন",
  },
  {
    icon: Truck,
    label: "ফাস্ট ডেলিভারি",
    description: "সারা বাংলাদেশে দ্রুত ডেলিভারি",
  },
  {
    icon: CreditCard,
    label: "সিকিউর পেমেন্ট",
    description: "বিকাশ ও ডিজিটাল পেমেন্ট",
  },
  {
    icon: Headset,
    label: "২৪/৭ সাপোর্ট",
    description: "যেকোনো সময় সহায়তা পান",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
};

export function TrustSection(): React.ReactElement {
  return (
    <section
      className="w-full py-6 lg:py-8 bg-white border-y border-slate-200"
      aria-label="Trust Bar"
    >
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4"
        >
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                variants={itemVariants}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-300 hover:border-amber-400 hover:shadow-xs transition-all duration-300 group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    {item.label}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-600 leading-tight mt-0.5">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default TrustSection;
