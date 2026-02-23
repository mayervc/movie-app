import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PartyPopper, Crown, ArrowLeft, Ticket } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";

export const SubscriptionSuccess = () => {
  const { refresh, planName } = useSubscription();

  // Refrescar la suscripción al llegar a esta página
  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.05)_1px,_transparent_1px)] bg-[length:40px_40px]" />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-3xl"
        />
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
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/30"
              >
                <PartyPopper size={40} className="text-white" />
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 mb-2">
                Suscripción activada
              </h1>
              <p className="text-slate-400 text-sm">
                Tu plan{planName ? ` ${planName}` : ""} está activo. Ya puedes
                disfrutar de todos los beneficios.
              </p>
            </div>

            {/* Beneficios */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-5 mb-6 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <Crown size={20} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-slate-50 font-medium text-sm">
                    Descuentos activados
                  </p>
                  <p className="text-slate-400 text-xs">
                    Se aplican automáticamente al comprar tickets
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                  <Ticket size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-50 font-medium text-sm">
                    Tickets gratis disponibles
                  </p>
                  <p className="text-slate-400 text-xs">
                    Se renuevan automáticamente cada mes
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/plans"
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600/50 rounded-xl text-slate-300 hover:text-slate-50 font-medium transition-all duration-300"
              >
                <Crown size={18} />
                <span className="text-sm">Ver mi plan</span>
              </Link>
              <Link
                to="/"
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 bg-[length:200%_100%] hover:animate-gradient-x transition-all duration-300"
              >
                <ArrowLeft size={18} />
                <span className="text-sm">Explorar películas</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
