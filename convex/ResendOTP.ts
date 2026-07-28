import React from "react";
import { render } from "@react-email/components";
import PasswordResetEmail from "./emails/PasswordResetEmail";
import VerificationEmail from "./emails/VerificationEmail";

const RESEND_API_URL = "https://api.resend.com/emails";

function generateToken() {
  const chars = "0123456789";
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

async function sendEmailViaResend({
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
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error (${res.status}): ${body}`);
  }
}

const emailConfig = {
  id: "resend",
  type: "email" as const,
  name: "Resend",
  server: {},
  from:
    process.env.AUTH_EMAIL_FROM ??
    "AIJ Creations <support@aijteam.abrdns.com>",
  maxAge: 15 * 60,
};

export const ResendOTPPasswordReset = {
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
    await sendEmailViaResend({
      from,
      to: email,
      subject: "Reset your password in AIJ Creations",
      text: "Your password reset code is: " + token,
      html,
    });
  },
};

export const ResendOTPEmailVerification = {
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
    await sendEmailViaResend({
      from,
      to: email,
      subject: "Verify your email for AIJ Creations",
      text: "Your email verification code is: " + token,
      html,
    });
  },
};
