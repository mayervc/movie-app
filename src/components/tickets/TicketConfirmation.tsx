import { motion } from "framer-motion";
import {
  PartyPopper,
  Ticket,
  MapPin,
  Clock,
  Film,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { TicketPurchaseResponse } from "@/types/ticket.types";

interface TicketConfirmationProps {
  purchaseResult: TicketPurchaseResponse;
  selectedDate: string;
  onNewPurchase: () => void;
}

export const TicketConfirmation = ({
  purchaseResult,
  selectedDate,
  onNewPurchase,
}: TicketConfirmationProps) => {
  const navigate = useNavigate();

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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Animación de éxito */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-lg shadow-emerald-500/30"
        >
          <PartyPopper size={40} className="text-white" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl sm:text-3xl font-bold text-slate-50 mb-2"
        >
          ¡Compra exitosa!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-400 text-sm"
        >
          Tus tickets han sido generados correctamente
        </motion.p>
      </div>

      {/* Tickets generados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-slate-800/30 border border-slate-700/30 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700/30 bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-600/20 flex items-center justify-center">
              <Film size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-slate-50 font-bold text-base sm:text-lg">
                {purchaseResult.movie_title}
              </h3>
              <p className="text-slate-400 text-sm">
                {purchaseResult.cinema_name}
              </p>
            </div>
          </div>
        </div>

        {/* Detalles generales */}
        <div className="p-4 sm:p-5 space-y-3 border-b border-slate-700/30">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-violet-400 flex-shrink-0" />
              <span className="text-slate-300 text-sm">
                {purchaseResult.room_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-blue-400 flex-shrink-0" />
              <span className="text-slate-300 text-sm">
                {purchaseResult.start_time} - {purchaseResult.end_time}
              </span>
            </div>
          </div>
          <p className="text-slate-500 text-xs capitalize">
            {formatSelectedDate(selectedDate)}
          </p>
        </div>

        {/* Tickets individuales */}
        <div className="p-4 sm:p-5 space-y-2">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">
            Tus tickets
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {purchaseResult.tickets.map((ticket, idx) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + idx * 0.1 }}
                className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-600/20 flex items-center justify-center flex-shrink-0">
                  <Ticket size={16} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 font-mono font-semibold text-sm">
                    {ticket.seat.row}
                    {ticket.seat.column}
                  </p>
                  <p className="text-slate-500 text-xs">
                    Ticket #{ticket.id}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Botones */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewPurchase}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600/50 rounded-xl text-slate-300 hover:text-slate-50 font-medium transition-all duration-300"
        >
          <Ticket size={18} />
          <span className="text-sm">Comprar más tickets</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/")}
          className="w-full sm:flex-1 relative flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500 bg-[length:200%_100%] group-hover:animate-gradient-x transition-all duration-300" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <ArrowLeft size={18} className="relative" />
          <span className="relative text-sm">Volver al inicio</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
