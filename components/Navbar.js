"use client";
import { Menu, Sparkles, X, LogOut, User, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  const checkAuth = async () => {
    try {
      const token = Cookies.get("token");
      if (token) {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token is invalid, remove it
          Cookies.remove("token");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check auth on mount and when pathname changes
  useEffect(() => {
    checkAuth();
  }, [pathname]); // Re-check auth when route changes

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call logout API
      const res = await fetch("/api/auth/logout", { method: "POST" });
      
      if (res.ok) {
        // Remove token from cookies
        Cookies.remove("token");
        
        // Clear user state
        setUser(null);
        
        // Redirect to login page
        router.push("/login");
      } else {
        // Fallback: redirect to login page
        Cookies.remove("token");
        setUser(null);
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: redirect to login page
      Cookies.remove("token");
      setUser(null);
      router.push("/login");
    }
  };

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return "/login";
    return user.role === "admin" ? "/dashboard/admin" : "/dashboard/user";
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "";
    return user.name || user.email || "User";
  };

  // Get role display
  const getRoleDisplay = () => {
    if (!user) return "";
    return user.role === "admin" ? "Admin" : "Employee";
  };

  if (loading) {
    return (
      <nav className="relative z-20 w-full bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
        <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  LeaveLite
                </span>
              </div>
              <div className="w-20 h-8 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="relative z-20 w-full bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                LeaveLite
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 text-white">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg border border-white/20">
                      {user.role === "admin" ? (
                        <Shield className="h-4 w-4 text-purple-300" />
                      ) : (
                        <User className="h-4 w-4 text-blue-300" />
                      )}
                      <span className="text-sm font-medium">{getUserDisplayName()}</span>
                      <span className="text-xs text-gray-300 bg-white/20 px-2 py-1 rounded-full">
                        {getRoleDisplay()}
                      </span>
                    </div>
                    
                    {/* Dashboard Link */}
                    <Link href={getDashboardLink()}>
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                        Dashboard
                      </button>
                    </Link>
                    
                    {/* Logout Button */}
                    <button 
                      onClick={handleLogout}
                      className="px-4 py-2 text-red-300 hover:text-white hover:bg-red-500/20 transition-colors duration-300 font-medium rounded-lg border border-red-500/30 hover:border-red-400"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Login/Register for non-authenticated users */}
                  <Link href="/login">
                    <button className="px-6 py-2 text-gray-300 hover:text-white transition-colors duration-300 font-medium rounded-lg border border-white/30 hover:border-white/50">
                      Login
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                      Register
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors duration-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={`md:hidden transition-all duration-300 overflow-hidden ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="py-4 space-y-4 border-t border-white/20">
              {user ? (
                <>
                  {/* User Info Mobile */}
                  <div className="pt-4 space-y-3 border-t border-white/20">
                    <div className="flex items-center justify-center space-x-2 px-4 py-3 bg-white/10 rounded-lg border border-white/20">
                      {user.role === "admin" ? (
                        <Shield className="h-5 w-5 text-purple-300" />
                      ) : (
                        <User className="h-5 w-5 text-blue-300" />
                      )}
                      <span className="text-white font-medium">{getUserDisplayName()}</span>
                      <span className="text-xs text-gray-300 bg-white/20 px-2 py-1 rounded-full">
                        {getRoleDisplay()}
                      </span>
                    </div>
                    
                    {/* Dashboard Link Mobile */}
                    <Link href={getDashboardLink()}>
                      <button className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 text-center">
                        Dashboard
                      </button>
                    </Link>
                    
                    {/* Logout Button Mobile */}
                    <button 
                      onClick={handleLogout}
                      className="block w-full px-4 py-3 text-red-300 hover:text-white hover:bg-red-500/20 transition-colors duration-300 font-medium rounded-lg border border-red-500/30 hover:border-red-400 text-center"
                    >
                      <LogOut className="h-5 w-5 inline mr-2" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Login/Register Mobile for non-authenticated users */}
                  <div className="pt-4 space-y-3 border-t border-white/20">
                    <Link href="/login">
                      <button className="block w-full px-4 py-3 text-gray-300 hover:text-white transition-colors duration-300 font-medium border border-white/30 hover:border-white/50 rounded-lg text-center">
                        Login
                      </button>
                    </Link>
                    <Link href="/register">
                      <button className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 text-center">
                        Register
                      </button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
