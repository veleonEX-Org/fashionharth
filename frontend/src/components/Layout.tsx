import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

import { socketService } from "../lib/socket";
import { getStoredTokens } from "../utils/tokenStorage";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, clearAuth } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  React.useEffect(() => {
    if (user) {
      const tokens = getStoredTokens();
      if (tokens?.accessToken) {
        socketService.connect(tokens.accessToken);
      }
    } else {
      socketService.disconnect();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold text-primary">
            Veleonex Starter
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {/* <Link to="/pricing" className="hover:text-primary">
              Pricing
            </Link> */}
            <Link to="/" className="hover:text-primary font-bold">
              Dress Room
            </Link>
            <Link to="/style-me" className="hover:text-primary font-bold">
              Style Me
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-primary">
                  Dashboard
                </Link>
                <Link to="/profile" className="hover:text-primary">
                  Profile
                </Link>
                {/* <Link to="/chat" className="hover:text-primary">
                  Chat
                </Link> */}
                <button
                  onClick={clearAuth}
                  className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main
        className={
          isLandingPage
            ? "w-full"
            : "mx-auto max-w-6xl px-6 py-10"
        }
      >
        {children}
      </main>
      
      <footer className="border-t border-gray-200 bg-gray-50 mt-12 py-12">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-lg font-semibold text-primary block mb-4">
              Veleonex Starter
            </Link>
            <p className="text-gray-600 text-sm max-w-sm">
              The ultimate full-stack boilerplate for building modern web applications. 
              Secure, scalable, and production-ready.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Documentation</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><a href="mailto:contact@veleonex.com" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6 mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Veleonex Starter. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
             <span>Twitter</span>
             <span>GitHub</span>
             <span>Discord</span>
          </div>
        </div>
      </footer>
    </div>
  );
};






