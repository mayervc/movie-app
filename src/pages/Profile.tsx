import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Save,
  KeyRound,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usersService } from "@/services/users.service";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay },
  }),
};

export const Profile = () => {
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const initials =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((s) => s![0].toUpperCase())
      .join("") ||
    user?.email?.[0].toUpperCase() ||
    "U";

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const extractError = (err: unknown): string => {
    const e = err as { response?: { data?: { errors?: unknown[] } } };
    const errors = e.response?.data?.errors;
    if (Array.isArray(errors)) {
      const first = errors[0];
      return typeof first === "string"
        ? first
        : (first as { message?: string })?.message ?? "Error desconocido.";
    }
    return "Ocurrió un error inesperado.";
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingInfo(true);
    setInfoError(null);
    setInfoSuccess(false);
    try {
      const updated = await usersService.updateProfile(user.id, {
        firstName,
        lastName,
        email,
      });
      updateUser(updated);
      setInfoSuccess(true);
      setTimeout(() => setInfoSuccess(false), 3000);
    } catch (err) {
      setInfoError(extractError(err));
    } finally {
      setSavingInfo(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }
    setSavingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      await usersService.updateProfile(user.id, { password: newPassword });
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(extractError(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.04)_1px,_transparent_1px)] bg-[length:40px_40px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16 max-w-2xl">
        {/* Avatar + header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl mb-5 shadow-lg shadow-blue-500/25 text-3xl font-bold text-white select-none"
          >
            {initials}
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-1">
            Mi perfil
          </h1>

          {joinDate && (
            <div className="inline-flex items-center gap-1.5 mt-2 text-slate-500 text-xs">
              <Calendar size={12} />
              <span>Miembro desde {joinDate}</span>
            </div>
          )}
        </motion.div>

        {/* Información personal */}
        <motion.div
          custom={0.15}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-slate-800/40 backdrop-blur-md border border-slate-700/40 rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl shadow-black/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-600/20 border border-blue-500/20 flex items-center justify-center">
              <User size={20} className="text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-50">
              Información personal
            </h2>
          </div>

          <form onSubmit={handleSaveInfo} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-50 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900/70 transition-all duration-300 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  Apellido
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                  className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-50 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900/70 transition-all duration-300 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-50 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900/70 transition-all duration-300 text-sm"
                />
              </div>
            </div>

            {infoError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{infoError}</p>
              </motion.div>
            )}

            {infoSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
              >
                <Check size={18} className="text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-400 text-sm">
                  Perfil actualizado correctamente.
                </p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={savingInfo}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full py-3.5 rounded-xl font-semibold text-white overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-600" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <span className="relative flex items-center justify-center gap-2 text-sm">
                {savingInfo ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar cambios
                  </>
                )}
              </span>
            </motion.button>
          </form>
        </motion.div>

        {/* Cambiar contraseña */}
        <motion.div
          custom={0.25}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-slate-800/40 backdrop-blur-md border border-slate-700/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center">
              <KeyRound size={20} className="text-violet-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-50">
              Cambiar contraseña
            </h2>
          </div>

          <form onSubmit={handleSavePassword} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-50 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-slate-900/70 transition-all duration-300 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-50 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-slate-900/70 transition-all duration-300 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <p className="text-slate-500 text-xs ml-1">
              Mínimo 6 caracteres, al menos 1 mayúscula, 1 minúscula y 1 carácter especial.
            </p>

            {passwordError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{passwordError}</p>
              </motion.div>
            )}

            {passwordSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
              >
                <Check size={18} className="text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-400 text-sm">
                  Contraseña actualizada correctamente.
                </p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={savingPassword || !newPassword || !confirmPassword}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full py-3.5 rounded-xl font-semibold text-white overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-600" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <span className="relative flex items-center justify-center gap-2 text-sm">
                {savingPassword ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    Cambiar contraseña
                  </>
                )}
              </span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
