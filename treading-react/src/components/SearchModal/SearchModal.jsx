import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import coinApi from "../../api/coinApi";

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      loadTrendingInitial();
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  const loadTrendingInitial = async () => {
    setLoading(true);
    try {
      const data = await coinApi.getTop50();
      setResults(data.slice(0, 6));
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      loadTrendingInitial();
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await coinApi.searchCoin(query);
        if (data.coins) {
          // Normalize results
          const formatted = data.coins.slice(0, 8).map((c) => ({
            id: c.id,
            name: c.name,
            symbol: c.symbol,
            image: c.large || c.thumb || "",
            marketCapRank: c.market_cap_rank,
            currentPrice: c.data?.price || null,
          }));
          setResults(formatted);
        }
      } catch (err) {
        console.warn("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (coinId) => {
    navigate(`/trade/${coinId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search header */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-800 gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coin name or symbol (e.g. BTC, Solana)..."
            className="w-full bg-transparent text-white placeholder-neutral-500 outline-none text-base font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-neutral-500 hover:text-neutral-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-neutral-800 text-neutral-400 hover:text-white px-2.5 py-1 rounded-md transition"
          >
            ESC
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-[380px] overflow-y-auto p-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 px-3 py-2">
            {query.trim() ? "Search Results" : "Popular Cryptocurrencies"}
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-neutral-400 animate-pulse">
              Searching crypto markets...
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              No matching coins found for "{query}"
            </div>
          ) : (
            results.map((coin) => (
              <div
                key={coin.id}
                onClick={() => handleSelect(coin.id)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-800/80 cursor-pointer transition group"
              >
                <div className="flex items-center gap-3">
                  {coin.image ? (
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center font-bold text-xs text-cyan-300">
                      {coin.symbol?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white group-hover:text-cyan-400 transition">
                        {coin.name}
                      </span>
                      <span className="text-xs font-mono uppercase bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">
                        {coin.symbol}
                      </span>
                    </div>
                    {coin.marketCapRank && (
                      <span className="text-[11px] text-neutral-500">
                        Rank #{coin.marketCapRank}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {coin.currentPrice && (
                    <span className="font-mono text-sm text-white font-medium">
                      {typeof coin.currentPrice === "number"
                        ? `$${coin.currentPrice.toLocaleString()}`
                        : coin.currentPrice}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer tip */}
        <div className="px-4 py-2.5 bg-neutral-950/60 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500">
          <span>Tip: Click any coin to launch Trading Terminal</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
