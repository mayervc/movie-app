import { motion } from "framer-motion";
import { Ticket, Armchair, ShieldCheck, PartyPopper } from "lucide-react";
import type { PurchaseStep } from "@/hooks/useTicketPurchase";

interface StepIndicatorProps {
  currentStep: PurchaseStep;
}

const STEPS = [
  { key: "showtime" as PurchaseStep, label: "Horario", icon: Ticket },
  { key: "seats" as PurchaseStep, label: "Asientos", icon: Armchair },
  { key: "confirm" as PurchaseStep, label: "Confirmar", icon: ShieldCheck },
  { key: "success" as PurchaseStep, label: "Listo", icon: PartyPopper },
];

const stepIndex = (step: PurchaseStep) =>
  STEPS.findIndex((s) => s.key === step);

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const currentIdx = stepIndex(currentStep);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {STEPS.map((step, idx) => {
        const isActive = idx === currentIdx;
        const isCompleted = idx < currentIdx;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            {/* Step circle */}
            <motion.div
              initial={false}
              animate={{
                scale: isActive ? 1 : 0.9,
                opacity: isActive || isCompleted ? 1 : 0.4,
              }}
              className="flex flex-col items-center"
            >
              <div
                className={`
                  relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-300
                  ${
                    isActive
                      ? "bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30"
                      : isCompleted
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20"
                        : "bg-slate-800/50 border border-slate-700/50"
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeStepGlow"
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 blur-md opacity-40"
                    transition={{ duration: 0.3 }}
                  />
                )}
                <Icon
                  size={18}
                  className={`relative z-10 ${
                    isActive || isCompleted ? "text-white" : "text-slate-500"
                  }`}
                />
              </div>
              <span
                className={`mt-1.5 text-[10px] sm:text-xs font-medium transition-colors ${
                  isActive
                    ? "text-blue-400"
                    : isCompleted
                      ? "text-emerald-400"
                      : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </motion.div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div className="w-6 sm:w-10 md:w-14 h-[2px] mx-1 sm:mx-2 relative mt-[-12px] sm:mt-[-14px]">
                <div className="absolute inset-0 bg-slate-700/50 rounded-full" />
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full origin-left"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
