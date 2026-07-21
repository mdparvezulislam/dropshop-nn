import Link from "next/link";
import { Download, Package, FileArchive, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketing Kits & Downloads - DropshopNN Account",
  description: "Download promotional banners, HD product photos, and product data sheets.",
};

const DOWNLOADS = [
  {
    id: "dl-1",
    title: "UGREEN Nexode 65W Marketing Kit (HD Images + Copywriting)",
    fileSize: "45.2 MB",
    type: "ZIP Media Bundle",
    date: "2026-07-20",
  },
  {
    id: "dl-2",
    title: "Baseus Blade 100W Power Bank Facebook Ad Templates",
    fileSize: "18.6 MB",
    type: "PSD & Canva Assets",
    date: "2026-07-19",
  },
];

export default function AccountDownloadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
            <Download className="w-6 h-6 text-amber-400" /> Reseller Downloads & Kits
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access high-res product photos, video ads, and product spec sheets for social selling.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOWNLOADS.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md hover:border-amber-500/30 transition-colors flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <FileArchive className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
                <span>{item.type}</span>
                <span>•</span>
                <span>{item.fileSize}</span>
              </div>
              <button className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors">
                <Download className="w-3.5 h-3.5" /> Download ZIP
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
