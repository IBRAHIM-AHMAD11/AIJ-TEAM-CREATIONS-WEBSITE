"use client"

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCurrentUser } from "@/features/auth/use-current-user";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader, Mail, ShieldCheck, Save, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";

const ProfilePage = () => {
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useMutation(api.users.updateProfile);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resetStep, setResetStep] = useState<"idle" | "sent" | "done">("idle");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetPending, setResetPending] = useState(false);
  const { signIn } = useAuthActions();

  if (isLoading) {
    return (
      <div className="px-4 pt-4 flex items-center justify-center h-64">
        <Loader className="size-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) return null;

  useEffect(() => {
    setName(user.name ?? "");
  }, [user.name]);

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

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPending(true);
    try {
      await signIn("password", { email: resetEmail, flow: "reset" });
      setResetStep("sent");
    } catch {
      toast.error("Failed to send reset code");
    } finally {
      setResetPending(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPending(true);
    try {
      await signIn("password", {
        email: resetEmail,
        code: resetCode,
        newPassword,
        flow: "reset-verification",
      });
      toast.success("Password changed successfully");
      setResetStep("done");
    } catch {
      toast.error("Invalid code or failed to reset password");
    } finally {
      setResetPending(false);
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

            <Dialog>
              <DialogTrigger>
                <Button variant="outline">
                  <KeyRound className="size-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    A reset code will be sent to your email.
                  </DialogDescription>
                </DialogHeader>

                {resetStep === "idle" && (
                  <form onSubmit={handleSendResetCode} className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                    <Button type="submit" disabled={resetPending} className="w-full">
                      {resetPending ? <Loader className="size-4 animate-spin mr-2" /> : null}
                      Send Reset Code
                    </Button>
                  </form>
                )}

                {resetStep === "sent" && (
                  <form onSubmit={handleCompleteReset} className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Enter 8-digit code"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      required
                    />
                    <Input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <Button type="submit" disabled={resetPending} className="w-full">
                      {resetPending ? <Loader className="size-4 animate-spin mr-2" /> : null}
                      Change Password
                    </Button>
                  </form>
                )}

                {resetStep === "done" && (
                  <p className="text-sm text-green-600 text-center py-4">
                    Password changed successfully!
                  </p>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
