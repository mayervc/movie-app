import { useEffect, useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { motion } from "framer-motion";
import {
  AlertCircle,
  RefreshCw,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { getTrendingMoviesPdf } from "@/services/movies.service";

// Use local worker bundled by Vite — works on all browsers including iOS/Android
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export const TrendingPDF = () => {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  // Initialize with actual window width to avoid oversized render flash on mobile
  const [pageWidth, setPageWidth] = useState(() =>
    Math.min(window.innerWidth - 32, 900)
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Track container width for responsive page rendering
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setPageWidth(Math.min(width - 16, 900));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const fetchPdf = useCallback(async () => {
    setPdfBlob(null);
    setCurrentPage(1);
    setNumPages(0);
    try {
      setLoading(true);
      setError(null);
      const blob = await getTrendingMoviesPdf();
      setPdfBlob(blob);
    } catch {
      setError("No se pudo cargar el PDF. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPdf();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trending-movies.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpen = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const goToPrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNext = () => setCurrentPage((p) => Math.min(p + 1, numPages));

  // Swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
    touchStartX.current = null;
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-36 sm:h-48 md:h-64 flex items-center justify-center bg-gradient-to-r from-blue-600 to-violet-600"
      >
        <div className="text-center px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
            <FileText size={24} className="text-white/80 sm:hidden" />
            <FileText size={36} className="text-white/80 hidden sm:block" />
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold">
              Películas en Tendencia
            </h1>
          </div>
          <p className="text-sm sm:text-lg md:text-xl text-slate-100">
            Reporte completo en PDF
          </p>
        </div>
      </motion.section>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        {/* Loading */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-20"
          >
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500" />
            <p className="text-slate-400">Cargando PDF…</p>
          </motion.div>
        )}

        {/* Error */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 p-6 bg-red-500/10 border border-red-500/30 rounded-xl max-w-lg mx-auto"
          >
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-red-400 text-sm text-center">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchPdf}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-sm transition-colors"
            >
              <RefreshCw size={16} />
              Reintentar
            </motion.button>
          </motion.div>
        )}

        {/* PDF loaded */}
        {!loading && !error && pdfBlob && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 sm:gap-6"
          >
            {/* Toolbar */}
            <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl">
              {/* Pagination */}
              {numPages > 0 && (
                <div className="flex items-center gap-3">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={goToPrev}
                    disabled={currentPage <= 1}
                    className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </motion.button>
                  <span className="text-slate-300 text-sm tabular-nums">
                    {currentPage} / {numPages}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={goToNext}
                    disabled={currentPage >= numPages}
                    className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={18} />
                  </motion.button>
                </div>
              )}

              {/* Action buttons — full width on mobile so they stay centered */}
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end sm:ml-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpen}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-slate-200 text-xs sm:text-sm font-medium transition-colors"
                >
                  <ExternalLink size={15} />
                  Abrir PDF
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-xs sm:text-sm font-medium transition-colors shadow-lg shadow-blue-900/30"
                >
                  <Download size={15} />
                  Descargar PDF
                </motion.button>
              </div>
            </div>

            {/* PDF Viewer — react-pdf (PDF.js), works on all browsers + mobile */}
            <div
              ref={containerRef}
              className="w-full max-w-4xl rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-black/40 bg-slate-800 flex justify-center py-3 sm:py-4"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <Document
                file={pdfBlob}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                onLoadError={() =>
                  setError("Error al procesar el PDF. Intenta de nuevo.")
                }
                loading={
                  <div className="flex items-center gap-3 py-20 text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
                    <span>Procesando…</span>
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  width={pageWidth}
                  renderTextLayer
                  renderAnnotationLayer
                  loading={
                    <div
                      style={{ width: pageWidth, height: 500 }}
                      className="flex items-center justify-center"
                    >
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
                    </div>
                  }
                />
              </Document>
            </div>

            {/* Mobile swipe hint */}
            {numPages > 1 && (
              <p className="text-slate-500 text-xs sm:hidden">
                Desliza ← → o usa los botones para cambiar de página
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
