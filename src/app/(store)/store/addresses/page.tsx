"use client"

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/features/auth/use-current-user";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Loader, Plus, MapPin, Pencil, Trash2, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type AddressForm = {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

const emptyForm = (): AddressForm => ({
  name: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
  isDefault: false,
});

const AddressesPage = () => {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const addresses = useQuery(api.addresses.list);
  const createAddress = useMutation(api.addresses.create);
  const updateAddress = useMutation(api.addresses.update);
  const removeAddress = useMutation(api.addresses.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"addresses"> | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  if (userLoading) {
    return (
      <div className="px-4 pt-4 flex items-center justify-center h-64">
        <Loader className="size-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) return null;

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (id: Id<"addresses">) => {
    const addr = addresses?.find((a) => a._id === id);
    if (!addr) return;
    setEditingId(id);
    setForm({
      name: addr.name,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateAddress({ id: editingId, ...form });
        toast.success("Address updated");
      } else {
        await createAddress(form);
        toast.success("Address added");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: Id<"addresses">) => {
    try {
      await removeAddress({ id });
      toast.success("Address removed");
    } catch {
      toast.error("Failed to remove address");
    }
  };

  return (
    <div className="px-4 pt-4 max-w-2xl mx-auto">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Store", href: "/store" }, { label: "Addresses" }]} />

      <div className="flex items-center justify-between mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Addresses</h1>
        <Button onClick={openNew}>
          <Plus className="size-4 mr-2" />
          Add Address
        </Button>
      </div>

      <div className="space-y-3">
        {addresses?.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            No addresses saved yet. Add one to get started.
          </p>
        )}

        {addresses?.map((addr) => (
          <Card key={addr._id} className={addr.isDefault ? "border-blue-400" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {addr.name}
                      {addr.isDefault && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-blue-600">
                          <Star className="size-3" /> Default
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{addr.street}</p>
                    <p className="text-sm text-gray-600">
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                    <p className="text-sm text-gray-600">{addr.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(addr._id)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(addr._id)}>
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Address" : "Add Address"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <Input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              placeholder="Street address"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
              <Input
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="ZIP code"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
                required
              />
              <Input
                placeholder="Country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                required
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.isDefault}
                onCheckedChange={(checked) => setForm({ ...form, isDefault: !!checked })}
              />
              Set as default address
            </label>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? <Loader className="size-4 animate-spin mr-2" /> : null}
              {editingId ? "Update" : "Add"} Address
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressesPage;
