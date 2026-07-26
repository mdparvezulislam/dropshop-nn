import Link from "next/link";
import { Briefcase, ArrowRight, Sparkles, Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Careers at DropshopNN Bangladesh",
  description:
    "Join the team building Bangladesh's next-generation e-commerce and logistics platform.",
};

const JOBS = [
  {
    title: "Senior Full Stack Engineer (Next.js / Node.js)",
    department: "Engineering",
    location: "Dhaka / Hybrid",
    type: "Full Time",
  },
  {
    title: "Category Operations Manager (Electronics)",
    department: "Operations",
    location: "Dhaka",
    type: "Full Time",
  },
  {
    title: "Reseller Growth Specialist",
    department: "Marketing",
    location: "Dhaka",
    type: "Full Time",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <Briefcase className="w-3.5 h-3.5" /> Work With Us
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight mb-4">
            Build the Future of BD E-commerce
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            We are looking for driven engineers, operators, and growth marketers passionate about
            revolutionizing digital commerce in Bangladesh.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {JOBS.map((job, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-amber-500/40 transition-colors"
            >
              <div>
                <h3 className="text-base font-bold text-white mb-1">{job.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{job.department}</span>
                  <span>•</span>
                  <span>{job.location}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">{job.type}</span>
                </div>
              </div>
              <Link
                href="/contact?type=career"
                className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0 inline-flex items-center gap-1.5"
              >
                Apply Now <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
