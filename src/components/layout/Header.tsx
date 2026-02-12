import { Link, useNavigate } from "react-router-dom";
import { Film, Heart, Menu, LogOut, User } from "lucide-react";
import { MovieSearch } from "@/components/movies/MovieSearch";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-blue-500"
          >
            <Film size={28} />
            <span className="hidden sm:inline">Movie App</span>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <MovieSearch />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/favorites"
              className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Heart size={20} />
              <span>Favoritos</span>
            </Link>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-all duration-200"
                aria-label="Menú de usuario"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="text-slate-300 text-sm font-medium max-w-[100px] truncate">
                  {user?.firstName || user?.email?.split("@")[0] || "Usuario"}
                </span>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl shadow-black/20 overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="p-4 border-b border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                          <User size={24} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-50 font-medium truncate">
                            {user?.firstName && user?.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user?.firstName || user?.email?.split("@")[0] || "Usuario"}
                          </p>
                          <p className="text-slate-400 text-sm truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut size={18} />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-50"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <MovieSearch />
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 border-t border-slate-800 pt-4 overflow-hidden"
            >
              {/* User Info Mobile */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800/50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-50 font-medium truncate">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.firstName || user?.email?.split("@")[0] || "Usuario"}
                  </p>
                  <p className="text-slate-400 text-sm truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              <Link
                to="/favorites"
                className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart size={20} />
                <span>Favoritos</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors py-2 w-full"
              >
                <LogOut size={20} />
                <span>Cerrar sesión</span>
              </button>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
