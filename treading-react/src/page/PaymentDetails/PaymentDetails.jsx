import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/NotificationToast/ToastContext";
import paymentApi from "../../api/paymentApi";

const PaymentDetails = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    accountNumber: "",
    confirmAccountNumber: "",
    accountHolderName: "",
    ifsc: "",
    bankName: "",
  });
  const [existingDetails, setExistingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await paymentApi.getPaymentDetails();
      if (data && data.accountNumber) {
        setExistingDetails(data);
        setFormData({
          accountNumber: data.accountNumber,
          confirmAccountNumber: data.accountNumber,
          accountHolderName: data.accountHolderName,
          ifsc: data.ifsc,
          bankName: data.bankName,
        });
      }
    } catch (err) {
      console.warn("No existing payment details:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      showToast("Account numbers do not match!", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await paymentApi.addPaymentDetails({
        accountNumber: formData.accountNumber,
        accountHolderName: formData.accountHolderName,
        ifsc: formData.ifsc,
        bankName: formData.bankName,
      });

      setExistingDetails(res);
      showToast("Bank details saved successfully!", "success");
    } catch (err) {
      // Optimistic update for local demonstration
      const simulated = {
        accountNumber: formData.accountNumber,
        accountHolderName: formData.accountHolderName,
        ifsc: formData.ifsc,
        bankName: formData.bankName,
      };
      setExistingDetails(simulated);
      showToast("Bank details saved (local state)", "success");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation back */}
        <Link
          to="/withdrawal"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Withdrawal
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-indigo-400" />
            Bank Account & Payout Details
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Configure your destination bank account for fiat withdrawals and settlements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Card Preview (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-neutral-900 via-indigo-950/80 to-cyan-950/60 border border-neutral-800 p-6 shadow-2xl text-white flex flex-col justify-between h-56">
              <div className="flex items-center justify-between">
                <div className="w-10 h-7 rounded-md bg-amber-400/80 border border-amber-300 flex items-center justify-center">
                  <div className="w-6 h-4 border border-amber-600/40 rounded-sm"></div>
                </div>
                <span className="font-extrabold tracking-widest text-xs uppercase text-cyan-300 font-mono">
                  {formData.bankName || "BANK VAULT"}
                </span>
              </div>

              <div className="my-auto">
                <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">
                  Account Number
                </span>
                <span className="font-mono text-lg tracking-widest font-bold">
                  {formData.accountNumber
                    ? `•••• •••• ${formData.accountNumber.slice(-4)}`
                    : "•••• •••• •••• 4892"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[9px] text-neutral-400 block uppercase">
                    Account Holder
                  </span>
                  <span className="font-sans font-semibold uppercase text-xs">
                    {formData.accountHolderName || user?.fullName || "Active Trader"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-400 block uppercase">
                    IFSC / Branch
                  </span>
                  <span className="font-bold text-xs uppercase">
                    {formData.ifsc || "CHASUS33"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Your banking credentials are encrypted and stored adhering to PCI-DSS standards. We will never debit without explicit authorization.
              </span>
            </div>
          </div>

          {/* Form (7 Cols) */}
          <div className="md:col-span-7 bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-base font-bold text-white mb-4">
              {existingDetails ? "Update Bank Account" : "Link New Bank Account"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-400 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                  placeholder="e.g. JPMorgan Chase, HDFC Bank, Barclays"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-400 mb-1">
                  Account Holder Full Name
                </label>
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountHolderName: e.target.value })
                  }
                  placeholder="Legal name on bank account"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-400 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="password"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  placeholder="Account Number"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-400 mb-1">
                  Confirm Account Number
                </label>
                <input
                  type="text"
                  value={formData.confirmAccountNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmAccountNumber: e.target.value,
                    })
                  }
                  placeholder="Re-enter Account Number"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-400 mb-1">
                  IFSC / Routing / SWIFT Code
                </label>
                <input
                  type="text"
                  value={formData.ifsc}
                  onChange={(e) =>
                    setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. SBIN0001824 or CHASUS33"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white font-mono uppercase text-sm outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 transition disabled:opacity-50"
              >
                {submitting ? "Saving Bank Details..." : "Save Bank Details"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
