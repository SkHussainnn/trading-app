import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  LayoutDashboard,
  LineChart,
  Wallet,
  ArrowDownUp,
  Star,
  Clock,
  Shield,
  CreditCard,
  User,
  LogOut,
  LogIn,
  Search,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import SearchModal from "@/components/SearchModal/SearchModal";
import { Button } from "@/components/ui/button";

const Navbar = ({ onOpenAiCopilot }) => {
  const { user, isAuthenticated, isAdmin, logout, demoLogin } = useAuth();
  const { wallet } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Markets", path: "/", icon: TrendingUp },
    { label: "Trade", path: "/trade/bitcoin", icon: LineChart },
    { label: "Portfolio", path: "/portfolio", icon: LayoutDashboard },
    { label: "Orders", path: "/orders", icon: Clock },
    { label: "Watchlist", path: "/watchlist", icon: Star },
    { label: "Wallet", path: "/wallet", icon: Wallet },
    { label: "Withdrawal", path: "/withdrawal", icon: Building2 },
    ...(isAdmin ? [{ label: "Admin Portal", path: "/admin", icon: Shield }] : []),
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-lg focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
                <ArrowDownUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-white text-lg flex items-center gap-1.5">
                  NEXUS <span className="text-cyan-400">CRYPTO</span>
                  <span className="text-[10px] font-mono font-semibold uppercase bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 px-1.5 py-0.2 rounded">
                    PRO
                  </span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-6">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-neutral-800 text-cyan-400 font-semibold shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, Wallet Balance, AI Copilot, User Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Coin Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800/80 text-neutral-400 px-3 py-1.5 rounded-xl text-xs font-medium transition shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-neutral-500" />
              <span>Search coins...</span>
              <kbd className="hidden md:inline-block bg-neutral-950 text-neutral-500 text-[10px] px-1.5 py-0.5 rounded border border-neutral-800">
                ⌘K
              </kbd>
            </button>

            {/* Search Icon on Mobile */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 text-neutral-400 hover:text-white"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* AI Copilot Button */}
            {onOpenAiCopilot && (
              <button
                onClick={onOpenAiCopilot}
                className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-800/60 hover:border-cyan-500/80 text-cyan-300 hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-medium transition shadow-sm"
                title="AI Trading Assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                <span className="hidden md:inline">AI Copilot</span>
              </button>
            )}

            {/* Wallet Balance Chip */}
            {isAuthenticated ? (
              <Link
                to="/wallet"
                className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl hover:border-neutral-700 transition"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-neutral-400 font-mono leading-none">
                    Balance
                  </span>
                  <span className="text-xs font-bold font-mono text-emerald-400 leading-tight">
                    ${Number(wallet?.balance || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </Link>
            ) : (
              <button
                onClick={() => demoLogin("ROLE_CUSTOMER")}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-cyan-950/70 border border-cyan-700/60 text-cyan-300 hover:text-white hover:bg-cyan-900/60 px-3 py-1.5 rounded-xl font-medium transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Demo Trader
              </button>
            )}

            {/* User Dropdown / Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-neutral-800 text-white transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {user?.fullName?.slice(0, 1)?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold max-w-[100px] truncate">
                    {user?.fullName || "Trader"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-neutral-800/80">
                      <p className="font-semibold text-white truncate">
                        {user?.fullName || "Active Trader"}
                      </p>
                      <p className="text-neutral-500 truncate text-[11px] font-mono">
                        {user?.email || "trader@nexus.io"}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="text-[10px] text-neutral-400 uppercase font-mono">
                          {user?.role || "ROLE_CUSTOMER"}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
                      >
                        <Shield className="w-4 h-4 text-cyan-400" />
                        <span>Security & 2FA</span>
                      </Link>

                      <Link
                        to="/payment-details"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
                      >
                        <CreditCard className="w-4 h-4 text-indigo-400" />
                        <span>Bank & Payout Details</span>
                      </Link>

                      <Link
                        to="/wallet"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
                      >
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span>Wallet & Top-up</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
                        >
                          <Shield className="w-4 h-4 text-amber-400" />
                          <span>Admin Approvals</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-neutral-800/80 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-800 bg-neutral-950 p-4 space-y-2 animate-in slide-in-from-top-4">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-neutral-800 text-cyan-400 font-semibold"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            {!isAuthenticated && (
              <div className="pt-3 border-t border-neutral-800 flex flex-col gap-2">
                <button
                  onClick={() => {
                    demoLogin("ROLE_CUSTOMER");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 font-medium text-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Explore as Demo Trader
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;