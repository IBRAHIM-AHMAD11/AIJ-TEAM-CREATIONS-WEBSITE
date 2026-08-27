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

interface DeleteOrderDialogProps {
  orderToDelete: any | null;
  setOrderToDelete: (order: any | null) => void;
  handleDeleteConfirm: () => void;
}

export function DeleteOrderDialog({ orderToDelete, setOrderToDelete, handleDeleteConfirm }: DeleteOrderDialogProps) {
  return (
    <Dialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-bold">Delete Order?</DialogTitle>
          <DialogDescription className="text-slate-500 pt-1">
            This will permanently delete order <strong className="text-slate-900 font-semibold">{orderToDelete?.orderNumber}</strong> from the database. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOrderToDelete(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteConfirm}>
            Delete Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}