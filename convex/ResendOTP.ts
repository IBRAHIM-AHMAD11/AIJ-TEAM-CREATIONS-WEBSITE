import React from "react";
import { render } from "@react-email/components";
import PasswordResetEmail from "./emails/PasswordResetEmail";
import VerificationEmail from "./emails/VerificationEmail";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function generateToken() {
  const chars = "0123456789";
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

function parseFrom(from: string): { name: string; email: string } {
  const match = from.match(/^(.+) <(.+)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: "", email: from.trim() };
}

async function sendEmailViaBrevo({
  from,
  to,
  subject,
  html,
  text,
}: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY is not set");

  const sender = parseFrom(from);
  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo error (${res.status}): ${body}`);
  }
}

const emailConfig = {
  id: "brevo",
  type: "email" as const,
  name: "Brevo",
  server: {},
  from:
    process.env.AUTH_EMAIL_FROM ??
    "AIJ Creations <aij.professionals.team@gmail.com>",
  maxAge: 15 * 60,
};

export const BrevoOTPPasswordReset = {
  ...emailConfig,
  async generateVerificationToken() {
    return generateToken();
  },
  async sendVerificationRequest(params: {
    identifier: string;
    provider: { from?: string };
    token: string;
  }) {
    const { identifier: email, provider, token } = params;
    const from = provider.from ?? emailConfig.from;
    const html = await render(
      React.createElement(PasswordResetEmail, { code: token })
    );
    await sendEmailViaBrevo({
      from,
      to: email,
      subject: "Reset your password in AIJ Creations",
      text: "Your password reset code is: " + token,
      html,
    });
  },
};

export const BrevoOTPEmailVerification = {
  ...emailConfig,
  async generateVerificationToken() {
    return generateToken();
  },
  async sendVerificationRequest(params: {
    identifier: string;
    provider: { from?: string };
    token: string;
  }) {
    const { identifier: email, provider, token } = params;
    const from = provider.from ?? emailConfig.from;
    const html = await render(
      React.createElement(VerificationEmail, { code: token })
    );
    await sendEmailViaBrevo({
      from,
      to: email,
      subject: "Verify your email for AIJ Creations",
      text: "Your email verification code is: " + token,
      html,
    });
  },
};
