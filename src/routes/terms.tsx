import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Robinhood" },
      { name: "description", content: "The agreement governing your Robinhood account, trading activity, deposits, withdrawals and use of the platform." },
      { property: "og:title", content: "Terms of Service — Robinhood" },
      { property: "og:description", content: "The agreement governing your Robinhood account, trading activity, deposits, withdrawals and use of the platform." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/terms" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: () => (
    <LegalPage
      title="Terms of Service"
      updated="January 1, 2026"
      intro="These terms form the agreement between you and Robinhood Financial LLC covering your account, your trading activity and your use of this platform. By opening an account you accept them."
      sections={[
        {
          heading: "1. Eligibility and your account",
          paragraphs: [
            "You must be at least 18 years old, provide accurate identifying information and keep it current. Accounts are personal — you may not let anyone else trade on your behalf through your credentials.",
            "You are responsible for safeguarding your password and devices, and for all activity occurring under your login.",
          ],
        },
        {
          heading: "2. Trading and order handling",
          paragraphs: [
            "Orders are routed for execution on a best-efforts basis. Quotes and charts may be delayed, and the price you see when placing an order is not guaranteed to be the price you receive.",
            "We may reject, cancel or limit orders where required by market conditions, regulatory rules, insufficient buying power, or suspected abuse.",
          ],
        },
        {
          heading: "3. Auto Trader",
          paragraphs: [
            "Robinhood offers an automated trading feature (Auto Trader) that executes trades on your behalf using algorithmic strategies. Historically, Auto Trader has generated profitable trades approximately 70% of the time.",
            "Past performance — including the 70% profitability rate — is not a guarantee of future results. All investing involves risk, including the possible loss of principal, and you should only enable Auto Trader with funds you can afford to risk. You may enable or disable Auto Trader at any time.",
          ],
        },
        {
          heading: "3. Deposits, withdrawals and balances",
          paragraphs: [
            "Deposits by card, bank or crypto are credited once confirmed and may be subject to review before funds become available for trading. Withdrawals are processed to verified destinations only.",
            "Pending deposits and withdrawals may require manual review, and we may hold or reverse a transaction where we detect error, fraud or a compliance concern.",
          ],
        },
        {
          heading: "4. Referral program",
          paragraphs: [
            "Every account receives a unique referral code. When a new user signs up with your code, both you and the new user receive a $100.00 referral bonus, credited to the bonus balance of each account.",
            "Referral bonus funds are included in your displayed balance and can be used for trading, but they can only be withdrawn after a total of $1,000 or more in confirmed deposits has been made — either by you or by the person you referred. This condition is disclosed to you when you attempt to withdraw bonus funds.",
            "Each account may claim one referral code. We may withhold or reverse bonuses obtained through self-referrals, fake accounts, or other abuse.",
          ],
        },
        {
          heading: "5. Fees",
          paragraphs: [
            "Commission-free trading applies to standard US-listed stock and ETF orders. Regulatory pass-through fees, crypto network fees and certain transfer or funding fees may still apply and are disclosed before you confirm.",
          ],
        },
        {
          heading: "6. Acceptable use",
          paragraphs: ["You agree not to use the platform for unlawful purposes or in ways that harm the service or other customers."],
          bullets: [
            "No market manipulation, spoofing, layering or coordinated abusive trading.",
            "No automated scraping, reverse engineering or unauthorized access attempts.",
            "No use of the account to launder funds or evade sanctions.",
          ],
        },
        {
          heading: "6. Suspension and termination",
          paragraphs: [
            "We may suspend or close an account for breach of these terms, suspected fraud, or legal requirement. You may close your account at any time once positions are closed and obligations are settled.",
          ],
        },
        {
          heading: "7. Disclaimers and limitation of liability",
          paragraphs: [
            "The platform is provided on an as-is basis. We are not liable for losses arising from market movements, delays in market data, or interruptions outside our reasonable control. Nothing here limits liability that cannot be limited by law.",
          ],
        },
        {
          heading: "8. Changes to these terms",
          paragraphs: [
            "We may amend these terms. Continued use of the platform after an update takes effect constitutes acceptance of the revised terms.",
          ],
        },
      ]}
    />
  ),
});
