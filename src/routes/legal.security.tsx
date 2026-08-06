import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/legal/security")({
  head: () => ({
    meta: [
      { title: "Security — Robinhood" },
      { name: "description", content: "How Robinhood protects your account and assets: encryption, two-factor authentication, monitoring and SIPC coverage." },
      { property: "og:title", content: "Security — Robinhood" },
      { property: "og:description", content: "How Robinhood protects your account and assets: encryption, two-factor authentication, monitoring and SIPC coverage." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/legal/security" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/legal/security" }],
  }),
  component: () => (
    <LegalPage
      title="Security"
      updated="January 1, 2026"
      intro="Protecting your money and your data is the foundation of everything we build. Here is how the platform is secured, and what you can do to keep your own account safe."
      sections={[
        {
          heading: "Protecting your account",
          paragraphs: ["Every account is protected by layered controls, enabled by default where possible."],
          bullets: [
            "Traffic is encrypted in transit with TLS, and sensitive data is encrypted at rest.",
            "Two-factor authentication and biometric or device unlock on supported devices.",
            "Session monitoring with alerts for new device sign-ins and unusual activity.",
            "Withdrawals are restricted to verified destinations you have previously confirmed.",
          ],
        },
        {
          heading: "Protecting your assets",
          paragraphs: [
            "Securities accounts are carried by Robinhood Securities, LLC, a member of SIPC. SIPC protects securities customers of its members up to $500,000, including a $250,000 limit for cash claims.",
            "SIPC coverage protects against the failure of a brokerage firm. It does not protect against a decline in the market value of your investments.",
            "Cryptocurrency held through Robinhood Crypto, LLC is not covered by SIPC or FDIC insurance.",
          ],
        },
        {
          heading: "Operational controls",
          paragraphs: [
            "Access to production systems is limited on a least-privilege basis and logged. Sensitive administrative actions require additional verification, and we continuously monitor for suspicious behavior on the platform.",
          ],
        },
        {
          heading: "What you can do",
          paragraphs: ["A few habits meaningfully reduce your risk."],
          bullets: [
            "Use a long, unique password that you do not reuse on other sites.",
            "Turn on two-factor authentication from Security settings.",
            "Never share verification codes — we will never ask for them.",
            "Confirm you are on the official app or site before entering credentials.",
          ],
        },
        {
          heading: "Reporting a vulnerability",
          paragraphs: [
            "If you believe you have found a security issue, report it through the Support page with steps to reproduce. Please do not publicly disclose the issue before we have had a chance to address it.",
          ],
        },
      ]}
    />
  ),
});
