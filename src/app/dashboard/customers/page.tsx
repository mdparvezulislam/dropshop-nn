"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  listCustomersAction,
  createCustomerAction,
  updateCustomerAction,
  addAddressAction,
  addNoteAction,
  updateTagsAction,
} from "@/features/customer/actions/customer-actions";
import { toast } from "sonner";
import {
  Users,
  Search,
  Plus,
  MapPin,
  ClipboardList,
  Tag,
  FileText,
  BarChart3,
  UserCheck,
  Shield,
} from "lucide-react";

export default function UnifiedCustomersPage() {
  const { data: session } = useSession() as any;
  const isReseller = session?.user?.role === "Reseller";

  const [customers, setCustomers] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCustomer, setSelectedCustomer] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Forms modals / toggles
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const [showNoteModal, setShowNoteModal] = React.useState(false);
  const [showTagsModal, setShowTagsModal] = React.useState(false);

  // Form input fields
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [alternativePhone, setAlternativePhone] = React.useState("");
  const [gender, setGender] = React.useState<"male" | "female" | "other" | "">("");
  const [birthDate, setBirthDate] = React.useState("");

  const [addressType, setAddressType] = React.useState<
    "home" | "office" | "warehouse" | "custom" | "store"
  >("home");
  const [division, setDivision] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [upazila, setUpazila] = React.useState("");
  const [area, setArea] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [landmark, setLandmark] = React.useState("");
  const [isDefault, setIsDefault] = React.useState(false);

  const [noteText, setNoteText] = React.useState("");
  const [isPrivate, setIsPrivate] = React.useState(false);

  const [tagsInput, setTagsInput] = React.useState("");

  const loadData = async (query?: string) => {
    setLoading(true);
    try {
      const res = await listCustomersAction(query);
      if (res.success && res.data) {
        setCustomers(res.data);
        if (selectedCustomer) {
          const fresh = res.data.find((c) => c.id === selectedCustomer.id);
          if (fresh) setSelectedCustomer(fresh);
        }
      }
    } catch (err) {
      toast.error("Failed to load customer profiles");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(searchQuery);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createCustomerAction({
        workspaceId: isReseller ? session.user.id : "admin-platform",
        name,
        phone,
        email: email || undefined,
        alternativePhone: alternativePhone || undefined,
        gender: gender || undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        source: "manual",
      });

      if (res.success) {
        toast.success("Customer profile created successfully");
        setShowCreateModal(false);
        // Reset forms
        setName("");
        setPhone("");
        setEmail("");
        setAlternativePhone("");
        setGender("");
        setBirthDate("");
        loadData();
      } else {
        toast.error(res.error || "Failed to create profile");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create profile");
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      const res = await addAddressAction({
        customerId: selectedCustomer.id,
        type: addressType,
        division,
        district,
        upazila,
        area,
        postalCode: postalCode || undefined,
        landmark: landmark || undefined,
        isDefault,
      });

      if (res.success) {
        toast.success("Billing address added successfully");
        setShowAddressModal(false);
        setDivision("");
        setDistrict("");
        setUpazila("");
        setArea("");
        setPostalCode("");
        setLandmark("");
        setIsDefault(false);
        loadData();
      } else {
        toast.error(res.error || "Failed to add address");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add address");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      const res = await addNoteAction({
        customerId: selectedCustomer.id,
        note: noteText,
        isPrivate,
      });

      if (res.success) {
        toast.success("Customer note remark added");
        setShowNoteModal(false);
        setNoteText("");
        setIsPrivate(false);
        loadData();
      } else {
        toast.error(res.error || "Failed to add note");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add note");
    }
  };

  const handleUpdateTags = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const res = await updateTagsAction({
        customerId: selectedCustomer.id,
        tags: tagsArray,
      });

      if (res.success) {
        toast.success("Customer segment tags updated");
        setShowTagsModal(false);
        setTagsInput("");
        loadData();
      } else {
        toast.error(res.error || "Failed to update tags");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update tags");
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  // Filter notes based on reseller permissions: resellers cannot view private admin notes
  const getVisibleNotes = (notesList: any[]) => {
    if (!notesList) return [];
    if (isReseller) {
      return notesList.filter((n) => !n.isPrivate);
    }
    return notesList;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Customer Relationship Workspace
          </h1>
          <p className="text-sm text-slate-400">
            Track profiles, address books, stats, segment tags, and timeline events
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-xs"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search by Name, Phone, Email, or Tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border-slate-850 text-xs text-white"
                />
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500">
                  <Search className="h-4 w-4" /> Search
                </Button>
              </form>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-850 hover:bg-transparent">
                      <TableHead className="text-slate-400">Name</TableHead>
                      <TableHead className="text-slate-400">Phone</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Tags</TableHead>
                      <TableHead className="text-slate-400 text-right">Orders</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-500 text-xs">
                          No customer profiles matched search query
                        </TableCell>
                      </TableRow>
                    ) : (
                      customers.map((c) => (
                        <TableRow
                          key={c.id}
                          onClick={() => setSelectedCustomer(c)}
                          className={`border-slate-850 cursor-pointer transition-colors ${
                            selectedCustomer?.id === c.id
                              ? "bg-slate-900/80"
                              : "hover:bg-slate-900/30"
                          }`}
                        >
                          <TableCell className="font-semibold text-slate-200">{c.name}</TableCell>
                          <TableCell className="font-mono text-xs text-slate-300">
                            {c.phone}
                          </TableCell>
                          <TableCell>
                            <Badge variant={c.status === "active" ? "success" : "destructive"}>
                              {c.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {c.tags?.map((t: string) => (
                                <Badge
                                  key={t}
                                  className="bg-indigo-950 text-indigo-300 text-[9px] hover:bg-indigo-900"
                                >
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold text-white">
                            {c.statistics?.totalOrders || 0}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-slate-800 bg-slate-900/50 min-h-[450px]">
            {!selectedCustomer ? (
              <div className="h-96 flex flex-col items-center justify-center text-center text-slate-500 p-6">
                <Users className="h-10 w-10 mb-2 opacity-50 text-indigo-400" />
                <span className="text-xs">
                  Select a customer from the registry to view details, timeline updates, notes, and
                  metrics
                </span>
              </div>
            ) : (
              <div className="p-5 space-y-6">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{selectedCustomer.name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                      ID: {selectedCustomer.id}
                    </span>
                  </div>
                  <Badge variant={selectedCustomer.status === "active" ? "success" : "destructive"}>
                    {selectedCustomer.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">
                      Mobile Phone
                    </span>
                    <span className="text-xs text-slate-200 font-mono font-semibold">
                      {selectedCustomer.phone}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">
                      Email Address
                    </span>
                    <span className="text-xs text-slate-200 font-semibold">
                      {selectedCustomer.email || "N/A"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">
                      Gender
                    </span>
                    <span className="text-xs text-slate-200 capitalize">
                      {selectedCustomer.gender || "N/A"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">
                      Total Spend
                    </span>
                    <span className="text-xs text-emerald-400 font-mono font-semibold">
                      {formatCurrency(selectedCustomer.statistics?.totalSpend || 0)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Address Book (
                      {selectedCustomer.addresses?.length || 0})
                    </h4>
                    <Button
                      onClick={() => setShowAddressModal(true)}
                      size="sm"
                      className="bg-indigo-650 hover:bg-indigo-600 h-6 text-[10px]"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedCustomer.addresses?.map((a: any) => (
                      <div
                        key={a.id}
                        className="p-2 rounded bg-slate-950/60 border border-slate-900 text-[10px]"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-indigo-300 capitalize">{a.type}</span>
                          {a.isDefault && (
                            <Badge className="text-[8px] h-4 bg-emerald-950 text-emerald-300">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-400">
                          {a.area}, {a.upazila}, {a.district}, {a.division}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Notes Remark (
                      {getVisibleNotes(selectedCustomer.notes).length})
                    </h4>
                    <Button
                      onClick={() => setShowNoteModal(true)}
                      size="sm"
                      className="bg-indigo-650 hover:bg-indigo-600 h-6 text-[10px]"
                    >
                      Add Note
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {getVisibleNotes(selectedCustomer.notes).map((n: any) => (
                      <div
                        key={n.id}
                        className="p-2 rounded bg-slate-950/60 border border-slate-900 text-[10px] space-y-1"
                      >
                        <div className="flex justify-between text-slate-500">
                          <span>By {n.authorId.slice(-6)}</span>
                          <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-300">{n.note}</p>
                        {n.isPrivate && (
                          <Badge className="text-[8px] h-4 bg-rose-950 text-rose-300">
                            Private Admin Only
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5" /> Client Timeline Logs
                    </h4>
                  </div>
                  <div className="space-y-3 max-h-40 overflow-y-auto pl-2 border-l border-slate-800">
                    {selectedCustomer.timeline?.map((t: any, idx: number) => (
                      <div key={idx} className="relative text-[10px]">
                        <div className="absolute -left-[14.5px] top-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        <span className="text-[8px] text-slate-500 font-mono block">
                          {new Date(t.timestamp).toLocaleString()}
                        </span>
                        <p className="text-slate-300 mt-0.5">{t.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* 1. Modal: Create Customer */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="border-slate-800 bg-slate-900 text-white w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Add Customer Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Name</label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Mobile Phone</label>
                  <Input
                    required
                    placeholder="e.g. 01700000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Email Address</label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Alternative Phone</label>
                  <Input
                    value={alternativePhone}
                    onChange={(e) => setAlternativePhone(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500"
                  >
                    Create Profile
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    variant="secondary"
                    className="text-xs h-9"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. Modal: Add Address */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="border-slate-800 bg-slate-900 text-white w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> Add Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Address Type</label>
                  <select
                    value={addressType}
                    onChange={(e: any) => setAddressType(e.target.value)}
                    className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-2.5 text-xs text-white outline-none"
                  >
                    <option value="home">Home</option>
                    <option value="office">Office</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="store">Store</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-slate-400">Division</label>
                    <Input
                      required
                      placeholder="e.g. Dhaka"
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-slate-400">District</label>
                    <Input
                      required
                      placeholder="e.g. Dhaka"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-slate-400">Upazila</label>
                    <Input
                      required
                      placeholder="e.g. Mirpur"
                      value={upazila}
                      onChange={(e) => setUpazila(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-slate-400">Postal Code</label>
                    <Input
                      placeholder="e.g. 1216"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">
                    Area details / Road / Address
                  </label>
                  <Input
                    required
                    placeholder="House 12, Road 4, Sector 6"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    id="isDefaultCheck"
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor="isDefaultCheck" className="text-xs text-slate-300">
                    Set as default shipping address
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500"
                  >
                    Add Address
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    variant="secondary"
                    className="text-xs h-9"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. Modal: Add Note */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="border-slate-800 bg-slate-900 text-white w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Add Note Remark
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddNote} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Note Content</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter remark details..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full rounded border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-indigo-650"
                  />
                </div>
                {!isReseller && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      id="isPrivateCheck"
                      className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
                    />
                    <label htmlFor="isPrivateCheck" className="text-xs text-slate-300">
                      Set as Private Admin-only Note
                    </label>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500"
                  >
                    Add Note
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowNoteModal(false)}
                    variant="secondary"
                    className="text-xs h-9"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
