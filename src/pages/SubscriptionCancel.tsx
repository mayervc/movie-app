import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, Crown } from "lucide-react";

export const SubscriptionCancel = () => {
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
          className="w-full max-w-md"
        >
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/20 border border-amber-500/30 rounded-2xl mb-6"
            >
              <XCircle size={40} className="text-amber-400" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 mb-2">
              Suscripción no completada
            </h1>
            <p className="text-slate-400 text-sm mb-8">
              No se realizó ningún cargo. Puedes suscribirte cuando quieras.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/plans"
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 bg-[length:200%_100%] hover:animate-gradient-x transition-all duration-300"
              >
                <Crown size={18} />
                <span className="text-sm">Ver planes</span>
              </Link>
              <Link
                to="/"
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600/50 rounded-xl text-slate-300 hover:text-slate-50 font-medium transition-all duration-300"
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
