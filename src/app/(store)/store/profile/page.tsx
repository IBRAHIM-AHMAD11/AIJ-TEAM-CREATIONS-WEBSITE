"use client"

import { useState, useRef, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCurrentUser } from "@/features/auth/use-current-user";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader, Mail, ShieldCheck, Save, KeyRound, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  const visible = name.slice(0, Math.min(3, name.length));
  const masked = visible + "*".repeat(Math.max(name.length - 3, 1));
  return masked + "@" + domain;
}

const ProfilePage = () => {
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useMutation(api.users.updateProfile);
  const changePassword = useAction(api.changePassword.changePassword);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPending, setResetPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  if (isLoading) {
    return (
      <div className="px-4 pt-4 flex items-center justify-center h-64">
        <Loader className="size-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, image });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setResetPending(true);
    try {
      await changePassword({ newPassword });
      setShowSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to change password";
      toast.error(message);
    } finally {
      setResetPending(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setNewPassword("");
        setConfirmPassword("");
        setShowSuccess(false);
      }, 200);
    }
  };

  const avatarFallback = (user.name ?? "U").charAt(0).toUpperCase();

  return (
    <div className="px-4 pt-4 max-w-2xl mx-auto">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Store", href: "/store" }, { label: "Profile" }]} />

      <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-6">My Profile</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="size-20">
              <AvatarImage alt={user.name} src={imagePreview ?? user.image ?? undefined} />
              <AvatarFallback className="text-xl">{avatarFallback}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 size-7 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Camera className="size-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <div className="flex items-center gap-2">
              <Input value={user.email ?? ""} disabled className="bg-gray-50" />
              {user.emailVerificationTime ? (
                <span className="flex items-center gap-1 text-xs text-green-600 shrink-0">
                  <ShieldCheck className="size-3.5" /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-amber-600 shrink-0">
                  <Mail className="size-3.5" /> Unverified
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
              Save Changes
            </Button>

            <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger className={buttonVariants({ variant: "outline" })}>
                <Button variant="outline">
                  <KeyRound className="size-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    {showSuccess
                      ? "Your password has been updated."
                      : `Set a new password for ${maskEmail(user.email ?? "")}.`}
                  </DialogDescription>
                </DialogHeader>

                <AnimatePresence mode="wait">
                  {showSuccess ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center gap-3 py-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                      >
                        <CheckCircle2 className="size-12 text-green-500" />
                      </motion.div>
                      <p className="text-sm text-green-600 font-medium">Password changed successfully!</p>
                      <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="mt-1">
                        Close
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <Input
                          type="password"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={resetPending}
                          required
                          minLength={8}
                        />
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={resetPending}
                          required
                          minLength={8}
                        />
                        <Button type="submit" className="w-full" disabled={resetPending || !newPassword || !confirmPassword}>
                          {resetPending ? <Loader className="size-4 animate-spin mr-2" /> : null}
                          Change Password
                        </Button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;