import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogIn,
  ArrowDownUp,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/NotificationToast/ToastContext";

const Login = () => {
  const { signin, verifyTwoFactor, demoLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [twoFactorSession, setTwoFactorSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await signin(email, password);
      if (res?.twoFactorRequired) {
        setTwoFactorSession(res.session);
        showToast("2FA OTP sent to your email. Please enter it below.", "info");
      } else {
        showToast("Welcome back! Login successful.", "success");
        navigate("/");
      }
    } catch (err) {
      setErrorMessage(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      showToast("Please enter the 6-digit OTP", "error");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      await verifyTwoFactor(otp.trim(), twoFactorSession);
      showToast("Two-factor authentication verified!", "success");
      navigate("/");
    } catch (err) {
      setErrorMessage(err.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = (role = "ROLE_CUSTOMER") => {
    demoLogin(role);
    showToast(`Logged in as Demo ${role === "ROLE_ADMIN" ? "Admin" : "Trader"}!`, "success");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/25 mx-auto mb-3">
            <ArrowDownUp className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            NEXUS <span className="text-cyan-400">CRYPTO</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Institutional Cryptocurrency Exchange & Trading Engine
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {twoFactorSession ? (
          /* 2FA OTP Form */
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 text-center">
              Enter the 6-digit verification code sent to your email address:
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5 text-center">
                Security OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white font-mono text-center tracking-widest text-xl outline-none focus:border-cyan-500 transition"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Enter Exchange"}
            </button>

            <button
              type="button"
              onClick={() => setTwoFactorSession(null)}
              className="w-full text-xs text-neutral-400 hover:text-white transition text-center"
            >
              Back to Password Login
            </button>
          </form>
        ) : (
          /* Standard Sign In Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@nexus.io"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-400">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to Terminal"}
            </button>

            {/* Quick Demo Login Option */}
            <div className="pt-2">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-neutral-800"></div>
                <span className="flex-shrink mx-3 text-[11px] text-neutral-500 uppercase font-mono">
                  Instant Preview
                </span>
                <div className="flex-grow border-t border-neutral-800"></div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleDemoSignIn("ROLE_CUSTOMER")}
                  className="py-2 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-cyan-300 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  Demo Trader
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn("ROLE_ADMIN")}
                  className="py-2 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-amber-300 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Demo Admin
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-xs text-neutral-400 pt-3">
              Don't have an account?{" "}
              <Link to="/signup" className="text-cyan-400 font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
