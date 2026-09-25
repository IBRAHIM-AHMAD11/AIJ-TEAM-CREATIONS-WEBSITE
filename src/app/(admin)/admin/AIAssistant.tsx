"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

/* ------------------------------- Types ------------------------------- */

export interface AIFeature {
  type: "color" | "size" | "material" | "dimension" | "finish" | "custom";
  label: string;
  value: string;
  unit?: string;
  priceAdjustmentRupees?: number;
}

export interface AIUpdate {
  field: string;
  stringValue?: string;
  numberValue?: number;
  features?: AIFeature[];
}

export interface AIFormContext {
  title: string;
  description: string;
  price: string;
  inventoryCount: number;
  uploadedImageCount: number;
  uploadedImageUrls: string[];
  categories: string[];
  existingFeatures: string[];
}

interface Attachment {
  mimeType: string;
  data: string; // base64, no prefix
  preview: string; // data url for thumbnails
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  previews?: string[];
  updates?: AIUpdate[];
  appliedIndices?: number[];
  error?: boolean;
}

interface AIAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formContext: AIFormContext;
  onApplyUpdates: (updates: AIUpdate[]) => Promise<void> | void;
}

/* ----------------------------- Constants ----------------------------- */

const FIELD_META: Record<string, { label: string; icon: string }> = {
  title: { label: "Product Title", icon: "📝" },
  slug: { label: "URL Slug", icon: "🔗" },
  description: { label: "Description", icon: "📄" },
  price: { label: "Price (Rs)", icon: "💰" },
  inventoryCount: { label: "Stock Count", icon: "📦" },
  category: { label: "Category", icon: "🗂️" },
  videoUrl: { label: "Video URL", icon: "🎬" },
  features: { label: "Features", icon: "🧩" },
};

const QUICK_ACTIONS = [
  {
    label: "🚀 Auto-fill from photos",
    needsFormImages: true,
    message:
      "Analyze my product images and auto-fill this listing (title, description, price, category, and features). Ask me about anything you can't determine from the photos.",
  },
  {
    label: "✍️ Write description",
    needsFormImages: false,
    message: "Write a compelling markdown product description for this product based on everything you know about it.",
  },
  {
    label: "💰 Suggest a price",
    needsFormImages: false,
    message: "Suggest a fair, competitive market price in Rs for this product, with a one-line justification.",
  },
  {
    label: "🧩 Suggest features",
    needsFormImages: false,
    message: "Suggest display features for this product (colors as CSS hex, materials, sizes, dimensions, finish).",
  },
  {
    label: "🗂️ Pick a category",
    needsFormImages: false,
    message: "Which category fits this product best? Prefer one of my existing categories if any fits.",
  },
];

const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------------------------- Image helper ---------------------------- */

function resizeImageToBase64(file: File, maxDim = 1024): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas failed"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve({ mimeType: "image/jpeg", data: dataUrl.split(",")[1], preview: dataUrl });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function previewValue(u: AIUpdate): string {
  if (u.field === "features" && u.features) {
    return u.features.map((f) => `${f.label}: ${f.value}${f.unit ? ` ${f.unit}` : ""}`).join("  •  ");
  }
  if (u.field === "price" || u.field === "inventoryCount") return String(u.numberValue ?? "");
  return u.stringValue || "";
}

/* ----------------------------- Component ----------------------------- */

export function AIAssistant({ open, onOpenChange, formContext, onApplyUpdates }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const [dragging, setDragging] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          text:
            "Hey! 👋 I'm Listing Copilot, powered by Gemini.\n\nDrop a product photo below (or hit \"Auto-fill from photos\") and I'll draft the title, description, price, category and features. Anything I can't tell from the photo, I'll just ask you.",
          appliedIndices: [],
        },
      ]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const handleFiles = async (files: File[]) => {
    const room = 4 - attachments.length;
    const imgs = files.filter((f) => f.type.startsWith("image/")).slice(0, room);
    if (!imgs.length) return;
    const processed: Attachment[] = [];
    for (const f of imgs) {
      try {
        processed.push(await resizeImageToBase64(f));
      } catch {
        /* skip undecodable files */
      }
    }
    setAttachments((prev) => [...prev, ...processed]);
  };

  const handleSend = async (opts?: { message?: string; useFormImages?: boolean }) => {
    if (sending) return;

    const text =
      (opts?.message ?? input).trim() ||
      (attachments.length > 0 ? "Analyze the attached product image(s) and suggest listing details." : "");
    if (!text) return;

    const imageUrls = opts?.useFormImages ? formContext.uploadedImageUrls.slice(0, 4) : [];
    if (opts?.useFormImages && imageUrls.length === 0) {
      toast.error("Upload at least one product image first — or attach a photo right here in the chat.");
      return;
    }

    const sentAttachments = attachments;
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text,
      previews: sentAttachments.map((a) => a.preview),
    };

    const history = [...messages, userMsg].slice(0, -1).slice(-10).map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachments([]);
    setSending(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history,
          message: text,
          images: sentAttachments.map((a) => ({ mimeType: a.mimeType, data: a.data })),
          imageUrls,
          context: formContext,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "The AI service is unavailable right now.");

      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", text: data.message || "Done!", updates: data.updates || [], appliedIndices: [] },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", text: err?.message || "Something went wrong. Please try again.", error: true, appliedIndices: [] },
      ]);
    } finally {
      setSending(false);
    }
  };

  const applyOne = async (msgId: string, index: number) => {
    const msg = messages.find((m) => m.id === msgId);
    const update = msg?.updates?.[index];
    if (!update) return;
    await onApplyUpdates([update]);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, appliedIndices: [...(m.appliedIndices || []), index] } : m))
    );
  };

  const applyAll = async (msg: ChatMessage) => {
    const pending = (msg.updates || []).filter((_, i) => !(msg.appliedIndices || []).includes(i));
    if (!pending.length) return;
    await onApplyUpdates(pending);
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, appliedIndices: (m.updates || []).map((_, i) => i) } : m))
    );
  };

  return (
    <>
      <style>{`
        @keyframes aiGlow {
          0%   { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.45); }
          50%  { box-shadow: 0 0 0 7px rgba(124, 58, 237, 0.12); border-color: #8b5cf6; }
          100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
        }
        .ai-glow { border-color: #8b5cf6 !important; animation: aiGlow 1.1s ease-in-out 2; }
      `}</style>

      {/* Floating launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="fixed bottom-6 right-6 z-[70] inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105 active:scale-95"
        >
          <span>✨</span> AI Autofill
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-[70] flex h-[min(640px,calc(100dvh-2.5rem))] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900 shadow-2xl shadow-indigo-950/50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/70 px-4 py-3">
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-white">✨ Listing Copilot</h3>
              <p className="text-[11px] text-slate-400">AI product assistant · powered by Gemini</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-7 w-7 rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Quick actions */}
          {messages.length <= 1 && !sending && (
            <div className="flex flex-wrap gap-1.5 border-b border-slate-800 p-3">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => handleSend({ message: a.message, useFormImages: a.needsFormImages })}
                  className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-[11px] font-medium text-slate-200 transition hover:border-indigo-500 hover:text-white"
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="relative flex-1">
            <div
              ref={scrollRef}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFiles(Array.from(e.dataTransfer.files));
              }}
              className="h-full space-y-3 overflow-y-auto p-3"
            >
              {messages.map((msg) => {
                if (msg.role === "user") {
                  return (
                    <div key={msg.id} className="flex flex-col items-end">
                      {msg.previews && msg.previews.length > 0 && (
                        <div className="mb-1.5 flex flex-wrap justify-end gap-1.5">
                          {msg.previews.map((p, i) => (
                            <img key={i} src={p} alt="attachment" className="h-14 w-14 rounded-lg border border-indigo-400/50 object-cover" />
                          ))}
                        </div>
                      )}
                      <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-indigo-600 px-3 py-2 text-sm text-white">
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                const pendingCount = (msg.updates || []).filter((_, i) => !(msg.appliedIndices || []).includes(i)).length;

                return (
                  <div key={msg.id} className="flex flex-col items-start">
                    <div
                      className={`max-w-[92%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-md px-3 py-2 text-sm ${
                        msg.error ? "border border-red-500/40 bg-red-500/10 text-red-300" : "bg-slate-800 text-slate-100"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {(msg.updates || []).map((u, idx) => {
                      const applied = (msg.appliedIndices || []).includes(idx);
                      const meta = FIELD_META[u.field] || { label: u.field, icon: "•" };
                      return (
                        <div
                          key={idx}
                          className={`mt-2 w-[92%] rounded-xl border p-2.5 ${
                            applied ? "border-emerald-500/40 bg-emerald-500/10" : "border-slate-700 bg-slate-800/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {meta.icon} {meta.label}
                            </span>
                            {applied ? (
                              <span className="text-[11px] font-semibold text-emerald-400">✓ Applied</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => applyOne(msg.id, idx)}
                                className="rounded-md bg-indigo-500 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-indigo-400"
                              >
                                Apply
                              </button>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 break-words whitespace-pre-wrap text-xs text-slate-300">
                            {previewValue(u)}
                          </p>
                        </div>
                      );
                    })}

                    {pendingCount > 1 && (
                      <button
                        type="button"
                        onClick={() => applyAll(msg)}
                        className="mt-2 w-[92%] rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                      >
                        ⚡ Apply all {pendingCount} changes
                      </button>
                    )}
                  </div>
                );
              })}

              {sending && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: "300ms" }} />
                  </span>
                  Thinking…
                </div>
              )}
            </div>

            {dragging && (
              <div className="pointer-events-none absolute inset-2 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-indigo-400 bg-slate-900/85 text-sm font-semibold text-indigo-300">
                📥 Drop product photos to analyze
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="space-y-2 border-t border-slate-700/70 p-3">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((a, i) => (
                  <div key={i} className="relative">
                    <img src={a.preview} alt="to send" className="h-12 w-12 rounded-lg border border-slate-600 object-cover" />
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold leading-none text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach product photos"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-sm text-slate-300 transition hover:border-indigo-500"
              >
                📎
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFiles(Array.from(e.target.files || []));
                  e.target.value = "";
                }}
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask anything, or drop a photo…"
                className="h-9 min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={sending || (!input.trim() && attachments.length === 0)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white transition hover:bg-indigo-500 disabled:opacity-40"
                aria-label="Send"
              >
                ➤
              </button>
            </div>
            <p className="text-[10px] text-slate-500">Review AI suggestions before publishing — you stay in control.</p>
          </div>
        </div>
      )}
    </>
  );
}