"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { OrdersHeader } from "@/components/admin/orders/orders-headers";
import { OrdersStats } from "@/components/admin/orders/orders-stats";
import { OrdersTable } from "@/components/admin/orders/orders-table";
import { UpdateStatusDialog } from "@/components/admin/orders/update-status-dialog";
import { DeleteOrderDialog } from "@/components/admin/orders/delete-order-dialog"; // Add this

export default function AdminOrdersPage() {
  const orders = useQuery(api.orders.listAll);
  const updateStatusMutation = useMutation(api.orders.updateStatus);
  const removeOrderMutation = useMutation(api.orders.removeOrder); // Add this

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Add state for deletion
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, status: any, paymentStatus: any) => {
    try {
      await updateStatusMutation({ 
        id: id as any, 
        status, 
        paymentStatus 
      });
      toast.success("Order updated successfully");
      setSelectedOrder(null);
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Error updating the order.");
    }
  };

  // Add the deletion handler
  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    const targetId = orderToDelete._id;
    setDeletingId(targetId);
    setOrderToDelete(null); // Close modal immediately while deleting

    try {
      await removeOrderMutation({ id: targetId });
      toast.success("Order deleted successfully");
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast.error("Error deleting order.");
    } finally {
      setDeletingId(null);
    }
  };

  const containerAnim = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  if (orders === undefined) {
    return <div className="p-8 text-center text-slate-500">Loading orders...</div>;
  }

  if (orders === null) {
    return <div className="p-8 text-center text-red-500">Not authorized to view this page.</div>;
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerAnim} className="space-y-8">
      <OrdersHeader itemAnim={itemAnim} />
      
      <OrdersStats orders={orders} itemAnim={itemAnim} />
      
      <OrdersTable 
        orders={orders} 
        onEditOrder={setSelectedOrder} 
        setOrderToDelete={setOrderToDelete}
        deletingId={deletingId}
        itemAnim={itemAnim} 
      />

      <UpdateStatusDialog 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        onUpdate={handleUpdateStatus} 
      />

      <DeleteOrderDialog 
        orderToDelete={orderToDelete}
        setOrderToDelete={setOrderToDelete}
        handleDeleteConfirm={handleDeleteConfirm}
      />
    </motion.div>
  );
}