import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Monitor,
  Armchair,
  Clock,
  MapPin,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";
import type { ShowtimeDetails, ShowtimeItem } from "@/types/showtime.types";

interface SeatSelectorProps {
  showtimeDetails: ShowtimeDetails;
  selectedShowtime: ShowtimeItem;
  roomName: string;
  selectedSeats: number[];
  loadingDetails: boolean;
  onToggleSeat: (seatId: number) => void;
  onBack: () => void;
  onContinue: () => void;
}

interface SeatInfo {
  id: number;
  row: string;
  col: number;
}

export const SeatSelector = ({
  showtimeDetails,
  selectedShowtime,
  roomName,
  selectedSeats,
  loadingDetails,
  onToggleSeat,
  onBack,
  onContinue,
}: SeatSelectorProps) => {
  // Generar grid de asientos basado en room_seats
  const seatGrid = useMemo(() => {
    const totalSeats = showtimeDetails.room_seats;
    const seatsPerRow = totalSeats <= 30 ? 6 : totalSeats <= 60 ? 8 : 10;
    const rows: SeatInfo[][] = [];
    let seatId = 1;

    while (seatId <= totalSeats) {
      const row: SeatInfo[] = [];
      const rowIndex = rows.length;
      const rowLabel = String.fromCharCode(65 + rowIndex); // A, B, C, ...

      for (let col = 1; col <= seatsPerRow && seatId <= totalSeats; col++) {
        row.push({ id: seatId, row: rowLabel, col });
        seatId++;
      }
      rows.push(row);
    }

    return { rows, seatsPerRow };
  }, [showtimeDetails.room_seats]);

  const isBooked = (seatId: number) =>
    showtimeDetails.booked_seats.includes(seatId);
  const isSelected = (seatId: number) => selectedSeats.includes(seatId);

  const totalPrice = selectedSeats.length * selectedShowtime.ticket_price;
  const availableSeats =
    showtimeDetails.room_seats - showtimeDetails.booked_seats.length;

  if (loadingDetails) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Cargando asientos...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Info del showtime seleccionado */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-slate-400">
          <MapPin size={14} className="text-violet-400" />
          <span>{roomName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock size={14} className="text-blue-400" />
          <span>
            {selectedShowtime.start_time} - {selectedShowtime.end_time}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <DollarSign size={14} />
          <span className="font-semibold">
            {selectedShowtime.ticket_price.toFixed(2)} / asiento
          </span>
        </div>
      </div>

      {/* Pantalla del cine */}
      <div className="relative flex flex-col items-center pt-2 pb-4">
        <div className="relative w-[80%] max-w-sm">
          {/* Glow de la pantalla */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[120%] h-8 bg-blue-500/10 blur-2xl rounded-full" />

          {/* Pantalla */}
          <div className="relative">
            <div className="h-2 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent rounded-full" />
            <div className="h-[2px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent mt-1" />
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Monitor size={12} className="text-blue-400/60" />
            <span className="text-blue-400/60 text-[10px] sm:text-xs font-medium uppercase tracking-widest">
              Pantalla
            </span>
          </div>
        </div>
      </div>

      {/* Grid de asientos */}
      <div className="flex flex-col items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2">
        {seatGrid.rows.map((row, rowIdx) => (
          <motion.div
            key={rowIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rowIdx * 0.03 }}
            className="flex items-center gap-1 sm:gap-1.5"
          >
            {/* Row label */}
            <span className="w-5 text-right text-slate-500 text-[10px] sm:text-xs font-mono flex-shrink-0">
              {row[0]?.row}
            </span>

            {/* Seats */}
            <div className="flex gap-1 sm:gap-1.5">
              {row.map((seat) => {
                const booked = isBooked(seat.id);
                const selected = isSelected(seat.id);

                return (
                  <motion.button
                    key={seat.id}
                    whileHover={!booked ? { scale: 1.15 } : undefined}
                    whileTap={!booked ? { scale: 0.9 } : undefined}
                    onClick={() => onToggleSeat(seat.id)}
                    disabled={booked}
                    aria-label={`Asiento ${seat.row}${seat.col} ${booked ? "ocupado" : selected ? "seleccionado" : "disponible"}`}
                    className={`
                      relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg text-[9px] sm:text-[10px] font-medium transition-all duration-200 flex items-center justify-center
                      ${
                        booked
                          ? "bg-red-500/20 text-red-400/40 cursor-not-allowed border border-red-500/10"
                          : selected
                            ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-md shadow-blue-500/30 border border-blue-400/30"
                            : "bg-slate-800/60 text-slate-500 border border-slate-700/40 hover:bg-slate-700/60 hover:border-slate-600/60 hover:text-slate-300"
                      }
                    `}
                  >
                    {selected && (
                      <motion.div
                        layoutId={`seat-glow-${seat.id}`}
                        className="absolute inset-0 rounded-lg bg-blue-500/20 blur-sm"
                      />
                    )}
                    <span className="relative z-10">{seat.col}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Row label right */}
            <span className="w-5 text-left text-slate-500 text-[10px] sm:text-xs font-mono flex-shrink-0">
              {row[0]?.row}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-slate-800/60 border border-slate-700/40" />
          <span className="text-slate-400">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-violet-600 border border-blue-400/30" />
          <span className="text-slate-400">Seleccionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/10" />
          <span className="text-slate-400">Ocupado</span>
        </div>
      </div>

      {/* Info de disponibilidad */}
      <div className="text-center">
        <p className="text-slate-500 text-xs">
          <Armchair className="inline w-3 h-3 mr-1" />
          {availableSeats} asientos disponibles de {showtimeDetails.room_seats}
        </p>
      </div>

      {/* Resumen de selección */}
      <motion.div
        initial={false}
        animate={{
          height: selectedSeats.length > 0 ? "auto" : 0,
          opacity: selectedSeats.length > 0 ? 1 : 0,
        }}
        className="overflow-hidden"
      >
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-medium">
                {selectedSeats.length}{" "}
                {selectedSeats.length === 1 ? "asiento" : "asientos"}{" "}
                seleccionado{selectedSeats.length !== 1 ? "s" : ""}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                Asientos:{" "}
                {selectedSeats
                  .sort((a, b) => a - b)
                  .map((id) => {
                    const seatsPerRow =
                      showtimeDetails.room_seats <= 30
                        ? 6
                        : showtimeDetails.room_seats <= 60
                          ? 8
                          : 10;
                    const rowIdx = Math.floor((id - 1) / seatsPerRow);
                    const colNum = ((id - 1) % seatsPerRow) + 1;
                    return `${String.fromCharCode(65 + rowIdx)}${colNum}`;
                  })
                  .join(", ")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 font-bold text-lg">
                ${totalPrice.toFixed(2)}
              </p>
              <p className="text-slate-500 text-xs">Total</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Botones de navegación */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600/50 rounded-xl text-slate-300 hover:text-slate-50 font-medium transition-all duration-300"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Volver</span>
        </motion.button>

        <motion.button
          whileHover={selectedSeats.length > 0 ? { scale: 1.02 } : undefined}
          whileTap={selectedSeats.length > 0 ? { scale: 0.98 } : undefined}
          onClick={onContinue}
          disabled={selectedSeats.length === 0}
          className="flex-[2] relative flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500 bg-[length:200%_100%] group-hover:animate-gradient-x transition-all duration-300" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <span className="relative text-sm">Continuar</span>
          <ArrowRight size={18} className="relative" />
        </motion.button>
      </div>
    </motion.div>
  );
};
