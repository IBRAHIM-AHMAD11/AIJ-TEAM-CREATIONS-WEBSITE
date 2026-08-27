"use client";

import { Edit, Package, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion, Variants } from "framer-motion";

interface OrdersTableProps {
  orders: any[];
  onEditOrder: (order: any) => void;
  setOrderToDelete: (order: any) => void;
  deletingId: string | null;
  itemAnim: Variants;
}

export function OrdersTable({ orders, onEditOrder, setOrderToDelete, deletingId, itemAnim }: OrdersTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
      case "shipped": return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "processing": return "bg-indigo-100 text-indigo-700 hover:bg-indigo-100";
      case "cancelled": return "bg-red-100 text-red-700 hover:bg-red-100";
      default: return "bg-amber-100 text-amber-700 hover:bg-amber-100"; // pending
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
      case "failed": return "bg-red-100 text-red-700 hover:bg-red-100";
      case "refunded": return "bg-slate-100 text-slate-700 hover:bg-slate-100";
      default: return "bg-amber-100 text-amber-700 hover:bg-amber-100"; // unpaid
    }
  };

  return (
    <motion.div variants={itemAnim}>
      <Card className="border border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {(!orders || orders.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-100 rounded-lg">
              <Package className="h-10 w-10 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No orders found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">When customers place orders, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Info</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Fulfillment</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, i) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className="group transition duration-150 border-b"
                    >
                      <TableCell className="font-medium">
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-slate-900 block">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="text-sm text-slate-800 block font-medium">
                            {order.shippingAddress?.name || "Unknown"}
                          </span>
                          <span className="text-xs font-medium text-slate-600 block">
                            {order.customerEmail}
                          </span>
                          <span className="text-xs text-slate-500">
                            {order.shippingAddress?.city}, {order.shippingAddress?.country}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700">
                        PKR {(order.total / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`uppercase text-[10px] tracking-wide font-bold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`uppercase text-[10px] tracking-wide font-bold ${getPaymentColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditOrder(order)}
                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOrderToDelete(order)}
                            disabled={deletingId === order._id}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-md transition"
                          >
                            {deletingId === order._id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}