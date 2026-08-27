"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// Components
import { FeatureSelectionModal } from "../../FeatureSelectionModal";

type FeatureType = "color" | "size" | "material" | "dimension" | "finish" | "custom";

interface ProductFeature {
  type: FeatureType;
  label: string;
  value: string;
  priceAdjustment?: number;
}

export default function NewProductPage() {
  const router = useRouter();
  
  // Convex Mutations & Queries
  const createProduct = useMutation(api.products.createProduct);
  const createCategory = useMutation(api.categories.create);
  const categories = useQuery(api.categories.list) || [];
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const getImageUrl = useMutation(api.upload.getStorageUrl);

  // Core Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [inventoryCount, setInventoryCount] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  // Feature State
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  
  // 👇 NEW: 3D Model state
  const [uploadedModelUrl, setUploadedModelUrl] = useState("");
  const [modelUploading, setModelUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const modelFileInputRef = useRef<HTMLInputElement>(null); // 👈 NEW

  const convertToSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    setSlug(convertToSlug(value)); 
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(convertToSlug(e.target.value));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();

      const imageUrl = await getImageUrl({ storageId });
      if (imageUrl) {
        setUploadedImages((prev) => [...prev, imageUrl]);
      }
      toast.success("Image added");
    } catch (err) {
      toast.error("Failed to upload image asset.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();

      const videoUrl = await getImageUrl({ storageId });
      if (videoUrl) {
        setUploadedVideoUrl(videoUrl);
        setVideoUrl(""); 
      }
      toast.success("Video added");
    } catch (err) {
      toast.error("Failed to upload video.");
    } finally {
      setVideoUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    setUploadedVideoUrl("");
  };

  // 👇 NEW: 3D model upload handler
  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setModelUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      
      // Only set Content-Type if the browser gives one
      const headers: Record<string, string> = {};
      if (file.type) {
        headers["Content-Type"] = file.type;
      }

      const result = await fetch(postUrl, {
        method: "POST",
        headers,
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();

      // ✅ Use the same method as images/videos
      const modelUrl = await getImageUrl({ storageId });
      if (modelUrl) {
        setUploadedModelUrl(modelUrl);
      }
      toast.success("3D model added");
    } catch (err) {
      toast.error("Failed to upload 3D model.");
    } finally {
      setModelUploading(false);
    }
  };

  const handleRemoveModel = () => {
    setUploadedModelUrl("");
  };
  // 👆 END NEW

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const catSlug = convertToSlug(newCatName);
      const newCatId = await createCategory({ name: newCatName, slug: catSlug });
      setCategoryId(newCatId); 
      setNewCatName("");
      setShowCategoryModal(false);
      toast.success("Category created");
    } catch (err) {
      toast.error("Failed to create category.");
    }
  };

  const handleAddFeature = (newFeature: ProductFeature) => {
    setFeatures((prev) => [...prev, newFeature]);
  };

  const handleRemoveFeature = (indexToRemove: number) => {
    setFeatures((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Helper to insert markdown syntax at cursor position
  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("markdown-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end, text.length);

    const newText = before + prefix + selection + suffix + after;
    setDescription(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = start + prefix.length + selection.length;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return toast.message("Please select or create a category first!");
    if (!description.trim()) return toast.error("A product description is required.");

    const priceInCents = Math.round(parseFloat(priceInput) * 100);

    if (isNaN(priceInCents) || priceInCents <= 0) {
      return toast.error("Please enter a valid base price.");
    }

    const negativeSum = features
      .filter((f) => f.priceAdjustment !== undefined && f.priceAdjustment < 0)
      .reduce((sum, f) => sum + (f.priceAdjustment ?? 0), 0);

    if (priceInCents + negativeSum <= 0) {
      return toast.error(
        `Price would go negative with current adjustments. The lowest possible price is $${((priceInCents + negativeSum) / 100).toFixed(2)}. Increase base price or reduce discounts.`
      );
    }

    setLoading(true);

    try {
      await createProduct({
        title,
        slug,
        description,
        price: priceInCents,
        inventoryCount: Number(inventoryCount),
        categoryId: categoryId as any,
        images: uploadedImages,
        video: (uploadedVideoUrl || videoUrl).trim() || undefined,
        features, 
        isActive: true,
        model3d: uploadedModelUrl || undefined, // 👈 NEW
      });

      toast.success("Product successfully created!");
      router.push("/admin");
    } catch (error) {
      toast.error("Error saving product to database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-8 relative">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
        <p className="text-sm text-gray-500">Configure your listing details, upload product assets, and assign catalog tags.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Title</label>
          <input
            required
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={title}
            onChange={handleTitleChange}
            placeholder="e.g. Vintage Leather Jacket"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product URL Slug <span className="text-xs text-gray-400 font-normal">(Auto-updates)</span>
          </label>
          <input
            required
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={slug}
            onChange={handleSlugChange}
          />
        </div>

        {/* Category */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              + Add New Category
            </button>
          </div>
          <select
            required
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Description - Expanded to launch modal */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <button
              type="button"
              onClick={() => setShowDescriptionModal(true)}
              className="text-xs font-semibold px-2 py-1 bg-gray-100 border rounded-md text-gray-700 hover:bg-gray-200 transition"
            >
              ⛶ Open Markdown Editor
            </button>
          </div>
          <textarea
            required
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 font-mono text-sm bg-gray-50"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a brief description or open the editor for formatting..."
          />
        </div>

        {/* Features Section */}
        <div className="p-4 border rounded-md bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">Display Features</label>
            <button
              type="button"
              onClick={() => setShowFeatureModal(true)}
              className="text-xs font-semibold px-2 py-1 bg-white border rounded-md text-gray-700 hover:bg-gray-100 shadow-sm"
            >
              + Assign Feature
            </button>
          </div>
          
          {features.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-full text-sm shadow-sm">
                  {feature.type === "color" && (
                    <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: feature.value }} />
                  )}
                  {feature.type === "dimension" && (
                    <span className="text-[10px] font-bold text-gray-400">⤐</span>
                  )}
                  {feature.type === "finish" && (
                    <span className="text-[10px] font-bold text-gray-400">✦</span>
                  )}
                  <span className="font-medium text-gray-700">
                    <span className="text-gray-400 text-xs mr-1 capitalize">{feature.type}:</span>
                    {feature.type === "dimension"
                      ? (() => {
                          const parts = feature.value.split("x");
                          return parts.map(p => `${p}cm`).join(" × ");
                        })()
                      : feature.label
                    }
                    {feature.type === "dimension" && feature.label !== "Dimensions" && (
                      <span className="text-gray-400 text-xs ml-1">({feature.label})</span>
                    )}
                    {feature.priceAdjustment !== undefined && feature.priceAdjustment !== 0 && (
                      <span className={`text-xs ml-1 font-semibold ${feature.priceAdjustment > 0 ? "text-amber-600" : "text-green-600"}`}>
                        {feature.priceAdjustment > 0 ? "+" : ""}${(feature.priceAdjustment / 100).toFixed(2)}
                      </span>
                    )}
                  </span>
                  <button type="button" onClick={() => handleRemoveFeature(index)} className="text-gray-400 hover:text-red-500 ml-1 font-bold">×</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No custom features assigned.</p>
          )}
        </div>

        {/* Price and Inventory */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price ($ USD)</label>
            <input
              required
              type="number"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Available Stock</label>
            <input
              required
              type="number"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              value={inventoryCount}
              onChange={(e) => setInventoryCount(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Media — Images + Video */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images <span className="text-xs text-gray-400 font-normal">(upload one at a time)</span>
            </label>
            
            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition duration-150"
            >
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
              {uploading ? (
                <p className="text-sm text-blue-500 font-medium animate-pulse">Uploading...</p>
              ) : (
                <p className="text-sm text-gray-600">
                  {uploadedImages.length === 0 ? "Click to add images" : "Click to add another image"}
                </p>
              )}
            </div>
          </div>

          {/* Video */}
          <div className="p-4 border rounded-md bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Video <span className="text-xs text-gray-400 font-normal">optional — upload a file or paste a link</span>
            </label>

            {uploadedVideoUrl ? (
              <div className="flex items-center gap-3 p-3 bg-white border rounded-md">
                <span className="text-sm text-green-600 font-medium">✓ Video uploaded</span>
                <span className="text-xs text-gray-400 truncate flex-1">{uploadedVideoUrl}</span>
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : videoUrl.trim() ? (
              <div className="flex items-center gap-3 p-3 bg-white border rounded-md">
                <span className="text-sm text-blue-600 font-medium">✓ Video link added</span>
                <span className="text-xs text-gray-400 truncate flex-1">{videoUrl}</span>
                <button
                  type="button"
                  onClick={() => setVideoUrl("")}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  onClick={() => videoFileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition duration-150"
                >
                  <input
                    type="file"
                    accept="video/*"
                    ref={videoFileInputRef}
                    className="hidden"
                    onChange={handleVideoUpload}
                  />
                  {videoUploading ? (
                    <p className="text-sm text-blue-500 font-medium animate-pulse">Uploading...</p>
                  ) : (
                    <p className="text-sm text-gray-600">Click to upload a video file</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs text-gray-400">or</span>
                  <span className="h-px flex-1 bg-gray-200" />
                </div>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    if (uploadedVideoUrl) setUploadedVideoUrl(""); 
                  }}
                  placeholder="Paste a video URL (YouTube, Vimeo, MP4...)"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm"
                />
              </div>
            )}
          </div>

          {/* 👇 NEW: 3D Model Upload Section */}
          <div className="p-4 border rounded-md bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3D Model <span className="text-xs text-gray-400 font-normal">optional — upload a .glb file</span>
            </label>

            {uploadedModelUrl ? (
              <div className="flex items-center gap-3 p-3 bg-white border rounded-md">
                <span className="text-sm text-green-600 font-medium">✓ 3D model uploaded</span>
                <span className="text-xs text-gray-400 truncate flex-1">{uploadedModelUrl}</span>
                <button
                  type="button"
                  onClick={handleRemoveModel}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div
                onClick={() => modelFileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition duration-150"
              >
                <input
                  type="file"
                  accept=".glb"
                  ref={modelFileInputRef}
                  className="hidden"
                  onChange={handleModelUpload}
                />
                {modelUploading ? (
                  <p className="text-sm text-blue-500 font-medium animate-pulse">Uploading...</p>
                ) : (
                  <p className="text-sm text-gray-600">Click to upload a .glb 3D model</p>
                )}
              </div>
            )}
          </div>
          {/* 👆 END NEW */}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center px-4 py-3 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex-1 bg-slate-900 hover:bg-black text-white font-medium py-3 px-4 rounded-md transition duration-150 disabled:bg-gray-400"
          >
            {loading ? "Publishing product..." : "Publish Product"}
          </button>
        </div>
      </form>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg border">
            <h3 className="text-lg font-bold text-gray-950 mb-4">New Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <input
                required
                autoFocus
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g. Outerwear"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW: Markdown Description Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Product Description</h3>
              <button 
                type="button" 
                onClick={() => setShowDescriptionModal(false)}
                className="text-gray-400 hover:text-gray-700 transition font-bold text-xl"
              >
                ×
              </button>
            </div>
            
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-gray-100">
              <button type="button" onClick={() => insertMarkdown("**", "**")} className="px-3 py-1.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 rounded text-gray-700">Bold</button>
              <button type="button" onClick={() => insertMarkdown("*", "*")} className="px-3 py-1.5 text-sm italic bg-gray-100 hover:bg-gray-200 rounded text-gray-700">Italic</button>
              <button type="button" onClick={() => insertMarkdown("# ", "")} className="px-3 py-1.5 text-sm font-bold bg-gray-100 hover:bg-gray-200 rounded text-gray-700">H1</button>
              <button type="button" onClick={() => insertMarkdown("## ", "")} className="px-3 py-1.5 text-sm font-bold bg-gray-100 hover:bg-gray-200 rounded text-gray-700">H2</button>
              <button type="button" onClick={() => insertMarkdown("- ", "")} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700">• List</button>
              <button type="button" onClick={() => insertMarkdown("[Link Text](https://", ")")} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700">🔗 Link</button>
            </div>

            {/* Editor Area */}
            <textarea
              id="markdown-editor"
              className="flex-1 w-full rounded-md border border-gray-300 p-4 text-gray-900 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none bg-gray-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write your product description here using Markdown..."
            />

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setShowDescriptionModal(false)} 
                className="px-6 py-2 bg-slate-900 text-white font-medium rounded-md hover:bg-black transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Selection Modal */}
      {showFeatureModal && (
        <FeatureSelectionModal
          onClose={setShowFeatureModal}
          onSave={handleAddFeature}
          basePriceDollars={priceInput}
        />
      )}
    </div>
  );
}