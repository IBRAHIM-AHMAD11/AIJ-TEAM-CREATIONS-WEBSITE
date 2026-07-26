import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  code: string;
}

const PasswordResetEmail = ({ code }: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Body
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f4f4",
        padding: "40px 20px",
      }}
    >
      <Container
        style={{
          maxWidth: 480,
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: 8,
          padding: 32,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: 700,
            margin: "0 0 4px",
            color: "#111",
          }}
        >
          AIJ Creations
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#666",
            margin: "0 0 24px",
          }}
        >
          Reset your password
        </Text>

        <Text
          style={{
            fontSize: 14,
            lineHeight: "1.5",
            color: "#333",
            margin: "0 0 16px",
          }}
        >
          Use the code below to reset your password. It expires in 15 minutes.
        </Text>

        <Section style={{ textAlign: "center", margin: "24px 0" }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: 8,
              color: "#000",
              fontFamily: "Courier New, monospace",
            }}
          >
            {code}
          </Text>
        </Section>

        <Text
          style={{
            fontSize: 12,
            color: "#999",
            margin: "24px 0 0",
            lineHeight: "1.4",
          }}
        >
          If you didn&apos;t request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PasswordResetEmail;
