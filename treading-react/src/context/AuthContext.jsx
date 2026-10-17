import React, { createContext, useContext, useState, useEffect } from "react";
import authApi from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(localStorage.getItem("jwt") || null);
  const [loading, setLoading] = useState(true);
  const [twoFactorSession, setTwoFactorSession] = useState(null);

  // Fetch user profile if token is present
  const fetchProfile = async () => {
    try {
      const data = await authApi.getUserProfile();
      setUser(data);
    } catch (err) {
      console.warn("Failed to fetch user profile:", err.message);
      // If unauthorized, clear state
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jwt) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [jwt]);

  // Signin handler
  const signin = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.signin({ email, password });
      if (res.twoFactorAuthEnabled) {
        setTwoFactorSession(res.session);
        setLoading(false);
        return { twoFactorRequired: true, session: res.session };
      }

      if (res.jwt) {
        localStorage.setItem("jwt", res.jwt);
        setJwt(res.jwt);
        // Will trigger profile fetch
        return { success: true };
      }
      return { success: false, message: res.message || "Login failed" };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || "Failed to sign in";
      throw new Error(msg);
    }
  };

  // 2FA OTP verification
  const verifyTwoFactor = async (otp, session = twoFactorSession) => {
    setLoading(true);
    try {
      const res = await authApi.verifyTwoFactorOtp(otp, session);
      if (res.jwt) {
        localStorage.setItem("jwt", res.jwt);
        setJwt(res.jwt);
        setTwoFactorSession(null);
        return { success: true };
      }
      throw new Error(res.message || "Verification failed");
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Signup handler
  const signup = async (fullName, email, password) => {
    setLoading(true);
    try {
      const res = await authApi.signup({ fullName, email, password });
      if (res.jwt) {
        localStorage.setItem("jwt", res.jwt);
        setJwt(res.jwt);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || "Failed to sign up";
      throw new Error(msg);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("jwt");
    setJwt(null);
    setUser(null);
    setTwoFactorSession(null);
  };

  // Demo user login for instant UI testing if user prefers quick exploration
  const demoLogin = (role = "ROLE_CUSTOMER") => {
    const mockUser = {
      id: 999,
      fullName: role === "ROLE_ADMIN" ? "Admin Trader" : "Alex Rivera",
      email: role === "ROLE_ADMIN" ? "admin@nexus.io" : "alex.trader@nexus.io",
      role: role,
      twoFactorAuth: { enabled: false },
    };
    setUser(mockUser);
    setJwt("demo-jwt-token-active");
    localStorage.setItem("jwt", "demo-jwt-token-active");
  };

  const isAdmin = user?.role === "ROLE_ADMIN";
  const isAuthenticated = !!user || !!jwt;

  return (
    <AuthContext.Provider
      value={{
        user,
        jwt,
        loading,
        isAdmin,
        isAuthenticated,
        twoFactorSession,
        signin,
        verifyTwoFactor,
        signup,
        logout,
        demoLogin,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
