import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Star,
  ArrowRight,
  Flame,
  ShieldCheck,
  Zap,
  Layers,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";
import coinApi from "../../api/coinApi";
import { useWallet } from "../../context/WalletContext";
import { useToast } from "../../components/NotificationToast/ToastContext";
import TradeModal from "../../components/TradeModal/TradeModal";

const Home = () => {
  const [coins, setCoins] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all"); // "all", "gainers", "losers", "watchlist"
  const [selectedCoinForTrade, setSelectedCoinForTrade] = useState(null);
  const [tradeType, setTradeType] = useState("BUY");

  const { isWatchlisted, toggleWatchlist } = useWallet();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMarketData();
  }, [page]);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const [coinList, trendingData] = await Promise.all([
        coinApi.getCoinList(page),
        coinApi.getTrending(),
      ]);
      setCoins(coinList);
      if (trendingData?.coins) {
        setTrending(trendingData.coins.slice(0, 4));
      }
    } catch (err) {
      console.warn("Market fetch fallback triggered:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTrade = (coin, type = "BUY") => {
    setSelectedCoinForTrade(coin);
    setTradeType(type);
  };

  const filteredCoins = coins.filter((coin) => {
    if (activeTab === "gainers") return coin.priceChangePercentage24h > 0;
    if (activeTab === "losers") return coin.priceChangePercentage24h < 0;
    if (activeTab === "watchlist") return isWatchlisted(coin.id);
    return true;
  });

  // Calculate Market Totals for top statistics
  const totalMarketCap = 2480190450000;
  const total24hVol = 89400210000;
  const btcDominance = 54.2;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-neutral-900 bg-radial from-neutral-900/60 via-neutral-950 to-neutral-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
                <Zap className="w-3.5 h-3.5" /> Next-Gen Crypto Trading Engine
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Trade Crypto with{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent">
                  Institutional Precision
                </span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-neutral-400 leading-relaxed">
                Execute instant spot orders, track real-time market depth, deposit via
                Stripe or Razorpay, and manage your portfolio with bank-grade 2FA security.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  to="/trade/bitcoin"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" /> Start Trading BTC
                </Link>
                <Link
                  to="/wallet"
                  className="px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-semibold text-sm transition"
                >
                  Deposit Funds
                </Link>
              </div>
            </div>

            {/* Quick Market Overview Cards */}
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0 max-w-md">
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-md">
                <span className="text-xs text-neutral-400 font-medium">Crypto Market Cap</span>
                <p className="text-xl font-bold font-mono text-white mt-1">
                  ${(totalMarketCap / 1e12).toFixed(2)}T
                </p>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-0.5 mt-1">
                  <TrendingUp className="w-3 h-3" /> +2.4% (24h)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-md">
                <span className="text-xs text-neutral-400 font-medium">24h Global Volume</span>
                <p className="text-xl font-bold font-mono text-white mt-1">
                  ${(total24hVol / 1e9).toFixed(1)}B
                </p>
                <span className="text-[11px] font-mono text-cyan-400 mt-1 block">
                  Liquid Spot Markets
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-md">
                <span className="text-xs text-neutral-400 font-medium">BTC Dominance</span>
                <p className="text-xl font-bold font-mono text-white mt-1">{btcDominance}%</p>
                <span className="text-[11px] text-neutral-500 mt-1 block">Market Leader</span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-md">
                <span className="text-xs text-neutral-400 font-medium">Fear & Greed</span>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-1">68 / 100</p>
                <span className="text-[11px] text-emerald-400/80 mt-1 block">Greed (Bullish)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Coins Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coins.slice(0, 4).map((coin) => {
            const isUp = coin.priceChangePercentage24h >= 0;
            return (
              <div
                key={coin.id}
                className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800/90 hover:border-neutral-700 shadow-xl backdrop-blur-md transition group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-cyan-400 transition">
                        {coin.name}
                      </h4>
                      <span className="text-xs uppercase font-mono text-neutral-400">
                        {coin.symbol}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toggleWatchlist(coin);
                      showToast(
                        isWatchlisted(coin.id)
                          ? `Removed ${coin.name} from watchlist`
                          : `Added ${coin.name} to watchlist`,
                        "info"
                      );
                    }}
                    className={`p-1.5 rounded-lg transition ${
                      isWatchlisted(coin.id)
                        ? "text-amber-400 bg-amber-400/10"
                        : "text-neutral-500 hover:text-white"
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-lg font-bold font-mono text-white">
                    ${coin.currentPrice?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span
                    className={`text-xs font-mono font-medium flex items-center gap-0.5 ${
                      isUp ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isUp ? "+" : ""}
                    {coin.priceChangePercentage24h?.toFixed(2)}%
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleOpenTrade(coin, "BUY")}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Quick Trade
                  </button>
                  <Link
                    to={`/trade/${coin.id}`}
                    className="text-neutral-400 hover:text-white flex items-center gap-1 group-hover:translate-x-0.5 transition"
                  >
                    Chart <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Markets Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Table Controls */}
          <div className="p-4 sm:p-6 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" /> All Cryptocurrencies
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Real-time price feed and market capitalization
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 gap-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "all"
                    ? "bg-neutral-800 text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                All Coins
              </button>
              <button
                onClick={() => setActiveTab("gainers")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "gainers"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Top Gainers
              </button>
              <button
                onClick={() => setActiveTab("losers")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "losers"
                    ? "bg-rose-950 text-rose-400 border border-rose-800/60"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Top Losers
              </button>
              <button
                onClick={() => setActiveTab("watchlist")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "watchlist"
                    ? "bg-amber-950 text-amber-400 border border-amber-800/60"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Watchlist
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-950/60 text-neutral-400 text-xs uppercase tracking-wider font-semibold border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">24h Change</th>
                  <th className="py-3 px-4 hidden sm:table-cell">24h High / Low</th>
                  <th className="py-3 px-4 hidden md:table-cell">Market Cap</th>
                  <th className="py-3 px-4 hidden lg:table-cell">24h Volume</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-neutral-500">
                      Loading crypto markets...
                    </td>
                  </tr>
                ) : filteredCoins.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-neutral-500">
                      No cryptocurrencies match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredCoins.map((coin) => {
                    const isUp = coin.priceChangePercentage24h >= 0;
                    return (
                      <tr
                        key={coin.id}
                        className="hover:bg-neutral-800/50 transition cursor-pointer group"
                        onClick={(e) => {
                          // Prevent navigation if clicked on action button or star
                          if (e.target.closest("button")) return;
                          navigate(`/trade/${coin.id}`);
                        }}
                      >
                        {/* Rank */}
                        <td className="py-4 px-4 text-center font-mono text-xs text-neutral-500">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(coin);
                            }}
                            className={`p-1 rounded transition ${
                              isWatchlisted(coin.id)
                                ? "text-amber-400"
                                : "text-neutral-600 hover:text-neutral-400"
                            }`}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </td>

                        {/* Name & Symbol */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={coin.image}
                              alt={coin.name}
                              className="w-7 h-7 rounded-full"
                            />
                            <div>
                              <span className="font-bold text-white group-hover:text-cyan-400 transition">
                                {coin.name}
                              </span>
                              <span className="ml-2 text-xs font-mono uppercase bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                                {coin.symbol}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-4 font-mono font-bold text-white">
                          ${coin.currentPrice?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* 24h Change */}
                        <td className="py-4 px-4 font-mono text-xs">
                          <span
                            className={`inline-flex items-center gap-1 font-bold ${
                              isUp ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isUp ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {isUp ? "+" : ""}
                            {coin.priceChangePercentage24h?.toFixed(2)}%
                          </span>
                        </td>

                        {/* 24h High / Low */}
                        <td className="py-4 px-4 font-mono text-xs text-neutral-400 hidden sm:table-cell">
                          ${coin.low24h?.toLocaleString(undefined, { maximumFractionDigits: 2 })} - $
                          {coin.high24h?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>

                        {/* Market Cap */}
                        <td className="py-4 px-4 font-mono text-xs text-neutral-300 hidden md:table-cell">
                          ${coin.marketCap?.toLocaleString()}
                        </td>

                        {/* 24h Volume */}
                        <td className="py-4 px-4 font-mono text-xs text-neutral-400 hidden lg:table-cell">
                          ${coin.totalVolume?.toLocaleString()}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTrade(coin, "BUY");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition"
                            >
                              Buy
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTrade(coin, "SELL");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition"
                            >
                              Sell
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>Page {page} of crypto markets</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold text-white px-2">{page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trade Modal */}
      <TradeModal
        isOpen={!!selectedCoinForTrade}
        onClose={() => setSelectedCoinForTrade(null)}
        coin={selectedCoinForTrade}
        initialType={tradeType}
      />
    </div>
  );
};

export default Home;
