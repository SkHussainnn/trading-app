import apiClient from "./apiClient";

export const paymentApi = {
  // Create payment order and get payment link (RAZORPAY or STRIPE)
  createPaymentLink: async (paymentMethod, amount) => {
    const response = await apiClient.post(
      `/api/payment/${paymentMethod}/amount/${amount}`
    );
    return response.data;
  },

  // Save / Add bank payment details
  addPaymentDetails: async ({ accountNumber, accountHolderName, ifsc, bankName }) => {
    const response = await apiClient.post("/api/payment-details", {
      accountNumber,
      accountHolderName,
      ifsc,
      bankName,
    });
    return response.data;
  },

  // Get user's saved bank payment details
  getPaymentDetails: async () => {
    try {
      const response = await apiClient.get("/api/payment-details");
      return response.data;
    } catch (err) {
      return null;
    }
  },
};

export default paymentApi;
