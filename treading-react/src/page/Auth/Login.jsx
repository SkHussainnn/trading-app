import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDownUp,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/NotificationToast/ToastContext";

/* ─── 6-box OTP input component ─────────────────────────────────── */
const OtpBoxes = ({ value, onChange }) => {
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);
  const refs = Array.from({ length: 6 }, () => useRef(null));

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = digits.map((d, idx) => (idx === i ? "" : d)).join("");
      onChange(next);
      if (i > 0) refs[i - 1].current?.focus();
      return;
    }
    if (e.key === "ArrowLeft" && i > 0) { refs[i - 1].current?.focus(); return; }
    if (e.key === "ArrowRight" && i < 5) { refs[i + 1].current?.focus(); return; }
  };

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, idx) => (idx === i ? char : d)).join("");
    onChange(next);
    if (char && i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    refs[Math.min(pasted.length, 5)].current?.focus();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          autoFocus={i === 0}
          className={`w-12 h-14 text-center text-2xl font-black font-mono rounded-xl border-2 bg-neutral-950 text-white outline-none transition
            ${digit
              ? "border-cyan-500 shadow-lg shadow-cyan-500/20"
              : "border-neutral-700 focus:border-cyan-500"
            }`}
        />
      ))}
    </div>
  );
};

/* ─── Main Login page ────────────────────────────────────────────── */
const Login = () => {
  const { signin, verifyTwoFactor, demoLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [twoFactorSession, setTwoFactorSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const { signin: authSignin } = useAuth();

  // countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* Mask email for display: h***@gmail.com */
  const maskEmail = (e) => {
    const [local, domain] = e.split("@");
    return local.slice(0, 1) + "***@" + domain;
  };

  /* Step 1 — credentials submit */
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    try {
      const res = await signin(email, password);
      if (res?.twoFactorRequired) {
        setTwoFactorSession(res.session);
        setMaskedEmail(maskEmail(email));
        setCountdown(60);
        showToast("OTP sent to your registered email!", "success");
      } else {
        showToast("Welcome back!", "success");
        navigate("/");
      }
    } catch (err) {
      setErrorMessage(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  /* Step 2 — OTP verify */
  const handleVerify2FA = async (e) => {
    e?.preventDefault();
    if (otp.replace(/\D/g, "").length < 6) {
      showToast("Please enter all 6 digits", "error");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      await verifyTwoFactor(otp, twoFactorSession);
      showToast("✅ Verified! Welcome to NexusTrade.", "success");
      navigate("/");
    } catch (err) {
      setErrorMessage(err.message || "Invalid OTP. Please try again.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  /* Auto-submit when all 6 digits filled */
  useEffect(() => {
    if (twoFactorSession && otp.replace(/\D/g, "").length === 6) {
      handleVerify2FA();
    }
  }, [otp]); // eslint-disable-line

  /* Resend OTP */
  const handleResend = async () => {
    setResending(true);
    setOtp("");
    setErrorMessage("");
    try {
      const res = await signin(email, password);
      if (res?.session) {
        setTwoFactorSession(res.session);
        setCountdown(60);
        showToast("New OTP sent!", "success");
      }
    } catch {
      showToast("Failed to resend. Please go back and try again.", "error");
    } finally {
      setResending(false);
    }
  };

  const handleDemoSignIn = (role = "ROLE_CUSTOMER") => {
    demoLogin(role);
    showToast(`Logged in as Demo ${role === "ROLE_ADMIN" ? "Admin" : "Trader"}!`, "success");
    navigate("/");
  };

  /* ══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[200px] bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md bg-neutral-900/95 border border-neutral-800 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10">

        {/* Brand header */}
        <div className="text-center px-8 pt-8 pb-6 border-b border-neutral-800/80">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/25 mx-auto mb-3">
            <ArrowDownUp className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            NEXUS <span className="text-cyan-400">CRYPTO</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {twoFactorSession
              ? "Two-Factor Authentication"
              : "Institutional Cryptocurrency Exchange"}
          </p>
        </div>

        <div className="p-8">
          {/* Error banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ── STEP 2: OTP verification ── */}
          {twoFactorSession ? (
            <div className="space-y-6">
              {/* Info banner */}
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 text-center">
                <div className="w-10 h-10 rounded-full bg-cyan-900/60 flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-sm font-bold text-white">Check your email</p>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  We sent a 6-digit verification code to
                  <br />
                  <span className="text-cyan-300 font-mono font-bold">{maskedEmail}</span>
                </p>
              </div>

              {/* 6-box OTP input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-4 text-center uppercase tracking-widest">
                  Enter Verification Code
                </label>
                <OtpBoxes value={otp} onChange={setOtp} />
                <p className="text-center text-[11px] text-neutral-500 mt-3">
                  Automatically submits when all 6 digits are entered
                </p>
              </div>

              {/* Verify button */}
              <button
                onClick={handleVerify2FA}
                disabled={loading || otp.replace(/\D/g, "").length < 6}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> Verify &amp; Sign In</>
                )}
              </button>

              {/* Resend + Back */}
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => { setTwoFactorSession(null); setOtp(""); setErrorMessage(""); }}
                  className="flex items-center gap-1 text-neutral-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || resending}
                  className="text-cyan-400 hover:text-cyan-300 transition disabled:text-neutral-500 disabled:cursor-not-allowed"
                >
                  {resending
                    ? "Sending…"
                    : countdown > 0
                    ? `Resend in ${countdown}s`
                    : "Resend OTP"}
                </button>
              </div>
            </div>

          ) : (
            /* ── STEP 1: Email + Password ── */
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trader@nexus.io"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-cyan-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-cyan-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-cyan-500 transition"
                    required
                  />
                </div>
              </div>

              {/* 2FA notice */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-300">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>An OTP will be sent to your registered email for 2-factor verification.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating…</>
                ) : (
                  "Continue to Verification →"
                )}
              </button>

              {/* Demo mode */}
              <div className="pt-1">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-neutral-800" />
                  <span className="flex-shrink mx-3 text-[11px] text-neutral-500 uppercase font-mono">
                    Quick Demo
                  </span>
                  <div className="flex-grow border-t border-neutral-800" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn("ROLE_CUSTOMER")}
                    className="py-2 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-cyan-300 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Demo Trader
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn("ROLE_ADMIN")}
                    className="py-2 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-amber-300 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Demo Admin
                  </button>
                </div>
              </div>

              <p className="text-center text-xs text-neutral-400 pt-1">
                Don't have an account?{" "}
                <Link to="/signup" className="text-cyan-400 font-bold hover:underline">
                  Create Account
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
