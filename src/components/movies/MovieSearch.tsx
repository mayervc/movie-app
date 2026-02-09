import { Link } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { formatYear } from "@/utils/formatters";

export const MovieSearch = () => {
  const { query, setQuery, suggestions, loading } = useSearch();

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        {loading ? (
          <Loader2
            className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 animate-spin"
            size={20}
          />
        ) : (
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar películas..."
          className="w-full pl-12 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-50 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {suggestions.map((movie) => (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              className="flex items-center gap-4 p-4 hover:bg-slate-700 transition-colors"
              onClick={() => setQuery("")}
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-12 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="text-slate-50 font-medium">{movie.title}</h4>
                <p className="text-slate-400 text-sm">
                  {formatYear(movie.releaseDate)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
