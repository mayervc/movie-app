import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Film, ArrowLeft, Ticket, Sparkles, Clapperboard } from "lucide-react";

import { getMovieById } from "@/services/movies.service";
import { useTicketPurchase } from "@/hooks/useTicketPurchase";
import type { Movie } from "@/types/movie.types";

import { StepIndicator } from "@/components/tickets/StepIndicator";
import { CinemaSelector } from "@/components/tickets/CinemaSelector";
import { ShowtimeSelector } from "@/components/tickets/ShowtimeSelector";
import { SeatSelector } from "@/components/tickets/SeatSelector";
import { PurchaseSummary } from "@/components/tickets/PurchaseSummary";
import { TicketConfirmation } from "@/components/tickets/TicketConfirmation";

export const TicketPurchase = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const movieId = Number(id);

  // Estado de la película
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loadingMovie, setLoadingMovie] = useState(true);

  // Hook de compra
  const {
    step,

    // Cinema
    cinemas,
    loadingCinemas,
    cinemasError,
    selectedCinema,

    // Showtime
    selectedDate,
    showtimeResults,
    loadingShowtimes,
    showtimesError,
    selectedShowtime,
    selectedRoomName,
    showtimeDetails,
    roomData,
    loadingDetails,

    // Seats
    selectedSeats,

    // Purchase
    purchasing,
    purchaseError,
    purchaseResult,

    // Acciones
    searchCinemas,
    selectCinema,
    searchShowtimes,
    selectShowtime,
    toggleSeat,
    confirmPurchase,
    goToStep,
    setStep,
    reset,
  } = useTicketPurchase(movieId);

  // Cargar película
  useEffect(() => {
    if (id) {
      getMovieById(id)
        .then(setMovie)
        .catch(() => setMovie(null))
        .finally(() => setLoadingMovie(false));
    }
  }, [id]);

  // Loading de la película
  if (loadingMovie) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
          />
          <p className="text-slate-400 mt-4 text-sm">Cargando película...</p>
        </div>
      </div>
    );
  }

  // Película no encontrada
  if (!movie) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="relative z-10 text-center">
          <Film size={48} className="text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-50 mb-2">
            Película no encontrada
          </h2>
          <p className="text-slate-400 mb-6">
            No pudimos encontrar la película seleccionada
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
          >
            <ArrowLeft size={18} />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      {/* Fondo animado decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradiente principal */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

        {/* Círculos decorativos animados */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-violet-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl"
        />

        {/* Iconos flotantes decorativos */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] text-blue-500/10 hidden lg:block"
        >
          <Ticket size={80} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 left-[8%] text-violet-500/10 hidden lg:block"
        >
          <Clapperboard size={60} />
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-[10%] text-violet-500/10 hidden lg:block"
        >
          <Sparkles size={70} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 25, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-[12%] text-emerald-500/10 hidden lg:block"
        >
          <Film size={50} />
        </motion.div>

        {/* Grid de puntos */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.05)_1px,_transparent_1px)] bg-[length:40px_40px]" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50"
        >
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(`/movie/${id}`)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-50 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="text-sm hidden sm:inline">Volver</span>
              </button>

              {/* Movie title in header */}
              <div className="flex items-center gap-2 min-w-0">
                <Ticket size={18} className="text-blue-400 flex-shrink-0" />
                <h1 className="text-slate-50 font-semibold text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">
                  {movie.title}
                </h1>
              </div>

              <div className="w-16 sm:w-20" /> {/* Spacer */}
            </div>
          </div>
        </motion.header>

        {/* Step Indicator */}
        <div className="container mx-auto px-4 pt-6 pb-4">
          <StepIndicator currentStep={step} />
        </div>

        {/* Content area */}
        <div className="flex-1 container mx-auto px-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-2xl mx-auto"
          >
            {/* Card con glass morphism */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-black/20">
              <AnimatePresence mode="wait">
                {/* Step 1: Selección de cine */}
                {step === "cinema" && (
                  <CinemaSelector
                    key="cinema"
                    cinemas={cinemas}
                    loading={loadingCinemas}
                    error={cinemasError}
                    onSearch={searchCinemas}
                    onSelect={selectCinema}
                  />
                )}

                {/* Step 2: Selección de horario */}
                {step === "showtime" && selectedCinema && (
                  <ShowtimeSelector
                    key="showtime"
                    showtimeResults={showtimeResults}
                    loading={loadingShowtimes}
                    error={showtimesError}
                    selectedDate={selectedDate}
                    cinemaName={selectedCinema.name}
                    onDateSelect={searchShowtimes}
                    onShowtimeSelect={selectShowtime}
                    onBack={() => goToStep("cinema")}
                  />
                )}

                {/* Step 3: Selección de asientos */}
                {step === "seats" &&
                  showtimeDetails &&
                  selectedShowtime &&
                  roomData && (
                    <SeatSelector
                      key="seats"
                      showtimeDetails={showtimeDetails}
                      selectedShowtime={selectedShowtime}
                      roomName={selectedRoomName}
                      roomData={roomData}
                      selectedSeats={selectedSeats}
                      loadingDetails={loadingDetails}
                      onToggleSeat={toggleSeat}
                      onBack={() => goToStep("showtime")}
                      onContinue={() => setStep("confirm")}
                    />
                  )}

                {/* Step 4: Resumen y confirmación */}
                {step === "confirm" &&
                  selectedShowtime &&
                  selectedCinema && (
                    <PurchaseSummary
                      key="confirm"
                      movie={movie}
                      selectedShowtime={selectedShowtime}
                      cinemaName={selectedCinema.name}
                      roomName={selectedRoomName}
                      selectedDate={selectedDate}
                      selectedSeats={selectedSeats}
                      roomData={roomData}
                      purchasing={purchasing}
                      error={purchaseError}
                      onBack={() => goToStep("seats")}
                      onConfirm={confirmPurchase}
                    />
                  )}

                {/* Step 5: Confirmación exitosa */}
                {step === "success" && purchaseResult && (
                  <TicketConfirmation
                    key="success"
                    purchaseResult={purchaseResult}
                    selectedDate={selectedDate}
                    onNewPurchase={reset}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Footer decoración */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 pb-6 text-slate-500"
        >
          <Ticket size={14} className="text-blue-500" />
          <span className="text-xs">Movie App</span>
          <span className="text-slate-600">•</span>
          <span className="text-xs">Compra segura</span>
        </motion.div>
      </div>
    </div>
  );
};
