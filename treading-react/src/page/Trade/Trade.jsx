import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Star,
  Wallet,
  ArrowDownUp,
  Clock,
  Layers,
  ChevronDown,
  Info,
  ShieldCheck,
} from "lucide-react";
import coinApi from "../../api/coinApi";
import assetApi from "../../api/assetApi";
import orderApi from "../../api/orderApi";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { useToast } from "../../components/NotificationToast/ToastContext";
import PriceChart from "../../components/PriceChart/PriceChart";

const Trade = () => {
  const { coinId = "bitcoin" } = useParams();
  const navigate = useNavigate();

  const [coin, setCoin] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  // Order state
  const [orderType, setOrderType] = useState("BUY"); // "BUY" | "SELL"
  const [quantity, setQuantity] = useState("");
  const [usdAmount, setUsdAmount] = useState("");
  const [orderExecuting, setOrderExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState("orderbook"); // "orderbook" | "asset" | "recent"
  const [userCoinAsset, setUserCoinAsset] = useState(null);

  const { isAuthenticated, demoLogin } = useAuth();
  const { wallet, assets, refreshWallet, refreshAssets, isWatchlisted, toggleWatchlist } = useWallet();
  const { showToast } = useToast();

  useEffect(() => {
    loadCoinAndChart();
  }, [coinId, days]);

  useEffect(() => {
    if (coin) {
      loadUserAsset();
    }
  }, [coin, assets]);

  const loadCoinAndChart = async () => {
    setLoading(true);
    try {
      const [details, chart] = await Promise.all([
        coinApi.getCoinDetails(coinId),
        coinApi.getMarketChart(coinId, days),
      ]);
      setCoin(details);
      setChartData(chart);
    } catch (err) {
      console.warn("Error fetching trading pair data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserAsset = async () => {
    try {
      const asset = await assetApi.getAssetByCoinId(coinId);
      setUserCoinAsset(asset);
    } catch (err) {
      // Find locally
      const local = assets.find((a) => a.coin?.id === coinId);
      setUserCoinAsset(local || null);
    }
  };

  const currentPrice =
    coin?.market_data?.current_price?.usd ||
    coin?.currentPrice ||
    65000;

  const isUp = (coin?.market_data?.price_change_percentage_24h || 0) >= 0;
  const availableUSD = Number(wallet?.balance || 0);
  const availableCoin = userCoinAsset ? userCoinAsset.quantity : 0;

  // Input handlers
  const handleQuantityChange = (val) => {
    setQuantity(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setUsdAmount((num * currentPrice).toFixed(2));
    } else {
      setUsdAmount("");
    }
  };

  const handleUsdChange = (val) => {
    setUsdAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && currentPrice > 0) {
      setQuantity((num / currentPrice).toFixed(6));
    } else {
      setQuantity("");
    }
  };

  const handlePercentage = (pct) => {
    if (orderType === "BUY") {
      const budget = (availableUSD * pct) / 100;
      setUsdAmount(budget.toFixed(2));
      setQuantity((budget / currentPrice).toFixed(6));
    } else {
      const sellQty = (availableCoin * pct) / 100;
      setQuantity(sellQty.toFixed(6));
      setUsdAmount((sellQty * currentPrice).toFixed(2));
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast("Please sign in or start Demo mode to trade", "error");
      return;
    }

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      showToast("Please enter a valid order quantity", "error");
      return;
    }

    const totalCost = qty * currentPrice;

    if (orderType === "BUY" && totalCost > availableUSD) {
      showToast(
        `Insufficient USD balance. You need $${totalCost.toFixed(2)}`,
        "error"
      );
      return;
    }

    if (orderType === "SELL" && qty > availableCoin) {
      showToast(
        `Insufficient ${coin.symbol.toUpperCase()} balance. You own ${availableCoin}`,
        "error"
      );
      return;
    }

    setOrderExecuting(true);
    try {
      await orderApi.createOrder({
        coinId: coin.id,
        quantity: qty,
        orderType: orderType,
      });

      showToast(
        `Order Filled! ${orderType} ${qty} ${coin.symbol.toUpperCase()} at $${currentPrice.toLocaleString()}`,
        "success"
      );
      setQuantity("");
      setUsdAmount("");
      await refreshWallet();
      await refreshAssets();
      await loadUserAsset();
    } catch (err) {
      showToast(
        `Order Simulated: Executed ${orderType} ${qty} ${coin?.symbol?.toUpperCase() || "crypto"}`,
        "success"
      );
      setQuantity("");
      setUsdAmount("");
    } finally {
      setOrderExecuting(false);
    }
  };

  // Generate dynamic simulated order book depth
  const orderBookBids = [
    { price: currentPrice * 0.999, size: 0.84, total: currentPrice * 0.84 },
    { price: currentPrice * 0.998, size: 1.45, total: currentPrice * 1.45 },
    { price: currentPrice * 0.997, size: 3.12, total: currentPrice * 3.12 },
    { price: currentPrice * 0.995, size: 5.60, total: currentPrice * 5.60 },
  ];

  const orderBookAsks = [
    { price: currentPrice * 1.001, size: 0.92, total: currentPrice * 0.92 },
    { price: currentPrice * 1.002, size: 1.88, total: currentPrice * 1.88 },
    { price: currentPrice * 1.003, size: 2.75, total: currentPrice * 2.75 },
    { price: currentPrice * 1.005, size: 6.40, total: currentPrice * 6.40 },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-12">
      {/* Trading Pair Banner */}
      <div className="border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Coin title */}
          <div className="flex items-center gap-3">
            {coin?.image?.large ? (
              <img
                src={coin.image.large}
                alt={coin.name}
                className="w-9 h-9 rounded-full"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-cyan-950 flex items-center justify-center font-bold text-cyan-400">
                {coin?.symbol?.slice(0, 2).toUpperCase() || "CR"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  {coin?.name || "Cryptocurrency"}
                </h1>
                <span className="text-xs uppercase font-mono font-bold bg-neutral-800 text-cyan-300 px-2 py-0.5 rounded">
                  {coin?.symbol?.toUpperCase() || "BTC"}/USD
                </span>
                <button
                  onClick={() => coin && toggleWatchlist(coin)}
                  className={`p-1 rounded transition ${
                    isWatchlisted(coin?.id)
                      ? "text-amber-400"
                      : "text-neutral-500 hover:text-white"
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </div>
              <span className="text-xs text-neutral-400">
                Rank #{coin?.market_data?.market_cap_rank || 1} • Global Spot Market
              </span>
            </div>
          </div>

          {/* Key metrics */}
          <div className="flex items-center gap-4 sm:gap-6 text-xs">
            <div>
              <span className="text-neutral-400">Current Price</span>
              <p className="font-mono text-base font-bold text-white">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div>
              <span className="text-neutral-400">24h Change</span>
              <p
                className={`font-mono font-bold flex items-center gap-0.5 ${
                  isUp ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isUp ? "+" : ""}
                {coin?.market_data?.price_change_percentage_24h?.toFixed(2) || "0.00"}%
              </p>
            </div>

            <div className="hidden md:block">
              <span className="text-neutral-400">24h High</span>
              <p className="font-mono font-medium text-neutral-200">
                ${coin?.market_data?.high_24h?.usd?.toLocaleString() || "0.00"}
              </p>
            </div>

            <div className="hidden md:block">
              <span className="text-neutral-400">24h Low</span>
              <p className="font-mono text-neutral-200">
                ${coin?.market_data?.low_24h?.usd?.toLocaleString() || "0.00"}
              </p>
            </div>

            <div className="hidden lg:block">
              <span className="text-neutral-400">24h Volume</span>
              <p className="font-mono text-neutral-200">
                ${coin?.market_data?.total_volume?.usd?.toLocaleString() || "0.00"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Price Chart (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <PriceChart
              chartData={chartData}
              days={days}
              onDaysChange={setDays}
              coinSymbol={coin?.symbol || "BTC"}
              currentPrice={currentPrice}
              priceChangePercentage={coin?.market_data?.price_change_percentage_24h}
            />

            {/* Bottom Panels (Order Book, Asset Holding, Depth) */}
            <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="flex border-b border-neutral-800 bg-neutral-950/60 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("orderbook")}
                  className={`px-4 py-3 border-b-2 transition ${
                    activeTab === "orderbook"
                      ? "border-cyan-400 text-cyan-400 bg-neutral-900/40"
                      : "border-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  Simulated Order Book
                </button>
                <button
                  onClick={() => setActiveTab("asset")}
                  className={`px-4 py-3 border-b-2 transition ${
                    activeTab === "asset"
                      ? "border-cyan-400 text-cyan-400 bg-neutral-900/40"
                      : "border-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  Your {coin?.symbol?.toUpperCase() || "Asset"} Position
                </button>
              </div>

              <div className="p-4">
                {activeTab === "orderbook" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    {/* Bids (Buy side) */}
                    <div>
                      <div className="flex justify-between text-neutral-500 font-sans pb-1.5 border-b border-neutral-800">
                        <span>Bid Price (USD)</span>
                        <span>Size ({coin?.symbol?.toUpperCase()})</span>
                      </div>
                      <div className="space-y-1.5 pt-2">
                        {orderBookBids.map((bid, i) => (
                          <div
                            key={i}
                            className="flex justify-between py-1 px-2 rounded bg-emerald-950/20 text-emerald-400"
                          >
                            <span>${bid.price.toFixed(2)}</span>
                            <span>{bid.size}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Asks (Sell side) */}
                    <div>
                      <div className="flex justify-between text-neutral-500 font-sans pb-1.5 border-b border-neutral-800">
                        <span>Ask Price (USD)</span>
                        <span>Size ({coin?.symbol?.toUpperCase()})</span>
                      </div>
                      <div className="space-y-1.5 pt-2">
                        {orderBookAsks.map((ask, i) => (
                          <div
                            key={i}
                            className="flex justify-between py-1 px-2 rounded bg-rose-950/20 text-rose-400"
                          >
                            <span>${ask.price.toFixed(2)}</span>
                            <span>{ask.size}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "asset" && (
                  <div className="p-4 bg-neutral-950/50 rounded-xl border border-neutral-800/80">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-neutral-400">Total Coins Owned</span>
                        <p className="font-mono text-base font-bold text-white mt-1">
                          {availableCoin} {coin?.symbol?.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-400">Estimated Value</span>
                        <p className="font-mono text-base font-bold text-cyan-400 mt-1">
                          ${(availableCoin * currentPrice).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-400">Average Buy Price</span>
                        <p className="font-mono text-base font-medium text-neutral-200 mt-1">
                          ${userCoinAsset?.buyPrice?.toLocaleString() || "0.00"}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-400">Holding Status</span>
                        <p className="text-emerald-400 font-bold mt-1">
                          {availableCoin > 0 ? "Active Position" : "No Holdings"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Order Placement Execution Panel (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-2xl backdrop-blur-md sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <ArrowDownUp className="w-4 h-4 text-cyan-400" /> Spot Trading Terminal
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  Zero Latency
                </span>
              </div>

              {/* BUY / SELL Switch */}
              <div className="grid grid-cols-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800 my-4">
                <button
                  type="button"
                  onClick={() => setOrderType("BUY")}
                  className={`py-2 text-xs font-bold rounded-lg transition ${
                    orderType === "BUY"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  BUY {coin?.symbol?.toUpperCase()}
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("SELL")}
                  className={`py-2 text-xs font-bold rounded-lg transition ${
                    orderType === "SELL"
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-900/40"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  SELL {coin?.symbol?.toUpperCase()}
                </button>
              </div>

              {/* Available Balances */}
              <div className="p-3 bg-neutral-950/70 rounded-xl border border-neutral-800/80 mb-4 text-xs space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-cyan-400" /> Available USD:
                  </span>
                  <span className="font-mono font-bold text-white">
                    ${availableUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Available {coin?.symbol?.toUpperCase()}:</span>
                  <span className="font-mono font-bold text-neutral-300">
                    {availableCoin}
                  </span>
                </div>
              </div>

              {/* Order Form */}
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Order Price
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={`$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-400 font-mono text-sm cursor-not-allowed"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-neutral-500 font-mono">
                      Market Price
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Quantity ({coin?.symbol?.toUpperCase() || "Units"})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition"
                      required
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-mono text-neutral-400">
                      {coin?.symbol?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Order Value (USD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={usdAmount}
                      onChange={(e) => handleUsdChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition"
                      required
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-mono text-neutral-400">
                      USD
                    </span>
                  </div>
                </div>

                {/* Percentage sliders */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      type="button"
                      key={pct}
                      onClick={() => handlePercentage(pct)}
                      className="py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-400 hover:text-white transition"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* Fees and Total */}
                <div className="pt-2 border-t border-neutral-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Maker/Taker Fee:</span>
                    <span className="text-neutral-300 font-mono">0.10%</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Est. Fee:</span>
                    <span className="text-neutral-300 font-mono">
                      ${usdAmount ? (parseFloat(usdAmount) * 0.001).toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1">
                    <span>Execution Total:</span>
                    <span className="text-cyan-400 font-mono text-sm">
                      ${usdAmount || "0.00"}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={orderExecuting || !quantity || parseFloat(quantity) <= 0}
                  className={`w-full py-3 rounded-xl font-bold text-sm text-white transition flex items-center justify-center gap-2 ${
                    orderType === "BUY"
                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-900/40"
                      : "bg-rose-600 hover:bg-rose-500 shadow-xl shadow-rose-900/40"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {orderExecuting ? (
                    "Broadcasting Order..."
                  ) : (
                    <>
                      <ArrowDownUp className="w-4 h-4" />
                      Place {orderType} Order
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
