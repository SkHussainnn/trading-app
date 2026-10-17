import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Star,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers,
} from "lucide-react";
import { useWallet } from "../../context/WalletContext";
import { useToast } from "../../components/NotificationToast/ToastContext";

const Watchlist = () => {
  const { watchlist, toggleWatchlist } = useWallet();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRemove = (coin) => {
    toggleWatchlist(coin);
    showToast(`Removed ${coin.name} from watchlist`, "info");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
              Crypto Watchlist
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Your curated list of pinned cryptocurrencies for rapid market monitoring
            </p>
          </div>

          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-cyan-400" /> Discover More Coins
          </Link>
        </div>

        {/* Watchlist Content */}
        {watchlist.length === 0 ? (
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <Star className="w-8 h-8 fill-amber-400/30" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Your Watchlist is Empty
            </h2>
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
              Star your favorite cryptocurrencies from the market overview table or trading terminal to keep an eye on price swings.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition"
            >
              Browse Crypto Markets <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((coin) => {
              const isUp = (coin.priceChangePercentage24h || 0) >= 0;
              return (
                <div
                  key={coin.id}
                  className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md hover:border-neutral-700 transition flex flex-col justify-between group"
                >
                  {/* Top coin header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {coin.image && (
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-base text-white group-hover:text-cyan-400 transition">
                          {coin.name}
                        </h3>
                        <span className="text-xs uppercase font-mono text-neutral-400">
                          {coin.symbol} • Rank #{coin.marketCapRank || "N/A"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(coin)}
                      className="p-1.5 rounded-lg text-amber-400 hover:bg-neutral-800 transition"
                      title="Remove from Watchlist"
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  {/* Price info */}
                  <div className="mt-6 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-neutral-500 block">
                        Market Price
                      </span>
                      <span className="text-2xl font-bold font-mono text-white">
                        $
                        {coin.currentPrice?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || "0.00"}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                        isUp
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                          : "bg-rose-950 text-rose-400 border border-rose-800/60"
                      }`}
                    >
                      {isUp ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {isUp ? "+" : ""}
                      {coin.priceChangePercentage24h?.toFixed(2) || "0.00"}%
                    </span>
                  </div>

                  {/* High / Low metric */}
                  {coin.high24h && (
                    <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-between text-xs text-neutral-400 font-mono">
                      <span>24h High: ${coin.high24h.toLocaleString()}</span>
                      <span>24h Low: ${coin.low24h.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Action button */}
                  <div className="mt-6 flex items-center gap-3">
                    <Link
                      to={`/trade/${coin.id}`}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs text-center shadow-lg shadow-cyan-600/25 transition flex items-center justify-center gap-1.5"
                    >
                      <BarChart3 className="w-4 h-4" /> Trade Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
