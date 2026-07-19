"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Database,
  Zap,
  Image as ImageIcon,
  FolderGit2,
  BookOpen,
  CheckCircle2,
  Code,
  Terminal,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const foundationServices = [
    {
      name: "MongoDB Connection Pool",
      description:
        "Mongoose integration supporting automated connection pooling and schema mappings.",
      icon: Database,
      status: "Verified & Connected",
    },
    {
      name: "Redis Client Caching",
      description: "High-throughput cache broker using ioredis, pre-configured for hot-reloads.",
      icon: Zap,
      status: "Active & Cached",
    },
    {
      name: "ImageKit Media Store",
      description: "Cloud-hosted asset storage client for serving optimized, responsive assets.",
      icon: ImageIcon,
      status: "Client Ready",
    },
    {
      name: "BullMQ Job Orchestrator",
      description: "Reliable background processing framework built to manage async tasks.",
      icon: Terminal,
      status: "Queue Initialized",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative z-10 max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            Phase 0: Foundation Complete
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            DropshopNN
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Enterprise-grade logistics orchestration, order ingestion, and multi-tenant warehouse
            dropshipping manager. The backend foundation is ready for scaling.
          </p>
        </motion.div>

        {/* Services Status Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-16"
        >
          {foundationServices.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -4, borderColor: "rgba(99, 102, 241, 0.4)" }}
              className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md transition-all duration-300 flex items-start gap-4"
            >
              <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <service.icon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-semibold text-slate-200 text-base">{service.name}</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 uppercase tracking-wide">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {service.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-normal">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Directories Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="w-full mt-8 p-6 rounded-xl bg-slate-950/60 border border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-200">Modular Feature Directory Frameworks</h3>
              <p className="text-xs text-slate-500 mt-1">
                Base feature modules created with Domain, Service, and Repository layers.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {["Auth", "Products", "Orders", "Payments", "Courier", "Inventory"].map((mod) => (
              <span
                key={mod}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-300"
              >
                {mod}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mt-12 w-full justify-center"
        >
          <Button
            size="lg"
            variant="default"
            className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-500 font-semibold px-8 py-3 rounded-full cursor-pointer flex items-center justify-center gap-2 group"
            onClick={() => window.open("/api/auth/signin", "_blank")}
          >
            Access Core API
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-slate-800 text-slate-300 hover:bg-slate-900/60 font-semibold px-8 py-3 rounded-full cursor-pointer flex items-center justify-center gap-2"
            onClick={() =>
              window.open(
                "file:///Users/parvez/code/dropshop-nn/docs/00-project-overview.md",
                "_blank",
              )
            }
          >
            <BookOpen className="w-4 h-4" />
            Read Architecture Docs
          </Button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900/60 text-center text-xs text-slate-600 relative z-10 w-full bg-slate-950/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 justify-center">
            <Code className="w-4 h-4 text-indigo-500/70" />
            <span>DropshopNN Framework Foundation</span>
          </div>
          <p>© 2026 DropshopNN. Built with Next.js 16, React 19 & Tailwind CSS v4.</p>
        </div>
      </footer>
    </div>
  );
}
