import apiClient from "./apiClient";

export const withdrawalApi = {
  // User requests a withdrawal
  requestWithdrawal: async (amount) => {
    const response = await apiClient.post(`/api/withdrawal/${amount}`);
    return response.data;
  },

  // Get current user's withdrawal history
  getUserWithdrawals: async () => {
    const response = await apiClient.get("/api/withdrawal");
    return response.data;
  },

  // Admin: get all pending withdrawal requests
  getAdminWithdrawals: async () => {
    const response = await apiClient.get("/api/admin/withdrawal");
    return response.data;
  },

  // Admin: proceed/approve or reject withdrawal
  proceedWithdrawal: async (id, accept) => {
    const response = await apiClient.post(
      `/api/admin/withdrawal/${id}/proceed/${accept}`
    );
    return response.data;
  },
};

export default withdrawalApi;
