import apiClient from "./apiClient";

export const assetApi = {
  // Get all user assets (portfolio holdings)
  getUserAssets: async () => {
    const response = await apiClient.get("/api/asset");
    return response.data;
  },

  // Get asset by assetId
  getAssetById: async (assetId) => {
    const response = await apiClient.get(`/api/asset/${assetId}`);
    return response.data;
  },

  // Get user's asset holding for a specific coinId
  getAssetByCoinId: async (coinId) => {
    try {
      const response = await apiClient.get(`/api/asset/coin/${coinId}/user`);
      return response.data;
    } catch (err) {
      // User might not have this coin in portfolio yet
      return null;
    }
  },
};

export default assetApi;
