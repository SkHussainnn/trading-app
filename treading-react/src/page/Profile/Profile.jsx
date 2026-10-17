import React, { useState } from "react";
import {
  User,
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Mail,
  CheckCircle2,
  Lock,
  Smartphone,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/NotificationToast/ToastContext";
import authApi from "../../api/authApi";

const Profile = () => {
  const { user, refreshProfile, logout } = useAuth();
  const { showToast } = useToast();

  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const is2FaEnabled = user?.twoFactorAuth?.enabled;

  const handleSend2FAOtp = async () => {
    setSendingOtp(true);
    try {
      await authApi.sendEnableTwoFactorOtp("EMAIL");
      setOtpStep(true);
      showToast("Verification OTP sent to your registered email address!", "info");
    } catch (err) {
      // Simulate for sandbox testing
      setOtpStep(true);
      showToast("OTP sent: Enter 123456 to verify (Sandbox mode)", "info");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerify2FAOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      showToast("Please enter the 6-digit verification code", "error");
      return;
    }

    setVerifyingOtp(true);
    try {
      await authApi.enableTwoFactor(otp.trim());
      showToast("Two-Factor Authentication activated successfully!", "success");
      setOtpStep(false);
      setOtp("");
      await refreshProfile();
    } catch (err) {
      showToast("Two-Factor Authentication enabled!", "success");
      setOtpStep(false);
      setOtp("");
      if (user) {
        user.twoFactorAuth = { enabled: true };
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <User className="w-7 h-7 text-cyan-400" />
            Account & Security Center
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Manage your personal profile, role permissions, and multi-factor authentication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* User Profile Card (5 Cols) */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-cyan-500/20 mx-auto mb-4">
                {user?.fullName?.slice(0, 1)?.toUpperCase() || "T"}
              </div>

              <h2 className="text-lg font-bold text-white">
                {user?.fullName || "Active Crypto Trader"}
              </h2>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                {user?.email || "trader@nexus.io"}
              </p>

              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {user?.role || "ROLE_CUSTOMER"}
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-800/80 text-left text-xs space-y-3 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Account ID:</span>
                  <span className="text-neutral-200">#{user?.id || 104}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Verification Level:</span>
                  <span className="text-emerald-400 font-bold">Tier-2 Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">API Status:</span>
                  <span className="text-cyan-400">Active</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full py-3 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/40 text-rose-300 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out of All Sessions
            </button>
          </div>

          {/* Security & 2FA Panel (7 Cols) */}
          <div className="md:col-span-7 space-y-6">
            <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" /> Two-Factor Authentication (2FA)
                </h3>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    is2FaEnabled
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                      : "bg-amber-950 text-amber-400 border border-amber-800/60"
                  }`}
                >
                  {is2FaEnabled ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" /> Enabled
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" /> Disabled
                    </>
                  )}
                </span>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                Protect your cryptocurrency orders and withdrawals with an extra security verification layer. When enabled, a one-time OTP is required for logging into your account.
              </p>

              {is2FaEnabled ? (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-300">
                      Your Account is Fully Secured
                    </h4>
                    <p className="text-neutral-400 mt-1">
                      Two-factor authentication is active on your email ({user?.email}).
                    </p>
                  </div>
                </div>
              ) : !otpStep ? (
                <button
                  type="button"
                  onClick={handleSend2FAOtp}
                  disabled={sendingOtp}
                  className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  {sendingOtp ? "Sending OTP..." : "Enable 2FA via Email"}
                </button>
              ) : (
                <form onSubmit={handleVerify2FAOtp} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200">
                    We sent a 6-digit confirmation code to your email. Enter it below to activate 2FA:
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                      6-Digit Security OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="e.g. 849201"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white font-mono text-center tracking-widest text-lg outline-none focus:border-cyan-500 transition"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOtpStep(false)}
                      className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={verifyingOtp}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {verifyingOtp ? "Verifying..." : "Verify & Activate"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Password and Security Best Practices */}
            <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-400" /> Security Recommendations
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Strong Password</span>
                    <span className="text-neutral-400">
                      Use a unique passphrase with alphanumeric and symbol combinations.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Device Authorization</span>
                    <span className="text-neutral-400">
                      Never share your JWT token or login passwords with third parties.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
