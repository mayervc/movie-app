import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Calendar,
  Armchair,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Building2,
} from "lucide-react";
import type { ShowtimeItem } from "@/types/showtime.types";
import type { Movie } from "@/types/movie.types";
import type { RoomWithSeats, RoomSeat } from "@/types/room.types";

interface PurchaseSummaryProps {
  movie: Movie;
  selectedShowtime: ShowtimeItem;
  cinemaName: string;
  roomName: string;
  selectedDate: string;
  selectedSeats: number[];
  roomData: RoomWithSeats | null;
  purchasing: boolean;
  error: string | null;
  onBack: () => void;
  onConfirm: () => void;
}

export const PurchaseSummary = ({
  movie,
  selectedShowtime,
  cinemaName,
  roomName,
  selectedDate,
  selectedSeats,
  roomData,
  purchasing,
  error,
  onBack,
  onConfirm,
}: PurchaseSummaryProps) => {
  const totalPrice = selectedSeats.length * selectedShowtime.ticket_price;

  // Construir mapa de id → seat para labels reales
  const seatMap = new Map<number, RoomSeat>();
  if (roomData?.blocks) {
    for (const block of roomData.blocks) {
      for (const seat of block.seats) {
        seatMap.set(seat.id, seat);
      }
    }
  }

  const getSeatLabel = (id: number) => {
    const seat = seatMap.get(id);
    if (seat) return `${seat.seatRowLabel}${seat.seatColumnLabel}`;
    return `#${id}`;
  };

  const formatSelectedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T12:00:00");
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

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
          <ShieldCheck size={28} className="text-blue-400" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-50 mb-2">
          Confirma tu compra
        </h2>
        <p className="text-slate-400 text-sm">
          Revisa los detalles antes de confirmar
        </p>
      </div>

      {/* Card resumen */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl overflow-hidden">
        {/* Movie info header */}
        <div className="relative p-4 sm:p-5 border-b border-slate-700/30 bg-slate-800/40">
          <div className="flex items-center gap-4">
            {movie.poster && (
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-14 h-20 sm:w-16 sm:h-24 object-cover rounded-lg shadow-lg flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <h3 className="text-slate-50 font-bold text-base sm:text-lg truncate">
                {movie.title}
              </h3>
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {movie.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre.id}
                      className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md text-[10px] sm:text-xs"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detalles */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <Building2 size={16} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs">Cine</p>
              <p className="text-slate-200 text-sm font-medium">
                {cinemaName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Calendar size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs">Fecha</p>
              <p className="text-slate-200 text-sm font-medium capitalize">
                {formatSelectedDate(selectedDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-violet-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs">Horario</p>
              <p className="text-slate-200 text-sm font-medium">
                {selectedShowtime.start_time} - {selectedShowtime.end_time}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-teal-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs">Sala</p>
              <p className="text-slate-200 text-sm font-medium">{roomName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Armchair size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs">Asientos</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedSeats
                  .sort((a, b) => a - b)
                  .map((seatId) => (
                    <span
                      key={seatId}
                      className="px-2 py-0.5 bg-blue-500/15 text-blue-300 rounded-md text-xs font-mono font-medium"
                    >
                      {getSeatLabel(seatId)}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 sm:mx-5 border-t border-dashed border-slate-700/50" />

        {/* Pricing */}
        <div className="p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              Precio por asiento
            </span>
            <span className="text-slate-300">
              ${selectedShowtime.ticket_price.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              Cantidad
            </span>
            <span className="text-slate-300">
              x{selectedSeats.length}
            </span>
          </div>
          <div className="h-px bg-slate-700/50 my-2" />
          <div className="flex items-center justify-between">
            <span className="text-slate-200 font-semibold">Total</span>
            <span className="text-emerald-400 font-bold text-xl">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Botones */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          disabled={purchasing}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600/50 rounded-xl text-slate-300 hover:text-slate-50 font-medium transition-all duration-300 disabled:opacity-50"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Volver</span>
        </motion.button>

        <motion.button
          whileHover={!purchasing ? { scale: 1.02 } : undefined}
          whileTap={!purchasing ? { scale: 0.98 } : undefined}
          onClick={onConfirm}
          disabled={purchasing}
          className="flex-[2] relative flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] group-hover:animate-gradient-x transition-all duration-300" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <span className="relative flex items-center gap-2">
            {purchasing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Procesando...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span className="text-sm">Confirmar Compra</span>
              </>
            )}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};
