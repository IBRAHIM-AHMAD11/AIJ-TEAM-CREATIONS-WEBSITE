"use client";

import { ShoppingCart, Clock, CircleDollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, Variants } from "framer-motion";

interface OrdersStatsProps {
  orders: any[];
  itemAnim: Variants;
}

export function OrdersStats({ orders, itemAnim }: OrdersStatsProps) {
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0;
  
  // Assuming total is stored in cents, similar to standard Stripe integrations
  const totalRevenue = orders
    ?.filter((o) => o.paymentStatus === "paid")
    .reduce((acc, o) => acc + o.total, 0) / 100 || 0;

  return (
    <motion.div variants={itemAnim} className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div variants={itemAnim}>
        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalOrders}</div>
            <p className="text-xs text-slate-400 mt-1">Lifetime orders</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemAnim}>
        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Fulfillment</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{pendingOrders}</div>
            <p className="text-xs text-slate-400 mt-1">Orders awaiting processing</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemAnim}>
        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-1">From paid orders only</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}