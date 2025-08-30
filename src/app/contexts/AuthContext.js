"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (session?.user) {
      setUser(session.user);
      setLoading(false);
    } else {
      // Check if user is logged in from localStorage (legacy support)
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Error parsing saved user:", error);
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    }
  }, [session, status]);

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        const userData = result.data;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        const newUser = result.data;
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        return { success: true, user: newUser };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" };
    }
  };

  const logout = async () => {
    if (session) {
      await signOut({ redirect: false });
    }
    setUser(null);
    localStorage.removeItem("user");
  };

  const loginWithLine = () => {
    signIn("line");
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    loginWithLine,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
