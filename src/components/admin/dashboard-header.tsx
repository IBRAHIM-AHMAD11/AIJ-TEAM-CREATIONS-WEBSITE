"use client";

import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";

interface DashboardHeaderProps {
  itemAnim: Variants;
}

export function DashboardHeader({ itemAnim }: DashboardHeaderProps) {
  return (
    <motion.div variants={itemAnim} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white">
          Overview Dashboard
        </h1>
        <p className="text-sm text-slate-500 max-w-xl">
          Monitor inventory values, adjust catalog products, and track real-time listings on your storefront.
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Removed asChild and nested the Link inside exactly like Add Product */}
        <Button variant="outline" className="shadow-sm">
          <Link href="/admin/orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Orders
          </Link>
        </Button>

        <Button className="shadow-sm">
          <Link href="/admin/products/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}