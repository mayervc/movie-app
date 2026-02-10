import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Building2,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import type {
  ShowtimeSearchResult,
  ShowtimeItem,
} from "@/types/showtime.types";

interface ShowtimeSelectorProps {
  showtimeResults: ShowtimeSearchResult[];
  loading: boolean;
  error: string | null;
  selectedDate: string;
  cinemaName: string;
  onDateSelect: (date: string) => void;
  onShowtimeSelect: (showtime: ShowtimeItem, roomName: string) => void;
  onBack: () => void;
}

export const ShowtimeSelector = ({
  showtimeResults,
  loading,
  error,
  selectedDate,
  cinemaName,
  onDateSelect,
  onShowtimeSelect,
  onBack,
}: ShowtimeSelectorProps) => {
  const [hoveredShowtime, setHoveredShowtime] = useState<number | null>(null);

  // Generar próximos 14 días
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEE", { locale: es }),
      dayNum: format(date, "d"),
      month: format(date, "MMM", { locale: es }),
      isToday: i === 0,
    };
  });

  // Seleccionar automáticamente el primer día
  useEffect(() => {
    if (!selectedDate && dates.length > 0) {
      onDateSelect(dates[0].value);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Cinema badge + Título */}
      <div className="text-center">
        {/* Badge del cine seleccionado */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
          <Building2 size={14} className="text-blue-400" />
          <span className="text-blue-300 text-xs font-medium">{cinemaName}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-50 mb-2">
          Elige fecha y horario
        </h2>
        <p className="text-slate-400 text-sm">
          Selecciona el día y la función que prefieras
        </p>
      </div>

      {/* Selector de fechas - scroll horizontal */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          {dates.map((date) => (
            <motion.button
              key={date.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDateSelect(date.value)}
              className={`
                flex-shrink-0 flex flex-col items-center px-3 py-3 sm:px-4 sm:py-3 rounded-xl transition-all duration-300 min-w-[64px] sm:min-w-[72px]
                ${
                  selectedDate === date.value
                    ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600/50"
                }
              `}
            >
              <span className="text-[10px] sm:text-xs font-medium uppercase">
                {date.isToday ? "Hoy" : date.dayName}
              </span>
              <span className="text-lg sm:text-xl font-bold mt-0.5">
                {date.dayNum}
              </span>
              <span className="text-[10px] sm:text-xs capitalize">
                {date.month}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Buscando horarios...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Resultados de showtimes */}
      {!loading && !error && selectedDate && (
        <AnimatePresence mode="wait">
          {showtimeResults.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                No hay funciones disponibles para esta fecha
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Intenta seleccionar otro día
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {showtimeResults.map((room, roomIdx) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: roomIdx * 0.1 }}
                  className="bg-slate-800/30 border border-slate-700/30 rounded-2xl overflow-hidden"
                >
                  {/* Room header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/30 bg-slate-800/40">
                    <MapPin size={16} className="text-violet-400" />
                    <span className="text-slate-300 font-medium text-sm">
                      {room.room_name}
                    </span>
                  </div>

                  {/* Showtimes */}
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {room.showtimes.map((showtime) => (
                      <motion.button
                        key={showtime.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onMouseEnter={() => setHoveredShowtime(showtime.id)}
                        onMouseLeave={() => setHoveredShowtime(null)}
                        onClick={() =>
                          onShowtimeSelect(showtime, room.room_name)
                        }
                        className="relative group flex items-center justify-between p-3 sm:p-4 bg-slate-900/50 hover:bg-slate-900/80 border border-slate-700/30 hover:border-blue-500/40 rounded-xl transition-all duration-300"
                      >
                        {/* Glow on hover */}
                        {hoveredShowtime === showtime.id && (
                          <motion.div
                            layoutId="showtimeHover"
                            className="absolute inset-0 bg-blue-500/5 rounded-xl"
                            transition={{ duration: 0.2 }}
                          />
                        )}

                        <div className="relative flex items-center gap-3">
                          {/* Time */}
                          <div className="flex items-center gap-1.5">
                            <Clock
                              size={14}
                              className="text-blue-400 flex-shrink-0"
                            />
                            <span className="text-slate-50 font-semibold text-sm sm:text-base">
                              {showtime.start_time}
                            </span>
                            <span className="text-slate-500 text-xs">-</span>
                            <span className="text-slate-400 text-xs sm:text-sm">
                              {showtime.end_time}
                            </span>
                          </div>
                        </div>

                        <div className="relative flex items-center gap-3 sm:gap-4">
                          {/* Seats info */}
                          <div className="flex items-center gap-1">
                            <Users
                              size={12}
                              className="text-slate-500 flex-shrink-0"
                            />
                            <span className="text-slate-400 text-xs">
                              {showtime.booked_seats} vendidos
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                            <DollarSign
                              size={12}
                              className="text-emerald-400"
                            />
                            <span className="text-emerald-400 font-semibold text-xs sm:text-sm">
                              {showtime.ticket_price.toFixed(2)}
                            </span>
                          </div>

                          <ChevronRight
                            size={16}
                            className="text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0"
                          />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Botón cambiar cine */}
      <div className="pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600/50 rounded-xl text-slate-400 hover:text-slate-50 font-medium transition-all duration-300"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Cambiar cine</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
