import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Star, Calendar, Ticket } from "lucide-react";
import { getMovieById } from "@/services/movies.service";
import { useFavorites } from "@/context/FavoritesContext";
import type { Movie } from "@/types/movie.types";
import { formatDate, formatRating } from "@/utils/formatters";

export const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
    if (id) {
      getMovieById(id)
        .then(setMovie)
        .catch(() => setMovie(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Película no encontrada</h2>
          <Link to="/" className="text-blue-500 hover:text-blue-400">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const favorite = isFavorite(movie.id);

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[50vh] overflow-hidden">
        <img
          src={movie.backdrop}
          alt={`Fondo de ${movie.title}`}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1"
          >
            <img
              src={movie.poster}
              alt={`Poster de ${movie.title}`}
              loading="lazy"
              className="w-full rounded-lg shadow-2xl"
            />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {movie.title}
                </h1>
                <div className="flex items-center gap-4 text-slate-400 mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar size={18} />
                    <span>{formatDate(movie.releaseDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star
                      size={18}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span>{formatRating(movie.rating)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  favorite ? removeFavorite(movie.id) : addFavorite(movie)
                }
                aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  favorite
                    ? "bg-red-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-red-500"
                }`}
              >
                <Heart fill={favorite ? "currentColor" : "none"} size={24} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Sinopsis</h2>
              <p className="text-slate-300 leading-relaxed">{movie.overview}</p>
            </div>

            {movie.cast && movie.cast.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Reparto</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {movie.cast.slice(0, 8).map((actor) => (
                    <div key={actor.id} className="text-center">
                      {actor.profilePath && (
                        <img
                          src={actor.profilePath}
                          alt={actor.name}
                          loading="lazy"
                          className="w-full rounded-lg mb-2"
                        />
                      )}
                      <p className="text-sm font-medium">{actor.name}</p>
                      <p className="text-xs text-slate-400">
                        {actor.character}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={`/movie/${movie.id}/tickets`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
              >
                <Ticket size={20} />
                Comprar Tickets
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
                Volver
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
