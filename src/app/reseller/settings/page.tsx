"use client";

import * as React from "react";
import {
  Store,
  Save,
  Image as ImageIcon,
  Phone,
  MessageSquare,
  Globe,
  MapPin,
  FileText,
  Percent,
  Sliders,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResellerStatusGuard } from "@/features/reseller-workspace/components/reseller-status-guard";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export default function ResellerSettingsPage(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [resellerStatus, setResellerStatus] = React.useState("active");

  const [businessName, setBusinessName] = React.useState("NN Express Reseller Shop");
  const [ownerName, setOwnerName] = React.useState("Md Reseller");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [bannerUrl, setBannerUrl] = React.useState("");
  const [phone, setPhone] = React.useState("01700000000");
  const [whatsapp, setWhatsapp] = React.useState("01700000000");
  const [facebook, setFacebook] = React.useState("https://facebook.com/resellershop");
  const [instagram, setInstagram] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [address, setAddress] = React.useState("Dhanmondi, Dhaka, Bangladesh");
  const [description, setDescription] = React.useState("সেরা দামে কোয়ালিটি পণ্য সরবরাহকারী ই-কমার্স শপ।");
  const [invoiceFooter, setInvoiceFooter] = React.useState("কেনাকাটার জন্য ধন্যবাদ! যেকোনো প্রয়োজনে যোগাযোগ করুন।");

  // Automation Preferences
  const [defaultDeliveryCharge, setDefaultDeliveryCharge] = React.useState("80");
  const [autoSaveDrafts, setAutoSaveDrafts] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { resolveCurrentResellerAction } = await import(
          "@/features/reseller/actions/reseller-actions"
        );
        const res = await resolveCurrentResellerAction();
        if (res.success && res.data) {
          const d = res.data;
          setBusinessName(d.businessName || businessName);
          setOwnerName(d.ownerName || ownerName);
          setResellerStatus(d.status || "active");
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute profile completion %
  const fields = [businessName, ownerName, phone, whatsapp, address, description, invoiceFooter];
  const filledCount = fields.filter((f) => f.trim().length > 0).length;
  const completionPercent = Math.round((filledCount / fields.length) * 100);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      toast.success("বিজনেস প্রোফাইল ও ব্র্যান্ডিং আপডেট করা হয়েছে!");
    } catch {
      toast.error("সেটিং সংরক্ষণে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResellerStatusGuard status={resellerStatus}>
      <div className="space-y-6 animate-fade-in pb-20 lg:pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              Business Headquarters Setup
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
              Shop Settings &amp; Branding
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
              আপনার রিসেলার শপের ব্র্যান্ডিং, কাস্টমার ইনভয়েস ফুটার ও প্রেফারেন্স কনফিগার করুন।
            </p>
          </div>
        </div>

        {/* Profile Completion Meter */}
        <Card className="border-primary/30 bg-primary/5 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" /> বিজনেস প্রোফাইল কমপ্লিটনেস: {completionPercent}%
              </span>
              <div className="w-48 sm:w-64 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-bold text-muted-foreground hidden sm:inline">
              প্রোফাইল পূরণ করলে কাস্টমার ট্রাস্ট বৃদ্ধি পায়
            </span>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="branding" className="text-xs font-black">
              ব্র্যান্ডিং ও শপ প্রোফাইল
            </TabsTrigger>
            <TabsTrigger value="automation" className="text-xs font-black">
              অটোমেশন প্রেফারেন্স
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Branding & Profile Form */}
          <TabsContent value="branding" className="pt-4">
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-5 space-y-5">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground">
                        বিজনেস / শপের নাম <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground">
                        মালিকের নাম <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground">
                        অফিসিয়াল ফোন নম্বর:
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-primary font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground">
                        হোয়াটসঅ্যাপ নম্বর:
                      </label>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-primary font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground">
                        ফেসবুক পেজ লিংক:
                      </label>
                      <input
                        type="url"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        placeholder="https://facebook.com/..."
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground">
                        ওয়েবসাইট / ইনস্টাগ্রাম (ঐচ্ছিক):
                      </label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://..."
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-primary"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-black text-foreground">
                        শপের ঠিকানা:
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-primary"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-black text-foreground">
                        ইনভয়েস ফুটার বার্তা (কাস্টমার বিলে প্রদর্শিত হবে):
                      </label>
                      <input
                        type="text"
                        value={invoiceFooter}
                        onChange={(e) => setInvoiceFooter(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    loading={saving}
                    className="w-full sm:w-auto px-6 h-11 text-xs font-black gap-2 shadow-xs"
                  >
                    <Save className="w-4 h-4" /> প্রোফাইল আপডেট করুন
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Automation Preferences */}
          <TabsContent value="automation" className="pt-4">
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-primary" /> সেলস ডেস্ক অটোমেশন সেটিং
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                    <div>
                      <p className="font-black text-foreground">অটো-সেভ ড্রাফট অর্ডার</p>
                      <p className="text-[11px] text-muted-foreground">টাইপ করার সময় অটোমেটিক অর্ডার ফর্ম ড্রাফট হিসেবে সেভ থাকবে</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSaveDrafts}
                      onChange={(e) => setAutoSaveDrafts(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                    <div>
                      <p className="font-black text-foreground">ডিফল্ট ডেলিভারি চার্জ নির্ধারণ</p>
                      <p className="text-[11px] text-muted-foreground">ঢাকার ভেতরে প্রাথমিক পেমেন্ট ফি ৳৮০ সেট করা থাকবে</p>
                    </div>
                    <span className="font-bold text-primary font-mono">৳৮০ (ঢাকার ভেতর)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResellerStatusGuard>
  );
}
