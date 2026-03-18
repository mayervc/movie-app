import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, FileText } from "lucide-react";
import { getTrendingMoviesPdf } from "@/services/movies.service";
import { PDFViewer } from "@/components/PDFViewer";

export const TrendingPDF = () => {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPdf = useCallback(async () => {
    setPdfBlob(null);
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

        {/* PDF Viewer */}
        {!loading && !error && pdfBlob && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PDFViewer blob={pdfBlob} downloadFilename="trending-movies.pdf" />
          </motion.div>
        )}
      </div>
    </div>
  );
};
