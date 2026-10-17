import apiClient from "./apiClient";
import { MOCK_COINS, generateMockChartData } from "./mockData";

export const coinApi = {
  // Get paginated coin list
  getCoinList: async (page = 1) => {
    try {
      const response = await apiClient.get(`/coins?page=${page}`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return MOCK_COINS;
    } catch (err) {
      console.warn("Using mock coins due to backend/coingecko status:", err.message);
      return MOCK_COINS;
    }
  },

  // Get market chart data for days
  getMarketChart: async (coinId, days = 7) => {
    try {
      const response = await apiClient.get(`/coins/${coinId}/chart?days=${days}`);
      if (response.data && response.data.prices) {
        return response.data;
      }
      return generateMockChartData(65000, days);
    } catch (err) {
      console.warn("Using mock chart data:", err.message);
      const coin = MOCK_COINS.find((c) => c.id === coinId);
      const base = coin ? coin.currentPrice : 50000;
      return generateMockChartData(base, days);
    }
  },

  // Search coins by keyword
  searchCoin: async (keyword) => {
    try {
      const response = await apiClient.get(`/coins/search?q=${encodeURIComponent(keyword)}`);
      return response.data;
    } catch (err) {
      const filtered = MOCK_COINS.filter(
        (c) =>
          c.name.toLowerCase().includes(keyword.toLowerCase()) ||
          c.symbol.toLowerCase().includes(keyword.toLowerCase())
      );
      return { coins: filtered };
    }
  },

  // Get Top 50 Coins
  getTop50: async () => {
    try {
      const response = await apiClient.get("/coins/top50");
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return MOCK_COINS;
    } catch (err) {
      return MOCK_COINS;
    }
  },

  // Get Trending Coins
  getTrending: async () => {
    try {
      const response = await apiClient.get("/coins/trending");
      return response.data;
    } catch (err) {
      return {
        coins: MOCK_COINS.slice(0, 5).map((c, i) => ({
          item: {
            id: c.id,
            coin_id: i + 1,
            name: c.name,
            symbol: c.symbol,
            market_cap_rank: c.marketCapRank,
            thumb: c.image,
            small: c.image,
            large: c.image,
            data: {
              price: `$${c.currentPrice.toLocaleString()}`,
              price_change_percentage_24h: { usd: c.priceChangePercentage24h },
            },
          },
        })),
      };
    }
  },

  // Get Coin Details
  getCoinDetails: async (coinId) => {
    try {
      const response = await apiClient.get(`/coins/details/${coinId}`);
      return response.data;
    } catch (err) {
      const coin = MOCK_COINS.find((c) => c.id === coinId) || MOCK_COINS[0];
      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: { large: coin.image },
        market_data: {
          current_price: { usd: coin.currentPrice },
          market_cap: { usd: coin.marketCap },
          market_cap_rank: coin.marketCapRank,
          total_volume: { usd: coin.totalVolume },
          high_24h: { usd: coin.high24h },
          low_24h: { usd: coin.low24h },
          price_change_24h: coin.priceChange24h,
          price_change_percentage_24h: coin.priceChangePercentage24h,
          total_supply: coin.totalSupply,
          max_supply: coin.maxSupply,
        },
      };
    }
  },
};

export default coinApi;
