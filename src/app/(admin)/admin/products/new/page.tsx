"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Components
import { FeatureSelectionModal } from "../../FeatureSelectionModal";

interface ProductFeature {
  type: "color" | "size" | "material" | "custom";
  label: string;
  value: string;
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
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  // Feature State
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setUploadedImageUrl(imageUrl);
      }
    } catch (err) {
      toast.error("Failed to upload image asset.");
    } finally {
      setUploading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return toast.message("Please select or create a category first!");
    setLoading(true);

    const priceInCents = Math.round(parseFloat(priceInput) * 100);

    try {
      await createProduct({
        title,
        slug,
        description,
        price: priceInCents,
        inventoryCount: Number(inventoryCount),
        categoryId: categoryId as any,
        images: uploadedImageUrl ? [uploadedImageUrl] : [],
        features, 
        isActive: true,
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

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            required
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
                  <span className="font-medium text-gray-700">
                    <span className="text-gray-400 text-xs mr-1 capitalize">{feature.type}:</span>
                    {feature.label}
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

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition duration-150"
          >
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
            {uploading ? (
              <p className="text-sm text-blue-500 font-medium animate-pulse">Uploading...</p>
            ) : uploadedImageUrl ? (
              <div className="flex flex-col items-center space-y-2">
                <img src={uploadedImageUrl} alt="Preview" className="h-32 w-32 object-cover rounded-md border" />
                <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Click to browse your files</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full bg-slate-900 hover:bg-black text-white font-medium py-3 px-4 rounded-md transition duration-150 disabled:bg-gray-400"
        >
          {loading ? "Publishing product..." : "Publish Product"}
        </button>
      </form>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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

      {/* Feature Selection Modal */}
      <FeatureSelectionModal 
        isOpen={showFeatureModal}
        onClose={setShowFeatureModal}
        onSave={handleAddFeature}
      />
    </div>
  );
}