import apiClient from "./apiClient";

export const watchlistApi = {
  // Get user's current watchlist
  getUserWatchlist: async () => {
    const response = await apiClient.get("/api/watchlist/user");
    return response.data;
  },

  // Toggle/Add coin to watchlist
  toggleWatchlistCoin: async (coinId) => {
    const response = await apiClient.patch(`/api/watchlist/add/coin/${coinId}`);
    return response.data;
  },

  // Get watchlist by id
  getWatchlistById: async (watchlistId) => {
    const response = await apiClient.get(`/api/watchlist/${watchlistId}`);
    return response.data;
  },
};

export default watchlistApi;
