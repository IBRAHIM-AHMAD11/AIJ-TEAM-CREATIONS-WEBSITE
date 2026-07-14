// app/(admin)/admin/page.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Package, 
  TrendingUp, 
  Layers, 
  ExternalLink,
  Loader2
} from "lucide-react";

// shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminPage() {
  // 1. Fetch Backend Data
  const products = useQuery(api.products.list) || [];
  const categories = useQuery(api.categories.list) || [];
  const deleteProduct = useMutation(api.products.deleteProduct);

  // 2. State management
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; title: string } | null>(null);

  // 3. Delete action
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    const targetId = productToDelete.id;
    setDeletingId(targetId);
    setProductToDelete(null); // Close modal instantly

    try {
      await deleteProduct({ id: targetId as any });
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Error deleting product document.");
    } finally {
      setDeletingId(null);
    }
  };

  // 4. Dynamic KPI metrics
  const totalProducts = products.length;
  const outOfStockProducts = products.filter(p => p.inventoryCount === 0).length;
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.inventoryCount), 0) / 100;

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white">
            Overview Dashboard
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Monitor inventory values, adjust catalog products, and track real-time listings on your storefront.
          </p>
        </div>
        <Button aschild="true" className="shadow-sm">
          <Link href="/admin/products/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Products</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalProducts}</div>
            <p className="text-xs text-slate-400 mt-1">
              Active unique items in catalog
            </p>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Stock Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Based on active price & inventory levels
            </p>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Stock Status</CardTitle>
            <Layers className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {outOfStockProducts} Out of Stock
            </div>
            <p className="text-xs text-amber-600 font-semibold mt-1">
              {outOfStockProducts > 0 ? "Needs restock attention" : "All products healthy"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Inventory Section */}
      <Card className="border border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Live Inventory List</CardTitle>
          <CardDescription>A comprehensive look at your current stock records stored in Convex.</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-100 rounded-lg">
              <Package className="h-10 w-10 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No products added yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">Get started by creating your very first catalog product.</p>
              <Button aschild="true" size="sm" className="mt-4">
                <Link href="/admin/products/new">Create Product</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px]">Product Info</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const matchedCategory = categories.find(c => c._id === product.categoryId);

                    return (
                      <TableRow key={product._id} className="group transition duration-150">
                        {/* Title & Image info */}
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {product.images && product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="h-10 w-10 object-cover rounded-lg border border-slate-100 bg-slate-50"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                                Empty
                              </div>
                            )}
                            <div className="space-y-0.5">
                              <span className="text-sm font-bold text-slate-900 line-clamp-1 block">
                                {product.title}
                              </span>
                              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                                {product.slug}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Category Tag */}
                        <TableCell>
                          {matchedCategory ? (
                            <Badge variant="secondary" className="font-semibold bg-slate-50 text-slate-600 hover:bg-slate-50">
                              {matchedCategory.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Uncategorized</span>
                          )}
                        </TableCell>

                        {/* Price */}
                        <TableCell className="text-slate-700 font-medium">
                          ${(product.price / 100).toFixed(2)}
                        </TableCell>

                        {/* Stock */}
                        <TableCell>
                          {product.inventoryCount === 0 ? (
                            <Badge variant="destructive" className="font-semibold px-2 py-0.5">
                              Sold Out
                            </Badge>
                          ) : product.inventoryCount < 5 ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-semibold text-amber-600">{product.inventoryCount} units</span>
                              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Low Stock</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-600">{product.inventoryCount} units</span>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setProductToDelete({ id: product._id, title: product.title })}
                              disabled={deletingId === product._id}
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-md transition"
                            >
                              {deletingId === product._id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SHADCN CONFIRMATION MODAL */}
      <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold">Are you sure?</DialogTitle>
            <DialogDescription className="text-slate-500 pt-1">
              This will permanently delete <strong className="text-slate-900 font-semibold">"{productToDelete?.title}"</strong> from your database and remove any uploaded image files. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setProductToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}