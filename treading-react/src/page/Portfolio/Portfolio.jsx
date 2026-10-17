import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Building2,
  PieChart,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";

const Portfolio = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const { wallet, assets, refreshAssets, refreshWallet } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    refreshAssets();
    refreshWallet();
  }, [refreshAssets, refreshWallet]);

  // Calculate portfolio totals
  const cryptoTotalValue = assets.reduce((sum, item) => {
    const price = item.coin?.currentPrice || 0;
    return sum + (item.quantity || 0) * price;
  }, 0);

  const walletCash = Number(wallet?.balance || 0);
  const totalNetWorth = cryptoTotalValue + walletCash;

  // Calculate profit and loss
  const totalInvested = assets.reduce((sum, item) => {
    const buyPrice = item.buyPrice || item.coin?.currentPrice || 0;
    return sum + (item.quantity || 0) * buyPrice;
  }, 0);

  const netPnl = cryptoTotalValue - totalInvested;
  const netPnlPct = totalInvested > 0 ? (netPnl / totalInvested) * 100 : 0;
  const isPnlPositive = netPnl >= 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <LayoutDashboard className="w-7 h-7 text-cyan-400" />
              Crypto Portfolio & Assets
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Live tracking of your holdings, valuations, and performance metrics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/wallet"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-cyan-600/30"
            >
              <PlusCircle className="w-4 h-4" /> Deposit USD
            </Link>
            <Link
              to="/withdrawal"
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4" /> Withdraw
            </Link>
          </div>
        </div>

        {/* Portfolio Stats Top Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Net Worth */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-md">
            <span className="text-xs text-neutral-400 font-medium">Total Net Worth</span>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1">
              ${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Crypto Assets + Available Cash
            </span>
          </div>

          {/* Crypto Holdings Value */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-md">
            <span className="text-xs text-neutral-400 font-medium">Active Crypto Value</span>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400 mt-1">
              ${cryptoTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Across {assets.length} Cryptocurrencies
            </span>
          </div>

          {/* Wallet Cash Balance */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-md">
            <span className="text-xs text-neutral-400 font-medium">Available Cash (USD)</span>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-1">
              ${walletCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Ready to trade or withdraw
            </span>
          </div>

          {/* Unrealized Return (P&L) */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-md">
            <span className="text-xs text-neutral-400 font-medium">Total Unrealized P&L</span>
            <p
              className={`text-2xl sm:text-3xl font-bold font-mono mt-1 ${
                isPnlPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isPnlPositive ? "+$" : "-$"}
              {Math.abs(netPnl).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <span
              className={`text-[11px] font-mono font-medium flex items-center gap-1 mt-1 ${
                isPnlPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isPnlPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {isPnlPositive ? "+" : ""}
              {netPnlPct.toFixed(2)}% Overall ROI
            </span>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-400" /> Current Holdings
            </h2>
            <span className="text-xs text-neutral-400">
              {assets.length} Assets in Wallet
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-950/60 text-neutral-400 text-xs uppercase tracking-wider font-semibold border-b border-neutral-800">
                <tr>
                  <th className="py-3.5 px-4">Asset</th>
                  <th className="py-3.5 px-4">Holdings</th>
                  <th className="py-3.5 px-4">Current Price</th>
                  <th className="py-3.5 px-4">Avg Buy Price</th>
                  <th className="py-3.5 px-4">Total Value</th>
                  <th className="py-3.5 px-4">Unrealized P&L</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-neutral-500">
                      No crypto assets in portfolio yet. Visit{" "}
                      <Link to="/" className="text-cyan-400 hover:underline">
                        Markets
                      </Link>{" "}
                      to make your first purchase!
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => {
                    const price = asset.coin?.currentPrice || 0;
                    const value = (asset.quantity || 0) * price;
                    const cost = (asset.quantity || 0) * (asset.buyPrice || price);
                    const pnl = value - cost;
                    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
                    const isProfit = pnl >= 0;

                    return (
                      <tr
                        key={asset.id}
                        className="hover:bg-neutral-800/40 transition"
                      >
                        {/* Asset */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={asset.coin?.image}
                              alt={asset.coin?.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <span className="font-bold text-white block">
                                {asset.coin?.name}
                              </span>
                              <span className="text-xs font-mono uppercase text-neutral-400">
                                {asset.coin?.symbol}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Holdings */}
                        <td className="py-4 px-4 font-mono font-bold text-white">
                          {asset.quantity}{" "}
                          <span className="text-xs text-neutral-400 uppercase">
                            {asset.coin?.symbol}
                          </span>
                        </td>

                        {/* Current Price */}
                        <td className="py-4 px-4 font-mono text-neutral-200">
                          ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Avg Buy Price */}
                        <td className="py-4 px-4 font-mono text-neutral-400">
                          ${(asset.buyPrice || price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Total Value */}
                        <td className="py-4 px-4 font-mono font-bold text-cyan-400">
                          ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* P&L */}
                        <td className="py-4 px-4 font-mono">
                          <span
                            className={`inline-flex items-center gap-1 font-bold ${
                              isProfit ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isProfit ? "+" : "-"}${Math.abs(pnl).toFixed(2)} ({isProfit ? "+" : ""}
                            {pnlPct.toFixed(2)}%)
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-4 px-4 text-right">
                          <Link
                            to={`/trade/${asset.coin?.id}`}
                            className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition"
                          >
                            Trade
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
