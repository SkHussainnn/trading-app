import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import coinApi from "../../api/coinApi";

const LiveTicker = () => {
  const [tickerCoins, setTickerCoins] = useState([]);

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const coins = await coinApi.getCoinList(1);
        setTickerCoins(coins.slice(0, 8));
      } catch (err) {
        // Fallback handled in coinApi
      }
    };
    fetchTicker();
  }, []);

  if (tickerCoins.length === 0) return null;

  return (
    <div className="bg-neutral-950/80 border-b border-neutral-800/60 py-1.5 px-4 overflow-hidden text-xs text-neutral-300">
      <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold tracking-wider uppercase shrink-0">
          <Zap className="w-3.5 h-3.5 fill-cyan-400/20" />
          <span>Markets 24h:</span>
        </div>

        {tickerCoins.map((coin) => {
          const isPositive = coin.priceChangePercentage24h >= 0;
          return (
            <Link
              key={coin.id}
              to={`/trade/${coin.id}`}
              className="flex items-center gap-2 shrink-0 hover:text-white transition group py-0.5"
            >
              <img
                src={coin.image}
                alt={coin.name}
                className="w-4 h-4 rounded-full"
              />
              <span className="font-semibold text-neutral-200 group-hover:text-cyan-300">
                {coin.symbol.toUpperCase()}
              </span>
              <span className="text-neutral-400 font-mono">
                ${coin.currentPrice?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span
                className={`flex items-center gap-0.5 text-[11px] font-medium font-mono ${
                  isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {isPositive ? "+" : ""}
                {coin.priceChangePercentage24h?.toFixed(2)}%
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default LiveTicker;
