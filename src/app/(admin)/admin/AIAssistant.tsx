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
  features?: { type: string; label: string; value: string; unit?: string }[];
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
  onAddGeneratedImages?: (dataUrls: string[]) => Promise<void>;
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

const ACTIONS = [
  {
    id: "analyze",
    icon: "🚀",
    label: "Auto-fill all fields",
    hint: "Analyze photos & fill the whole form",
    needsImages: true,
    message:
      "Analyze the product image(s) and auto-fill this listing: title, description, price in Rs, category, and features. Ask me about anything you can't determine from the photos.",
  },
  {
    id: "title",
    icon: "🏷️",
    label: "Suggest Title",
    hint: "Generate a product title",
    needsImages: false,
    message: "Suggest a specific, searchable, brand-style product title for this product.",
  },
  {
    id: "description",
    icon: "✍️",
    label: "Suggest Description",
    hint: "Write a markdown description",
    needsImages: false,
    message:
      "Write a compelling markdown product description (80–160 words, ending with a '## Highlights' bullet list).",
  },
  {
    id: "price",
    icon: "💰",
    label: "Suggest Price",
    hint: "Suggest a price in Rs",
    needsImages: false,
    message: "Suggest a fair, competitive market price in Rs for this product with a one-line justification.",
  },
  {
    id: "features",
    icon: "🧩",
    label: "Suggest Features",
    hint: "Propose colors, materials, sizes…",
    needsImages: false,
    message:
      "Suggest display features for this product: color (CSS hex), material, size, dimensions (value like 30x45x20 + unit), and finish. Only include what you can verify or reasonably infer.",
  },
  {
    id: "category",
    icon: "🗂️",
    label: "Suggest Category",
    hint: "Pick or create a category",
    needsImages: false,
    message:
      "Which category fits this product best? Prefer one of my existing categories; only propose a new one if nothing fits.",
  },
  {
    id: "stock",
    icon: "📦",
    label: "Suggest Stock",
    hint: "Suggest a stock count",
    needsImages: false,
    message: "Suggest a sensible default stock count for this kind of product, and ask me if it should vary.",
  },
  {
    id: "variants",
    icon: "🎨",
    label: "Variants",
    hint: "AI-generate photos for each color/size",
    needsImages: false,
    message: "",
  },
];

const uid = () => Math.random().toString(36).slice(2, 10);

const VARIANT_SETTINGS = {
  BETWEEN_JOBS_MS: 3000, // pause between generations
  MAX_ATTEMPTS: 3,       // retries per image
  BACKOFF_MS: 12000,     // wait after a 429: 12s → 24s → 36s
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface VariantJob {
  id: string;
  label: string;
  swatch?: string;
  instruction: string;
  status: "queued" | "generating" | "waiting" | "done" | "error";
  image?: string;
  error?: string;
  added?: boolean;
}
interface VariantBase {
  source: "chat" | "form";
  preview: string;
  mimeType?: string;
  data?: string;
  url?: string;
}

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

export function AIAssistant({ open, onOpenChange, formContext, onApplyUpdates, onAddGeneratedImages }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const [dragging, setDragging] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showVariantPicker, setShowVariantPicker] = useState(false);
  const [variantSelection, setVariantSelection] = useState<Record<string, boolean>>({});
  const [variantJobs, setVariantJobs] = useState<VariantJob[]>([]);
  const [variantBusy, setVariantBusy] = useState(false);
  const variantBaseRef = useRef<VariantBase | null>(null);

  const variantFeatures = (formContext.features ?? []).filter((f) => f.type === "color" || f.type === "size");
  const doneUnaddedCount = variantJobs.filter((j) => j.status === "done" && !j.added).length;

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          text: "Hey! 👋 I'm Listing Copilot, powered by Gemini.\n\nDrop a product photo below, or use the action buttons (🚀 Auto-fill all, ✍️ Description, 🧩 Features…) to fill the form fast. Anything I can't tell from the photo, I'll just ask you.",
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

  const runAction = (action: (typeof ACTIONS)[number]) => {
    if (sending) return;

    const hasChatImages = attachments.length > 0;
    const hasFormImages = formContext.uploadedImageUrls.length > 0;

    if (action.needsImages && !hasChatImages && !hasFormImages) {
      toast.error("Add a photo first — attach one here (📎) or upload product images in the form.");
      return;
    }

    handleSend({
      message: action.message,
      // pass form images as visual context when the user hasn't attached any in chat
      useFormImages: !hasChatImages && hasFormImages,
    });
  };

  const getVariantBase = (): VariantBase | null => {
    if (attachments[0]) {
      return { source: "chat", preview: attachments[0].preview, mimeType: attachments[0].mimeType, data: attachments[0].data };
    }
    const url = formContext.uploadedImageUrls[0];
    return url ? { source: "form", preview: url, url } : null;
  };

  const buildInstruction = (f: { type: string; label: string; value: string; unit?: string }): string => {
    if (f.type === "color") {
      return `Change the product's main color to "${f.label}" (target color: ${f.value}). Recolor the main body/material only — keep hardware, buttons, soles and trims unchanged.`;
    }
    const sizeText = f.unit ? `${f.value} ${f.unit}` : f.value;
    return `Show the same product in size ${f.label} (${sizeText}). Keep styling, background, lighting and camera angle identical.`;
  };

  const processVariantJob = async (jobId: string, instruction: string) => {
    const base = variantBaseRef.current ?? getVariantBase();
    const updateJob = (patch: Partial<VariantJob>) =>
      setVariantJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, ...patch } : j)));

    if (!base) {
      updateJob({ status: "error", error: "No base photo found." });
      return;
    }

    for (let attempt = 1; attempt <= VARIANT_SETTINGS.MAX_ATTEMPTS; attempt++) {
      updateJob({ status: "generating", error: undefined });
      try {
        const res = await fetch("/api/ai/generate-variant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instruction,
            baseImage: base.data ? { mimeType: base.mimeType, data: base.data } : undefined,
            baseImageUrl: base.url,
          }),
        });
        const data = await res.json();

        if (res.status === 429) {
          if (attempt < VARIANT_SETTINGS.MAX_ATTEMPTS) {
            updateJob({ status: "waiting", error: "Rate limited — auto-retrying…" });
            await sleep(VARIANT_SETTINGS.BACKOFF_MS * attempt);
            continue;
          }
          throw new Error("Rate limited too many times. Wait a minute, then hit Retry.");
        }
        if (!res.ok) throw new Error(data?.error || "Generation failed.");

        updateJob({ status: "done", image: data.image, error: undefined });
        return;
      } catch (err: any) {
        if (attempt >= VARIANT_SETTINGS.MAX_ATTEMPTS) {
          updateJob({ status: "error", error: err?.message || "Failed" });
          return;
        }
        await sleep(4000 * attempt);
      }
    }
  };

  const openVariantPicker = () => {
    if (variantFeatures.length === 0) {
      return toast.error("Add color or size features first — use the 🧩 Features button.");
    }
    if (!getVariantBase()) {
      return toast.error("Add a product photo first (form upload or 📎 attach one here).");
    }
    setVariantSelection(Object.fromEntries(variantFeatures.map((f) => [`${f.type}:${f.label}`, true])));
    setShowVariantPicker(true);
  };

  const startVariantBatch = async () => {
    if (variantBusy) return toast.error("A batch is already running — let it finish first.");
    const selected = variantFeatures.filter((f) => variantSelection[`${f.type}:${f.label}`]);
    if (selected.length === 0) return toast.error("Pick at least one variant.");
    const base = getVariantBase();
    if (!base) return toast.error("No base photo — add a product image first.");

    variantBaseRef.current = base; // lock the base for the whole batch
    setShowVariantPicker(false);
    setVariantBusy(true);

    const jobs: VariantJob[] = selected.map((f) => ({
      id: uid(),
      label: f.label,
      swatch: f.type === "color" ? f.value : undefined,
      instruction: buildInstruction(f),
      status: "queued",
    }));
    setVariantJobs((prev) => [...prev, ...jobs]);

    // 🔁 Sequential queue with pacing — one image at a time, respects rate limits
    for (const job of jobs) {
      await processVariantJob(job.id, job.instruction);
      await sleep(VARIANT_SETTINGS.BETWEEN_JOBS_MS);
    }
    setVariantBusy(false);
  };

  const addGeneratedImages = async (ids: string[]) => {
    if (!onAddGeneratedImages) return toast.error("Image adding isn't wired on this page.");
    const jobs = variantJobs.filter((j) => ids.includes(j.id) && j.status === "done" && !j.added && j.image);
    if (jobs.length === 0) return;
    try {
      await onAddGeneratedImages(jobs.map((j) => j.image!));
      setVariantJobs((prev) => prev.map((j) => (ids.includes(j.id) ? { ...j, added: true } : j)));
      toast.success(`✨ Added ${jobs.length} image${jobs.length > 1 ? "s" : ""} to the product gallery`);
    } catch {
      toast.error("Failed to add the images. Try again.");
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
          {/* Messages */}
          <div className="relative min-h-0 flex-1">
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
              className="h-full space-y-3 overflow-y-auto overscroll-contain p-3"
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

          {showVariantPicker && (
            <div className="space-y-2 border-t border-slate-700/70 bg-slate-900/80 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">🎨 Generate variant photos</span>
                <button type="button" onClick={() => setShowVariantPicker(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <p className="text-[11px] text-slate-400">
                Each checked variant gets one AI-edited photo. Base photo: {attachments[0] ? "your chat attachment" : "1st product image"}. Runs one at a time to respect rate limits.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {variantFeatures.map((f) => {
                  const key = `${f.type}:${f.label}`;
                  const checked = variantSelection[key];
                  return (
                    <label
                      key={key}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition ${
                        checked ? "border-indigo-500 bg-indigo-500/15 text-white" : "border-slate-700 bg-slate-800/70 text-slate-300"
                      }`}
                    >
                      <input type="checkbox" className="hidden" checked={!!checked} onChange={() => setVariantSelection((p) => ({ ...p, [key]: !p[key] }))} />
                      {f.type === "color" && <span className="h-3 w-3 rounded-full border border-slate-500" style={{ backgroundColor: f.value }} />}
                      {f.label}
                    </label>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={startVariantBatch}
                className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                ✨ Generate {Object.values(variantSelection).filter(Boolean).length} image(s)
              </button>
            </div>
          )}

          {variantJobs.length > 0 && (
            <div className="border-t border-slate-700/70 p-3">
              <div className="mb-2 flex items-center gap-2">
                {variantBaseRef.current && (
                  <img src={variantBaseRef.current.preview} alt="base" className="h-6 w-6 rounded border border-slate-600 object-cover" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Variant photos {variantBusy && <span className="ml-1 animate-pulse normal-case text-indigo-400">generating…</span>}
                </span>
                <span className="ml-auto flex items-center gap-2">
                  {doneUnaddedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => addGeneratedImages(variantJobs.filter((j) => j.status === "done" && !j.added).map((j) => j.id))}
                      className="rounded-md bg-emerald-500/20 px-2 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/30"
                    >
                      ＋ Add all ({doneUnaddedCount})
                    </button>
                  )}
                  {!variantBusy && (
                    <button type="button" onClick={() => setVariantJobs([])} className="text-slate-400 hover:text-white">✕</button>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {variantJobs.map((job) => (
                  <div key={job.id} className="rounded-lg border border-slate-700 bg-slate-900/60 p-2">
                    <div className="mb-1.5 flex items-center gap-1.5">
                      {job.swatch && <span className="h-3 w-3 shrink-0 rounded-full border border-slate-500" style={{ backgroundColor: job.swatch }} />}
                      <span className="truncate text-xs font-medium text-slate-200">{job.label}</span>
                      <span className="ml-auto shrink-0 text-[10px]">
                        {job.status === "queued" && <span className="text-slate-500">⏳ queued</span>}
                        {job.status === "generating" && <span className="animate-pulse text-indigo-300">✨ generating</span>}
                        {job.status === "waiting" && <span className="text-amber-400">⏱ retrying</span>}
                        {job.status === "error" && <span className="text-red-400" title={job.error}>failed</span>}
                        {job.status === "done" && !job.added && <span className="text-emerald-400">ready</span>}
                        {job.added && <span className="text-emerald-400">✓ added</span>}
                      </span>
                    </div>
                    {job.image ? (
                      <img src={job.image} alt={job.label} className="h-28 w-full rounded-md border border-slate-700 object-cover" />
                    ) : (
                      <div className="flex h-28 w-full items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-2xl text-slate-600">
                        {job.status === "error" ? "⚠️" : job.status === "waiting" ? "⏱" : "✨"}
                      </div>
                    )}
                    {job.status === "error" && !variantBusy && (
                      <button
                        type="button"
                        onClick={() => processVariantJob(job.id, job.instruction)}
                        className="mt-1.5 w-full rounded-md border border-slate-600 py-1 text-[11px] text-slate-300 hover:bg-slate-800"
                      >
                        ↻ Retry
                      </button>
                    )}
                    {job.status === "done" && !job.added && (
                      <button
                        type="button"
                        onClick={() => addGeneratedImages([job.id])}
                        className="mt-1.5 w-full rounded-md bg-indigo-500/90 py-1 text-[11px] font-semibold text-white hover:bg-indigo-400"
                      >
                        ＋ Add to product images
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="space-y-2 border-t border-slate-700/70 p-3">
            {/* ⚡ AI action buttons */}
            <div className="flex flex-wrap gap-1.5">
              {ACTIONS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  disabled={sending}
                  onClick={() => (a.id === "variants" ? openVariantPicker() : runAction(a))}
                  title={a.hint}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 transition hover:border-indigo-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>{a.icon}</span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
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