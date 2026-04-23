import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Film,
  Building2,
  Calendar,
  Clock,
  Ticket,
  Loader2,
  AlertCircle,
  ArrowRight,
  Crown,
} from "lucide-react";

type HistoryTab = "tickets" | "subscriptions";
import { ordersService } from "@/services/orders.service";
import { subscriptionsService } from "@/services/subscriptions.service";
import type {
  OrderHistoryItem,
  SubscriptionPurchaseItem,
} from "@/types/order.types";

export const PurchaseHistory = () => {
  const [activeTab, setActiveTab] = useState<HistoryTab>("tickets");
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [subscriptionPurchases, setSubscriptionPurchases] = useState<
    SubscriptionPurchaseItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const [ordersRes, subRes] = await Promise.all([
          ordersService.getMyOrders(),
          subscriptionsService.getSubscriptionPurchases(),
        ]);
        if (!cancelled) {
          setOrders(ordersRes.orders ?? []);
          setSubscriptionPurchases(subRes.purchases ?? []);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const apiErr = err as { response?: { data?: { errors?: unknown[] } } };
        const errors = apiErr.response?.data?.errors;
        const message = Array.isArray(errors)
          ? typeof errors[0] === "string"
            ? errors[0]
            : (errors[0] as { message?: string })?.message
          : "Error al cargar el historial de compras.";
        setError(message ?? null);
        setOrders([]);
        setSubscriptionPurchases([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + "T12:00:00").toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatCreatedAt = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Background - mismo estilo que Plans */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.04)_1px,_transparent_1px)] bg-[length:40px_40px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16">
        {/* Header - mismo estilo que Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 rounded-2xl mb-6"
          >
            <Receipt size={32} className="text-violet-400" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-50 mb-4">
            Historial de compras
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-8">
            Tickets y compras de planes en un solo lugar.
          </p>

          {/* Tabs: Compras de tickets | Compras de suscripción */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex p-1.5 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg shadow-black/10"
          >
            <button
              type="button"
              onClick={() => setActiveTab("tickets")}
              className="relative flex items-center gap-2.5 px-5 sm:px-6 py-3 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              {activeTab === "tickets" && (
                <motion.span
                  layoutId="purchase-history-tab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/25 to-violet-600/25 border border-blue-500/30 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-2.5">
                <Ticket
                  size={20}
                  className={
                    activeTab === "tickets"
                      ? "text-blue-400"
                      : "text-slate-400"
                  }
                />
                <span
                  className={
                    activeTab === "tickets"
                      ? "text-slate-50"
                      : "text-slate-400 hover:text-slate-300"
                  }
                >
                  Compras de tickets
                </span>
                {orders.length > 0 && (
                  <span
                    className={`min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-md text-xs font-bold ${
                      activeTab === "tickets"
                        ? "bg-blue-500/30 text-blue-300"
                        : "bg-slate-700/60 text-slate-400"
                    }`}
                  >
                    {orders.length}
                  </span>
                )}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("subscriptions")}
              className="relative flex items-center gap-2.5 px-5 sm:px-6 py-3 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              {activeTab === "subscriptions" && (
                <motion.span
                  layoutId="purchase-history-tab"
                  className="absolute inset-0 bg-gradient-to-r from-violet-500/25 to-blue-500/25 border border-violet-500/30 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-2.5">
                <Crown
                  size={20}
                  className={
                    activeTab === "subscriptions"
                      ? "text-violet-400"
                      : "text-slate-400"
                  }
                />
                <span
                  className={
                    activeTab === "subscriptions"
                      ? "text-slate-50"
                      : "text-slate-400 hover:text-slate-300"
                  }
                >
                  Compras de suscripción
                </span>
                {subscriptionPurchases.length > 0 && (
                  <span
                    className={`min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-md text-xs font-bold ${
                      activeTab === "subscriptions"
                        ? "bg-violet-500/30 text-violet-300"
                        : "bg-slate-700/60 text-slate-400"
                    }`}
                  >
                    {subscriptionPurchases.length}
                  </span>
                )}
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-blue-400 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Cargando historial...</p>
          </div>
        )}

        {/* Contenido según pestaña activa */}
        {!loading && !error && (
          <div className="max-w-2xl mx-auto mt-8">
            <AnimatePresence mode="wait">
              {activeTab === "tickets" ? (
                <motion.div
                  key="tickets"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {orders.length > 0 ? (
                    orders.map((order, index) => (
                      <motion.div
                        key={`ticket-${order.id}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                      >
                        <Link
                          to={`/movie/${order.movie_id}`}
                          className="block group"
                        >
                          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-slate-600/50 hover:bg-slate-800/60">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-blue-500/30 group-hover:to-violet-600/30 transition-colors">
                                <Film size={24} className="text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-slate-50 font-bold text-lg truncate group-hover:text-blue-400 transition-colors">
                                  {order.movie_title}
                                </h3>
                                <p className="text-slate-400 text-sm mt-0.5">
                                  {order.cinema_name}
                                </p>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-blue-400 flex-shrink-0" />
                                    <span className="text-slate-400">Fecha:</span>
                                    <span className="text-slate-200 font-medium capitalize">
                                      {formatDate(order.showtime_date)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-violet-400 flex-shrink-0" />
                                    <span className="text-slate-400">Hora:</span>
                                    <span className="text-slate-200 font-medium">
                                      {order.showtime_time}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Building2 size={14} className="text-emerald-400 flex-shrink-0" />
                                    <span className="text-slate-400">Sala:</span>
                                    <span className="text-slate-200 font-medium">
                                      {order.room_name}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                  <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/40 border border-slate-700/30 rounded-lg">
                                    <Ticket size={14} className="text-amber-400" />
                                    <span className="text-slate-300 text-sm">
                                      {order.tickets_count} ticket
                                      {order.tickets_count !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                  <span className="text-emerald-400 font-bold text-lg">
                                    ${typeof order.total_amount === "number" ? order.total_amount.toFixed(2) : order.total_amount}
                                  </span>
                                  <span className="text-slate-500 text-xs ml-auto">
                                    Comprado: {formatCreatedAt(order.created_at)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-shrink-0 self-center">
                                <ArrowRight size={20} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8 text-center"
                    >
                      <Ticket size={48} className="text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 text-sm">
                        Aún no tienes compras de tickets.
                      </p>
                      <Link
                        to="/"
                        className="inline-flex items-center gap-2 mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        Ver películas
                        <ArrowRight size={14} />
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="subscriptions"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {subscriptionPurchases.length > 0 ? (
                    subscriptionPurchases.map((sub, index) => (
                      <motion.div
                        key={`sub-${sub.id}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                      >
                        <Link to="/plans" className="block group">
                          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-violet-500/40 hover:bg-slate-800/60">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-violet-500/30 group-hover:to-blue-500/30 transition-colors">
                                <Crown size={24} className="text-violet-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-slate-50 font-bold text-lg truncate group-hover:text-violet-400 transition-colors">
                                  Plan {sub.plan_name}
                                </h3>
                                <p className="text-slate-400 text-sm mt-0.5">
                                  Suscripción mensual
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                  <span className="text-emerald-400 font-bold text-lg">
                                    ${typeof sub.total_amount === "number" ? sub.total_amount.toFixed(2) : sub.total_amount}
                                  </span>
                                  <span className="text-slate-500 text-xs ml-auto">
                                    Contratado: {formatCreatedAt(sub.created_at)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-shrink-0 self-center">
                                <ArrowRight size={20} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8 text-center"
                    >
                      <Crown size={48} className="text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 text-sm">
                        Aún no tienes compras de suscripción.
                      </p>
                      <Link
                        to="/plans"
                        className="inline-flex items-center gap-2 mt-4 text-violet-400 hover:text-violet-300 text-sm font-medium"
                      >
                        Ver planes
                        <ArrowRight size={14} />
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
};
