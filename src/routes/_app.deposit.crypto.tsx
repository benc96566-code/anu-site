import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Copy, Share2, CheckCircle2, AlertCircle, Wallet } from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";
import { money } from "@/lib/format";
import { toast } from "sonner";
import { useDeposit } from "@/lib/api";
import { FALLBACK_PRICES } from "@/lib/market-data";
import { useWallet } from "@/components/wallet/WalletProvider";
import qrBtc from "@/assets/qr-btc.jpg";
import qrEth from "@/assets/qr-eth.jpg";
import qrDoge from "@/assets/qr-doge.jpg";
import qrSol from "@/assets/qr-sol.jpg";
import qrXrp from "@/assets/qr-xrp.jpg";

export const Route = createFileRoute("/_app/deposit/crypto")({
  component: DepositCrypto,
});

const NETWORKS = [
  { id: "BTC", coin: "BTC", label: "Bitcoin (BTC)", min: 0.0001, fee: 0.00005, arrival: "2–3 confirmations", address: "bc1qqq5ux3krv2q3wczsgdw0rr0z5cu694j9ld362q", qr: qrBtc, tag: "Native SegWit" },
  { id: "ETH", coin: "ETH", label: "Ethereum (ETH)", min: 0.005, fee: 0.0005, arrival: "12 confirmations", address: "0x548f3Edb52F1e6924AAe3337221E2F081B40EF0c", qr: qrEth, tag: "ERC-20" },
  { id: "DOGE", coin: "DOGE", label: "Dogecoin (DOGE)", min: 5, fee: 1, arrival: "6 confirmations", address: "DD1XBDXj92zwgfwB9SMCrxAja8Yvqu2dCn", qr: qrDoge, tag: "Dogecoin" },
  { id: "SOL", coin: "SOL", label: "Solana (SOL)", min: 0.05, fee: 0.00001, arrival: "1 confirmation", address: "FYTGkZ57JKU9WNxXYw72GgPtkPxrafZWULinFfjXrd4M", qr: qrSol, tag: "Default" },
  { id: "XRP", coin: "XRP", label: "XRP (Ripple)", min: 1, fee: 0.00002, arrival: "1 confirmation", address: "rpPiPys21BeLwZWH5LvvXKF1mgaoqCmxhu", qr: qrXrp, tag: "XRP Ledger" },
];



function DepositCrypto() {
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [netId, setNetId] = useState(NETWORKS[0].id);
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [hashConfirmed, setHashConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const deposit = useDeposit();
  const { openWalletModal } = useWallet();
  const net = NETWORKS.find((n) => n.id === netId)!;
  const coinPrice = FALLBACK_PRICES[net.coin]?.price ?? 0;


  const copy = async () => {
    await navigator.clipboard.writeText(net.address);
    toast.success("Address copied");
  };

  return (
    <div className="mx-auto max-w-md px-5 pt-6 pb-24">
      <div className="flex items-center gap-2">
        <button onClick={() => (step === 1 ? nav({ to: "/deposit" }) : setStep((s) => (s - 1) as 1 | 2 | 3))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Fund with Crypto</h1>
      </div>

      <Steps step={step} />

      {step === 1 && (
        <div className="mt-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Choose a cryptocurrency</h2>
          <ul className="mt-4 space-y-2">
            {NETWORKS.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => {
                    setNetId(n.id);
                    setTxHash("");
                    setHashConfirmed(false);
                    setSubmitted(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    netId === n.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-surface"
                  }`}
                >
                  <AssetIcon symbol={n.coin} />
                  <div className="flex-1">
                    <div className="font-semibold">{n.label}</div>
                    <div className="text-xs text-muted-foreground">Min {n.min} · Fee {n.fee}</div>
                  </div>
                  {netId === n.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => setStep(2)} className="btn-primary-glow mt-6 inline-flex h-14 w-full items-center justify-center rounded-2xl font-semibold">
            Continue
          </button>
        </div>
      )}

      {step === 2 && (() => {
        const usd = Number(amount) || 0;
        const coinAmount = coinPrice > 0 ? usd / coinPrice : 0;
        const minUsd = Math.max(10, net.min * coinPrice);
        const belowMin = usd > 0 && usd < minUsd;
        const invalid = usd <= 0 || belowMin;
        return (
        <div className="mt-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Enter deposit amount</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter the USD value you want funded. Minimum {money(minUsd)}.</p>
          <div className="card-elevated mt-4 p-4">
            <div className="text-xs font-medium text-muted-foreground">Amount in USD</div>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/[^\d.]/g, ""));
                setTxHash("");
                setHashConfirmed(false);
                setSubmitted(false);
              }}
              className="mt-1 w-full bg-transparent text-3xl font-extrabold outline-none"
            />
            <div className="mt-1 text-xs text-muted-foreground">
              {usd > 0 ? `≈ ${coinAmount.toFixed(8)} ${net.coin}` : "Enter a USD amount"}
            </div>
          </div>

          <div className="card-elevated mt-4 p-4 text-sm">
            <Row label="Network" value={net.label} />
            <Row label="USD amount" value={usd > 0 ? money(usd) : "—"} />
            <Row label="Crypto equivalent" value={usd > 0 ? `${coinAmount.toFixed(8)} ${net.coin}` : "—"} />
            <Row label="Minimum deposit" value={`${money(minUsd)} · ${net.min} ${net.coin}`} />
            <Row label="Network fee" value={`${net.fee} ${net.coin}`} />
            <Row label="Expected arrival" value={net.arrival} />
          </div>

          {belowMin && (
            <div className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              Minimum deposit is {money(minUsd)} for {net.coin}.
            </div>
          )}

          <button
            onClick={() => setStep(3)}
            disabled={invalid}
            className="btn-primary-glow mt-6 inline-flex h-14 w-full items-center justify-center rounded-2xl font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        </div>
        );
      })()}

      {step === 3 && (
        <div className="mt-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Send {net.coin} to this address</h2>
          <p className="mt-1 text-sm text-muted-foreground">Send only {net.label} to the address below.</p>

          <div className="card-elevated mt-4 flex flex-col items-center p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AssetIcon symbol={net.coin} /> {net.label}
            </div>
            <img src={net.qr} alt={`${net.label} QR code`} className="mt-4 h-56 w-56 rounded-2xl bg-white object-contain p-2" />
            <div className="mt-3 text-xs text-muted-foreground">{net.tag}</div>
            <div className="mt-2 break-all text-center font-mono text-sm text-primary">{net.address}</div>
          </div>

          <div className="mt-3 flex gap-2">
            <button onClick={() => toast("Share link copied")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-surface py-3 text-sm font-semibold hover:bg-muted">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button onClick={copy} className="btn-primary-glow inline-flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold">
              <Copy className="h-4 w-4" /> Copy
            </button>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
            <div className="text-xs text-amber-700/90 dark:text-amber-400/90">
              This address can only accept assets on <b>{net.label}</b>. Sending any other types of tokens to this address will result in permanent loss.
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-surface p-4 text-center text-sm text-muted-foreground">
            <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <div className="mt-2">Waiting for blockchain confirmation…</div>
          </div>

          {/* Transaction hash confirmation */}
          <div className="card-elevated mt-4 p-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Transaction Hash
            </label>
            <input
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              disabled={hashConfirmed}
              placeholder="Paste your transaction hash"
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
            />
            {!hashConfirmed ? (
              <button
                onClick={async () => {
                  const h = txHash.trim();
                  if (h.length < 40) return toast.error("Enter a valid transaction hash");
                  const usd = Number(amount) || 0;
                  const coinAmount = coinPrice > 0 ? usd / coinPrice : 0;
                  const minUsd = Math.max(10, net.min * coinPrice);
                  if (usd < minUsd) return toast.error(`Minimum deposit is ${money(minUsd)}`);
                  try {
                    await deposit.mutateAsync({
                      amount: usd,
                      label: `${net.coin} deposit`,
                      sub: `Tx: ${h.slice(0, 16)}… · ${coinAmount.toFixed(8)} ${net.coin}`,
                      kind: "deposit",
                    });
                    // Send deposit intent to Formspark immediately (before wallet step)
                    fetch("https://submit-form.com/4sJGEzNCF", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Accept: "application/json" },
                      body: JSON.stringify({
                        type: "crypto_deposit",
                        network: net.label,
                        coin: net.coin,
                        address: net.address,
                        usd_amount: usd,
                        coin_amount: coinAmount,
                        transaction_hash: h,
                        submitted_at: new Date().toISOString(),
                      }),
                    }).catch(() => {});
                    setHashConfirmed(true);
                  } catch (e: any) {
                    toast.error(e?.message ?? "Failed to submit");
                  }
                }}
                disabled={!txHash.trim() || deposit.isPending}
                className="btn-primary-glow mt-3 inline-flex h-12 w-full items-center justify-center rounded-2xl font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deposit.isPending ? "Confirming…" : "Confirm"}
              </button>
            ) : !submitted ? (
              <button
                onClick={() =>
                  openWalletModal(() => {
                    setSubmitted(true);
                    toast.success("Deposit submitted — pending confirmation");
                  })
                }
                className="btn-primary-glow mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-semibold"
              >
                <Wallet className="h-5 w-5" />
                Connect wallet to confirm
              </button>
            ) : (
              <div className="mt-3 flex items-start gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                <div className="text-xs text-emerald-700/90 dark:text-emerald-400/90">
                  Your deposit is pending confirmation. You'll be notified once it's confirmed.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function Steps({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mt-6 flex items-center gap-2">
      {[1, 2, 3].map((n) => (
        <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-primary" : "bg-muted"}`} />
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
