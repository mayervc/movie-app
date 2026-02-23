import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { MovieGrid } from "@/components/movies/MovieGrid";
import {
  getPopularMovies,
  getTopRatedMovies,
} from "@/services/movies.service";
import type { Movie } from "@/types/movie.types";

export const Home = () => {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const [popular, topRated] = await Promise.all([
        getPopularMovies(),
        getTopRatedMovies(),
      ]);
      setPopularMovies(popular);
      setTopRatedMovies(topRated);
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const message = Array.isArray(errors)
        ? typeof errors[0] === "string"
          ? errors[0]
          : errors[0]?.message
        : "Error al cargar las películas";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[60vh] flex items-center justify-center bg-gradient-to-r from-blue-600 to-violet-600"
      >
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">Movie App</h1>
          <p className="text-xl md:text-2xl text-slate-100">
            Descubre las mejores películas
          </p>
        </div>
      </motion.section>

      {/* Error State */}
      {error && !loading && (
        <section className="container mx-auto px-4 py-12">
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
              onClick={fetchMovies}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-sm transition-colors"
            >
              <RefreshCw size={16} />
              Reintentar
            </motion.button>
          </motion.div>
        </section>
      )}

      {/* Popular Movies */}
      {!error && (
        <section className="container mx-auto px-4 py-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-8"
          >
            Películas Populares
          </motion.h2>
          {!loading && popularMovies.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              No se encontraron películas populares
            </div>
          ) : (
            <MovieGrid movies={popularMovies} loading={loading} />
          )}
        </section>
      )}

      {/* Top Rated Movies */}
      {!error && (
        <section className="container mx-auto px-4 py-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-8"
          >
            Mejor Valoradas
          </motion.h2>
          {!loading && topRatedMovies.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              No se encontraron películas mejor valoradas
            </div>
          ) : (
            <MovieGrid movies={topRatedMovies} loading={loading} />
          )}
        </section>
      )}
    </div>
  );
};
