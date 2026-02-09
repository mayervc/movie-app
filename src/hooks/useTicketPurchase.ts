import { useState, useCallback } from "react";
import { showtimesService } from "@/services/showtimes.service";
import { ticketsService } from "@/services/tickets.service";
import type {
  ShowtimeSearchResult,
  ShowtimeDetails,
  ShowtimeItem,
} from "@/types/showtime.types";
import type { TicketPurchaseResponse } from "@/types/ticket.types";

export type PurchaseStep = "showtime" | "seats" | "confirm" | "success";

export const useTicketPurchase = (movieId: number) => {
  // Estado del flujo
  const [step, setStep] = useState<PurchaseStep>("showtime");
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
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Asientos seleccionados
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  // Compra
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseResult, setPurchaseResult] =
    useState<TicketPurchaseResponse | null>(null);

  // Buscar showtimes por fecha
  const searchShowtimes = useCallback(
    async (date: string) => {
      try {
        setLoadingShowtimes(true);
        setShowtimesError(null);
        setSelectedDate(date);
        const results = await showtimesService.search({
          movie_id: movieId,
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
    [movieId]
  );

  // Seleccionar un showtime y obtener detalles
  const selectShowtime = useCallback(
    async (showtime: ShowtimeItem, roomName: string) => {
      try {
        setSelectedShowtime(showtime);
        setSelectedRoomName(roomName);
        setLoadingDetails(true);
        setSelectedSeats([]);
        const details = await showtimesService.getById(showtime.id);
        setShowtimeDetails(details);
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

  // Confirmar compra
  const confirmPurchase = useCallback(async () => {
    if (!selectedShowtime || selectedSeats.length === 0) return;

    try {
      setPurchasing(true);
      setPurchaseError(null);
      const result = await ticketsService.purchase(
        selectedShowtime.id,
        selectedSeats
      );
      setPurchaseResult(result);
      setStep("success");
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
        message = "Error al comprar tickets";
      }
      setPurchaseError(message);
    } finally {
      setPurchasing(false);
    }
  }, [selectedShowtime, selectedSeats]);

  // Navegar entre pasos
  const goToStep = useCallback((newStep: PurchaseStep) => {
    setStep(newStep);
    if (newStep === "showtime") {
      setSelectedShowtime(null);
      setSelectedRoomName("");
      setShowtimeDetails(null);
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
    setStep("showtime");
    setSelectedDate("");
    setShowtimeResults([]);
    setSelectedShowtime(null);
    setSelectedRoomName("");
    setShowtimeDetails(null);
    setSelectedSeats([]);
    setPurchaseResult(null);
    setPurchaseError(null);
    setShowtimesError(null);
  }, []);

  return {
    // Estado
    step,
    selectedDate,
    showtimeResults,
    loadingShowtimes,
    showtimesError,
    selectedShowtime,
    selectedRoomName,
    showtimeDetails,
    loadingDetails,
    selectedSeats,
    purchasing,
    purchaseError,
    purchaseResult,

    // Acciones
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
