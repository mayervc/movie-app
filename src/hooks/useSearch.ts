import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";
import { searchMovies } from "@/services/movies.service";
import type { Movie } from "@/types/movie.types";

export const useSearch = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      setLoading(true);
      searchMovies(debouncedQuery)
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  return { query, setQuery, suggestions, loading };
};
