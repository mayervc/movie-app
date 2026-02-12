import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  Ticket,
  Star,
  Zap,
  Calendar,
  XCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { subscriptionsService } from "@/services/subscriptions.service";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanSlug,
} from "@/types/subscription.types";

export const Plans = () => {
  const {
    subscription,
    isSubscribed,
    isCanceling,
    planName,
    freeTicketsRemaining,
    refresh,
  } = useSubscription();

  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlanSlug | null>(
    null
  );
  const [cancelingPlan, setCancelingPlan] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubscribe = async (plan: SubscriptionPlanSlug) => {
    try {
      setLoadingPlan(plan);
      setError(null);
      const { url } = await subscriptionsService.createCheckoutSession(plan);
      window.location.href = url;
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const message = Array.isArray(errors)
        ? typeof errors[0] === "string"
          ? errors[0]
          : errors[0]?.message
        : "Error al iniciar la suscripción. Intenta de nuevo.";
      setError(message);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCancel = async () => {
    try {
      setCancelingPlan(true);
      setError(null);
      setSuccessMsg(null);
      const response = await subscriptionsService.cancel();
      setSuccessMsg(response.message || "Suscripción cancelada. Se mantendrá activa hasta el fin del periodo.");
      await refresh();
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const message = Array.isArray(errors)
        ? typeof errors[0] === "string"
          ? errors[0]
          : errors[0]?.message
        : "Error al cancelar la suscripción.";
      setError(message);
    } finally {
      setCancelingPlan(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setReactivating(true);
      setError(null);
      setSuccessMsg(null);
      await subscriptionsService.reactivate();
      setSuccessMsg("Suscripción reactivada correctamente.");
      await refresh();
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const message = Array.isArray(errors)
        ? typeof errors[0] === "string"
          ? errors[0]
          : errors[0]?.message
        : "Error al reactivar la suscripción.";
      setError(message);
    } finally {
      setReactivating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const planIcons: Record<SubscriptionPlanSlug, typeof Star> = {
    basic: Star,
    premium: Crown,
  };

  const planGradients: Record<SubscriptionPlanSlug, string> = {
    basic: "from-blue-500 to-cyan-500",
    premium: "from-violet-500 to-purple-600",
  };

  const planGlows: Record<SubscriptionPlanSlug, string> = {
    basic: "shadow-blue-500/20",
    premium: "shadow-violet-500/30",
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.04)_1px,_transparent_1px)] bg-[length:40px_40px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
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
            <Sparkles size={32} className="text-violet-400" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-50 mb-4">
            Elige tu plan
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Ahorra en cada visita al cine con nuestros planes de suscripción.
            Tickets gratis y descuentos exclusivos cada mes.
          </p>
        </motion.div>

        {/* Suscripción activa */}
        {isSubscribed && subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${planGradients[subscription.plan]} flex items-center justify-center flex-shrink-0`}
                >
                  <ShieldCheck size={24} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-slate-50 font-bold text-lg">
                      Plan {planName}
                    </h3>
                    {isCanceling ? (
                      <span className="px-2.5 py-0.5 bg-amber-500/15 text-amber-400 text-xs rounded-full font-medium">
                        Se cancela al final del periodo
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-xs rounded-full font-medium">
                        Activo
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Ticket size={14} className="text-blue-400" />
                      <span className="text-slate-400">Tickets gratis:</span>
                      <span className="text-slate-200 font-medium">
                        {freeTicketsRemaining}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Zap size={14} className="text-violet-400" />
                      <span className="text-slate-400">Descuento:</span>
                      <span className="text-slate-200 font-medium">
                        {subscription.discount_percent}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className="text-emerald-400" />
                      <span className="text-slate-400">
                        {isCanceling ? "Expira:" : "Renueva:"}
                      </span>
                      <span className="text-slate-200 font-medium">
                        {formatDate(subscription.current_period_end)}
                      </span>
                    </div>
                  </div>

                  {/* Acciones de suscripción activa */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {isCanceling ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleReactivate}
                        disabled={reactivating}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                      >
                        {reactivating ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ArrowRight size={14} />
                        )}
                        Reactivar suscripción
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCancel}
                        disabled={cancelingPlan}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                      >
                        {cancelingPlan ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <XCircle size={14} />
                        )}
                        Cancelar suscripción
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mensajes */}
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

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-6 flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
          >
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-400 text-sm">{successMsg}</p>
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const Icon = planIcons[plan.slug];
            const isCurrentPlan = isSubscribed && subscription?.plan === plan.slug;
            const isPremium = plan.slug === "premium";

            return (
              <motion.div
                key={plan.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                {/* Popular badge para premium */}
                {isPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-4 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg shadow-violet-500/30">
                      Más popular
                    </span>
                  </div>
                )}

                <div
                  className={`relative h-full bg-slate-800/40 backdrop-blur-xl border rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
                    isPremium
                      ? "border-violet-500/40 shadow-xl shadow-violet-500/10"
                      : "border-slate-700/40"
                  } ${isCurrentPlan ? "ring-2 ring-emerald-500/50" : ""}`}
                >
                  {/* Current plan indicator */}
                  {isCurrentPlan && (
                    <div className="absolute top-4 right-4">
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-400 text-xs rounded-full font-medium">
                        <Check size={12} />
                        Tu plan
                      </span>
                    </div>
                  )}

                  {/* Icon & Name */}
                  <div className="mb-6">
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${planGradients[plan.slug]} rounded-2xl mb-4 shadow-lg ${planGlows[plan.slug]}`}
                    >
                      <Icon size={28} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-50">
                      {plan.name}
                    </h2>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-50">
                        ${plan.price.toFixed(2)}
                      </span>
                      <span className="text-slate-400 text-sm">/mes</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="flex gap-3 mb-6">
                    <div className="flex-1 bg-slate-900/40 border border-slate-700/30 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-blue-400">
                        {plan.discount_percent}%
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">Descuento</p>
                    </div>
                    <div className="flex-1 bg-slate-900/40 border border-slate-700/30 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-violet-400">
                        {plan.free_tickets_per_month}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Tickets gratis
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full bg-gradient-to-br ${planGradients[plan.slug]} flex items-center justify-center flex-shrink-0 mt-0.5`}
                        >
                          <Check size={12} className="text-white" />
                        </div>
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    {isCurrentPlan ? (
                      <div className="w-full py-3.5 rounded-xl text-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-medium text-sm">
                        Plan actual
                      </div>
                    ) : isSubscribed ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSubscribe(plan.slug)}
                        disabled={loadingPlan !== null}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white overflow-hidden relative group disabled:opacity-70 disabled:cursor-not-allowed`}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${planGradients[plan.slug]} bg-[length:200%_100%] group-hover:animate-gradient-x`}
                        />
                        <span className="relative flex items-center gap-2 text-sm">
                          {loadingPlan === plan.slug ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              <ArrowRight size={18} />
                              Cambiar a {plan.name}
                            </>
                          )}
                        </span>
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSubscribe(plan.slug)}
                        disabled={loadingPlan !== null}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white overflow-hidden relative group disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${planGradients[plan.slug]} bg-[length:200%_100%] group-hover:animate-gradient-x`}
                        />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <span className="relative flex items-center gap-2 text-sm">
                          {loadingPlan === plan.slug ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              <Zap size={18} />
                              Suscribirme
                            </>
                          )}
                        </span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-slate-500 text-xs mt-8 max-w-md mx-auto"
        >
          Los tickets gratis se renuevan cada mes. Los descuentos se aplican
          automáticamente al comprar tickets. Cancela en cualquier momento.
        </motion.p>
      </div>
    </div>
  );
};
