import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet as WalletIcon,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Clock,
  PlusCircle,
  ShieldCheck,
  Landmark,
  IndianRupee,
  Sparkles,
  CheckCircle2,
  Loader2,
  XCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { useToast } from "../../components/NotificationToast/ToastContext";
import walletApi from "../../api/walletApi";
import paymentApi from "../../api/paymentApi";

/* ─────────────────────────── helpers ────────────────────────────── */
const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

const METHOD_CARDS = [
  {
    id: "RAZORPAY",
    label: "Razorpay",
    sub: "UPI · Cards · Net Banking · Wallets",
    icon: (
      <span className="text-[22px] font-black tracking-tight text-blue-400">
        ₹pay
      </span>
    ),
    badge: "Recommended",
    badgeColor: "bg-blue-900/60 text-blue-300 border-blue-700/50",
    border: "border-blue-500",
    bg: "bg-blue-950/40",
  },
];

/* ─────────────────────────── component ──────────────────────────── */
const Wallet = () => {
  const { user } = useAuth();
  const { wallet, transactions, refreshWallet, refreshTransactions } =
    useWallet();
  const { showToast } = useToast();

  const [copied, setCopied] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // "deposit" | "transfer" | null

  /* deposit flow: idle → selecting → redirecting → verifying → done | error */
  const [depositStep, setDepositStep] = useState("idle");
  const [depositAmount, setDepositAmount] = useState("1000");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState("");

  /* transfer */
  const [transferWalletId, setTransferWalletId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);

  /* ── on mount: check if Razorpay redirected us back ── */
  const verifyReturnedPayment = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");
    const paymentId =
      params.get("razorpay_payment_id") || params.get("payment_id");
    const linkStatus = params.get("razorpay_payment_link_status");

    if (!orderId) return;

    // Clean URL immediately so refresh doesn't re-trigger
    window.history.replaceState({}, "", "/wallet");

    if (linkStatus === "paid" && paymentId) {
      showToast("Payment received — crediting your wallet…", "info");
      try {
        await walletApi.depositBalance(orderId, paymentId);
        await refreshWallet();
        await refreshTransactions();
        showToast("🎉 Wallet topped up successfully!", "success");
      } catch {
        showToast("Payment captured but credit failed — contact support.", "error");
      }
    } else if (linkStatus === "cancelled" || linkStatus === "expired") {
      showToast("Payment was cancelled or expired.", "error");
    } else if (orderId && !paymentId) {
      // Stripe success (no payment_id in URL, just order_id)
      try {
        // For Stripe we pass a dummy paymentId — proceedPaymentOrder handles non-Razorpay as SUCCESS
        await walletApi.depositBalance(orderId, "stripe-auto");
        await refreshWallet();
        await refreshTransactions();
        showToast("🎉 Wallet topped up via Stripe!", "success");
      } catch {
        showToast("Could not confirm Stripe payment — contact support.", "error");
      }
    }
  }, [refreshTransactions, refreshWallet, showToast]);

  useEffect(() => {
    refreshWallet();
    refreshTransactions();
    verifyReturnedPayment();
  }, []); // eslint-disable-line

  /* ── copy wallet id ── */
  const handleCopyWalletId = () => {
    const id = wallet?.id ? `NEXUS-WALLET-${wallet.id}` : "NEXUS-WALLET-10492";
    navigator.clipboard.writeText(id);
    setCopied(true);
    showToast("Wallet ID copied!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── open deposit modal ── */
  const openDeposit = () => {
    setDepositStep("selecting");
    setDepositError("");
    setActiveModal("deposit");
  };

  /* ── submit deposit → call backend → redirect to Razorpay ── */
  const handleDeposit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 100) {
      setDepositError("Minimum deposit amount is ₹100");
      return;
    }

    setDepositError("");
    setDepositLoading(true);
    setDepositStep("redirecting");

    try {
      const res = await paymentApi.createPaymentLink("RAZORPAY", Math.round(amount));
      if (res?.payment_url) {
        showToast("Opening Razorpay checkout…", "info");
        // Redirect in same tab so Razorpay can redirect back
        window.location.href = res.payment_url;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (err) {
      setDepositStep("error");
      setDepositError(
        err?.response?.data?.message ||
          "Could not connect to payment gateway. Please try again."
      );
      showToast("Payment gateway error. Please retry.", "error");
    } finally {
      setDepositLoading(false);
    }
  };

  /* ── wallet-to-wallet transfer ── */
  const handleTransfer = async (e) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    const targetId = transferWalletId.trim();
    if (!targetId) return showToast("Enter recipient Wallet ID", "error");
    if (!amount || amount <= 0) return showToast("Enter a valid amount", "error");
    if (amount > Number(wallet?.balance || 0))
      return showToast("Insufficient balance", "error");

    setTransferLoading(true);
    try {
      await walletApi.transferToWallet(targetId, amount);
      showToast(`₹${amount} transferred to Wallet #${targetId}!`, "success");
      setActiveModal(null);
      setTransferAmount("");
      setTransferWalletId("");
      await refreshWallet();
      await refreshTransactions();
    } catch {
      showToast("Transfer failed. Check the wallet ID and retry.", "error");
    } finally {
      setTransferLoading(false);
    }
  };

  const balance = Number(wallet?.balance || 0);

  /* ════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* ── Page Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <WalletIcon className="w-7 h-7 text-emerald-400" />
              Wallet
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Deposit via Razorpay · Transfer internally · Withdraw to bank
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openDeposit}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Deposit Funds
            </button>
            <button
              onClick={() => setActiveModal("transfer")}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-semibold text-xs transition flex items-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" /> Transfer
            </button>
          </div>
        </div>

        {/* ── Balance Card ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 p-6 sm:p-8 shadow-2xl mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Vault · Institutional Custody
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                  ₹{balance.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-2 bg-neutral-950/80 px-3 py-1.5 rounded-xl border border-neutral-800 font-mono text-neutral-300">
                  <span className="text-neutral-500">Wallet ID:</span>
                  <span className="font-bold text-cyan-400">
                    NEXUS-{wallet?.id ? String(wallet.id).padStart(5, "0") : "00101"}
                  </span>
                  <button
                    onClick={handleCopyWalletId}
                    className="text-neutral-400 hover:text-white transition p-0.5"
                    title="Copy Wallet ID"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-400 bg-neutral-950/80 px-3 py-1.5 rounded-xl border border-neutral-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>256-bit Encrypted</span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={openDeposit}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40"
              >
                <ArrowDownLeft className="w-4 h-4" /> Deposit
              </button>
              <button
                onClick={() => setActiveModal("transfer")}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/40"
              >
                <ArrowRightLeft className="w-4 h-4" /> Transfer
              </button>
              <a
                href="/withdrawal"
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4 text-rose-400" /> Withdraw
              </a>
            </div>
          </div>
        </div>

        {/* ── Transaction History ── */}
        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" /> Wallet Activity
            </h2>
            <button
              onClick={async () => { await refreshWallet(); await refreshTransactions(); showToast("Refreshed", "success"); }}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-950/60 text-neutral-400 text-xs uppercase tracking-wider font-semibold border-b border-neutral-800">
                <tr>
                  <th className="py-3.5 px-4">Tx ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-neutral-500">
                      No wallet transactions yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isCredit =
                      tx.walletTransactionType === "DEPOSIT" ||
                      tx.walletTransactionType === "SELL_ASSET";
                    return (
                      <tr key={tx.id} className="hover:bg-neutral-800/40 transition font-mono text-xs">
                        <td className="py-4 px-4 text-neutral-400">
                          {tx.transferId || `#TX-${tx.id}`}
                        </td>
                        <td className="py-4 px-4 text-neutral-300">
                          {tx.date || "Recent"}
                        </td>
                        <td className="py-4 px-4 font-sans font-bold">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                              isCredit
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                                : "bg-neutral-800 text-neutral-300 border border-neutral-700/60"
                            }`}
                          >
                            {tx.walletTransactionType}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-sans text-neutral-300">
                          {tx.purpose || "Account operation"}
                        </td>
                        <td
                          className={`py-4 px-4 text-right font-bold text-sm ${
                            isCredit ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isCredit ? "+₹" : "-₹"}
                          {Math.abs(Number(tx.amount || 0)).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ══════════════════ DEPOSIT MODAL ══════════════════ */}
      {activeModal === "deposit" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/30 border-b border-neutral-800 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-400" />
                  Add Funds to Wallet
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Secure payment via Razorpay • UPI / Cards / Net Banking
                </p>
              </div>
              <button
                onClick={() => { setActiveModal(null); setDepositStep("idle"); setDepositError(""); }}
                className="text-neutral-500 hover:text-white transition text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* ── Step: selecting ── */}
            {(depositStep === "selecting" || depositStep === "error") && (
              <form onSubmit={handleDeposit} className="p-6 space-y-5">

                {/* Gateway badge */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-blue-600/40 bg-blue-950/30">
                  <div className="w-10 h-10 rounded-lg bg-blue-900/50 flex items-center justify-center text-blue-300 font-black text-sm flex-shrink-0">
                    ₹
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">Razorpay Checkout</p>
                    <p className="text-xs text-neutral-400">UPI · Credit/Debit Cards · Net Banking · Wallets</p>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-900 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-full whitespace-nowrap">
                    TEST MODE
                  </span>
                </div>

                {/* Amount input */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                    Amount (INR)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="number"
                      min="100"
                      step="1"
                      value={depositAmount}
                      onChange={(e) => { setDepositAmount(e.target.value); setDepositError(""); }}
                      placeholder="1000"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-4 py-3 text-white font-mono text-lg outline-none focus:border-emerald-500 transition"
                      required
                    />
                  </div>
                  {depositError && (
                    <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> {depositError}
                    </p>
                  )}
                </div>

                {/* Quick amount presets */}
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Quick select</p>
                  <div className="grid grid-cols-5 gap-2">
                    {QUICK_AMOUNTS.map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setDepositAmount(String(val))}
                        className={`py-2 rounded-lg text-xs font-mono font-bold border transition ${
                          Number(depositAmount) === val
                            ? "bg-emerald-900/60 border-emerald-600 text-emerald-300"
                            : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600"
                        }`}
                      >
                        ₹{val >= 1000 ? val / 1000 + "k" : val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test card hint */}
                <div className="rounded-xl bg-amber-950/30 border border-amber-800/40 p-3.5 text-xs text-amber-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Test Card Details (Razorpay Sandbox)
                  </p>
                  <p>Card: <span className="font-mono text-white">4111 1111 1111 1111</span></p>
                  <p>Expiry: <span className="font-mono text-white">Any future date</span> &nbsp; CVV: <span className="font-mono text-white">Any 3 digits</span></p>
                  <p className="text-amber-400/70 mt-1">Or use UPI ID: <span className="font-mono text-white">success@razorpay</span></p>
                </div>

                {/* Info row */}
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-bit TLS encrypted · PCI-DSS compliant · Your card is never stored</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setActiveModal(null); setDepositStep("idle"); setDepositError(""); }}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={depositLoading}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {depositLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Opening…</>
                    ) : (
                      <><ExternalLink className="w-3.5 h-3.5" /> Pay ₹{Number(depositAmount || 0).toLocaleString("en-IN")}</>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ── Step: redirecting ── */}
            {depositStep === "redirecting" && (
              <div className="p-10 flex flex-col items-center gap-4 text-center">
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                <p className="text-white font-bold">Opening Razorpay Checkout…</p>
                <p className="text-xs text-neutral-400">
                  You will be redirected to the secure Razorpay payment page.<br />
                  After payment, you'll return here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ TRANSFER MODAL ══════════════════ */}
      {activeModal === "transfer" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
                  Internal Wallet Transfer
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Instant · Zero fee · To any registered NexusTrade wallet
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-neutral-500 hover:text-white transition text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransfer} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                  Recipient Wallet ID
                </label>
                <div className="relative">
                  <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={transferWalletId}
                    onChange={(e) => setTransferWalletId(e.target.value)}
                    placeholder="e.g. 2 or 104"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-4 py-3 text-white font-mono text-sm outline-none focus:border-cyan-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                  Amount (INR)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="500"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-4 py-3 text-white font-mono text-sm outline-none focus:border-cyan-500 transition"
                    required
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1.5">
                  Available: ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferLoading}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {transferLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  ) : (
                    "Send Transfer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
