import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { ToastProvider } from "./components/NotificationToast/ToastContext";

import Navbar from "./page/Navbar/Navbar";
import LiveTicker from "./components/LiveTicker/LiveTicker";
import AICopilot from "./components/AICopilot/AICopilot";

import Home from "./page/Home/Home";
import Trade from "./page/Trade/Trade";
import Portfolio from "./page/Portfolio/Portfolio";
import Orders from "./page/Orders/Orders";
import Wallet from "./page/Wallet/Wallet";
import Withdrawal from "./page/Withdrawal/Withdrawal";
import PaymentDetails from "./page/PaymentDetails/PaymentDetails";
import Watchlist from "./page/Watchlist/Watchlist";
import Profile from "./page/Profile/Profile";
import Admin from "./page/Admin/Admin";

import Login from "./page/Auth/Login";
import Signup from "./page/Auth/Signup";
import ForgotPassword from "./page/Auth/ForgotPassword";

function App() {
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <WalletProvider>
          <ToastProvider>
            <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
              {/* Real-time Crypto Ticker Banner */}
              <LiveTicker />

              {/* Top Navigation */}
              <Navbar onOpenAiCopilot={() => setIsAiCopilotOpen(true)} />

              {/* Main Routing View */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/trade" element={<Navigate to="/trade/bitcoin" replace />} />
                  <Route path="/trade/:coinId" element={<Trade />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/withdrawal" element={<Withdrawal />} />
                  <Route path="/payment-details" element={<PaymentDetails />} />
                  <Route path="/watchlist" element={<Watchlist />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<Admin />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Catch-all redirect to Home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Floating AI Trading Copilot Assistant */}
              <AICopilot
                isOpen={isAiCopilotOpen}
                onClose={() => setIsAiCopilotOpen(false)}
              />

              {/* Footer */}
              <footer className="border-t border-neutral-900 bg-neutral-950/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-neutral-500">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white">NEXUS CRYPTO</span>
                    <span>• High-Frequency Digital Asset Platform</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-neutral-400">Spring Boot Backend API: Port 5454</span>
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> All Systems Operational
                    </span>
                  </div>
                </div>
              </footer>
            </div>
          </ToastProvider>
        </WalletProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
