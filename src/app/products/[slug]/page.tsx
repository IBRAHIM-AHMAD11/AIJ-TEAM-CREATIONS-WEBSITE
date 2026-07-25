"use client";

import React, { useState, useRef, use, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import ImageLightbox from "@/components/ui/image-lightbox";
import RelatedProducts from "./relatedProducts";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import {
  ShieldCheck, 
  RotateCcw, 
  Truck, 
  Play, 
  Check, 
  Minus, 
  Plus, 
  Loader2,
  ShoppingCart
} from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

interface MediaItem {
  type: "image" | "video";
  url: string;
}

function computeEffectivePrice(
  product: { price?: number; features?: Array<{ type: string; label: string; value: string; priceAdjustment?: number }> } | null | undefined,
  selectedColor: string,
  selectedSize: string,
  selectedDimension: string,
  selectedFinish: string
) {
  let total = product?.price ?? 0;
  if (!product?.features) return total;
  const findAdj = (type: string, match: string, byLabel = false) => {
    const f = product.features?.find(fe => fe.type === type && (byLabel ? fe.label === match : fe.value === match));
    return f?.priceAdjustment ?? 0;
  };
  if (selectedColor) total += findAdj("color", selectedColor, true);
  if (selectedSize) total += findAdj("size", selectedSize);
  if (selectedDimension) total += findAdj("dimension", selectedDimension);
  if (selectedFinish) total += findAdj("finish", selectedFinish);
  return Math.max(0, total);
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const product = useQuery(api.products.getBySlug, { slug });

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [selectedFinish, setSelectedFinish] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [buttonState, setButtonState] = useState<"idle" | "loading">("idle");
  const [showToast, setShowToast] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { addRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    if (product) addRecentlyViewed(product._id);
  }, [product, addRecentlyViewed]);

  const addToCart = useMutation(api.cart.addItem);
  const router = useRouter();

  const similarProducts = useQuery(
    api.products.getByCategory,
    product ? { categoryId: product.categoryId, excludeId: product._id } : "skip"
  );

  const effectivePrice = computeEffectivePrice(product, selectedColor, selectedSize, selectedDimension, selectedFinish);
  const hasPricedFeatures = product?.features?.some(f => f.priceAdjustment !== undefined && f.priceAdjustment !== 0) ?? false;

  const handleAddToCart = useCallback(async () => {
    if (buttonState !== "idle") return;
    setButtonState("loading");
    const features: Array<{ type: string; label: string; value: string }> = [];
    if (selectedColor) {
      const f = product?.features?.find(fe => fe.type === "color" && fe.label === selectedColor);
      if (f) features.push({ type: f.type, label: f.label, value: f.value });
    }
    if (selectedSize) {
      const f = product?.features?.find(fe => fe.type === "size" && fe.value === selectedSize);
      if (f) features.push({ type: f.type, label: f.label, value: f.value });
    }
    if (selectedDimension) {
      const f = product?.features?.find(fe => fe.type === "dimension" && fe.value === selectedDimension);
      if (f) features.push({ type: f.type, label: f.label, value: f.value });
    }
    if (selectedFinish) {
      const f = product?.features?.find(fe => fe.type === "finish" && fe.value === selectedFinish);
      if (f) features.push({ type: f.type, label: f.label, value: f.value });
    }
    try {
      await addToCart({
        productId: product!._id,
        quantity,
        selectedFeatures: features.length > 0 ? features : undefined,
      });
      setButtonState("idle");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/store");
      }, 1800);
    } catch {
      setButtonState("idle");
    }
  }, [product, selectedColor, selectedSize, selectedDimension, selectedFinish, quantity, buttonState, addToCart, router]);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  if (product === undefined) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading product details...</p>
      </motion.div>
    );
  }

  if (product === null) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-destructive">Product Not Found</h1>
        <p className="text-muted-foreground">The product you are looking for does not exist.</p>
        <Button>
          <Link href="/">Back to Shop</Link>
        </Button>
      </motion.div>
    );
  }

  const dbImages: string[] = product.images.length > 0 
    ? product.images 
    : ["/placeholder-product.jpg"];

  const mediaItems: MediaItem[] = dbImages.map((url) => ({
    type: "image",
    url,
  }));

  if (product.video && product.video.trim() !== "") {
    mediaItems.push({
      type: "video",
      url: product.video,
    });
  }

  const activeMedia = mediaItems[activeMediaIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !zoomRef.current || activeMedia.type !== "image") return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;

    zoomRef.current.style.display = "block";
    zoomRef.current.style.backgroundImage = `url(${activeMedia.url})`;
    zoomRef.current.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
    zoomRef.current.style.backgroundSize = "220%";
  };

  const handleMouseLeave = () => {
    if (zoomRef.current) zoomRef.current.style.display = "none";
  };

  return (
    <main>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-2">
          <Breadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Store", href: "/store" },
            { label: product.title },
          ]} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Media Gallery */}
          <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-4 items-start w-full">
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible w-full md:w-20 shrink-0 py-1">
              {mediaItems.map((item, index) => (
                <button
                  key={index}
                  onMouseEnter={() => setActiveMediaIndex(index)}
                  onClick={() => setActiveMediaIndex(index)}
                  className={`relative aspect-square w-16 md:w-full rounded-md border-2 bg-muted overflow-hidden transition-all focus:outline-none ${
                    activeMediaIndex === index ? "border-primary shadow-xs" : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  {item.type === "video" ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-zinc-900 text-white">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-1 py-0.5 rounded-xs absolute top-1 left-1 scale-75 origin-top-left">Video</span>
                      <Play className="size-5 text-primary fill-current" />
                    </div>
                  ) : (
                    <Image src={item.url} alt={`${product.title} thumbnail ${index + 1}`} fill className="object-cover" sizes="80px" />
                  )}
                </button>
              ))}
            </div>

            <div ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative aspect-square w-full rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              {activeMedia.type === "video" ? (
                <video src={activeMedia.url} controls autoPlay muted className="w-full h-full object-contain bg-black" />
              ) : (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="w-full h-full cursor-zoom-in group/zoom"
                >
                  <Image src={activeMedia.url} alt={product.title} fill priority className="object-contain p-4 transition-opacity duration-200 group-hover/zoom:opacity-0" sizes="(max-width: 1024px) 100vw, 50vw" />
                  <div ref={zoomRef} className="absolute inset-0 bg-no-repeat pointer-events-none" style={{ display: "none" }} />
                </button>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-6 space-y-8">
            <div className="border-b border-border pb-6 space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{product.title}</h1>
              {(() => {
                const hasNoSelection = !selectedColor && !selectedSize && !selectedDimension && !selectedFinish;
                const displayPrice = hasPricedFeatures && hasNoSelection ? product.price : effectivePrice;
                const dollars = Math.floor(displayPrice / 100);
                const cents = (displayPrice % 100).toString().padStart(2, "0");
                return (
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-light text-foreground/80 align-super">$</span>
                    <span className="text-4xl font-semibold tracking-tight text-foreground">{dollars}</span>
                    <span className="text-lg font-light text-foreground/80 align-super">.{cents}</span>
                    {hasPricedFeatures && hasNoSelection && (
                      <span className="text-sm text-muted-foreground ml-1 font-normal">from</span>
                    )}
                  </div>
                );
              })()}
              {effectivePrice !== product.price && effectivePrice > 0 && (
                <p className="text-xs text-muted-foreground">
                  Base ${(product.price / 100).toFixed(2)}
                  {selectedColor && (() => {
                    const f = product.features?.find(fe => fe.type === "color" && fe.label === selectedColor);
                    return f?.priceAdjustment ? ` + color (${f.label}) $${(f.priceAdjustment / 100).toFixed(2)}` : "";
                  })()}
                  {selectedSize && (() => {
                    const f = product.features?.find(fe => fe.type === "size" && fe.value === selectedSize);
                    return f?.priceAdjustment ? ` + size (${f.value}) $${(f.priceAdjustment / 100).toFixed(2)}` : "";
                  })()}
                  {selectedDimension && (() => {
                    const f = product.features?.find(fe => fe.type === "dimension" && fe.value === selectedDimension);
                    return f?.priceAdjustment ? ` + dimensions $${(f.priceAdjustment / 100).toFixed(2)}` : "";
                  })()}
                  {selectedFinish && (() => {
                    const f = product.features?.find(fe => fe.type === "finish" && fe.value === selectedFinish);
                    return f?.priceAdjustment ? ` + finish (${f.value}) $${(f.priceAdjustment / 100).toFixed(2)}` : "";
                  })()}
                </p>
              )}
            </div>

            {/* SELECTION AREA */}
            <div className="space-y-6">
              
              {/* Color Selector */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.features.filter((f) => f.type === "color").map((feature, i) => (
                      <button
                        key={`color-${feature.label}-${i}`}
                        type="button"
                        onClick={() => setSelectedColor(feature.label)}
                        className={`flex items-center gap-2 px-3 py-2 border-2 rounded-md transition-all ${
                          selectedColor === feature.label
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {selectedColor === feature.label && <Check className="size-4 text-primary" />}
                        <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: feature.value }} />
                        <span className="text-sm font-medium">{feature.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Material Section */}
              {(() => {
                const m = product.features?.find((f) => f.type === "material");
                return m ? (
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Material</Label>
                    <div className="p-3 border rounded-md bg-muted/20 text-sm font-medium text-foreground">
                      {m.label}: {m.value}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Size Selector — dynamic from features */}
              {product.features && product.features.filter((f) => f.type === "size").length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Size</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.features.filter((f) => f.type === "size").map((feature, i) => (
                      <button
                        key={`size-${feature.value}-${i}`}
                        type="button"
                        onClick={() => setSelectedSize(feature.value)}
                        className={`px-4 h-10 flex items-center justify-center border-2 rounded-md transition-all text-sm font-medium ${
                          selectedSize === feature.value
                            ? "border-primary bg-primary text-primary-foreground ring-1 ring-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {feature.value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dimensions from features */}
              {product.features && product.features.filter((f) => f.type === "dimension").length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Dimensions</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.features.filter((f) => f.type === "dimension").map((feature, i) => {
                      const parts = feature.value.split("x");
                      const formatted = parts.map(p => `${p}cm`).join(" × ");
                      return (
                        <button
                          key={`dim-${feature.value}-${i}`}
                          type="button"
                          onClick={() => setSelectedDimension(feature.value)}
                          className={`px-4 py-2 border-2 rounded-md text-sm font-medium transition-all ${
                            selectedDimension === feature.value
                              ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          {formatted}
                          {feature.label && feature.label !== "Dimensions" && (
                            <span className="text-xs text-muted-foreground ml-1">({feature.label})</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Finish from features */}
              {product.features && product.features.filter((f) => f.type === "finish").length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Finish</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.features.filter((f) => f.type === "finish").map((feature, i) => (
                      <button
                        key={`finish-${feature.value}-${i}`}
                        type="button"
                        onClick={() => setSelectedFinish(feature.value)}
                        className={`px-4 py-2 border-2 rounded-md text-sm font-medium transition-all ${
                          selectedFinish === feature.value
                            ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {feature.value}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description & Footer */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">About this item</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{product.description}</p>
            </div>

            <div className="border border-border rounded-xl p-6 bg-muted/30 dark:bg-muted/10 space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quantity</Label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="size-8 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
                    disabled={quantity <= 1}
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.min(99, q + 1))}
                    className="size-8 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>

              <Button
                className="w-full h-12 text-base font-semibold shadow-xs transition-all duration-300 relative overflow-hidden"
                disabled={
                  buttonState !== "idle" ||
                  (product.features?.some(f => f.type === "color") ? !selectedColor : false) ||
                  (product.features?.some(f => f.type === "size") ? !selectedSize : false) ||
                  (product.features?.some(f => f.type === "dimension") ? !selectedDimension : false) ||
                  (product.features?.some(f => f.type === "finish") ? !selectedFinish : false)
                }
                onClick={handleAddToCart}
              >
                <span className={`flex items-center justify-center gap-2 transition-all duration-300 ${buttonState === "loading" ? "opacity-0 scale-75" : ""}`}>
                  <ShoppingCart className="size-4" />
                  Add to Cart
                </span>
                {buttonState === "loading" && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="size-5 animate-spin" />
                  </span>
                )}
              </Button>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Truck className="size-4 text-primary" /> <span>Fast Delivery</span></div>
                <div className="flex items-center gap-1.5"><RotateCcw className="size-4 text-primary" /> <span>30-Day Returns</span></div>
                <div className="flex items-center gap-1.5 col-span-2"><ShieldCheck className="size-4 text-primary" /> <span>Secure Transaction Guarantee</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {similarProducts && similarProducts.length > 0 && (
        <RelatedProducts products={similarProducts} />
      )}

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: 120, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 120, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 22, stiffness: 350, mass: 0.8 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
          >
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-green-200 dark:border-green-800 p-5 overflow-hidden">
              {/* Progress bar */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 1.8, ease: "linear" }}
                style={{ transformOrigin: "left" }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-green-500/30"
              />

              <div className="flex items-center gap-4">
                {/* Checkmark circle */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.15 }}
                  className="size-12 shrink-0 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <Check className="size-6 text-green-600 dark:text-green-400" strokeWidth={3} />
                  </motion.div>
                </motion.div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300">Added to Cart</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-0.5">
                    {product?.title} × {quantity}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageLightbox
        images={dbImages}
        initialIndex={activeMediaIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </main>
  );
}