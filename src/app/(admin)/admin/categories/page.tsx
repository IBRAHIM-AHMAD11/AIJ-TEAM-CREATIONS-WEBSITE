"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { DeleteCategoryDialog } from "../../../../components/admin/delete-category-dialog";
import { CategoryProductsDialog } from "../../../../components/admin/category-products-dialog";
import { Trash2, Folder, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CategoriesPage() {
  const categories = useQuery(api.categories.list);
  const products = useQuery(api.products.list);
  const removeCategory = useMutation(api.categories.remove);

  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: Id<"categories">;
    name: string;
  } | null>(null);

  const [selectedCategoryForProducts, setSelectedCategoryForProducts] = useState<{
    id: Id<"categories">;
    name: string;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      await removeCategory({ id: categoryToDelete.id });
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to count items per category
  const getProductCount = (categoryId: Id<"categories">) => {
    if (!products) return 0;
    return products.filter((p) => p.categoryId === categoryId).length;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500">Manage your product categories and view linked items.</p>
        </div>
        <Button className="shadow-sm">
          <Link href="/admin" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Page
          </Link>
        </Button>
      </div>

      {categories === undefined && (
        <p className="text-slate-500 text-sm">Loading categories...</p>
      )}

      {categories && categories.length === 0 && (
        <div className="p-8 text-center border rounded-lg bg-slate-50">
          <Folder className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 font-medium">No categories found</p>
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="border rounded-lg overflow-hidden divide-y">
          {categories.map((category) => {
            const count = getProductCount(category._id);
            return (
              <div
                key={category._id}
                className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">{category.name}</h3>
                  <p className="text-xs text-slate-500">
                    /{category.slug} • <span className="font-medium text-slate-700">{count} {count === 1 ? "product" : "products"}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-1.5 text-xs"
                    onClick={() => setSelectedCategoryForProducts({ id: category._id, name: category.name })}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Products
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setCategoryToDelete({ id: category._id, name: category.name })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Products Modal */}
      <CategoryProductsDialog
        category={selectedCategoryForProducts}
        onClose={() => setSelectedCategoryForProducts(null)}
      />

      {/* Deletion Confirm Dialog */}
      <DeleteCategoryDialog
        categoryToDelete={categoryToDelete}
        setCategoryToDelete={setCategoryToDelete}
        handleDeleteConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}