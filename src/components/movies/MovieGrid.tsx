import { MovieCard } from "./MovieCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import type { Movie } from "@/types/movie.types";

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  viewMode?: "grid" | "list";
}

export const MovieGrid = ({
  movies,
  loading,
  viewMode = "grid",
}: MovieGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
        {[...Array(12)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} viewMode="list" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} viewMode="grid" />
      ))}
    </div>
  );
};
