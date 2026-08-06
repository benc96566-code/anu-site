import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/disclosure")({
  head: () => ({
    meta: [
      { title: "Disclosure — Robinhood" },
      { name: "description", content: "Important risk disclosures covering securities trading, cryptocurrency, market data, order routing and account protection." },
      { property: "og:title", content: "Disclosure — Robinhood" },
      { property: "og:description", content: "Important risk disclosures covering securities trading, cryptocurrency, market data, order routing and account protection." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/disclosure" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/disclosure" }],
  }),
  component: () => (
    <LegalPage
      title="Disclosure"
      updated="January 1, 2026"
      intro="Investing involves risk, including the possible loss of principal. These disclosures explain the entities behind your account and the risks you should understand before trading."
      sections={[
        {
          heading: "Entities and roles",
          paragraphs: [
            "Robinhood Financial LLC is a registered broker-dealer and member FINRA/SIPC, and offers securities trading. Robinhood Securities, LLC provides brokerage clearing services. Cryptocurrency trading services are offered through Robinhood Crypto, LLC, which is not a member of FINRA or SIPC.",
          ],
        },
        {
          heading: "Investment risk",
          paragraphs: [
            "The value of investments can go down as well as up, and you may get back less than you invested. Past performance is not a reliable indicator of future results, and no strategy assures a profit or protects against loss.",
          ],
        },
        {
          heading: "Cryptocurrency risk",
          paragraphs: [
            "Crypto assets are highly volatile and trade continuously, including outside traditional market hours. They are not securities, are not protected by SIPC or FDIC insurance, and network transfers are generally irreversible once broadcast.",
          ],
        },
        {
          heading: "Market data and order execution",
          paragraphs: [
            "Quotes, charts and portfolio values may be delayed and are provided for informational purposes only. Orders are subject to market conditions and may execute at prices different from those displayed, particularly for volatile or thinly traded assets and during extended-hours sessions.",
          ],
        },
        {
          heading: "Fractional shares",
          paragraphs: [
            "Fractional share positions are generally not transferable to another brokerage and may be liquidated on account transfer or closure. Fractional shares may not carry voting rights.",
          ],
        },
        {
          heading: "Not investment advice",
          paragraphs: [
            "Nothing on this platform is a recommendation to buy or sell any security or crypto asset, and no content constitutes tax, legal or investment advice. Consider your objectives and consult a qualified professional before investing.",
          ],
        },
        {
          heading: "Account protection",
          paragraphs: [
            "All investments and custodial accounts managed through the Robinhood platform are protected in accordance with SIPC insurance guidelines and industry-standard regulatory protocols. SIPC does not protect against market losses.",
          ],
        },
      ]}
    />
  ),
});
