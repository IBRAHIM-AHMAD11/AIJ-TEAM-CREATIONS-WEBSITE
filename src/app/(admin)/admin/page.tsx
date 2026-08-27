"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { DashboardHeader } from "@/components/admin/dashboard-header";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { ProductTable } from "@/components/admin/product-table";
import { DeleteProductDialog } from "@/components/admin/delete-product-dialog";

export default function AdminPage() {
  const products = useQuery(api.products.list) || [];
  const categories = useQuery(api.categories.list) || [];
  const deleteProduct = useMutation(api.products.deleteProduct);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; title: string } | null>(null);

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    const targetId = productToDelete.id;
    setDeletingId(targetId);
    setProductToDelete(null);

    try {
      await deleteProduct({ id: targetId as any });
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Error deleting product document.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalProducts = products.length;
  const outOfStockProducts = products.filter(p => p.inventoryCount === 0).length;
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.inventoryCount), 0) / 100;

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-8">
      <DashboardHeader itemAnim={itemAnim} />
      
      <DashboardStats 
        totalProducts={totalProducts} 
        totalValue={totalValue} 
        outOfStockProducts={outOfStockProducts} 
        itemAnim={itemAnim} 
      />
      
      <ProductTable 
        products={products} 
        categories={categories} 
        deletingId={deletingId} 
        setProductToDelete={setProductToDelete} 
        itemAnim={itemAnim} 
      />

      <DeleteProductDialog 
        productToDelete={productToDelete} 
        setProductToDelete={setProductToDelete} 
        handleDeleteConfirm={handleDeleteConfirm} 
      />
    </motion.div>
  );
}