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

interface DeleteProductDialogProps {
  productToDelete: { id: string; title: string } | null;
  setProductToDelete: (product: { id: string; title: string } | null) => void;
  handleDeleteConfirm: () => void;
}

export function DeleteProductDialog({ productToDelete, setProductToDelete, handleDeleteConfirm }: DeleteProductDialogProps) {
  return (
    <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-bold">Are you sure?</DialogTitle>
          <DialogDescription className="text-slate-500 pt-1">
            This will permanently delete <strong className="text-slate-900 font-semibold">"{productToDelete?.title}"</strong> and all its associated images and videos. This action cannot be undone.
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
  );
}