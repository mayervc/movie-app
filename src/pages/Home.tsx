import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const [popular, topRated] = await Promise.all([
          getPopularMovies(),
          getTopRatedMovies(),
        ]);
        setPopularMovies(popular);
        setTopRatedMovies(topRated);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

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

      {/* Popular Movies */}
      <section className="container mx-auto px-4 py-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-8"
        >
          Películas Populares
        </motion.h2>
        <MovieGrid movies={popularMovies} loading={loading} />
      </section>

      {/* Top Rated Movies */}
      <section className="container mx-auto px-4 py-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-8"
        >
          Mejor Valoradas
        </motion.h2>
        <MovieGrid movies={topRatedMovies} loading={loading} />
      </section>
    </div>
  );
};
