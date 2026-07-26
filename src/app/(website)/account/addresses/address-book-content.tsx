"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  addAddressAction,
  updateAddressAction,
  deleteAddressAction,
} from "@/features/identity/actions/account-actions";

interface Address {
  id: string;
  type: string;
  fullName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  area: string;
  postalCode?: string;
  landmark?: string;
  isDefault: boolean;
}

interface AddressFormData {
  type: "home" | "office" | "warehouse" | "custom" | "store";
  fullName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  area: string;
  postalCode?: string;
  landmark?: string;
  isDefault: boolean;
}

const emptyForm: AddressFormData = {
  type: "home",
  fullName: "",
  phone: "",
  division: "",
  district: "",
  upazila: "",
  area: "",
  isDefault: false,
};

function AddressForm({
  data,
  onChange,
  onCancel,
  onSubmit,
  loading,
  isEditing,
}: {
  data: AddressFormData;
  onChange: (d: AddressFormData) => void;
  onCancel: () => void;
  onSubmit: () => void;
  loading: boolean;
  isEditing: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Full Name</label>
          <input
            value={data.fullName}
            onChange={(e) => onChange({ ...data, fullName: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Phone</label>
          <input
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <select
            value={data.type}
            onChange={(e) => onChange({ ...data, type: e.target.value as any })}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
          >
            <option value="home">Home</option>
            <option value="office">Office</option>
            <option value="warehouse">Warehouse</option>
            <option value="custom">Custom</option>
            <option value="store">Store</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Division</label>
          <input
            value={data.division}
            onChange={(e) => onChange({ ...data, division: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">District</label>
          <input
            value={data.district}
            onChange={(e) => onChange({ ...data, district: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Upazila</label>
          <input
            value={data.upazila}
            onChange={(e) => onChange({ ...data, upazila: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Area</label>
          <input
            value={data.area}
            onChange={(e) => onChange({ ...data, area: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Postal Code</label>
          <input
            value={data.postalCode ?? ""}
            onChange={(e) => onChange({ ...data, postalCode: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Landmark</label>
          <input
            value={data.landmark ?? ""}
            onChange={(e) => onChange({ ...data, landmark: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={data.isDefault}
          onChange={(e) => onChange({ ...data, isDefault: e.target.checked })}
          className="rounded border-input"
        />
        Set as default address
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button size="sm" onClick={onSubmit} disabled={loading}>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isEditing ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export function AddressBookContent({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormData>(emptyForm);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (addr: Address) => {
    setForm({
      type: addr.type as any,
      fullName: addr.fullName,
      phone: addr.phone,
      division: addr.division,
      district: addr.district,
      upazila: addr.upazila,
      area: addr.area,
      postalCode: addr.postalCode,
      landmark: addr.landmark,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingId) {
        const res = await updateAddressAction(editingId, form);
        if (res.success) {
          setAddresses((prev) =>
            prev.map((a) =>
              a.id === editingId
                ? ({ ...a, ...form, id: editingId } as Address)
                : form.isDefault
                  ? { ...a, isDefault: false }
                  : a,
            ),
          );
          setModalOpen(false);
          resetForm();
        }
      } else {
        const res = await addAddressAction(form);
        if (res.success && res.data) {
          const newAddr: Address = {
            id: res.data.id,
            type: form.type,
            fullName: form.fullName,
            phone: form.phone,
            division: form.division,
            district: form.district,
            upazila: form.upazila,
            area: form.area,
            postalCode: form.postalCode,
            landmark: form.landmark,
            isDefault: form.isDefault,
          };
          setAddresses((prev) =>
            form.isDefault
              ? prev.map((a) => ({ ...a, isDefault: false })).concat(newAddr)
              : [...prev, newAddr],
          );
          setModalOpen(false);
          resetForm();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteAddressAction(id);
    if (res.success) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Addresses</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your saved addresses.</p>
        </div>
        <Button size="sm" onClick={openAdd} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <MapPin className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No addresses saved yet.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={openAdd}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr, i) => (
            <motion.div
              key={addr.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={addr.isDefault ? "ring-1 ring-primary/30" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {addr.type}
                      </Badge>
                      {addr.isDefault && (
                        <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 gap-1">
                          <Star className="h-2.5 w-2.5" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(addr)}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/60 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(addr.id)}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-md hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium">{addr.fullName}</p>
                  <p className="text-xs text-muted-foreground">{addr.phone}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {addr.area}, {addr.upazila}, {addr.district}, {addr.division}
                  </p>
                  {(addr.postalCode || addr.landmark) && (
                    <p className="text-xs text-muted-foreground">
                      {addr.postalCode && `Postal: ${addr.postalCode}`}
                      {addr.postalCode && addr.landmark && " · "}
                      {addr.landmark && addr.landmark}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              {editingId ? "Edit Address" : "Add Address"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingId ? "Update your saved address." : "Add a new delivery address."}
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            data={form}
            onChange={setForm}
            onCancel={() => {
              setModalOpen(false);
              resetForm();
            }}
            onSubmit={handleSubmit}
            loading={loading}
            isEditing={!!editingId}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
