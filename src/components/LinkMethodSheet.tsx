import { useMemo, useState } from "react";
import { Loader2, ShieldAlert, Lock } from "lucide-react";

type Mode = "card" | "bank";

const luhn = (num: string) => {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return num.length > 0 && sum % 10 === 0;
};

const abaChecksum = (r: string) => {
  if (!/^\d{9}$/.test(r)) return false;
  const d = r.split("").map(Number) as number[];
  const sum =
    3 * (d[0]! + d[3]! + d[6]!) +
    7 * (d[1]! + d[4]! + d[7]!) +
    1 * (d[2]! + d[5]! + d[8]!);
  return sum % 10 === 0 && Number(r) !== 0;
};

export const detectBrand = (num: string) => {
  if (/^4/.test(num)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(num)) return "Mastercard";
  if (/^3[47]/.test(num)) return "Amex";
  if (/^6(?:011|5)/.test(num)) return "Discover";
  return "Card";
};

const groupCard = (v: string, amex: boolean) => {
  const digits = v.replace(/\D/g, "").slice(0, amex ? 15 : 19);
  const pattern = amex ? [4, 6, 5] : [4, 4, 4, 4, 3];
  const out: string[] = [];
  let i = 0;
  for (const size of pattern) {
    if (i >= digits.length) break;
    out.push(digits.slice(i, i + size));
    i += size;
  }
  return out.join(" ");
};

type Errors = Record<string, string>;

export function LinkMethodSheet({
  mode,
  onClose,
}: {
  mode: Mode;
  onClose: () => void;
}) {
  const [f, setF] = useState({
    number: "",
    holder: "",
    exp: "",
    cvv: "",
    zip: "",
    bankName: "",
    accountHolder: "",
    routing: "",
    account: "",
    confirmAccount: "",
    accountType: "checking",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [declined, setDeclined] = useState<string | null>(null);

  const digits = f.number.replace(/\D/g, "");
  const brand = useMemo(() => detectBrand(digits), [digits]);
  const isAmex = brand === "Amex";
  const cvvLen = isAmex ? 4 : 3;

  const set = (k: keyof typeof f, v: string) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
    setDeclined(null);
  };

  const validateCard = (): Errors => {
    const e: Errors = {};
    if (digits.length < 13 || digits.length > 19) e['number'] = "Card number must be 13–19 digits";
    else if (isAmex && digits.length !== 15) e['number'] = "American Express cards have 15 digits";
    else if (!isAmex && brand !== "Card" && digits.length !== 16) e['number'] = `${brand} cards have 16 digits`;
    else if (!luhn(digits)) e['number'] = "That card number isn't valid";

    if (f.holder.trim().length < 3) e['holder'] = "Enter the full name on the card";
    else if (!/^[a-zA-Z][a-zA-Z .'-]*\s+[a-zA-Z][a-zA-Z .'-]*$/.test(f.holder.trim()))
      e['holder'] = "Enter first and last name as printed on the card";

    const m = f.exp.match(/^(\d{2})\/(\d{2})$/);
    if (!m) e['exp'] = "Use MM/YY format";
    else {
      const mm = Number(m[1]);
      const yy = 2000 + Number(m[2]);
      const now = new Date();
      if (mm < 1 || mm > 12) e['exp'] = "Month must be between 01 and 12";
      else if (yy < now.getFullYear() || (yy === now.getFullYear() && mm < now.getMonth() + 1))
        e['exp'] = "This card has expired";
      else if (yy > now.getFullYear() + 20) e['exp'] = "Expiry date is too far in the future";
    }

    if (f.cvv.length !== cvvLen) e['cvv'] = `Security code must be ${cvvLen} digits`;
    if (f.zip.trim().length < 4) e['zip'] = "Enter the billing ZIP / postal code";
    return e;
  };

  const validateBank = (): Errors => {
    const e: Errors = {};
    if (f.bankName.trim().length < 2) e['bankName'] = "Enter your bank's name";
    if (f.accountHolder.trim().length < 3) e['accountHolder'] = "Enter the full account holder name";
    else if (!/^[a-zA-Z][a-zA-Z .'-]*\s+[a-zA-Z][a-zA-Z .'-]*$/.test(f.accountHolder.trim()))
      e['accountHolder'] = "Enter first and last name on the account";

    if (f.routing.length !== 9) e['routing'] = "Routing number must be exactly 9 digits";
    else if (!abaChecksum(f.routing)) e['routing'] = "That routing number isn't valid";

    if (f.account.length < 4 || f.account.length > 17) e['account'] = "Account number must be 4–17 digits";
    if (f.confirmAccount !== f.account) e['confirmAccount'] = "Account numbers don't match";
    return e;
  };

  const submit = async () => {
    const e = mode === "card" ? validateCard() : validateBank();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    setDeclined(null);
    await new Promise((r) => setTimeout(r, 1600));
    setSubmitting(false);
    setDeclined(
      mode === "card"
        ? "We couldn't verify this card with your bank. Please try another card."
        : "We couldn't verify this bank account with your institution. Please try another bank account.",
    );
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 sm:place-items-center" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-5 sm:rounded-3xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <h3 className="text-lg font-bold">{mode === "card" ? "Add a debit or credit card" : "Link a bank account"}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {mode === "card"
            ? "Enter your card details exactly as they appear on the card."
            : "Enter your account details exactly as they appear on your bank statement or check."}
        </p>

        {declined && (
          <div className="mt-4 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{declined}</span>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {mode === "card" ? (
            <>
              <Field
                label="Card number"
                value={f.number}
                onChange={(v) => set("number", groupCard(v, detectBrand(v.replace(/\D/g, "")) === "Amex"))}
                error={errors['number']}
                inputMode="numeric"
                placeholder={isAmex ? "3782 822463 10005" : "4242 4242 4242 4242"}
                hint={digits.length >= 2 && brand !== "Card" ? brand : undefined}
              />
              <Field
                label="Name on card"
                value={f.holder}
                onChange={(v) => set("holder", v.replace(/[^a-zA-Z .'-]/g, ""))}
                error={errors['holder']}
                placeholder="John Doe"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Expiry (MM/YY)"
                  value={f.exp}
                  onChange={(v) => {
                    const d = v.replace(/\D/g, "").slice(0, 4);
                    set("exp", d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                  }}
                  error={errors['exp']}
                  inputMode="numeric"
                  placeholder="09/29"
                />
                <Field
                  label={`CVV (${cvvLen} digits)`}
                  value={f.cvv}
                  onChange={(v) => set("cvv", v.replace(/\D/g, "").slice(0, cvvLen))}
                  error={errors['cvv']}
                  inputMode="numeric"
                  placeholder={isAmex ? "1234" : "123"}
                />
              </div>
              <Field
                label="Billing ZIP / postal code"
                value={f.zip}
                onChange={(v) => set("zip", v.replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 10))}
                error={errors['zip']}
                placeholder="10001"
              />
            </>
          ) : (
            <>
              <Field
                label="Bank name"
                value={f.bankName}
                onChange={(v) => set("bankName", v.slice(0, 60))}
                error={errors['bankName']}
                placeholder="Chase Bank"
              />
              <Field
                label="Account holder name"
                value={f.accountHolder}
                onChange={(v) => set("accountHolder", v.replace(/[^a-zA-Z .'-]/g, ""))}
                error={errors['accountHolder']}
                placeholder="John Doe"
              />
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Account type</span>
                <select
                  value={f.accountType}
                  onChange={(e) => set("accountType", e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </label>
              <Field
                label="Routing number (9 digits)"
                value={f.routing}
                onChange={(v) => set("routing", v.replace(/\D/g, "").slice(0, 9))}
                error={errors['routing']}
                inputMode="numeric"
                placeholder="021000021"
              />
              <Field
                label="Account number (4–17 digits)"
                value={f.account}
                onChange={(v) => set("account", v.replace(/\D/g, "").slice(0, 17))}
                error={errors['account']}
                inputMode="numeric"
                placeholder="000123456789"
              />
              <Field
                label="Confirm account number"
                value={f.confirmAccount}
                onChange={(v) => set("confirmAccount", v.replace(/\D/g, "").slice(0, 17))}
                error={errors['confirmAccount']}
                inputMode="numeric"
                placeholder="000123456789"
              />
            </>
          )}
        </div>

        <button
          onClick={submit}
          disabled={submitting}
          className="btn-primary-glow mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-semibold disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
            </>
          ) : mode === "card" ? (
            "Add card"
          ) : (
            "Link bank account"
          )}
        </button>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3" /> Your details are encrypted and never shared.
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  inputMode,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  placeholder?: string;
  inputMode?: "numeric" | "text";
  hint?: string | undefined;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        {label}
        {hint && <span className="font-semibold text-foreground">{hint}</span>}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? ""}
        inputMode={inputMode ?? "text"}
        aria-invalid={!!error}
        className={`mt-1 h-11 w-full rounded-xl border bg-background px-3 outline-none ${
          error ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
        }`}
      />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
