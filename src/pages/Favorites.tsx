import { motion } from "framer-motion";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { useFavorites } from "@/context/FavoritesContext";
import { Heart } from "lucide-react";

export const Favorites = () => {
  const { favorites } = useFavorites();

  return (
    <div className="min-h-screen container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <Heart className="text-red-500" size={32} fill="currentColor" />
          <h1 className="text-4xl font-bold">Mis Favoritos</h1>
        </div>
        <p className="text-slate-400">
          {favorites.length === 0
            ? "No tienes películas favoritas aún"
            : `${favorites.length} película${favorites.length > 1 ? "s" : ""} favorita${favorites.length > 1 ? "s" : ""}`}
        </p>
      </motion.div>

      {favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Heart className="mx-auto text-slate-700 mb-4" size={64} />
          <p className="text-slate-400 text-lg mb-4">
            Empieza agregando películas a tus favoritos
          </p>
        </motion.div>
      ) : (
        <MovieGrid movies={favorites} />
      )}
    </div>
  );
};
