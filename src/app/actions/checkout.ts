"use server";

import React from "react";
import { render } from "@react-email/components";
import OrderConfirmationEmail from "@/emails/OrderConfirmationEmail";

const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendOrderConfirmationEmail(params: {
  email: string;
  orderNumber: string;
  customerName: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  total: number;
  shippingAddress: any;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");

  const html = await render(
    React.createElement(OrderConfirmationEmail, {
      orderNumber: params.orderNumber,
      customerName: params.customerName,
      items: params.items,
      total: params.total,
      shippingAddress: params.shippingAddress,
    })
  );

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.AUTH_EMAIL_FROM ?? "AIJ Creations <support@aijteam.abrdns.com>",
      to: params.email,
      subject: `Order Confirmation #${params.orderNumber} - AIJ Creations`,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error (${res.status}): ${body}`);
  }

  return { success: true };
}