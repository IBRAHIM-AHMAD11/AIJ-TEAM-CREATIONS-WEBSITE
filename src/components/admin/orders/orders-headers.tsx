"use client";

import { motion, Variants } from "framer-motion";

interface OrdersHeaderProps {
  itemAnim: Variants;
}

export function OrdersHeader({ itemAnim }: OrdersHeaderProps) {
  return (
    <motion.div variants={itemAnim} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white">
          Orders Management
        </h1>
        <p className="text-sm text-slate-500 max-w-xl">
          View all customer orders, track fulfillment progress, and manage payment statuses.
        </p>
      </div>
    </motion.div>
  );
}