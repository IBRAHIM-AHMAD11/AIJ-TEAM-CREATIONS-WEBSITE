import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// Image EDITING model — Imagen won't work here (no image input)
const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-lite-image";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set on the server." }, { status: 500 });
    }

    const body = await req.json();
    const instruction: string = (body.instruction || "").trim();
    const baseImage = body.baseImage as { mimeType?: string; data?: string } | undefined;
    const baseImageUrl: string | undefined = body.baseImageUrl;

    if (!instruction) {
      return NextResponse.json({ error: "Missing instruction." }, { status: 400 });
    }

    // Base photo: inline (chat attachment) or URL (product image) — server fetches it
    let inlineData: { mimeType: string; data: string } | undefined =
      baseImage?.data ? { mimeType: baseImage.mimeType || "image/jpeg", data: baseImage.data } : undefined;

    if (!inlineData && baseImageUrl) {
      try {
        const res = await fetch(baseImageUrl);
        const contentType = res.headers.get("content-type") || "";
        if (!res.ok || !contentType.startsWith("image/")) throw new Error("bad fetch");
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.byteLength > 10 * 1024 * 1024) throw new Error("too big");
        inlineData = { mimeType: contentType.split(";")[0], data: buffer.toString("base64") };
      } catch {
        return NextResponse.json(
          { error: "Couldn't load the base product photo. Attach it directly in the chat instead." },
          { status: 400 }
        );
      }
    }

    if (!inlineData) {
      return NextResponse.json({ error: "No base photo available — add a product image first." }, { status: 400 });
    }

    const prompt = `You are a professional product photographer and retoucher.
Edit the provided product photo with this request: "${instruction}"

STRICT RULES:
- Keep the product's shape, construction, stitching, textures, logos and fine details identical.
- Keep the exact same background, lighting, shadows and camera angle.
- Apply ONLY the requested change — nothing else.
- Output one photorealistic, e-commerce-quality product image.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ inlineData }, { text: prompt }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[ai/generate-variant] Gemini error:", geminiRes.status, errText.slice(0, 500));
      // Propagate 429 so the client queue knows to back off
      return NextResponse.json(
        {
          error:
            geminiRes.status === 429
              ? "Rate limited by Gemini — the queue will retry automatically."
              : `Image model error (${geminiRes.status}). Check server logs — is your key allowed to use ${MODEL}?`,
        },
        { status: geminiRes.status === 429 ? 429 : 502 }
      );
    }

    const data = await geminiRes.json();
    const parts: any[] = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p?.inlineData?.data);

    if (!imagePart) {
      return NextResponse.json(
        { error: "The model returned no image (it may have refused the edit). Try a different base photo." },
        { status: 502 }
      );
    }

    const mimeType = imagePart.inlineData.mimeType || "image/png";
    return NextResponse.json({ image: `data:${mimeType};base64,${imagePart.inlineData.data}` });
  } catch (err) {
    console.error("[ai/generate-variant] Route error:", err);
    return NextResponse.json({ error: "Variant generation failed. Please try again." }, { status: 500 });
  }
}