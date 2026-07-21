"use client";

import React, { useState, useRef, use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  ShieldCheck, 
  RotateCcw, 
  Truck, 
  Play, 
  ArrowBigLeftIcon, 
  Check 
} from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

interface MediaItem {
  type: "image" | "video";
  url: string;
}

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const product = useQuery(api.products.getBySlug, { slug });

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: "none" });
  const containerRef = useRef<HTMLDivElement>(null);

  if (product === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading product details...</p>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-destructive">Product Not Found</h1>
        <p className="text-muted-foreground">The product you are looking for does not exist.</p>
        <Button>
          <Link href="/">Back to Shop</Link>
        </Button>
      </div>
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
    if (!containerRef.current || activeMedia.type !== "image") return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;

    setZoomStyle({
      display: "block",
      backgroundImage: `url(${activeMedia.url})`,
      backgroundPosition: `${xPercent}% ${yPercent}%`,
      backgroundSize: "220%",
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  return (
    <main>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-6">
          <Link href="/">
            <button className="group inline-flex items-center justify-center rounded-full p-2 transition-colors hover:bg-muted" aria-label="Go back">
              <ArrowBigLeftIcon className="size-8 text-muted-foreground transition-all duration-300 ease-out group-hover:-translate-x-1 group-hover:text-foreground" fill="currentColor" />
            </button>
          </Link>
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
                    <img src={item.url} alt={`${product.title} thumbnail ${index + 1}`} className="object-cover w-full h-full" />
                  )}
                </button>
              ))}
            </div>

            <div ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative aspect-square w-full rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              {activeMedia.type === "video" ? (
                <video src={activeMedia.url} controls autoPlay muted className="w-full h-full object-contain bg-black" />
              ) : (
                <div className="w-full h-full cursor-zoom-in group/zoom">
                  <img src={activeMedia.url} alt={product.title} className="object-contain w-full h-full p-4 transition-opacity duration-200 group-hover/zoom:opacity-0" />
                  <div style={zoomStyle} className="absolute inset-0 bg-no-repeat pointer-events-none transition-shadow duration-300" />
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-6 space-y-8">
            <div className="border-b border-border pb-6 space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{product.title}</h1>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-light text-foreground/80 align-super">$</span>
                <span className="text-4xl font-semibold tracking-tight text-foreground">{Math.floor(product.price / 100)}</span>
                <span className="text-lg font-light text-foreground/80 align-super">{(product.price % 100).toString().padStart(2, "0")}</span>
              </div>
            </div>

            {/* SELECTION AREA */}
            <div className="space-y-6">
              
              {/* Color Selector */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((feature) => (
                      <button
                        key={feature.featureType}
                        type="button"
                        onClick={() => setSelectedColor(feature.featureType)}
                        className={`flex items-center gap-2 px-3 py-2 border-2 rounded-md transition-all ${
                          selectedColor === feature.featureType
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {selectedColor === feature.featureType && <Check className="size-4 text-primary" />}
                        <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: feature.color }} />
                        <span className="text-sm font-medium">{feature.featureType}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Material Section */}
              {product.material && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Material</Label>
                  <div className="p-3 border rounded-md bg-muted/20 text-sm font-medium text-foreground">
                    {product.material}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Size</Label>
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-10 flex items-center justify-center border-2 rounded-md transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground ring-1 ring-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description & Footer */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">About this item</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{product.description}</p>
            </div>

            <div className="border border-border rounded-xl p-6 bg-muted/30 dark:bg-muted/10 space-y-4">
              <Button className="w-full h-11 text-base font-semibold shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-[0.98]" disabled={!selectedColor || !selectedSize}>
                Add to Cart
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
    </main>
  );
}