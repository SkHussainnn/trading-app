import apiClient from "./apiClient";

export const authApi = {
  // Sign up
  signup: async (userData) => {
    const response = await apiClient.post("/auth/signup", userData);
    return response.data;
  },

  // Login
  signin: async (credentials) => {
    const response = await apiClient.post("/auth/signin", credentials);
    return response.data;
  },

  // Two-Factor Auth Verification
  verifyTwoFactorOtp: async (otp, sessionId) => {
    const response = await apiClient.post(
      `/auth/two-factor/otp/${otp}?id=${sessionId}`
    );
    return response.data;
  },

  // Forgot password - send OTP
  sendForgotPasswordOtp: async (sendTo, verificationType = "EMAIL") => {
    const response = await apiClient.post("/auth/users/reset-password/send-otp", {
      sendTo,
      verificationType,
    });
    return response.data;
  },

  // Reset password - verify OTP and update password
  resetPassword: async (id, otp, password) => {
    const response = await apiClient.patch(
      `/auth/users/reset-password/verify-otp?id=${id}`,
      { otp, password }
    );
    return response.data;
  },

  // Get current user profile
  getUserProfile: async () => {
    const response = await apiClient.get("/api/users/profile");
    return response.data;
  },

  // Send 2FA setup verification OTP
  sendEnableTwoFactorOtp: async (verificationType = "EMAIL") => {
    const response = await apiClient.post(
      `/api/users/verification/${verificationType}/send-otp`
    );
    return response.data;
  },

  // Enable 2FA by verifying OTP
  enableTwoFactor: async (otp) => {
    const response = await apiClient.patch(
      `/api/users/enable-two-factor/verify-otp/${otp}`
    );
    return response.data;
  },
};

export default authApi;
