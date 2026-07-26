"use client"

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCurrentUser } from "@/features/auth/use-current-user";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader, Package, Clock, MapPin } from "lucide-react";
import Image from "next/image";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const OrdersPage = () => {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const orders = useQuery(api.orders.list);

  if (userLoading) {
    return (
      <div className="px-4 pt-4 flex items-center justify-center h-64">
        <Loader className="size-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="px-4 pt-4 max-w-3xl mx-auto">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Store", href: "/store" }, { label: "Orders" }]} />

      <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-6">Order History</h1>

      {orders?.length === 0 && (
        <div className="text-center py-12">
          <Package className="size-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No orders yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {orders?.map((order) => (
          <Card key={order._id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="size-4" />
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <Badge className={statusColor[order.status]}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-1">
                    {item.image && (
                      <div className="size-12 rounded bg-gray-100 relative shrink-0 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} &times; ${(item.price / 100).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="size-3" />
                  Ship to: {order.shippingAddress.name}, {order.shippingAddress.city}
                </div>
                <p className="text-base font-bold text-gray-900">
                  ${(order.total / 100).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
