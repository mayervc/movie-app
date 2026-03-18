import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { motion } from "framer-motion";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFViewerProps {
  blob: Blob;
  downloadFilename?: string;
  className?: string;
}

export const PDFViewer = ({
  blob,
  downloadFilename = "document.pdf",
  className = "",
}: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWidth, setPageWidth] = useState(() =>
    Math.min(window.innerWidth - 32, 900)
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setPageWidth(Math.min(width - 16, 900));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const goToPrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNext = () => setCurrentPage((p) => Math.min(p + 1, numPages));

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

  const handleDownload = () => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpen = () => {
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`flex flex-col items-center gap-4 sm:gap-6 ${className}`}>
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

        {/* Action buttons */}
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

      {/* PDF canvas */}
      <div
        ref={containerRef}
        className="w-full max-w-4xl rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-black/40 bg-slate-800 flex justify-center py-3 sm:py-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Document
          file={blob}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={() => {
            /* errors are handled by the parent fetching layer */
          }}
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
    </div>
  );
};
