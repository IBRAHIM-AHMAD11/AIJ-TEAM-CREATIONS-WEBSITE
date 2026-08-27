import React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
  Row,
  Column,
  Hr,
} from "@react-email/components";

interface OrderEmailProps {
  orderNumber: string;
  customerName: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export default function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  total,
  shippingAddress,
}: OrderEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#fff9e6", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ margin: "0 auto", padding: "20px", backgroundColor: "#fffbed", borderRadius: "8px" }}>
          <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#3d3a30" }}>
            Order Confirmation
          </Text>
          <Text style={{ color: "#4a4238" }}>
            Hi {customerName}, thanks for your order! We're getting it ready to be shipped.
          </Text>
          
          <Section style={{ margin: "20px 0", padding: "15px", border: "1px solid #efe6cc", borderRadius: "8px" }}>
            <Text style={{ fontWeight: "bold", margin: "0 0 10px", color: "#3d3a30" }}>
              Order #{orderNumber}
            </Text>
            {items.map((item, index) => (
              <Row key={index} style={{ marginBottom: "10px" }}>
                <Column>
                  <Text style={{ margin: 0, color: "#4a4238" }}>
                    {item.quantity}x {item.title}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={{ margin: 0, color: "#3d3a30", fontWeight: "bold" }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            ))}
            <Hr style={{ borderColor: "#efe6cc", margin: "15px 0" }} />
            <Row>
              <Column><Text style={{ margin: 0, fontWeight: "bold", color: "#3d3a30" }}>Total</Text></Column>
              <Column align="right"><Text style={{ margin: 0, fontWeight: "bold", color: "#3d3a30" }}>${total.toFixed(2)}</Text></Column>
            </Row>
          </Section>

          <Section>
            <Text style={{ fontWeight: "bold", color: "#3d3a30" }}>Shipping Address:</Text>
            <Text style={{ color: "#4a4238", margin: 0 }}>{shippingAddress.street}</Text>
            <Text style={{ color: "#4a4238", margin: 0 }}>
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
            </Text>
            <Text style={{ color: "#4a4238", margin: 0 }}>{shippingAddress.country}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}