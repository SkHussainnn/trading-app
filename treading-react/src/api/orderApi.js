import apiClient from "./apiClient";

export const orderApi = {
  // Pay and create an order (BUY or SELL)
  createOrder: async ({ coinId, quantity, orderType }) => {
    const response = await apiClient.post("/api/orders/pay", {
      coinId,
      quantity,
      orderType,
    });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const response = await apiClient.get(`/api/orders/${orderId}`);
    return response.data;
  },

  // Get all user orders with optional filters
  getUserOrders: async ({ orderType = null, assetSymbol = null } = {}) => {
    const params = new URLSearchParams();
    if (orderType) params.append("order_type", orderType);
    if (assetSymbol) params.append("asset_symbol", assetSymbol);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await apiClient.get(`/api/orders${queryString}`);
    return response.data;
  },
};

export default orderApi;
