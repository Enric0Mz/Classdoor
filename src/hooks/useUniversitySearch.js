"use client";

import { useState, useEffect } from "react";

export function useUniversitySearch({
  search = "",
  type = null,
  state = null,
  limit = 100,
  debounceMs = 300,
} = {}) {
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  useEffect(() => {
    let cancelled = false;

    async function fetchUniversities() {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (type) params.set("type", type);
      if (state) params.set("state", state);
      params.set("limit", String(limit));

      try {
        const response = await fetch(`/api/v1/universities?${params}`);
        if (!response.ok) throw new Error("Falha ao buscar universidades");
        const json = await response.json();

        if (!cancelled) {
          setResults(json.data ?? []);
          setTotal(json.pagination?.total ?? 0);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchUniversities();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, type, state, limit]);

  return { results, total, isLoading };
}
