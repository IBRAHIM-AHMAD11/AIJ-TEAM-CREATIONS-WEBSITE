// app/(admin)/admin/products/new/page.tsx
"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewProductPage() {
  const router = useRouter();
  
  // Convex Mutations & Queries
  const createProduct = useMutation(api.products.createProduct);
  const createCategory = useMutation(api.categories.create);
  const categories = useQuery(api.categories.list) || [];
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  
  // Query helper to resolve Convex Storage ID directly to a CDN URL
  const getImageUrl = useMutation(api.upload.getStorageUrl);

  // Core Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [inventoryCount, setInventoryCount] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  // Loading States
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Mini-form state for new category
  const [newCatName, setNewCatName] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Turn any text into a clean slug
  const convertToSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  // Auto-fill slug when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    setSlug(convertToSlug(value)); 
  };

  // Handle manual slug typing
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(convertToSlug(e.target.value));
  };

  // Direct Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Ask Convex for a unique, secure upload URL
      const postUrl = await generateUploadUrl();

      // 2. POST the raw image file directly to that URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) toast.error("Network upload request failed");
      const { storageId } = await result.json();

      // 3. Resolve the Storage ID to a publicly accessible URL
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

  // Add Category Inline
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const catSlug = convertToSlug(newCatName);
      const newCatId = await createCategory({ name: newCatName, slug: catSlug });
      setCategoryId(newCatId); // Auto-select the newly created category!
      setNewCatName("");
      setShowCategoryModal(false);
    } catch (err) {
      toast.error("Failed to create category.");
    }
  };

  // Submit Final Product Form
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
            Product URL Slug <span className="text-xs text-gray-400 font-normal">(Auto-updates, editable text box)</span>
          </label>
          <input
            required
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={slug}
            onChange={handleSlugChange}
            placeholder="vintage-leather-jacket"
          />
        </div>

        {/* Category Selector with Quick Add */}
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
            placeholder="Detail the materials, design quirks, and measurements..."
          />
        </div>

        {/* Grid: Price and Inventory */}
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
              placeholder="49.99"
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
              placeholder="10"
            />
          </div>
        </div>

        {/* File Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition duration-150"
          >
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImageUpload}
            />
            {uploading ? (
              <p className="text-sm text-blue-500 font-medium animate-pulse">Uploading file to servers...</p>
            ) : uploadedImageUrl ? (
              <div className="flex flex-col items-center space-y-2">
                <img src={uploadedImageUrl} alt="Preview" className="h-32 w-32 object-cover rounded-md border" />
                <span className="text-xs text-green-600 font-medium">✓ Image uploaded successfully</span>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600">Click to browse your files</p>
                <p className="text-xs text-gray-400 mt-1">Supports PNG, JPG, WEBP up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full bg-slate-900 hover:bg-black text-white font-medium py-3 px-4 rounded-md transition duration-150 disabled:bg-gray-400"
        >
          {loading ? "Publishing product..." : "Publish Product"}
        </button>
      </form>

      {/* QUICK ADD CATEGORY MODAL DIALOG */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-950 mb-1">New Category</h3>
            <p className="text-xs text-gray-500 mb-4">Add a new organization classification to your catalog.</p>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Category Name</label>
                <input
                  required
                  autoFocus
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 text-sm"
                  placeholder="e.g. Outerwear"
                />
              </div>
              <div className="flex justify-end gap-2 text-sm pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}