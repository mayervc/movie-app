import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PartyPopper,
  Ticket,
  Film,
  ArrowLeft,
  MapPin,
  Clock,
  Loader2,
} from "lucide-react";
import { paymentsService } from "@/services/payments.service";
import type { TicketPurchaseResponse } from "@/types/ticket.types";

export const TicketPurchaseSuccess = () => {
  const { id: movieIdParam } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState<TicketPurchaseResponse | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(!!sessionId);

  const movieId = movieIdParam ?? sessionStorage.getItem("ticket_purchase_movie_id");
  const selectedDate =
    sessionStorage.getItem("ticket_purchase_selected_date") ?? "";

  useEffect(() => {
    if (!sessionId) {
      setLoadingOrder(false);
      return;
    }
    paymentsService
      .getOrderBySession(sessionId)
      .then((data) => {
        setOrder(data ?? null);
      })
      .finally(() => setLoadingOrder(false));
  }, [sessionId]);

  // Limpiar datos temporales del sessionStorage
  useEffect(() => {
    return () => {
      sessionStorage.removeItem("ticket_purchase_movie_id");
      sessionStorage.removeItem("ticket_purchase_selected_date");
    };
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
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
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.05)_1px,_transparent_1px)] bg-[length:40px_40px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20">
            {/* Icono y título */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30"
              >
                <PartyPopper size={40} className="text-white" />
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 mb-2">
                Pago realizado
              </h1>
              <p className="text-slate-400 text-sm">
                Tu compra se ha procesado correctamente
              </p>
            </div>

            {/* Detalle de la orden (si el BE lo devuelve) */}
            {loadingOrder && (
              <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Cargando detalle...</span>
              </div>
            )}

            {!loadingOrder && order && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/30 border border-slate-700/30 rounded-2xl overflow-hidden mb-6"
              >
                <div className="p-4 border-b border-slate-700/30 bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-600/20 flex items-center justify-center">
                      <Film size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-slate-50 font-bold text-base">
                        {order.movie_title}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {order.cinema_name}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2 border-b border-slate-700/30">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <MapPin size={14} className="text-violet-400 flex-shrink-0" />
                    {order.room_name}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <Clock size={14} className="text-blue-400 flex-shrink-0" />
                    {order.start_time} - {order.end_time}
                  </div>
                  {selectedDate && (
                    <p className="text-slate-500 text-xs capitalize pt-1">
                      {formatDate(selectedDate)}
                    </p>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                    Tus tickets
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.tickets.map((t) => (
                      <span
                        key={t.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/50 border border-slate-700/30 rounded-lg text-slate-300 font-mono text-sm"
                      >
                        <Ticket size={14} className="text-blue-400" />
                        {t.seat.row}
                        {t.seat.column}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {!loadingOrder && !order && sessionId && (
              <p className="text-slate-400 text-sm text-center py-4 mb-4">
                Los tickets han sido registrados. Revisa tu correo o la sección
                de mis tickets.
              </p>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                to={movieId ? `/movie/${movieId}/tickets` : "/"}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600/50 rounded-xl text-slate-300 hover:text-slate-50 font-medium transition-all duration-300"
              >
                <Ticket size={18} />
                <span className="text-sm">Comprar más tickets</span>
              </Link>
              <Link
                to="/"
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500 bg-[length:200%_100%] hover:animate-gradient-x transition-all duration-300"
              >
                <ArrowLeft size={18} />
                <span className="text-sm">Volver al inicio</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
