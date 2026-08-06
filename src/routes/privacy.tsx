import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Robinhood" },
      { name: "description", content: "How Robinhood collects, uses, shares and protects your personal and financial information." },
      { property: "og:title", content: "Privacy Policy — Robinhood" },
      { property: "og:description", content: "How Robinhood collects, uses, shares and protects your personal and financial information." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: () => (
    <LegalPage
      title="Privacy Policy"
      updated="January 1, 2026"
      intro="Your privacy matters. This policy explains what information we collect when you open and use a Robinhood account, why we collect it, who we share it with, and the choices you have."
      sections={[
        {
          heading: "1. Information we collect",
          paragraphs: [
            "We collect information you provide directly, information generated as you use the platform, and information we receive from third parties such as identity verification and market data providers.",
          ],
          bullets: [
            "Identity data — name, date of birth, address, government ID and tax identification number, collected to meet Know Your Customer and anti-money-laundering obligations.",
            "Contact data — email address and phone number used for account notices, security alerts and support.",
            "Financial data — linked bank accounts, cards, crypto deposit addresses, balances, holdings, orders and transaction history.",
            "Usage and device data — IP address, device identifiers, browser type, pages viewed and session activity.",
          ],
        },
        {
          heading: "2. How we use your information",
          paragraphs: [
            "We use your information to open and maintain your account, execute and settle your trades, process deposits and withdrawals, and display accurate balances and positions.",
            "We also use it to detect and prevent fraud, secure your account, meet legal and regulatory reporting duties, provide customer support and improve our products.",
          ],
        },
        {
          heading: "3. How we share information",
          paragraphs: [
            "We do not sell your personal information. We share it only with clearing and custody partners, payment and banking providers, identity verification vendors, and regulators or law enforcement where legally required.",
            "Service providers are contractually limited to using your data solely to perform services for us.",
          ],
        },
        {
          heading: "4. Data retention",
          paragraphs: [
            "Brokerage records are retained for the periods required by applicable financial recordkeeping rules, generally at least six years after account closure. Data no longer required is deleted or anonymized.",
          ],
        },
        {
          heading: "5. Your choices and rights",
          paragraphs: [
            "You can review and update your profile details from Account settings, manage linked payment methods, and control non-essential notifications at any time.",
            "Depending on where you live, you may have the right to request a copy of your data, ask us to correct it, or request deletion of information we are not required to retain.",
          ],
        },
        {
          heading: "6. Security of your data",
          paragraphs: [
            "Data is encrypted in transit and at rest, access is restricted on a least-privilege basis, and sensitive actions require re-authentication. See the Security page for more detail.",
          ],
        },
        {
          heading: "7. Changes to this policy",
          paragraphs: [
            "We may update this policy as our services or legal obligations change. Material changes will be announced in-app or by email before they take effect.",
          ],
        },
      ]}
    />
  ),
});
