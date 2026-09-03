"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Id } from "../../../convex/_generated/dataModel";

interface DeleteCategoryDialogProps {
  categoryToDelete: { id: Id<"categories">; name: string } | null;
  setCategoryToDelete: (category: { id: Id<"categories">; name: string } | null) => void;
  handleDeleteConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteCategoryDialog({
  categoryToDelete,
  setCategoryToDelete,
  handleDeleteConfirm,
  isDeleting = false,
}: DeleteCategoryDialogProps) {
  return (
    <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-bold">Are you sure?</DialogTitle>
          <DialogDescription className="text-slate-500 pt-1">
            This will permanently delete <strong className="text-slate-900 font-semibold">"{categoryToDelete?.name}"</strong> and all associated products, images, and media assets. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setCategoryToDelete(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}