"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { sendOrderConfirmationEmail } from "@/app/actions/checkout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
  });

  // Convex Hooks
  const cartItems = useQuery(api.cart.getCart) || [];
  const createOrder = useMutation(api.orders.create);
  const clearCart = useMutation(api.cart.clearCart);

  // Math
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const shippingCost = subtotal > 0 ? 15 : 0; // Flat rate example
  const taxTotal = subtotal * 0.08; // 8% tax example
  const total = subtotal + shippingCost + taxTotal;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setIsSubmitting(true);

    try {
      // 1. Format items for Convex
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        title: item.product?.title || "Unknown Product",
        price: item.product?.price || 0,
        quantity: item.quantity,
        image: item.product?.images?.[0],
        selectedFeatures: item.selectedFeatures,
      }));

      // 2. Create Order in Convex
      const orderId = await createOrder({
        items: orderItems,
        subtotal,
        shippingCost,
        taxTotal,
        total,
        shippingAddress: {
          name: formData.name,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          phone: formData.phone,
        },
        paymentMethod: "credit_card", 
      });

      // (Optional) Fetch the created order from DB to get the auto-generated orderNumber
      // For immediate UI, we can just generate a generic one or assume a successful response.
      const mockOrderNumber = `ORD-${Date.now()}`;

      // 3. Send Email via Resend Action
      await sendOrderConfirmationEmail({
        email: formData.email,
        orderNumber: mockOrderNumber,
        customerName: formData.name,
        items: orderItems,
        total,
        shippingAddress: formData,
      });

      // 4. Clear Cart & Redirect
      await clearCart();
      router.push(`/checkout/success`);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Something went wrong during checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Checkout Form */}
        <motion.div className="lg:col-span-7" variants={itemVariants}>
          <Card className="bg-card shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-foreground">
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="bg-input"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      className="bg-input"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      name="street"
                      required
                      className="bg-input"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        required
                        className="bg-input"
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State / Province</Label>
                      <Input
                        id="state"
                        name="state"
                        required
                        className="bg-input"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP / Postal Code</Label>
                      <Input
                        id="zip"
                        name="zip"
                        required
                        className="bg-input"
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        required
                        className="bg-input"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="bg-input"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg mt-6"
                  disabled={isSubmitting || cartItems.length === 0}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-5 w-5" />
                  )}
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Summary */}
        <motion.div className="lg:col-span-5" variants={itemVariants}>
          <Card className="bg-card shadow-sm border-border sticky top-8">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-foreground">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {cartItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Your cart is empty.
                  </p>
                ) : (
                  cartItems.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between items-center bg-secondary p-3 rounded-md"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {item.product?.title}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>

              <Separator className="my-6 bg-border" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-foreground">${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span className="text-foreground">${taxTotal.toFixed(2)}</span>
                </div>
                <Separator className="my-3 bg-border" />
                <div className="flex justify-between font-bold text-lg text-foreground">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}