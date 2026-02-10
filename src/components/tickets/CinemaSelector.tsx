import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Search,
  MapPin,
  Phone,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clapperboard,
} from "lucide-react";
import type { Cinema } from "@/types/cinema.types";

interface CinemaSelectorProps {
  cinemas: Cinema[];
  loading: boolean;
  error: string | null;
  onSearch: (query?: string) => void;
  onSelect: (cinema: Cinema) => void;
}

export const CinemaSelector = ({
  cinemas,
  loading,
  error,
  onSearch,
  onSelect,
}: CinemaSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCinema, setHoveredCinema] = useState<number | null>(null);

  // Cargar cinemas al montar
  useEffect(() => {
    onSearch();
  }, []);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery || undefined);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Título */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500/20 to-violet-600/20 border border-blue-500/20 rounded-2xl mb-4">
          <Building2 size={28} className="text-blue-400" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-50 mb-2">
          Elige tu cine
        </h2>
        <p className="text-slate-400 text-sm">
          Selecciona el cine donde quieres ver la película
        </p>
      </div>

      {/* Buscador */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300" />
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cine por nombre..."
            className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-50 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900/70 transition-all duration-300 text-sm"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Buscando cines...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Lista de cinemas */}
      {!loading && !error && (
        <AnimatePresence mode="wait">
          {cinemas.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Clapperboard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No se encontraron cines</p>
              <p className="text-slate-500 text-sm mt-1">
                Intenta con otro nombre o elimina el filtro
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {cinemas.map((cinema, idx) => (
                <motion.button
                  key={cinema.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onMouseEnter={() => setHoveredCinema(cinema.id)}
                  onMouseLeave={() => setHoveredCinema(null)}
                  onClick={() => onSelect(cinema)}
                  className="relative w-full group flex items-center gap-4 p-4 bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/30 hover:border-blue-500/30 rounded-2xl transition-all duration-300 text-left"
                >
                  {/* Hover glow */}
                  {hoveredCinema === cinema.id && (
                    <motion.div
                      layoutId="cinemaHover"
                      className="absolute inset-0 bg-blue-500/5 rounded-2xl"
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  {/* Icon */}
                  <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-600/15 border border-blue-500/10 flex items-center justify-center group-hover:from-blue-500/25 group-hover:to-violet-600/25 transition-all duration-300">
                    <Building2
                      size={22}
                      className="text-blue-400 group-hover:text-blue-300 transition-colors"
                    />
                  </div>

                  {/* Info */}
                  <div className="relative flex-1 min-w-0">
                    <h3 className="text-slate-50 font-semibold text-sm sm:text-base truncate group-hover:text-white transition-colors">
                      {cinema.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-500 flex-shrink-0" />
                        <span className="text-slate-400 text-xs truncate">
                          {cinema.address}
                        </span>
                      </div>
                      <span className="text-slate-600 text-xs hidden sm:inline">•</span>
                      <span className="text-slate-500 text-xs">
                        {cinema.city}, {cinema.country}
                      </span>
                    </div>
                    {cinema.phoneNumber && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone size={11} className="text-slate-500 flex-shrink-0" />
                        <span className="text-slate-500 text-[11px]">
                          +{cinema.countryCode || ""} {cinema.phoneNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight
                    size={18}
                    className="relative text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0"
                  />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};
