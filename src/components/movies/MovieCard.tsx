import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import type { Movie } from "@/types/movie.types";
import { useFavorites } from "@/context/FavoritesContext";
import { formatYear } from "@/utils/formatters";

interface MovieCardProps {
  movie: Movie;
  viewMode?: "grid" | "list";
}

export const MovieCard = ({ movie, viewMode = "grid" }: MovieCardProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = isFavorite(movie.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) {
      removeFavorite(movie.id);
    } else {
      addFavorite(movie);
    }
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex gap-4 p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-24 h-32 object-cover rounded"
        />
        <div className="flex-1">
          <h3 className="text-slate-50 font-semibold text-lg">{movie.title}</h3>
          <p className="text-slate-400 text-sm mt-1">
            {formatYear(movie.releaseDate)}
          </p>
          <p className="text-slate-300 text-sm mt-2 line-clamp-2">
            {movie.overview}
          </p>
        </div>
        <button
          onClick={handleFavoriteClick}
          className={`p-2 rounded-full transition-colors ${
            favorite ? "text-red-500" : "text-slate-400 hover:text-red-500"
          }`}
        >
          <Heart fill={favorite ? "currentColor" : "none"} size={24} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-lg bg-slate-800 cursor-pointer"
    >
      <Link to={`/movie/${movie.id}`}>
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-auto transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-slate-50 font-semibold text-sm">
              {movie.title}
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              {formatYear(movie.releaseDate)}
            </p>
          </div>
        </div>
      </Link>
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-2 right-2 p-2 rounded-full bg-slate-900/80 backdrop-blur-sm transition-colors ${
          favorite ? "text-red-500" : "text-slate-400 hover:text-red-500"
        }`}
      >
        <Heart fill={favorite ? "currentColor" : "none"} size={20} />
      </button>
    </motion.div>
  );
};
