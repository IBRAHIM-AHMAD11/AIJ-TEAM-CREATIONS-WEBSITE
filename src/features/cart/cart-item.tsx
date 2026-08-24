"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: Doc<"cartItems"> & { product: Doc<"products"> | null };
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.removeItem);

  if (!item.product) return null;

  return (
    <div className="flex gap-3 py-3 border-b last:border-b-0">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100 relative">
        <Image
          src={item.product.images?.[0] || "/placeholder-product.jpg"}
          alt={item.product.title}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
            {item.product.title}
          </h4>
          {item.selectedFeatures && item.selectedFeatures.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {item.selectedFeatures.map(f => f.label || f.value).join(", ")}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            ${(item.product.price / 100).toFixed(2)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() =>
                updateQuantity({ id: item._id, quantity: item.quantity - 1 })
              }
            >
              <Minus className="size-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() =>
                updateQuantity({ id: item._id, quantity: item.quantity + 1 })
              }
            >
              <Plus className="size-3" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-red-500 hover:text-red-700"
            onClick={() => removeItem({ id: item._id })}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
