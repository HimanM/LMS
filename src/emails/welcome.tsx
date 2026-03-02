import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  inviteLink: string;
  email: string;
}

export function WelcomeEmail({ inviteLink, email }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;ve been invited to the Learning Management System</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>Welcome to LMS</Heading>
          </Section>
          <Hr style={hr} />
          <Section style={contentSection}>
            <Text style={text}>
              Hello! You&apos;ve been invited to join our Learning Management System.
            </Text>
            <Text style={text}>
              Your account has been created with the email{" "}
              <strong>{email}</strong>. Please click the button below to set your
              password and get started.
            </Text>
            <Section style={buttonSection}>
              <Link style={button} href={inviteLink}>
                Set Your Password
              </Link>
            </Section>
            <Text style={mutedText}>
              If you didn&apos;t expect this invitation, you can safely ignore this
              email.
            </Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            © {new Date().getFullYear()} LMS Platform. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ──────────────────────────────────────────
const main = {
  backgroundColor: "#f8fafc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  padding: "0",
  maxWidth: "560px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
};

const headerSection = {
  padding: "32px 40px 0",
};

const contentSection = {
  padding: "0 40px",
};

const h1 = {
  color: "#1e293b",
  fontSize: "24px",
  fontWeight: "700" as const,
  margin: "0 0 8px",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "24px 40px",
};

const text = {
  color: "#334155",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const mutedText = {
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "24px 0 0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "#1e293b",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "600" as const,
  lineHeight: "100%",
  padding: "14px 32px",
  textDecoration: "none",
};

const footer = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  padding: "0 40px 32px",
  margin: "0",
};
