"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AuthGuard({ children, requiredRole = null }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get("token");
        
        if (!token) {
          router.push("/login");
          return;
        }

        // Verify token with backend
        const res = await fetch("/api/user/me");
        
        if (!res.ok) {
          // Token is invalid, remove it
          Cookies.remove("token");
          router.push("/login");
          return;
        }

        const userData = await res.json();
        setUser(userData);
        
        // Check role requirement if specified
        if (requiredRole && userData.role !== requiredRole) {
          // User doesn't have required role, redirect to appropriate dashboard
          if (userData.role === "admin") {
            router.push("/dashboard/admin");
          } else {
            router.push("/dashboard/user");
          }
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check error:", error);
        Cookies.remove("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return children;
}
