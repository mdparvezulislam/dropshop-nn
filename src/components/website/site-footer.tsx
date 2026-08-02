import Link from "next/link";
import { BRAND } from "@/config/brand";
import type { PublicCategoryInfo } from "@/features/catalog/domain/public-catalog-types";
import { Truck, Store, ShieldCheck, Zap, Phone, Mail, MapPin } from "lucide-react";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TiktokIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.98-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.24 1.59-1.22 2.58.01 1.25.75 2.42 1.88 2.87 1.07.45 2.37.24 3.21-.52.75-.68 1.12-1.74 1.09-2.75.02-5.35.01-10.71.01-16.06z" />
    </svg>
  );
}

interface FooterLink {
  label: string;
  href: string;
}

const STATIC_COLUMNS: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "প্রোডাক্ট",
    links: [
      { label: "সব প্রোডাক্ট", href: "/products" },
      { label: "ফ্ল্যাশ সেল", href: "/offers" },
      { label: "New Arrivals", href: "/products?sort=newest" },
      { label: "জনপ্রিয় প্রোডাক্ট", href: "/products?sort=featured" },
    ],
  },
  {
    title: "পার্টনারশিপ",
    links: [
      { label: "রিসেলার পোর্টালে যুক্ত হন", href: "/become-reseller" },
      { label: "হোলসেলার বিটুবি পোর্টাল", href: "/become-wholesale-partner" },
      { label: "রিসেলার ওয়ালেট ও উইথড্র", href: "/account" },
      { label: "অর্ডার ট্র্যাকিং", href: "/track-order" },
    ],
  },
  {
    title: "সহায়তা",
    links: [
      { label: "সাপোর্ট সেন্টার", href: "/support" },
      { label: "শর্তাবলী", href: "/terms" },
      { label: "রিটার্ন পলিসি", href: "/refund" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "কোম্পানি",
    links: [
      { label: "আমাদের সম্পর্কে", href: "/about" },
      { label: "যোগাযোগ", href: "/contact" },
      { label: "ব্লগ", href: "/blog" },
      { label: "ক্যারিয়ার", href: "/careers" },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com/dropshopnn" },
  { icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com/dropshopnn" },
  { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com/dropshopnn" },
  { icon: TiktokIcon, label: "TikTok", href: "https://tiktok.com/@dropshopnn" },
];

export interface SiteFooterProps {
  categories?: PublicCategoryInfo[];
}

export function SiteFooter({ categories = [] }: SiteFooterProps): React.ReactElement {
  const categoryLinks: FooterLink[] = categories
    .filter((c) => c.parentCategoryId === null)
    .slice(0, 4)
    .map((c) => ({ label: c.name, href: `/category/${c.slug}` }));

  const columns: Array<{ title: string; links: FooterLink[] }> = [
    STATIC_COLUMNS[0],
    STATIC_COLUMNS[1],
    ...(categoryLinks.length > 0 ? [{ title: "ক্যাটাগরি", links: categoryLinks }] : []),
    STATIC_COLUMNS[2],
    STATIC_COLUMNS[3],
  ];

  return (
    <footer className="bg-[#0b1120] text-slate-200 pt-10 sm:pt-16 pb-8 border-t border-slate-800 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Value Proposition Badges Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">⚡ Steadfast 1-Click Pickup</p>
              <p className="text-[11px] text-slate-400">সমগ্র বাংলাদেশে দ্রুততম হোম ডেলিভারি</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">১০০% নিরাপদ ক্যাশ অন ডেলিভারি</p>
              <p className="text-[11px] text-slate-400">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">রিসেলার ও বিটুবি হোলসেল</p>
              <p className="text-[11px] text-slate-400">জিরো ইনভেস্টমেন্টে ড্রপশিপিং সুবিধা</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">ইনস্ট্যান্ট বিকাশ payout</p>
              <p className="text-[11px] text-slate-400">প্রফিট উইথড্রল বিকাশ ও নগদে</p>
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-8 pb-10 border-b border-slate-800">
          {/* Logo & Tagline Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-xl shadow-md">
                N
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white leading-none">
                  NN <span className="text-amber-500">Enterprise</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Commerce OS
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              বাংলাদেশের সেরা ড্রপশিপিং এবং বিটুবি হোলসেল প্ল্যাটফর্ম। আপনার ডিজিটাল ই-কমার্স ব্যবসায় সাফল্য আমাদের একমাত্র লক্ষ্য।
            </p>

            {/* Direct Social Links */}
            <div className="flex items-center gap-2.5 pt-1">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/80 text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-all border border-slate-700/80"
                >
                  <s.icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {columns.map((column) => (
            <nav key={column.title} className="space-y-3" aria-label={column.title}>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Payment & Courier Badges Bar */}
        <div className="py-4 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-extrabold text-slate-300">পেমেন্ট মেথড:</span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 text-amber-400 font-black border border-slate-800 text-[11px]">
              bKash
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 text-amber-400 font-black border border-slate-800 text-[11px]">
              Nagad
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 text-slate-200 font-bold border border-slate-800 text-[11px]">
              VISA
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 text-slate-200 font-bold border border-slate-800 text-[11px]">
              Mastercard
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 text-emerald-400 font-bold border border-slate-800 text-[11px]">
              Cash On Delivery
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-extrabold text-slate-300">কুরিয়ার পার্টনার:</span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 text-amber-400 font-black border border-slate-800 text-[11px]">
              ⚡ Steadfast Courier
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 text-slate-200 font-bold border border-slate-800 text-[11px]">
              Pathao Courier
            </span>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>{BRAND.copyright}</p>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/privacy" className="hover:text-amber-400 transition-colors">
              প্রাইভেসি পলিসি
            </Link>
            <span aria-hidden>|</span>
            <Link href="/terms" className="hover:text-amber-400 transition-colors">
              শর্তাবলী
            </Link>
            <span aria-hidden>|</span>
            <Link href="/refund" className="hover:text-amber-400 transition-colors">
              রিটার্ন পলিসি
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
