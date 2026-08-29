"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="border-t border-slate-200 bg-white mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} AIJ Creations. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Handcrafted resin art</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
