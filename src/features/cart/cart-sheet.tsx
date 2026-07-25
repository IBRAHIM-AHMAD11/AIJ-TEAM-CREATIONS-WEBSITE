"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAtom } from "jotai";
import { cartOpenAtom } from "./store";
import { CartItem } from "./cart-item";
import { useCurrentUser } from "@/features/auth/use-current-user";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, LogIn } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

export function CartSheet() {
  const [open, setOpen] = useAtom(cartOpenAtom);
  const { data: user } = useCurrentUser();
  const router = useRouter();

  const cart = useQuery(api.cart.getCart);
  const clearCart = useMutation(api.cart.clearCart);

  const total = (cart ?? []).reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

  const itemCount = (cart ?? []).reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="size-5" />
            Shopping Cart
            {itemCount > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <Separator />

        {!user ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <LogIn className="size-12 text-gray-300" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Sign in to view your cart
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Your cart items will be saved across sessions
              </p>
            </div>
            <Button onClick={() => router.push("/auth")}>
              Sign In
            </Button>
          </motion.div>
        ) : cart === undefined ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        ) : cart.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <ShoppingCart className="size-12 text-gray-300" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Your cart is empty
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Add some products to get started
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 overflow-y-auto px-1">
            <AnimatePresence initial={false}>
              {cart.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <CartItem item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {user && cart && cart.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3 px-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ${(total / 100).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Shipping and taxes calculated at checkout
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => clearCart()}
                >
                  <Trash2 className="size-4 mr-1" />
                  Clear
                </Button>
                <Button size="sm" className="flex-1" onClick={() => { setOpen(false); toast.info("Checkout coming soon!"); }}>
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}

        <div className="h-2" />
      </SheetContent>
    </Sheet>
  );
}
