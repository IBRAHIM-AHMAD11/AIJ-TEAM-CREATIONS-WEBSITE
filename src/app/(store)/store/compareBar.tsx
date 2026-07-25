"use client";

import { useAtom } from "jotai";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { compareIdsAtom } from "./atoms";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CompareBar() {
  const [compareIds, setCompareIds] = useAtom(compareIdsAtom);
  const products = useQuery(
    api.products.getByIds,
    compareIds.length > 0 ? { ids: compareIds as Id<"products">[] } : "skip"
  );
  const router = useRouter();

  return (
    <AnimatePresence>
      {compareIds.length > 0 && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-4 py-3"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700 shrink-0">
              Compare ({compareIds.length})
            </span>
            <div className="flex gap-2 flex-1 overflow-x-auto">
              {(products ?? []).map((p) => (
                <span
                  key={p._id}
                  className="text-xs text-slate-600 bg-slate-100 rounded px-2 py-1 flex items-center gap-1 shrink-0"
                >
                  {p.title}
                  <button
                    onClick={() => setCompareIds((prev) => prev.filter((id) => id !== p._id))}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/compare")}
              disabled={compareIds.length < 2}
            >
              Compare
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
