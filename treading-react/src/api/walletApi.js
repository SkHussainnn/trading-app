import apiClient from "./apiClient";

export const walletApi = {
  // Get current user's wallet
  getUserWallet: async () => {
    const response = await apiClient.get("/api/wallet");
    return response.data;
  },

  // Wallet-to-wallet transfer
  transferToWallet: async (recipientWalletId, amount) => {
    const response = await apiClient.put(
      `/api/wallet/${recipientWalletId}/transfer`,
      { amount }
    );
    return response.data;
  },

  // Pay order from wallet
  payOrder: async (orderId) => {
    const response = await apiClient.put(`/api/wallet/order/${orderId}/pay`);
    return response.data;
  },

  // Add balance after payment completion
  depositBalance: async (orderId, paymentId) => {
    const response = await apiClient.put(
      `/api/wallet/deposit?order_id=${orderId}&payment_id=${paymentId}`
    );
    return response.data;
  },

  // Test / Sandbox deposit — directly credits wallet on the backend
  testDeposit: async (amount) => {
    const response = await apiClient.put(
      `/api/wallet/deposit/amount/${Math.round(amount)}`
    );
    return response.data;
  },

  // Get user's wallet transaction history
  getTransactions: async () => {
    const response = await apiClient.get("/api/transactions");
    return response.data;
  },
};

export default walletApi;
