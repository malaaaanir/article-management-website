"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authAPI, type User } from "@/lib/api"
import axios from "axios";

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    username: string,
    password: string,
    role: "User" | "Admin",
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user session and validate token
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user")
      const token = localStorage.getItem("token")

      if (storedUser && token) {
        try {
          // Validate token by fetching profile
          const profile = await authAPI.getProfile()
          setUser(profile)
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem("user")
          localStorage.removeItem("token")
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const res = await authAPI.login(username, password)
      const token = res.token

      if (!token) return { success: false, error: "Token missing from server response" }

      localStorage.setItem("token", token)

      // try to get full profile
      let profile: User | null = null
      try {
        profile = await authAPI.getProfile()
      } catch {
        // profile route might not exist – build minimal user object
        profile = { id: "", username, role: (res.role as "User" | "Admin") ?? "User" }
      }

      setUser(profile)
      localStorage.setItem("user", JSON.stringify(profile))
      return { success: true }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Login failed"
      return { success: false, error: msg }
    }
  }

  // const register = async (username: string, password: string, role: "User" | "Admin") => {
  //   try {
  //     const res = await authAPI.register(username, password, role)

  //     const loginRes = await authAPI.login(username, password);
  //     const token = loginRes.token;

  //     if (!token) {
  //       return { success: false, error: "Token missing from server response" };
  //     }

  //     let profile: User | null = null
  //     try {
  //       profile = await authAPI.getProfile()
  //     } catch {
  //       profile = { id: "", username, role }
  //     }

  //     setUser(profile)
  //     localStorage.setItem("user", JSON.stringify(profile))
  //     return { success: true }
  //   } catch (err: any) {
  //     const msg = err.response?.data?.message || err.message || "Registration failed"
  //     return { success: false, error: msg }
  //   }
  // }
  const register = async (username: string, password: string, role: "User" | "Admin") => {
  try {
    // 1. Registrasi user baru
    await authAPI.register(username, password, role);
    
    // 2. Auto-login setelah registrasi berhasil
    const loginRes = await authAPI.login(username, password);
    const token = loginRes.token;

    if (!token) {
      return { success: false, error: "Token missing from server response" };
    }

    // 3. Simpan token dan profile
    localStorage.setItem("token", token);
    
    const profile = { 
      id: "", 
      username, 
      role 
    };
    
    setUser(profile);
    localStorage.setItem("user", JSON.stringify(profile));

    // 4. Redirect berdasarkan role
    if (role === "Admin") {
      router.push("/admin/articles");
    } else {
      router.push("/articles");
    }

    return { success: true };
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || "Registration failed";
    return { success: false, error: msg };
  }
};

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
