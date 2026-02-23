import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Film,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Clapperboard,
  User,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    label: "Al menos 6 caracteres",
    test: (p) => p.length >= 6,
  },
  {
    label: "Al menos una letra minúscula",
    test: (p) => /[a-z]/.test(p),
  },
  {
    label: "Al menos una letra mayúscula",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    label: "Al menos un símbolo especial",
    test: (p) => /[^a-zA-Z0-9]/.test(p),
  },
];

export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isPasswordValid = PASSWORD_REQUIREMENTS.every((req) =>
    req.test(password)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validación del lado del cliente
    if (!validateEmail(email)) {
      setError("Por favor ingresa un email válido.");
      return;
    }

    if (!isPasswordValid) {
      setError("La contraseña no cumple con todos los requisitos.");
      return;
    }

    setLoading(true);

    try {
      await register({
        email,
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      navigate("/");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al crear la cuenta. Intenta nuevamente.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900 flex items-center justify-center p-4">
      {/* Fondo animado con formas decorativas */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradiente principal */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

        {/* Círculos decorativos animados */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-3xl"
        />

        {/* Iconos flotantes decorativos */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-[15%] text-violet-500/20"
        >
          <Film size={80} />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-32 left-[10%] text-blue-500/20"
        >
          <Clapperboard size={60} />
        </motion.div>
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 20, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-32 right-[12%] text-blue-500/20"
        >
          <Sparkles size={70} />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 25, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 right-[15%] text-violet-500/20"
        >
          <Film size={50} />
        </motion.div>

        {/* Grid de puntos decorativo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.1)_1px,_transparent_1px)] bg-[length:40px_40px]" />
      </div>

      {/* Contenido principal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card con glass morphism */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-black/20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            {/* Logo animado */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-blue-600 rounded-2xl mb-6 shadow-lg shadow-violet-500/30"
            >
              <UserPlus size={40} className="text-white" />
            </motion.div>

            <h1 className="text-3xl font-bold text-slate-50 mb-2">
              Crear Cuenta
            </h1>
            <p className="text-slate-400">
              Únete y descubre las mejores películas
            </p>
          </motion.div>

          {/* Formulario */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Nombre y Apellido en fila */}
            <div className="grid grid-cols-2 gap-3">
              {/* Campo Nombre */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  Nombre
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-300" />
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-400 transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Juan"
                      className="w-full pl-10 pr-3 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-50 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-slate-900/70 transition-all duration-300 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Campo Apellido */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  Apellido
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-300" />
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-400 transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Pérez"
                      className="w-full pl-10 pr-3 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-50 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-slate-900/70 transition-all duration-300 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Campo Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">
                Correo electrónico <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-300" />
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-400 transition-colors"
                    size={20}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-50 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-slate-900/70 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Campo Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">
                Contraseña <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-300" />
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-400 transition-colors"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (!showRequirements) setShowRequirements(true);
                    }}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-4 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-50 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-slate-900/70 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Indicadores de requisitos de contraseña */}
              {showRequirements && password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="space-y-1.5 pt-2"
                >
                  {PASSWORD_REQUIREMENTS.map((req, index) => {
                    const passed = req.test(password);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2"
                      >
                        {passed ? (
                          <Check size={14} className="text-emerald-400" />
                        ) : (
                          <X size={14} className="text-slate-500" />
                        )}
                        <span
                          className={`text-xs transition-colors duration-200 ${
                            passed ? "text-emerald-400" : "text-slate-500"
                          }`}
                        >
                          {req.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <p className="text-red-400 text-sm text-center">{error}</p>
              </motion.div>
            )}

            {/* Botón Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full py-4 rounded-xl font-semibold text-white overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {/* Gradiente animado del botón */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-blue-500 to-violet-500 bg-[length:200%_100%] group-hover:animate-gradient-x transition-all duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Brillo superior */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    Crear Cuenta
                    <Sparkles size={18} />
                  </>
                )}
              </span>
            </motion.button>
          </motion.form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-slate-800/50 text-slate-500 text-sm">
                ¿Ya tienes cuenta?
              </span>
            </div>
          </div>

          {/* Login link */}
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="w-full py-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 rounded-xl text-slate-300 hover:text-slate-50 font-medium transition-all duration-300"
            >
              Iniciar Sesión
            </motion.button>
          </Link>

          {/* Footer */}
          <p className="text-center text-slate-500 text-xs mt-8">
            Al continuar, aceptas nuestros{" "}
            <a
              href="#"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Términos de Servicio
            </a>{" "}
            y{" "}
            <a
              href="#"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Política de Privacidad
            </a>
          </p>
        </div>

        {/* Decoración inferior */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 mt-8 text-slate-500"
        >
          <Film size={16} className="text-violet-500" />
          <span className="text-sm">Movie App</span>
          <span className="text-slate-600">•</span>
          <span className="text-sm">Tu cine en casa</span>
        </motion.div>
      </motion.div>
    </div>
  );
};
