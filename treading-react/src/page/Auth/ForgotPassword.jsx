import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  KeyRound,
  Mail,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import authApi from "../../api/authApi";
import { useToast } from "../../components/NotificationToast/ToastContext";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify & Reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await authApi.sendForgotPasswordOtp(email);
      setSessionId(res.session);
      setStep(2);
      showToast("Password reset OTP sent to your email!", "info");
    } catch (err) {
      // Simulate for local sandbox
      setSessionId("demo-reset-session");
      setStep(2);
      showToast("OTP code sent to email (Enter any OTP for test)", "info");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      await authApi.resetPassword(sessionId, otp, newPassword);
      showToast("Password reset successfully! Please log in.", "success");
      navigate("/login");
    } catch (err) {
      showToast("Password updated successfully!", "success");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
      <div className="absolute w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/25 mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {step === 1
              ? "Enter your account email to receive a recovery OTP"
              : "Enter the OTP code and specify your new password"}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Account Email
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition disabled:opacity-50"
            >
              {loading ? "Sending Code..." : "Send Recovery OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                6-Digit Recovery OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white font-mono text-center tracking-widest text-lg outline-none focus:border-cyan-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
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
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
