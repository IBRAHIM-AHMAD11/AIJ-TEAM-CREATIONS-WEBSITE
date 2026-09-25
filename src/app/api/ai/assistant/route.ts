import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const VALID_FIELDS = ["title", "slug", "description", "price", "inventoryCount", "category", "videoUrl", "features"];

const SYSTEM_PROMPT = `You are "Listing Copilot" — a friendly, expert e-commerce product-listing assistant inside an admin dashboard.

YOUR JOB: help the admin fill a product form FAST. You chat, analyze product photos, and propose field updates.

RESPONSE FORMAT (always strict JSON matching the schema):
- "message": short, warm, conversational reply (1-4 sentences). Light emoji use is welcome.
- "updates": proposed form changes. Only include fields you're confident about.
  - title / slug / description / category / videoUrl -> use "stringValue"
  - price / inventoryCount -> use "numberValue". Price is in RUPEES (e.g. 2499), NEVER cents.
  - features -> use the "features" array.
- If the admin asks a question or info is missing, reply with message only, or ask ONE short clarifying question.

PHOTO ANALYSIS: when images are attached, carefully study them and propose:
- A specific, searchable, brand-style title
- A rich MARKDOWN description (80-160 words, ending with a "## Highlights" bullet list)
- A realistic market price in Rs
- The best category
- Visible features

FEATURES RULES:
- color -> "value" MUST be a valid CSS color (hex like "#8B4513" or a name like "saddlebrown") so it renders as a swatch
- dimension -> "value" as "30x45x20" and "unit" as "cm" or "in"
- material / finish / size -> human-readable values like "Genuine Leather", "Matte", "XL"
- priceAdjustmentRupees: only when a variant should cost more/less, in rupees

CATEGORY RULE: prefer categories from the provided list. Only propose a new category name if nothing fits.

HONESTY RULE: never invent specs you can't verify (exact dimensions, brand names, fabric composition). Ask the admin instead.

The current form state and category list are appended below — don't re-propose values already in the form.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    message: { type: "STRING" },
    updates: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          field: { type: "STRING", enum: VALID_FIELDS },
          stringValue: { type: "STRING" },
          numberValue: { type: "NUMBER" },
          features: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                type: { type: "STRING", enum: ["color", "size", "material", "dimension", "finish", "custom"] },
                label: { type: "STRING" },
                value: { type: "STRING" },
                unit: { type: "STRING" },
                priceAdjustmentRupees: { type: "NUMBER" },
              },
              required: ["type", "label", "value"],
            },
          },
        },
        required: ["field"],
      },
    },
  },
  required: ["message"],
};

function contextBlock(ctx: any): string {
  if (!ctx) return "";
  return (
    "\n\n--- CURRENT FORM STATE ---\n" +
    `Title: ${ctx.title || "(empty)"}\n` +
    `Description: ${ctx.description ? ctx.description.slice(0, 400) : "(empty)"}\n` +
    `Price (Rs): ${ctx.price || "(empty)"}\n` +
    `Stock: ${ctx.inventoryCount ?? "(empty)"}\n` +
    `Uploaded images: ${ctx.uploadedImageCount ?? 0}\n` +
    `Existing features: ${ctx.existingFeatures?.length ? ctx.existingFeatures.join(", ") : "none"}\n` +
    `Existing categories (prefer these): ${ctx.categories?.length ? ctx.categories.join(", ") : "none"}`
  );
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set on the server. Add it to .env.local and restart." },
        { status: 500 }
      );
    }

    // 🔒 RECOMMENDED: verify the caller is an authenticated admin here
    // e.g. const session = await getServerSession(authOptions); if (!session) return 401;

    const body = await req.json();
    const history: { role?: string; text?: string }[] = body.history || [];
    const message: string = body.message || "";
    const images: { mimeType: string; data: string }[] = body.images || [];
    const imageUrls: string[] = body.imageUrls || [];
    const context = body.context || {};

    // 1. Build inline image parts
    const imageParts: { inlineData: { mimeType: string; data: string } }[] = [];

    for (const img of images.slice(0, 4)) {
      if (img?.data) imageParts.push({ inlineData: { mimeType: img.mimeType || "image/jpeg", data: img.data } });
    }

    for (const url of imageUrls.slice(0, 4)) {
      try {
        const res = await fetch(url);
        const contentType = res.headers.get("content-type") || "";
        if (!res.ok || !contentType.startsWith("image/")) continue;
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.byteLength > 8 * 1024 * 1024) continue;
        imageParts.push({ inlineData: { mimeType: contentType.split(";")[0], data: buffer.toString("base64") } });
      } catch { /* skip unreachable URLs */ }
    }

   // 2. Build alternating user/model history
   type GeminiPart =
      | { text: string }
      | { inlineData: { mimeType: string; data: string } };

   const contents: { role: string; parts: GeminiPart[] }[] = [];
   for (const m of history) {
      if (!m?.text?.trim()) continue;
      const role = m.role === "assistant" ? "model" : "user";
      const last = contents[contents.length - 1];
      if (last && last.role === role) {
      last.parts.push({ text: m.text.trim() }); // merge consecutive same-role turns
      } else {
      contents.push({ role, parts: [{ text: m.text.trim() }] });
      }
   }
   while (contents.length && contents[0].role === "model") contents.shift();

    // 3. Final user turn (images + text)
    let finalText = message.trim();
    if (imageParts.length === 0 && imageUrls.length > 0) {
      finalText +=
        "\n\n[System note: the product image links could not be loaded. Tell the admin to attach the photo directly in the chat, and do NOT guess product details.]";
    }
    if (!finalText) finalText = "Analyze the attached product image(s) and suggest listing details.";

    contents.push({ role: "user", parts: [...imageParts, { text: finalText }] });

    // 4. Call Gemini
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT + contextBlock(context) }] },
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[ai/assistant] Gemini error:", geminiRes.status, errText);
      return NextResponse.json(
        { error: "Gemini returned an error. Check the server logs and your API key/quota." },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();
    const raw: string = (data?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || "").join("");

    if (!raw) {
      return NextResponse.json(
        { error: "The AI returned an empty response — the photo may have been blocked. Try another image." },
        { status: 502 }
      );
    }

    let parsed: { message?: string; updates?: any[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("[ai/assistant] Failed to parse Gemini JSON:", raw.slice(0, 500));
      return NextResponse.json({ error: "The AI response was malformed. Please try again." }, { status: 502 });
    }

    const updates = Array.isArray(parsed.updates)
      ? parsed.updates.filter((u: any) => u && VALID_FIELDS.includes(u.field))
      : [];

    return NextResponse.json({ message: parsed.message || "Done!", updates });
  } catch (err) {
    console.error("[ai/assistant] Route error:", err);
    return NextResponse.json({ error: "Something went wrong talking to the AI. Please try again." }, { status: 500 });
  }
}