"use client";

import { Package, TrendingUp, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, Variants } from "framer-motion";

interface DashboardStatsProps {
  totalProducts: number;
  totalValue: number;
  outOfStockProducts: number;
  itemAnim: Variants;
}

export function DashboardStats({ totalProducts, totalValue, outOfStockProducts, itemAnim }: DashboardStatsProps) {
  return (
    <motion.div variants={itemAnim} className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div variants={itemAnim}>
        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Products</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, delay: 0.2 }} className="text-2xl font-bold text-slate-900">{totalProducts}</motion.div>
            <p className="text-xs text-slate-400 mt-1">Active unique items in catalog</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemAnim}>
        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Stock Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, delay: 0.3 }} className="text-2xl font-bold text-slate-900">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </motion.div>
            <p className="text-xs text-slate-400 mt-1">Based on active price & inventory levels</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemAnim}>
        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Stock Status</CardTitle>
            <Layers className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, delay: 0.4 }} className="text-2xl font-bold text-slate-900">
              {outOfStockProducts} Out of Stock
            </motion.div>
            <p className="text-xs text-amber-600 font-semibold mt-1">
              {outOfStockProducts > 0 ? "Needs restock attention" : "All products healthy"}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}