import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import walletApi from "../api/walletApi";
import assetApi from "../api/assetApi";
import watchlistApi from "../api/watchlistApi";
import { useAuth } from "./AuthContext";

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const { isAuthenticated, jwt } = useAuth();
  const [wallet, setWallet] = useState({ id: 1, balance: 25000.0 });
  const [assets, setAssets] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync wallet data
  const refreshWallet = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await walletApi.getUserWallet();
      if (data) setWallet(data);
    } catch (err) {
      console.warn("Wallet sync failed, keeping local state:", err.message);
    }
  }, [isAuthenticated]);

  // Sync assets / portfolio
  const refreshAssets = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await assetApi.getUserAssets();
      if (Array.isArray(data)) setAssets(data);
    } catch (err) {
      console.warn("Assets sync fallback:", err.message);
      // Default demo assets if empty
      if (assets.length === 0) {
        setAssets([
          {
            id: 1,
            coin: {
              id: "bitcoin",
              name: "Bitcoin",
              symbol: "btc",
              image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
              currentPrice: 68420.5,
            },
            quantity: 0.35,
            buyPrice: 64100.0,
          },
          {
            id: 2,
            coin: {
              id: "ethereum",
              name: "Ethereum",
              symbol: "eth",
              image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
              currentPrice: 3540.25,
            },
            quantity: 3.2,
            buyPrice: 3300.0,
          },
          {
            id: 3,
            coin: {
              id: "solana",
              name: "Solana",
              symbol: "sol",
              image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
              currentPrice: 178.6,
            },
            quantity: 25.0,
            buyPrice: 155.0,
          },
        ]);
      }
    }
  }, [isAuthenticated, assets.length]);

  // Sync watchlist
  const refreshWatchlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await watchlistApi.getUserWatchlist();
      if (data && Array.isArray(data.coins)) {
        setWatchlist(data.coins);
      }
    } catch (err) {
      console.warn("Watchlist sync fallback:", err.message);
    }
  }, [isAuthenticated]);

  // Sync transactions
  const refreshTransactions = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await walletApi.getTransactions();
      if (Array.isArray(data)) setTransactions(data);
    } catch (err) {
      console.warn("Transactions sync fallback:", err.message);
      if (transactions.length === 0) {
        setTransactions([
          {
            id: 101,
            walletTransactionType: "DEPOSIT",
            date: new Date(Date.now() - 86400000 * 2).toLocaleDateString(),
            transferId: "DEP-849201",
            purpose: "Fiat Stripe Deposit",
            amount: 10000,
          },
          {
            id: 102,
            walletTransactionType: "BUY_ASSET",
            date: new Date(Date.now() - 86400000).toLocaleDateString(),
            transferId: "ORD-99120",
            purpose: "Bought 0.35 BTC",
            amount: 22435,
          },
        ]);
      }
    }
  }, [isAuthenticated, transactions.length]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshWallet();
      refreshAssets();
      refreshWatchlist();
      refreshTransactions();
    }
  }, [isAuthenticated, jwt, refreshWallet, refreshAssets, refreshWatchlist, refreshTransactions]);

  // Watchlist helper
  const isWatchlisted = (coinId) => {
    return watchlist.some((c) => c.id === coinId || c.symbol?.toLowerCase() === coinId?.toLowerCase());
  };

  const toggleWatchlist = async (coin) => {
    try {
      await watchlistApi.toggleWatchlistCoin(coin.id);
      refreshWatchlist();
    } catch (err) {
      // Local optimistic toggle
      setWatchlist((prev) => {
        const exists = prev.some((c) => c.id === coin.id);
        if (exists) {
          return prev.filter((c) => c.id !== coin.id);
        } else {
          return [...prev, coin];
        }
      });
    }
  };

  // Add mock balance
  const addBalanceLocal = (amount) => {
    setWallet((prev) => ({
      ...prev,
      balance: Number(prev.balance || 0) + Number(amount),
    }));
    setTransactions((prev) => [
      {
        id: Date.now(),
        walletTransactionType: "DEPOSIT",
        date: new Date().toLocaleDateString(),
        transferId: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
        purpose: "Instant Deposit",
        amount: Number(amount),
      },
      ...prev,
    ]);
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        assets,
        watchlist,
        transactions,
        loading,
        refreshWallet,
        refreshAssets,
        refreshWatchlist,
        refreshTransactions,
        isWatchlisted,
        toggleWatchlist,
        addBalanceLocal,
        setWallet,
        setAssets,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export default WalletContext;
