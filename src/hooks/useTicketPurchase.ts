import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { cinemasService } from "@/services/cinemas.service";
import { showtimesService } from "@/services/showtimes.service";
import { roomsService } from "@/services/rooms.service";
import { paymentsService } from "@/services/payments.service";
import type { Cinema } from "@/types/cinema.types";
import type {
  ShowtimeSearchResult,
  ShowtimeDetails,
  ShowtimeItem,
} from "@/types/showtime.types";
import type { RoomWithSeats } from "@/types/room.types";

export type PurchaseStep = "cinema" | "showtime" | "seats" | "confirm";

export const useTicketPurchase = (movieId: number) => {
  const { user } = useAuth();

  // Estado del flujo
  const [step, setStep] = useState<PurchaseStep>("cinema");

  // Cinema
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loadingCinemas, setLoadingCinemas] = useState(false);
  const [cinemasError, setCinemasError] = useState<string | null>(null);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [cinemaSearchQuery, setCinemaSearchQuery] = useState("");

  // Fecha
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Datos de showtimes
  const [showtimeResults, setShowtimeResults] = useState<
    ShowtimeSearchResult[]
  >([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [showtimesError, setShowtimesError] = useState<string | null>(null);

  // Showtime seleccionado
  const [selectedShowtime, setSelectedShowtime] =
    useState<ShowtimeItem | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>("");
  const [showtimeDetails, setShowtimeDetails] =
    useState<ShowtimeDetails | null>(null);
  const [roomData, setRoomData] = useState<RoomWithSeats | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Asientos seleccionados
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  // Compra
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Buscar cinemas
  const searchCinemas = useCallback(async (query?: string) => {
    try {
      setLoadingCinemas(true);
      setCinemasError(null);
      const params: { page: number; limit: number; name?: string } = {
        page: 1,
        limit: 50,
      };
      if (query && query.trim()) {
        params.name = query.trim();
      }
      const response = await cinemasService.search(params);
      setCinemas(response.cinemas);
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const message = Array.isArray(errors)
        ? typeof errors[0] === "string"
          ? errors[0]
          : errors[0]?.message
        : "Error al buscar cines";
      setCinemasError(message);
    } finally {
      setLoadingCinemas(false);
    }
  }, []);

  // Seleccionar cinema
  const selectCinema = useCallback((cinema: Cinema) => {
    setSelectedCinema(cinema);
    setSelectedDate("");
    setShowtimeResults([]);
    setSelectedShowtime(null);
    setSelectedRoomName("");
    setShowtimeDetails(null);
    setSelectedSeats([]);
    setStep("showtime");
  }, []);

  // Buscar showtimes por fecha y cinema
  const searchShowtimes = useCallback(
    async (date: string) => {
      if (!selectedCinema) return;
      try {
        setLoadingShowtimes(true);
        setShowtimesError(null);
        setSelectedDate(date);
        const results = await showtimesService.search({
          movie_id: movieId,
          cinema_id: selectedCinema.id,
          date,
        });
        setShowtimeResults(results);
      } catch (err: any) {
        const errors = err.response?.data?.errors;
        const message = Array.isArray(errors)
          ? typeof errors[0] === "string"
            ? errors[0]
            : errors[0]?.message
          : "Error al buscar horarios";
        setShowtimesError(message);
      } finally {
        setLoadingShowtimes(false);
      }
    },
    [movieId, selectedCinema]
  );

  // Seleccionar un showtime y obtener detalles + asientos de la sala
  const selectShowtime = useCallback(
    async (showtime: ShowtimeItem, roomName: string) => {
      try {
        setSelectedShowtime(showtime);
        setSelectedRoomName(roomName);
        setLoadingDetails(true);
        setSelectedSeats([]);
        setRoomData(null);

        // Cargar detalles del showtime y asientos de la sala en paralelo
        const [details, room] = await Promise.all([
          showtimesService.getById(showtime.id),
          roomsService.getWithSeats(showtime.room_id),
        ]);

        setShowtimeDetails(details);
        setRoomData(room);
        setStep("seats");
      } catch (err: any) {
        const errors = err.response?.data?.errors;
        const message = Array.isArray(errors)
          ? typeof errors[0] === "string"
            ? errors[0]
            : errors[0]?.message
          : "Error al obtener detalles del horario";
        setShowtimesError(message);
      } finally {
        setLoadingDetails(false);
      }
    },
    []
  );

  // Toggle selección de asiento
  const toggleSeat = useCallback(
    (seatId: number) => {
      if (showtimeDetails?.booked_seats.includes(seatId)) return;

      setSelectedSeats((prev) =>
        prev.includes(seatId)
          ? prev.filter((id) => id !== seatId)
          : [...prev, seatId]
      );
    },
    [showtimeDetails]
  );

  // Confirmar compra: crea sesión Stripe y redirige al checkout
  const confirmPurchase = useCallback(async () => {
    if (!selectedShowtime || selectedSeats.length === 0) return;

    try {
      setPurchasing(true);
      setPurchaseError(null);
      const { url } = await paymentsService.createCheckoutSession(
        selectedShowtime.id,
        selectedSeats,
        movieId,
        user?.email ?? undefined
      );
      sessionStorage.setItem(
        "ticket_purchase_movie_id",
        String(movieId)
      );
      sessionStorage.setItem(
        "ticket_purchase_selected_date",
        selectedDate || ""
      );
      window.location.href = url;
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      let message: string;
      if (Array.isArray(errors)) {
        message = errors
          .map((e: string | { message: string }) =>
            typeof e === "string" ? e : e.message
          )
          .join(". ");
      } else {
        message = "Error al iniciar el pago. Intenta de nuevo.";
      }
      setPurchaseError(message);
    } finally {
      setPurchasing(false);
    }
  }, [movieId, selectedShowtime, selectedSeats, selectedDate, user?.email]);

  // Navegar entre pasos
  const goToStep = useCallback((newStep: PurchaseStep) => {
    setStep(newStep);
    if (newStep === "cinema") {
      setSelectedCinema(null);
      setSelectedDate("");
      setShowtimeResults([]);
      setSelectedShowtime(null);
      setSelectedRoomName("");
      setShowtimeDetails(null);
      setRoomData(null);
      setSelectedSeats([]);
      setPurchaseError(null);
      setShowtimesError(null);
    }
    if (newStep === "showtime") {
      setSelectedShowtime(null);
      setSelectedRoomName("");
      setShowtimeDetails(null);
      setRoomData(null);
      setSelectedSeats([]);
      setPurchaseError(null);
    }
    if (newStep === "seats") {
      setSelectedSeats([]);
      setPurchaseError(null);
    }
  }, []);

  // Resetear todo
  const reset = useCallback(() => {
    setStep("cinema");
    setCinemas([]);
    setSelectedCinema(null);
    setCinemaSearchQuery("");
    setCinemasError(null);
    setSelectedDate("");
    setShowtimeResults([]);
    setSelectedShowtime(null);
    setSelectedRoomName("");
    setShowtimeDetails(null);
    setRoomData(null);
    setSelectedSeats([]);
    setPurchaseError(null);
    setShowtimesError(null);
  }, []);

  return {
    // Estado
    step,

    // Cinema
    cinemas,
    loadingCinemas,
    cinemasError,
    selectedCinema,
    cinemaSearchQuery,

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

    // Acciones
    searchCinemas,
    selectCinema,
    setCinemaSearchQuery,
    searchShowtimes,
    selectShowtime,
    toggleSeat,
    setSelectedSeats,
    confirmPurchase,
    goToStep,
    setStep,
    reset,
  };
};
