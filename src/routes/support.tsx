import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — Robinhood" },
      { name: "description", content: "Get help with your Robinhood account: funding, withdrawals, trading questions, account access and security reports." },
      { property: "og:title", content: "Support — Robinhood" },
      { property: "og:description", content: "Get help with your Robinhood account: funding, withdrawals, trading questions, account access and security reports." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/support" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/support" }],
  }),
  component: () => (
    <LegalPage
      title="Support"
      updated="January 1, 2026"
      intro="We're here to help. Most questions about funding, trading and account access are answered below — and our team is reachable any day of the week."
      sections={[
        {
          heading: "Contact us",
          paragraphs: [
            "Email support@robinhood.com and include your registered email address so we can locate your account. Never include your password or a verification code in a message.",
            "Support requests are answered seven days a week. Account access and suspected fraud reports are prioritized.",
          ],
        },
        {
          heading: "Funding your account",
          paragraphs: [
            "You can fund with a debit card, a linked bank account, or a crypto deposit on a supported network. Card and bank deposits are typically credited shortly after confirmation; crypto deposits are credited after the required network confirmations.",
            "Some deposits enter a pending state while they are reviewed. Pending items clear automatically once approved, and your balance and buying power update at that point.",
          ],
        },
        {
          heading: "Withdrawals",
          paragraphs: [
            "Withdrawals can only be sent to a destination you have verified on your account. Requests are reviewed before release, and you'll receive a notification once a withdrawal is approved or declined.",
          ],
        },
        {
          heading: "Trading questions",
          paragraphs: [
            "Buying power must cover the full cost of an order before it can be placed. If an order is rejected, check your available buying power, the market session, and whether the asset is currently tradable.",
          ],
        },
        {
          heading: "Account access",
          paragraphs: [
            "Use the Forgot password link on the sign-in screen to reset your password by email. If you have lost access to your registered email or suspect your account has been compromised, contact us immediately so we can secure it.",
          ],
        },
        {
          heading: "Reporting fraud or a security issue",
          paragraphs: [
            "Report suspicious messages, unrecognized activity or a potential vulnerability to our team right away. We will never ask you for your password or a two-factor code.",
          ],
        },
      ]}
    />
  ),
});
